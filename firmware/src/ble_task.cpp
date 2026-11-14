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
#include "display_task.h"
#include "time_manager.h"
#include <LittleFS.h>

// Standard Nordic UART Service (NUS) UUIDs
#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

static BLEServer         *pServer         = nullptr;
static BLECharacteristic *pTxCharacteristic = nullptr;
static bool               deviceConnected = false;
static bool               oldDeviceConnected = false;

// Buffer for receiving photo / camera frames (128x64 = 1024 bytes)
static uint8_t  _incomingPhotoBuf[1024];
static uint16_t _incomingPhotoOffset = 0;

// Dynamic QGIF receiving
static File   _incomingQgifFile;
static String _incomingQgifName = "";

// ESP32-C3 Super Mini onboard Blue LED pin (GPIO 8, Active LOW: LOW = ON, HIGH = OFF)
#define ONBOARD_BLUE_LED_PIN 8

void bleSetLed(bool on) {
    // Active LOW: LOW = ON, HIGH = OFF
    digitalWrite(ONBOARD_BLUE_LED_PIN, on ? LOW : HIGH);
}

// Process received command string (from BLE or Serial)
static void handleCommand(const String &cmd) {
    String trimmed = cmd;
    trimmed.trim();
    if (trimmed.length() == 0) return;

    Serial.printf("[CMD] Received: %s\n", trimmed.c_str());

    if (trimmed.startsWith("PLAY:")) {
        String filename = trimmed.substring(5);
        filename.trim();
        if (filename.length() > 0) {
            if (!filename.endsWith(".qgif")) filename += ".qgif";
            if (LittleFS.exists("/" + filename)) {
                displayPlayAnimation(filename);
                bleNotify("OK:PLAY:" + filename);
                Serial.printf("[PLAY] Playing %s on OLED\n", filename.c_str());
            } else {
                Serial.printf("[PLAY] File not found on LittleFS: /%s\n", filename.c_str());
                bleNotify("ERR:NO_FILE:" + filename);
            }
        }
    } else if (trimmed.startsWith("QGIF_START:")) {
        _incomingQgifName = trimmed.substring(11);
        _incomingQgifName.trim();
        if (!_incomingQgifName.endsWith(".qgif")) _incomingQgifName += ".qgif";
        if (_incomingQgifFile) _incomingQgifFile.close();
        _incomingQgifFile = LittleFS.open("/" + _incomingQgifName, "w");
        if (_incomingQgifFile) {
            Serial.printf("[QGIF] Receiving file: /%s\n", _incomingQgifName.c_str());
            bleNotify("OK:QGIF_READY");
        } else {
            Serial.printf("[QGIF] Failed to open /%s for write\n", _incomingQgifName.c_str());
            bleNotify("ERR:QGIF_OPEN_FAILED");
        }
    } else if (trimmed.startsWith("QGIF_DATA:")) {
        String hex = trimmed.substring(10);
        hex.trim();
        if (_incomingQgifFile) {
            uint8_t chunk[256];
            int count = 0;
            for (unsigned int i = 0; i + 1 < hex.length() && count < 256; i += 2) {
                char bChars[3] = { hex[i], hex[i + 1], '\0' };
                chunk[count++] = (uint8_t)strtol(bChars, NULL, 16);
            }
            if (count > 0) {
                _incomingQgifFile.write(chunk, count);
            }
        }
    } else if (trimmed.equalsIgnoreCase("QGIF_END")) {
        if (_incomingQgifFile) {
            _incomingQgifFile.close();
            Serial.printf("[QGIF] Saved /%s successfully! Playing on OLED...\n", _incomingQgifName.c_str());
            displayPlayAnimation(_incomingQgifName);
            bleNotify("OK:PLAY:" + _incomingQgifName);
        }
    } else if (trimmed.startsWith("PHOTO_START")) {
        _incomingPhotoOffset = 0;
        memset(_incomingPhotoBuf, 0, sizeof(_incomingPhotoBuf));
        bleNotify("OK:PHOTO_READY");
    } else if (trimmed.startsWith("PHOTO_DATA:")) {
        String hex = trimmed.substring(11);
        hex.trim();
        for (unsigned int i = 0; i + 1 < hex.length() && _incomingPhotoOffset < 1024; i += 2) {
            char bChars[3] = { hex[i], hex[i + 1], '\0' };
            _incomingPhotoBuf[_incomingPhotoOffset++] = (uint8_t)strtol(bChars, NULL, 16);
        }
    } else if (trimmed.equalsIgnoreCase("PHOTO_SHOW")) {
        displayShowPhoto(_incomingPhotoBuf, 0); // 0 = stay until dismissed
        bleNotify("OK:PHOTO_SHOWN");
    } else if (trimmed.startsWith("PHOTO_SAVE:")) {
        String filename = trimmed.substring(11);
        filename.trim();
        if (filename.length() == 0) filename = "photo";
        if (!filename.endsWith(".qgif")) filename += ".qgif";
        File f = LittleFS.open("/" + filename, "w");
        if (f) {
            // Write standard QGIF header (1 static frame, 128x64, 1000ms delay)
            uint8_t hdr[7] = {
                1,          // frame count = 1
                128, 0,     // width = 128 (uint16 LE)
                64, 0,      // height = 64 (uint16 LE)
                0xE8, 0x03  // delay = 1000ms (uint16 LE)
            };
            f.write(hdr, 7);
            f.write(_incomingPhotoBuf, 1024);
            f.close();
            Serial.printf("[PHOTO] Saved %s to LittleFS (%d bytes)\n", filename.c_str(), 1031);
            displayPlayAnimation(filename);
            bleNotify("OK:SAVED:" + filename);
        } else {
            bleNotify("ERR:SAVE_FAILED");
        }
    } else if (trimmed.startsWith("TIME:")) {
        String epochStr = trimmed.substring(5);
        epochStr.trim();
        long epoch = epochStr.toInt();
        if (epoch > 0) {
            struct timeval tv = { .tv_sec = (time_t)epoch, .tv_usec = 0 };
            settimeofday(&tv, NULL);
            Serial.printf("[CMD] Real-Time Clock updated to epoch: %ld\n", epoch);
            displayShowClock(25000); // Display clock on OLED for 25s with live ticking!
            bleNotify("OK:TIME");
        }
    } else if (trimmed.startsWith("TZ:")) {
        String tz = trimmed.substring(3);
        tz.trim();
        if (tz.length() > 0) {
            timeManagerSetTimezone(tz);
            saveSettings();
            displayShowClock(25000); // Re-render with new timezone
            bleNotify("OK:TZ:" + tz);
        }
    } else if (trimmed.startsWith("FMT24:")) {
        String fmt = trimmed.substring(6);
        fmt.trim();
        bool is24 = (fmt == "1" || fmt.equalsIgnoreCase("true"));
        setTimeFormat24h(is24);
        saveSettings();
        displayShowClock(25000); // Re-render with new 24h format
        bleNotify("OK:FMT24");
    } else if (trimmed.equalsIgnoreCase("CLOCK") || trimmed.startsWith("CLOCK:")) {
        setClockMode(true);
        saveSettings();
        displayShowClock(0); // 0 = indefinite / persistent always-on clock!
        bleNotify("OK:CLOCK");
    } else if (trimmed.equalsIgnoreCase("FACE") || trimmed.equalsIgnoreCase("STOP")) {
        setClockMode(false);
        saveSettings();
        displayShowRobotFace();
        bleNotify("OK:FACE");
    } else if (trimmed.startsWith("TIMER:")) {
        uint32_t sec = trimmed.substring(6).toInt();
        if (sec > 0) {
            displayStartTimer(sec);
            bleNotify("OK:TIMER:" + String(sec));
        }
    } else if (trimmed.equalsIgnoreCase("TIMER_STOP") || trimmed.equalsIgnoreCase("STOP_TIMER")) {
        displayCancelTimer();
        bleNotify("OK:TIMER_STOPPED");
    } else if (trimmed.equalsIgnoreCase("PING")) {
        bleNotify("PONG:PommAI");
    } else if (trimmed.equalsIgnoreCase("INFO")) {
        String info = "INFO:NAME=PommAI;ID=" + getDeviceId() + ";VER=1.0.0";
        bleNotify(info);
    }
}

// Background FreeRTOS task to receive commands over USB-C Serial
static void serialCommandTask(void *param) {
    (void)param;
    String line = "";
    for (;;) {
        while (Serial.available()) {
            char c = (char)Serial.read();
            if (c == '\n' || c == '\r') {
                if (line.length() > 0) {
                    handleCommand(line);
                    line = "";
                }
            } else {
                line += c;
                if (line.length() > 1024) line = "";
            }
        }
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}

class ServerCallbacks : public BLEServerCallbacks {
    void onConnect(BLEServer *pServer) override {
        deviceConnected = true;
        bleSetLed(true); // Blue LED turns solid ON when connected!
        Serial.println("[BLE] Client connected to PommAI! Blue LED turned ON.");
        displayShowRobotFace(); // Dismiss QR code and show robot face immediately!
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
    BLEDevice::setMTU(512);

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

    // 8. Start background Serial command listener (for USB-C Web Serial)
    xTaskCreate(serialCommandTask, "serial_cmd", 3072, NULL, 1, NULL);
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

