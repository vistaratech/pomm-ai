// ==========================================================================
//  PommAI -- BLE Task (Bluetooth Low Energy Connectivity)
// ==========================================================================

#include "ble_task.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <sys/time.h>

#include "gif_player.h"
#include "settings.h"
#include "app_state.h"

// Standard Nordic UART Service (NUS) UUIDs
#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

static BLEServer         *pServer         = nullptr;
static BLECharacteristic *pTxCharacteristic = nullptr;
static bool               deviceConnected = false;
static bool               oldDeviceConnected = false;

// ESP32-C3 Super Mini onboard Blue LED pin (GPIO 8, Active LOW: LOW = ON, HIGH = OFF)
#define ONBOARD_BLUE_LED_PIN 8

void bleSetLed(bool on) {
    // Active LOW: LOW = ON, HIGH = OFF
    digitalWrite(ONBOARD_BLUE_LED_PIN, on ? LOW : HIGH);
}

// Process received command string
static void handleCommand(const String &cmd) {
    String trimmed = cmd;
    trimmed.trim();
    if (trimmed.length() == 0) return;

    Serial.printf("[BLE] Command received: %s\n", trimmed.c_str());

    if (trimmed.startsWith("PLAY:")) {
        String filename = trimmed.substring(5);
        filename.trim();
        if (filename.length() > 0) {
            gifPlayerSetFile(filename);
            bleNotify("OK:PLAY:" + filename);
        }
    } else if (trimmed.startsWith("TIME:")) {
        String epochStr = trimmed.substring(5);
        epochStr.trim();
        long epoch = epochStr.toInt();
        if (epoch > 0) {
            struct timeval tv = { .tv_sec = (time_t)epoch, .tv_usec = 0 };
            settimeofday(&tv, NULL);
            Serial.printf("[BLE] Real-Time Clock updated to epoch: %ld\n", epoch);
            bleNotify("OK:TIME");
        }
    } else if (trimmed.equalsIgnoreCase("PING")) {
        bleNotify("PONG:PommAI");
    } else if (trimmed.equalsIgnoreCase("INFO")) {
        String info = "INFO:NAME=PommAI;ID=" + getDeviceId() + ";VER=1.0.0";
        bleNotify(info);
    }
}

class ServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer *pServer) override {
        deviceConnected = true;
        bleSetLed(true); // Blue LED turns solid ON when connected!
        Serial.println("[BLE] Client connected to PommAI! Blue LED turned ON.");
    }

    void onDisconnect(BLEServer *pServer) override {
        deviceConnected = false;
        bleSetLed(false); // Blue LED turns OFF when disconnected!
        Serial.println("[BLE] Client disconnected from PommAI. Blue LED turned OFF.");
        // Restart advertising
        pServer->startAdvertising();
        Serial.println("[BLE] Restarted advertising as 'PommAI'");
    }
};

class RxCallbacks : public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) override {
        String rxValue = pCharacteristic->getValue();
        if (rxValue.length() > 0) {
            handleCommand(rxValue);
        }
    }
};

void bleInit() {
    Serial.println("[BLE] Initializing Bluetooth Low Energy as 'PommAI'...");

    // 0. Configure onboard Blue LED (GPIO 8)
    pinMode(ONBOARD_BLUE_LED_PIN, OUTPUT);
    // Two quick blinks to indicate BLE ready
    bleSetLed(true);
    delay(80);
    bleSetLed(false);
    delay(80);
    bleSetLed(true);
    delay(80);
    bleSetLed(false);

    // 1. Initialize BLE with name "PommAI"
    BLEDevice::init("PommAI");

    // 2. Create BLE Server
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    // 3. Create Service
    BLEService *pService = pServer->createService(SERVICE_UUID);

    // 4. Create TX Characteristic (Notify to Web Browser)
    pTxCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_TX,
        BLECharacteristic::PROPERTY_NOTIFY
    );
    pTxCharacteristic->addDescriptor(new BLE2902());

    // 5. Create RX Characteristic (Write from Web Browser)
    BLECharacteristic *pRxCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID_RX,
        BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
    );
    pRxCharacteristic->setCallbacks(new RxCallbacks());

    // 6. Start Service
    pService->start();

    // 7. Start Advertising with explicit complete local name in both Adv and Scan response
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);

    BLEAdvertisementData advData;
    advData.setFlags(0x06); // General Discoverable Mode, BR/EDR Not Supported
    advData.setName("PommAI");
    advData.setCompleteServices(BLEUUID(SERVICE_UUID));
    pAdvertising->setAdvertisementData(advData);

    BLEAdvertisementData scanData;
    scanData.setName("PommAI");
    pAdvertising->setScanResponseData(scanData);

    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);
    pAdvertising->setMinPreferred(0x12);
    BLEDevice::startAdvertising();

    Serial.println("[BLE] PommAI Bluetooth is now advertising as 'PommAI'!");
}

bool bleIsConnected() {
    return deviceConnected;
}

void bleNotify(const String &msg) {
    if (deviceConnected && pTxCharacteristic != nullptr) {
        pTxCharacteristic->setValue((uint8_t *)msg.c_str(), msg.length());
        pTxCharacteristic->notify();
    }
}

