#ifndef HOME_RELAY_H
#define HOME_RELAY_H

#include <Arduino.h>

#define NUM_RELAYS     2
#define RELAY_1_PIN    7   // GPIO 7 (Relay 1 - Light)
#define RELAY_2_PIN    10  // GPIO 10 (Relay 2 - Fan)
#define RELAY_ACTIVE_LOW true

void   homeRelayInit();
void   homeRelaySet(uint8_t channel, bool on);
void   homeRelayToggle(uint8_t channel);
bool   homeRelayGet(uint8_t channel);
void   homeRelaySetTimer(uint8_t channel, unsigned long seconds);
void   homeRelayLoop();
String homeRelayGetStatusString(); // "R1:1,R2:0"
void   homeRelayProcessCommand(const String &cmd);

// Function to trigger OLED popup when relay state changes
void triggerRelayDisplayPopup(uint8_t channel, bool state);

#endif // HOME_RELAY_H
