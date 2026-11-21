#pragma once
#include <Arduino.h>

// Shared Pins for ESP32-C3 Super Mini
#define RELAY_1_PIN       7    // Home: Relay 1  |  Car: Left Motor / Servo
#define RELAY_2_PIN       10   // Home: Relay 2  |  Car: Right Motor / Servo
#define NUM_RELAYS        2
#define RELAY_ACTIVE_LOW  true

// Continuous Servo / Motor Timing (microseconds)
#define CAR_SERVO_STOP    1500
#define CAR_SERVO_OFFSET  500  // Max speed offset (1000 - 2000 us)

enum SystemMode {
    SYS_MODE_HOME = 0,
    SYS_MODE_CAR  = 1
};

// Mode Management
void        systemModeInit();
SystemMode  systemModeGet();
void        systemModeSet(SystemMode mode);
const char* systemModeGetName();

// Home Relay Control
void   homeRelayInit();
void   homeRelaySet(uint8_t channel, bool on);
void   homeRelayToggle(uint8_t channel);
bool   homeRelayGet(uint8_t channel);
void   homeRelaySetTimer(uint8_t channel, unsigned long seconds);
void   homeRelayLoop();
String homeRelayGetStatusString();
void   homeRelayProcessCommand(const String &rawCmd);
void   homeRelayProcessBinary(const uint8_t *data, size_t len);

// RC Car Motor Control
void   carMotorsInit();
void   carCommand(const String &dir, int speed);
void   carCommandCode(uint8_t dirCode, uint8_t speed);
void   carHorn(bool on);
void   carStop();
int    carGetSpeed();
String carGetDirection();
bool   carIsHornActive();

// Display Popups
void   triggerRelayDisplayPopup(uint8_t channel, bool state);
void   triggerCarDisplayPopup(const String &dir, int speed);
