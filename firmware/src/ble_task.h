// ==========================================================================
//  PommAI -- BLE Task (Bluetooth Low Energy Connectivity)
// ==========================================================================
#ifndef BLE_TASK_H
#define BLE_TASK_H

#include <Arduino.h>

// Initialize BLE GATT Server and start advertising with name "PommAI"
void bleInit();

// Control onboard Bluetooth status LED (GPIO 8)
void bleSetLed(bool on);

// Check if a client is currently connected via BLE
bool bleIsConnected();

// Send text notification to connected BLE client
void bleNotify(const String &msg);

#endif // BLE_TASK_H

