#include "home_relay.h"
#include "app_state.h"
#include "settings.h"
#include "ble_task.h"
#include "display_task.h"
#include "melodies.h"
#include <NonBlockingRtttl.h>
#include <Arduino.h>

static const uint8_t _relayPins[NUM_RELAYS] = { RELAY_1_PIN, RELAY_2_PIN };
static bool          _relayState[NUM_RELAYS] = { false, false };
static bool          _timerActive[NUM_RELAYS] = { false, false };
static unsigned long _offAt[NUM_RELAYS]       = { 0, 0 };

void homeRelayInit() {
    for (int i = 0; i < NUM_RELAYS; i++) {
        pinMode(_relayPins[i], OUTPUT);
        // Active LOW: LOW = ON, HIGH = OFF
        digitalWrite(_relayPins[i], RELAY_ACTIVE_LOW ? HIGH : LOW);
        _relayState[i] = false;
        _timerActive[i] = false;
    }
    Serial.printf("[RELAY] Initialized %d channels (R1=GPIO%d, R2=GPIO%d)\n",
                  NUM_RELAYS, RELAY_1_PIN, RELAY_2_PIN);
}

void homeRelaySet(uint8_t channel, bool on) {
    if (channel >= NUM_RELAYS) return;

    _relayState[channel] = on;
    bool pinLevel = RELAY_ACTIVE_LOW ? !on : on;
    digitalWrite(_relayPins[channel], pinLevel ? HIGH : LOW);

    // Cancel timer if manually turned off
    if (!on) {
        _timerActive[channel] = false;
    }

    Serial.printf("[RELAY] Channel %d set to %s\n", channel + 1, on ? "ON" : "OFF");

    // Show visual popup on OLED + buzzer feedback
    triggerRelayDisplayPopup(channel, on);

    // Notify BLE app (Lumo)
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

void homeRelayLoop() {
    unsigned long now = millis();
    for (int i = 0; i < NUM_RELAYS; i++) {
        if (_timerActive[i] && (long)(now - _offAt[i]) >= 0) {
            Serial.printf("[RELAY] Timer expired for Channel %d -> Turning OFF\n", i + 1);
            homeRelaySet(i, false);
        }
    }
}

String homeRelayGetStatusString() {
    String res = "";
    for (int i = 0; i < NUM_RELAYS; i++) {
        if (i > 0) res += ",";
        res += "R" + String(i + 1) + ":" + String(_relayState[i] ? "1" : "0");
    }
    return res;
}

void homeRelayProcessCommand(const String &rawCmd) {
    String cmd = rawCmd;
    cmd.trim();
    if (cmd.length() == 0) return;

    String up = cmd;
    up.toUpperCase();

    // R1:1, R1:0, R1_ON, R1_OFF, R1
    if (up == "R1:1" || up == "R1_ON" || up == "RELAY1_ON") {
        homeRelaySet(0, true);
    } else if (up == "R1:0" || up == "R1_OFF" || up == "RELAY1_OFF") {
        homeRelaySet(0, false);
    } else if (up == "R1" || up == "TOGGLE:1") {
        homeRelayToggle(0);
    }
    // R2:1, R2:0, R2_ON, R2_OFF, R2
    else if (up == "R2:1" || up == "R2_ON" || up == "RELAY2_ON") {
        homeRelaySet(1, true);
    } else if (up == "R2:0" || up == "R2_OFF" || up == "RELAY2_OFF") {
        homeRelaySet(1, false);
    } else if (up == "R2" || up == "TOGGLE:2") {
        homeRelayToggle(1);
    }
    // Timers: e.g. "TIMER:1:60" (channel 1 for 60 seconds)
    else if (up.startsWith("TIMER:")) {
        int firstColon = up.indexOf(':');
        int secondColon = up.indexOf(':', firstColon + 1);
        if (firstColon != -1 && secondColon != -1) {
            int ch = up.substring(firstColon + 1, secondColon).toInt() - 1;
            unsigned long sec = up.substring(secondColon + 1).toInt();
            if (ch >= 0 && ch < NUM_RELAYS && sec > 0) {
                homeRelaySetTimer((uint8_t)ch, sec);
            }
        }
    }
    // Status query
    else if (up == "STATUS" || up == "GET_CONFIG" || up == "GET_STATUS") {
        bleNotify(homeRelayGetStatusString());
    }
}

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
