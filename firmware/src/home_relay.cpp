#include "home_relay.h"
#include "app_state.h"
#include "settings.h"
#include "ble_task.h"
#include "display_task.h"
#include "melodies.h"
#include <NonBlockingRtttl.h>
#include <Arduino.h>

// Shared pin definitions
static const uint8_t _sharedPins[NUM_RELAYS] = { RELAY_1_PIN, RELAY_2_PIN };

// System Mode state
static SystemMode    _sysMode           = SYS_MODE_HOME;

// Relay state (Home Mode)
static bool          _relayState[NUM_RELAYS]  = { false, false };
static bool          _timerActive[NUM_RELAYS] = { false, false };
static unsigned long _offAt[NUM_RELAYS]       = { 0, 0 };

// Car state (Car Mode)
static int           _currentSpeed      = 200;
static String        _currentDir        = "S";
static bool          _carMotorsActive   = false;
static bool          _hornActive        = false;
static unsigned long _lastCarCmdTime    = 0;
static const unsigned long CAR_SAFETY_TIMEOUT_MS = 1200;

// Internal helper to set raw microseconds on servo pins
static void carMotorsSetRaw(int leftUs, int rightUs) {
    if (_sysMode != SYS_MODE_CAR) return;
    // 50Hz period = 20,000 us. Resolution = 14 bits (16384 levels).
    uint32_t leftDuty  = ((uint32_t)constrain(leftUs, 800, 2200) * 16384UL) / 20000UL;
    uint32_t rightDuty = ((uint32_t)constrain(rightUs, 800, 2200) * 16384UL) / 20000UL;
    ledcWrite(RELAY_1_PIN, leftDuty);
    ledcWrite(RELAY_2_PIN, rightDuty);
    _carMotorsActive = (leftUs != CAR_SERVO_STOP || rightUs != CAR_SERVO_STOP);
}

void systemModeInit() {
    _sysMode = SYS_MODE_HOME;
    homeRelayInit();
}

SystemMode systemModeGet() {
    return _sysMode;
}

const char* systemModeGetName() {
    return (_sysMode == SYS_MODE_CAR) ? "car" : "home";
}

void systemModeSet(SystemMode mode) {
    if (mode == _sysMode) return;

    if (mode == SYS_MODE_HOME) {
        // Stop motors and detach PWM
        carStop();
        if (_hornActive) carHorn(false);
        ledcDetach(RELAY_1_PIN);
        ledcDetach(RELAY_2_PIN);

        _sysMode = SYS_MODE_HOME;
        homeRelayInit();

        Serial.println("[MODE] Switched to HOME AUTOMATION (GPIO 7 & 10 = Relays)");
        displayShowRelayPopup("MODE SWITCHED", "Home Relay Ready");
        bleNotify("MODE:HOME");
    } else {
        // Turn off relays
        for (int i = 0; i < NUM_RELAYS; i++) {
            digitalWrite(_sharedPins[i], RELAY_ACTIVE_LOW ? HIGH : LOW);
            _relayState[i] = false;
            _timerActive[i] = false;
        }

        _sysMode = SYS_MODE_CAR;
        carMotorsInit();

        Serial.println("[MODE] Switched to RC CAR (GPIO 7 & 10 = Motors)");
        displayShowRelayPopup("MODE SWITCHED", "RC Car Ready");
        bleNotify("MODE:CAR");
    }
}

// ==========================================================================
//  Home Relay Implementation
// ==========================================================================

void homeRelayInit() {
    for (int i = 0; i < NUM_RELAYS; i++) {
        pinMode(_sharedPins[i], OUTPUT);
        digitalWrite(_sharedPins[i], RELAY_ACTIVE_LOW ? HIGH : LOW);
        _relayState[i] = false;
        _timerActive[i] = false;
    }
    Serial.printf("[RELAY] Initialized %d channels (R1=GPIO%d, R2=GPIO%d)\n",
                  NUM_RELAYS, RELAY_1_PIN, RELAY_2_PIN);
}

void homeRelaySet(uint8_t channel, bool on) {
    if (channel >= NUM_RELAYS) return;

    // Auto-switch to Home Mode if called while in Car Mode
    if (_sysMode != SYS_MODE_HOME) {
        systemModeSet(SYS_MODE_HOME);
    }

    _relayState[channel] = on;
    bool pinLevel = RELAY_ACTIVE_LOW ? !on : on;
    digitalWrite(_sharedPins[channel], pinLevel ? HIGH : LOW);

    if (!on) {
        _timerActive[channel] = false;
    }

    Serial.printf("[RELAY] Channel %d set to %s\n", channel + 1, on ? "ON" : "OFF");
    triggerRelayDisplayPopup(channel, on);

    String status = homeRelayGetStatusString();
    bleNotify(status);
}

void homeRelayToggle(uint8_t channel) {
    if (channel >= NUM_RELAYS) return;
    homeRelaySet(channel, !_relayState[channel]);
}

bool homeRelayGet(uint8_t channel) {
    if (channel >= NUM_RELAYS) return false;
    return _relayState[channel];
}

void homeRelaySetTimer(uint8_t channel, unsigned long seconds) {
    if (channel >= NUM_RELAYS || seconds == 0) return;
    homeRelaySet(channel, true);
    _offAt[channel] = millis() + (seconds * 1000UL);
    _timerActive[channel] = true;
    Serial.printf("[RELAY] Channel %d timer set for %lu sec\n", channel + 1, seconds);
}

String homeRelayGetStatusString() {
    String res = "MODE:" + String(systemModeGetName()) + ";";
    for (int i = 0; i < NUM_RELAYS; i++) {
        if (i > 0) res += ",";
        res += "R" + String(i + 1) + ":" + String(_relayState[i] ? "1" : "0");
    }
    return res;
}

// ==========================================================================
//  RC Car Motor Implementation
// ==========================================================================

void carMotorsInit() {
    // 50 Hz PWM with 14-bit resolution on GPIO 7 and GPIO 10
    ledcAttach(RELAY_1_PIN, 50, 14);
    ledcAttach(RELAY_2_PIN, 50, 14);
    carStop();
    Serial.printf("[CAR] Initialized motors on Left=GPIO%d, Right=GPIO%d\n",
                  RELAY_1_PIN, RELAY_2_PIN);
}

void carStop() {
    _currentDir = "S";
    carMotorsSetRaw(CAR_SERVO_STOP, CAR_SERVO_STOP);
    _carMotorsActive = false;
}

void carCommand(const String &dir, int speed) {
    // Auto-switch to Car Mode if command received while in Home Mode
    if (_sysMode != SYS_MODE_CAR) {
        systemModeSet(SYS_MODE_CAR);
    }

    speed = constrain(speed, 0, 255);
    _currentSpeed = speed;
    _currentDir = dir;
    _lastCarCmdTime = millis();

    int offset = (speed * CAR_SERVO_OFFSET) / 255;

    // Differential Drive: Left servo normal, Right servo mirrored
    if (dir == "F" || dir == "FORWARD") {
        carMotorsSetRaw(CAR_SERVO_STOP + offset, CAR_SERVO_STOP - offset);
    } else if (dir == "B" || dir == "BACKWARD") {
        carMotorsSetRaw(CAR_SERVO_STOP - offset, CAR_SERVO_STOP + offset);
    } else if (dir == "L" || dir == "LEFT") {
        carMotorsSetRaw(CAR_SERVO_STOP - offset, CAR_SERVO_STOP - offset);
    } else if (dir == "R" || dir == "RIGHT") {
        carMotorsSetRaw(CAR_SERVO_STOP + offset, CAR_SERVO_STOP + offset);
    } else if (dir == "FL") {
        carMotorsSetRaw(CAR_SERVO_STOP + (offset / 2), CAR_SERVO_STOP - offset);
    } else if (dir == "FR") {
        carMotorsSetRaw(CAR_SERVO_STOP + offset, CAR_SERVO_STOP - (offset / 2));
    } else if (dir == "BL") {
        carMotorsSetRaw(CAR_SERVO_STOP - (offset / 2), CAR_SERVO_STOP + offset);
    } else if (dir == "BR") {
        carMotorsSetRaw(CAR_SERVO_STOP - offset, CAR_SERVO_STOP + (offset / 2));
    } else {
        carStop();
    }

    triggerCarDisplayPopup(dir, speed);
}

void carCommandCode(uint8_t dirCode, uint8_t speed) {
    switch (dirCode) {
        case 1: carCommand("F", speed);  break;
        case 2: carCommand("B", speed);  break;
        case 3: carCommand("L", speed);  break;
        case 4: carCommand("R", speed);  break;
        case 5: carCommand("FL", speed); break;
        case 6: carCommand("FR", speed); break;
        case 7: carCommand("BL", speed); break;
        case 8: carCommand("BR", speed); break;
        default: carStop(); break;
    }
}

void carHorn(bool on) {
    _hornActive = on;
    uint8_t buzzerPin = getPinBuzzer();
    if (on) {
        tone(buzzerPin, 440); // 440 Hz Car Horn
        displayShowRelayPopup("RC CAR", "📢 HORN ACTIVE!");
    } else {
        noTone(buzzerPin);
    }
}

int carGetSpeed() {
    return _currentSpeed;
}

String carGetDirection() {
    return _currentDir;
}

bool carIsHornActive() {
    return _hornActive;
}

// ==========================================================================
//  Main Loop & Background Tasks
// ==========================================================================

void homeRelayLoop() {
    unsigned long now = millis();

    if (_sysMode == SYS_MODE_HOME) {
        // Check auto-off timers
        for (int i = 0; i < NUM_RELAYS; i++) {
            if (_timerActive[i] && (long)(now - _offAt[i]) >= 0) {
                Serial.printf("[RELAY] Timer expired for Channel %d -> Turning OFF\n", i + 1);
                homeRelaySet(i, false);
            }
        }
    } else if (_sysMode == SYS_MODE_CAR) {
        // Safety timeout for RC Car (prevents runaway car)
        if (_carMotorsActive && (now - _lastCarCmdTime > CAR_SAFETY_TIMEOUT_MS)) {
            Serial.println("[CAR] Safety timeout reached -> Motors STOP");
            carStop();
        }
    }
}

// ==========================================================================
//  Command Parsers (String & Binary)
// ==========================================================================

void homeRelayProcessCommand(const String &rawCmd) {
    String cmd = rawCmd;
    cmd.trim();
    if (cmd.length() == 0) return;

    String up = cmd;
    up.toUpperCase();

    // Mode switching
    if (up == "MODE:HOME" || up == "MODE_HOME") {
        systemModeSet(SYS_MODE_HOME);
        return;
    } else if (up == "MODE:CAR" || up == "MODE_CAR" || up == "MODE:RC") {
        systemModeSet(SYS_MODE_CAR);
        return;
    } else if (up == "MODE?") {
        bleNotify(String("MODE:") + systemModeGetName());
        return;
    }

    // Horn commands
    if (up == "HORN:1" || up == "HORN_ON") {
        carHorn(true);
        return;
    } else if (up == "HORN:0" || up == "HORN_OFF") {
        carHorn(false);
        return;
    } else if (up == "HORN") {
        carHorn(true);
        delay(120);
        carHorn(false);
        return;
    }

    // RC Car directional commands
    if (up.startsWith("CAR:") || up.startsWith("F") || up.startsWith("B") ||
        up.startsWith("L") || up.startsWith("R") || up == "S" || up == "STOP") {

        String payload = up;
        if (payload.startsWith("CAR:")) {
            payload = payload.substring(4);
        }

        int colon = payload.indexOf(':');
        String dir = (colon != -1) ? payload.substring(0, colon) : payload;
        int spd = (colon != -1) ? payload.substring(colon + 1).toInt() : _currentSpeed;
        if (spd <= 0) spd = _currentSpeed > 0 ? _currentSpeed : 200;

        if (dir == "F" || dir == "B" || dir == "L" || dir == "R" ||
            dir == "FL" || dir == "FR" || dir == "BL" || dir == "BR" ||
            dir == "S" || dir == "STOP") {
            carCommand(dir, spd);
            return;
        }
    }

    // Home Relay commands
    if (up == "R1:1" || up == "R1_ON" || up == "RELAY1_ON") {
        homeRelaySet(0, true);
    } else if (up == "R1:0" || up == "R1_OFF" || up == "RELAY1_OFF") {
        homeRelaySet(0, false);
    } else if (up == "R1" || up == "TOGGLE:1") {
        homeRelayToggle(0);
    } else if (up == "R2:1" || up == "R2_ON" || up == "RELAY2_ON") {
        homeRelaySet(1, true);
    } else if (up == "R2:0" || up == "R2_OFF" || up == "RELAY2_OFF") {
        homeRelaySet(1, false);
    } else if (up == "R2" || up == "TOGGLE:2") {
        homeRelayToggle(1);
    } else if (up.startsWith("TIMER:")) {
        int firstColon = up.indexOf(':');
        int secondColon = up.indexOf(':', firstColon + 1);
        if (firstColon != -1 && secondColon != -1) {
            int ch = up.substring(firstColon + 1, secondColon).toInt() - 1;
            unsigned long sec = up.substring(secondColon + 1).toInt();
            if (ch >= 0 && ch < NUM_RELAYS && sec > 0) {
                homeRelaySetTimer((uint8_t)ch, sec);
            }
        }
    } else if (up == "STATUS" || up == "GET_CONFIG" || up == "GET_STATUS") {
        bleNotify(homeRelayGetStatusString());
    }
}

void homeRelayProcessBinary(const uint8_t *data, size_t len) {
    if (!data || len == 0) return;

    // Check if 3-byte binary protocol from rc_car_ble.ino: [dir, speed, reserved]
    if (len == 3 && data[0] <= 8) {
        uint8_t dir   = data[0];
        uint8_t speed = data[1];
        carCommandCode(dir, speed);
        return;
    }

    // Fallback: treat as ASCII string
    String str;
    for (size_t i = 0; i < len; i++) {
        if (data[i] == '\0') break;
        str += (char)data[i];
    }
    homeRelayProcessCommand(str);
}

// ==========================================================================
//  Display Visual Popups
// ==========================================================================

void triggerRelayDisplayPopup(uint8_t channel, bool state) {
    char l1[32];
    char l2[32];
    snprintf(l1, sizeof(l1), "R%d (%s): %s",
             channel + 1,
             (channel == 0 ? "Light" : "Fan"),
             (state ? "ON" : "OFF"));
    snprintf(l2, sizeof(l2), "R1:%s  R2:%s",
             _relayState[0] ? "ON" : "OFF",
             _relayState[1] ? "ON" : "OFF");

    displayShowRelayPopup(l1, l2);

    if (getBuzzerVolume() > 0) {
        noTone(getPinBuzzer());
        rtttl::begin(getPinBuzzer(), TOUCH_MELODY);
    }
}

void triggerCarDisplayPopup(const String &dir, int speed) {
    char l1[32];
    char l2[32];
    const char *dirName = "STOP";
    if (dir == "F")  dirName = "FORWARD ▲";
    else if (dir == "B") dirName = "REVERSE ▼";
    else if (dir == "L") dirName = "LEFT ◀";
    else if (dir == "R") dirName = "RIGHT ▶";
    else if (dir == "FL") dirName = "FWD-LEFT ◤";
    else if (dir == "FR") dirName = "FWD-RIGHT ◥";
    else if (dir == "BL") dirName = "BACK-LEFT ◣";
    else if (dir == "BR") dirName = "BACK-RIGHT ◢";

    snprintf(l1, sizeof(l1), "RC CAR: %s", dirName);
    snprintf(l2, sizeof(l2), "Speed: %d / 255", speed);

    displayShowRelayPopup(l1, l2);
}
