# PommAI (பொம்மை) -- Smart AI Robot & Bike Buddy Navigation HUD 🏍️🤖

> **Dual-Mode AI Companion:** A cute Desktop Robot Companion with 52 animated expressions that transforms into an ultra-modern **Motorcycle Smart Navigation HUD** (Turn-by-turn road animation, distance countdown, live speed & Google Maps sync).

---

## 🌟 Overview & Key Concepts

PommAI is a versatile, standalone smart gadget powered by the **Seeed Studio XIAO ESP32-C3**. It operates in two intelligent modes:

1. **🤖 Desktop Robot Buddy Mode:**
   - Automatically cycles through **52 fluid emotion animations** sequentially every 30 seconds uninterrupted.
   - Functions 100% offline without needing active Wi-Fi, BLE, or cloud connections.
   - Interactive capacitive touch sensing on the head (tap to cycle expressions, long-press for settings/games).
   - Real-Time Clock (RTC), Pomodoro timer, weather screen, and retro mini-games (T-Rex Runner, Flappy Bird, Car Avoidance).

2. **🏍️ Bike Buddy Mode (Smart Motorcycle HUD):**
   - Mounted on the motorcycle handlebar as a wireless, rechargeable navigation dash (like Royal Enfield Tripper / Ather Dash / Garmin).
   - **3D Moving Road Animation:** 25 FPS perspective highway lines scrolling towards the rider; road dynamically curves left or right depending on the upcoming turn.
   - **Maneuver Indicators:** Crisp vector turn arrows for Right Turn, Left Turn, Slight/Sharp Turns, U-Turn, Roundabout, and Destination Reached.
   - **Distance Countdown & Urgency Alert:** Real-time distance countdown (`250 m`, `1.2 km`). Flashes an inverted **`[ TURN NOW! ]`** alert when within 35 meters.
   - **Live Speedometer:** Displays live vehicle speed (`80 km/h`) calculated from high-precision phone GPS.
   - **Smart Dual Personality:** While cruising straight with no upcoming turn, it shows the robot's cute animated eyes; automatically awakens into Navigation Mode when approaching a turn (< 300m).

---

## 🛠️ Hardware Architecture & Specifications

The complete standalone "Bike Buddy" pod is compact, battery-powered, and wireless.

```text
               ┌─────────────────────────────────────────┐
               │    3.7V 1000mAh Flat LiPo Battery       │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
                         [ Micro Slide Switch ]
                                    │
                                    ▼
               ┌─────────────────────────────────────────┐
               │     Seeed Studio XIAO ESP32-C3          │
               │  - On-board LiPo Battery Charger (BAT±) │
               │  - Native USB Type-C Fast Charging      │
               │  - Bluetooth 5.0 Low Energy (BLE)       │
               └────────────────────┬────────────────────┘
                                    │  High-Speed Hardware SPI (40 MHz)
                                    ▼
               ┌─────────────────────────────────────────┐
               │      2.8" SPI TFT LCD Display           │
               │    (240 x 320 Color Screen / ILI9341)   │
               └─────────────────────────────────────────┘
```

### 1. Core Hardware Components

| Component | Specification | Purpose |
| :--- | :--- | :--- |
| **Microcontroller (MCU)** | **Seeed Studio XIAO ESP32-C3** | 160MHz 32-bit RISC-V, Bluetooth 5.0 LE, Wi-Fi 2.4GHz, 4MB Flash |
| **Display (Recommended)** | **2.8 Inch SPI TFT LCD (240x320)** | High visibility for motorcycle handlebars, color graphics, ILI9341/ST7789 |
| **Alternate Compact Display** | **1.69 Inch IPS TFT (240x280)** | Modern curved-corner smartwatch card aesthetic (ST7789 SPI) |
| **Alternate Round Pod Display**| **1.28 Inch Round IPS (240x240)**| Royal Enfield Tripper circular pod style (GC9A01 SPI) |
| **Legacy Desktop Display** | **0.96" / 1.3" I2C OLED (128x64)** | Monochrome SSD1306/SH1106 for compact desktop buddy |
| **Battery** | **3.7V 1000mAh LiPo (Flat pack)** | ~6.5 to 7 hours of wireless non-stop riding time |
| **Charging Circuit** | **Integrated on XIAO ESP32-C3** | Charges via native USB Type-C (`BAT+` / `BAT-` solder pads on the underside) |
| **Power Switch** | Micro SPDT Slide Switch | Physical ON / OFF control |
| **Touch Input** | TTP223 Capacitive Touch / Wire | Touch sensor on robot head / case bezel |
| **Audio** | Passive Buzzer (GPIO 2) | Maneuver chime, turn alerts, and 8-bit melodies |

### 2. Battery Life & Power Budget

* **ESP32-C3 (Active BLE connected):** ~45 - 60 mA
* **2.8" TFT LCD (Full Backlight):** ~80 - 90 mA
* **Total Current Draw:** ~135 - 150 mA
* **Continuous Runtime on 1000mAh Battery:**
  $$\text{Runtime} \approx \frac{1000\text{ mAh}}{145\text{ mA}} \approx \mathbf{6.8\text{ Hours}}$$
* Recharges conveniently from any standard bike USB port or power bank via the USB Type-C port!

---

## 📌 Wiring & Pinout Guide

### Seeed Studio XIAO ESP32-C3 to 2.8" SPI TFT Display (ILI9341 / ST7789)

| Display Pin | XIAO ESP32-C3 Pin | Function / Description |
| :--- | :--- | :--- |
| **VCC** | **3.3V** or **5V** | Power supply (display has on-board 3.3V LDO) |
| **GND** | **GND** | Ground |
| **CS** | **GPIO 7** (D5) | SPI Chip Select |
| **RESET / RES** | **GPIO 3** (D1) | Display Reset |
| **DC / RS** | **GPIO 2** (D0) | Data / Command register select |
| **SDI / MOSI** | **GPIO 6** (D4) | Hardware SPI Data Line |
| **SCK / SCLK** | **GPIO 4** (D2) | Hardware SPI Clock Line |
| **LED / BLK** | **3.3V** (or GPIO 8) | Backlight Power / Brightness control |
| **SDO / MISO** | **GPIO 5** (D3) | SPI Return Data (Optional for SD card/touch) |

### Battery & Switch Wiring
* **LiPo Battery Red (+):** Connect to Switch pin 1 $\rightarrow$ Switch pin 2 connects to `BAT+` pad under XIAO.
* **LiPo Battery Black (-):** Connect directly to `BAT-` pad under XIAO.

---

## 📱 Companion Application Architecture ("Application Perfect")

The companion application powers the live GPS routing, live speed calculation, and Bluetooth synchronization.

```text
┌─────────────────────────────────────────────────────────────┐
│                   SMARTPHONE COMPANION                      │
│                                                             │
│   [ Live GPS ]        [ OSRM / Google Maps ]     [ Speech ] │
│  watchPosition()       Turn-by-Turn Engine       Voice HUD  │
│        │                        │                    │      │
│        └────────────┬───────────┘                    │      │
│                     ▼                                │      │
│        ┌────────────────────────┐                    │      │
│        │  Interactive Web App   │◄───────────────────┘      │
│        │  - Route Map & Path    │                           │
│        │  - Waypoint Timeline   │                           │
│        │  - Live Speed (km/h)   │                           │
│        │  - 60 km/h Simulator   │                           │
│        └────────────┬───────────┘                           │
└─────────────────────┼───────────────────────────────────────┘
                      │ Web Bluetooth API (Nordic UART Service)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 POMMAI / BIKE BUDDY (ESP32-C3)              │
│                                                             │
│  [ BLE RX Task ] ──► [ Nav State ] ──► [ 3D Road Animation ]│
│                                    ──► [ Turn Arrow & Metres│
│                                    ──► [ Flashing NOW Alert]│
└─────────────────────────────────────────────────────────────┘
```

### 1. Method A: Web Bluetooth Dashboard (Zero App Installation)
* Open the PommAI Web App in Chrome/Edge on your Android phone.
* Tap **"Connect"** $\rightarrow$ pairs with `PommAI` via Web Bluetooth (BLE).
* **Live GPS Tracking:** The browser's Geolocation API tracks latitude, longitude, and speed in real time.
* **Smart Route Engine:** Fetches turn-by-turn maneuvers from OpenStreetMap / OSRM routing.
* **Auto-Sync:** Streams formatted maneuver commands (`NAV:RIGHT:220m:Anna Salai`) directly to the bike display.
* **Live Desktop Simulator:** Allows you to simulate driving at 60 km/h from your desk to preview the exact display animations and countdowns before riding!

### 2. Method B: Direct Google Maps Mirroring (Android Notification Service)
* Use the free open-source companion app (such as **Chronos** from Google Play Store or **MacroDroid**).
* Whenever navigation is running in the official Google Maps app, the notification text (`In 200m Turn Right onto Anna Salai`) is read and transmitted over BLE.
* The ESP32-C3 firmware contains a built-in natural language parser that automatically extracts the maneuver, distance in meters, and street name!

---

## 📡 Bluetooth Low Energy (BLE) Protocol Reference

PommAI exposes the standard **Nordic UART Service (NUS)**:
* **Service UUID:** `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`
* **RX Characteristic (Write):** `6E400002-B5A3-F393-E0A9-E50E24DCCA9E`
* **TX Characteristic (Notify):** `6E400003-B5A3-F393-E0A9-E50E24DCCA9E`

### Command Syntax

| Command | Example | Description |
| :--- | :--- | :--- |
| `NAV:<ICON>:<DIST>:<STREET>` | `NAV:RIGHT:220m:Anna Salai` | Shows road curving right, right arrow, 220m, street name |
| `NAV:<ICON>:<DIST>:<STREET>` | `NAV:LEFT:100m:GST Road` | Shows road curving left, left arrow, 100m, street name |
| `NAV:<ICON>:<DIST>:<STREET>` | `NAV:STRAIGHT:1.5km:NH 44` | Shows straight highway scrolling, up arrow, 1.5km |
| `NAV:UTURN:<DIST>:<STREET>` | `NAV:UTURN:50m:Service Rd` | Shows U-turn hairpin loop arrow |
| `NAV:ROUNDABOUT:<DIST>:<STREET>`| `NAV:ROUNDABOUT:200m:Rotary`| Shows traffic circle symbol |
| `NAV:STOP` | `NAV:STOP` | Immediately exits navigation and restores cute Robot Faces |
| Natural Text | `NAV:In 250 m, turn right` | Firmware extracts direction and distance automatically |
| JSON Payload | `{"nav":{"icon":"RIGHT","dist":"250m","street":"MG Rd"}}` | Direct JSON parsing supported |
| `TIME:<EPOCH>` | `TIME:1731744000` | Syncs Real-Time Clock with phone epoch timestamp |
| `CLOCK` / `FACE` | `CLOCK` | Toggles between persistent Always-On Clock and Robot Faces |

---

## 💻 Firmware Build & Flash Guide

### Requirements
* [PlatformIO Core (CLI)](https://platformio.org/install/cli) or PlatformIO IDE in VS Code.
* Python 3.10+

### Step-by-Step Compilation & Upload

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/vistaratech/pomm-ai.git
   cd pomm-ai
   ```

2. **Connect ESP32-C3:**
   Plug your Seeed Studio XIAO ESP32-C3 into your PC via USB Type-C. Check the assigned COM port in Device Manager (e.g. `COM9`).

3. **Compile Firmware:**
   ```bash
   # Temporary drive redirect to prevent C: drive space issues if needed:
   $env:TEMP="D:\temp"; $env:TMP="D:\temp"
   pio run -d firmware -e seeed_xiao_esp32c3
   ```

4. **Flash to ESP32-C3:**
   ```bash
   pio run -d firmware -e seeed_xiao_esp32c3 -t upload
   ```

5. **Upload LittleFS Filesystem (52 Animation Faces & Web UI):**
   ```bash
   pio run -d firmware -e seeed_xiao_esp32c3 -t uploadfs
   ```

---

## 📁 Repository Directory Map

```text
pomm-ai/
├── firmware/                 # ESP32-C3 Firmware (PlatformIO)
│   ├── lib/
│   │   ├── gif_player/       # Optimized QGIF binary animation engine
│   │   └── web_dashboard/    # On-board AsyncWebServer & /api/nav REST API
│   ├── src/
│   │   ├── ble_task.cpp      # Bluetooth Low Energy NUS service & command parser
│   │   ├── display_task.cpp  # FreeRTOS display state machine
│   │   ├── nav_screen.cpp    # 3D perspective road animation & vector arrows
│   │   ├── nav_screen.h      # Navigation state declarations & natural parser
│   │   ├── time_manager.cpp  # RTC sync & timezone handling
│   │   └── main.cpp          # FreeRTOS task launcher & hardware setup
│   ├── data/                 # On-chip Web Dashboard (HTML, JS, CSS, LittleFS)
│   └── platformio.ini        # Build flags, COM port & partition table
├── web/                      # Phone / Desktop Web Companion (Vite + TypeScript)
│   ├── src/
│   │   ├── main.ts           # Web Bluetooth API, GPS tracking, OSRM routing
│   │   └── style.css         # Modern dark dashboard styling
│   └── index.html            # Navigation card view, route timeline, simulator
├── 3D_Models/                # 3D Printable handlebar enclosures & desktop stands
└── README.md                 # Complete project documentation & guide
```

---

## 📜 License & Credits

Developed with ❤️ by Yohesh & Vistara Tech.  
Open-source under the [MIT License](LICENSE). Contributions, suggestions, and pull requests are warmly welcomed!
