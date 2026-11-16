# PommAI (பொம்மை) -- Smart AI Desktop Robot Companion 🤖

> **Cute Animated Desktop Robot Companion:** Featuring 52 fluid animated expressions, capacitive touch interaction, Real-Time Clock (RTC), Pomodoro productivity timer, weather display, and retro mini-games. Powered by the **Seeed Studio XIAO ESP32-C3**.

> [!NOTE]
> **Looking for the Motorcycle Navigation HUD project?**  
> The **BikeBuddy 2.0** motorcycle turn-by-turn navigation HUD has been moved to its own dedicated standalone project folder: [BikeBuddy](../BikeBuddy/README.md).

---

## 🌟 Overview & Key Features

PommAI (பொம்மை) is a compact, autonomous desktop AI companion robot designed to bring personality, companionship, and utility to your workspace.

1. **🤖 52 Fluid Animated Expressions:**
   - Smoothly cycles through 52 unique emotion animations (happy, thinking, wink, sleepy, excited, curious, dance, etc.).
   - Optimized high-performance binary frame player (`QGIF`) rendering directly from LittleFS to SPI OLED/TFT display.
   - Operates 100% offline without needing active Wi-Fi or cloud connections.

2. **👆 Capacitive Touch Interaction:**
   - Single tap on the head: Instantly changes mood/expression.
   - Double tap: Switches to Real-Time Clock & Pomodoro timer mode.
   - Long press: Enters retro game selector (T-Rex Runner, Flappy Bird).

3. **⏰ Workspace Productivity Tools:**
   - **Real-Time Clock (RTC):** Clean digital clock with date, day, and battery indicator.
   - **Pomodoro Timer:** 25-minute focus session with buzzer alerts and break reminders.
   - **Wi-Fi NTP Auto-Sync:** Automatically updates time when connected to local Wi-Fi.

4. **🌐 Embedded Web Dashboard:**
   - Onboard HTTP Web Server hosted directly on the ESP32-C3 (`http://192.168.4.1` or local mDNS).
   - Allows changing faces, adjusting animation speeds, uploading custom graphics, and controlling settings directly from your browser.

---

## 🛠️ Hardware Specifications

| Component | Specification | Purpose |
| :--- | :--- | :--- |
| **Microcontroller (MCU)** | **Seeed Studio XIAO ESP32-C3** | 160MHz 32-bit RISC-V, Wi-Fi 2.4GHz, Bluetooth 5.0 LE, 4MB Flash |
| **Display** | **0.96" / 1.3" I2C OLED or 1.69" IPS TFT** | High-contrast display for robot eyes & widgets |
| **Power Input** | Native USB Type-C | Continuous desktop USB power or 3.7V LiPo battery |
| **Touch Sensor** | TTP223 Capacitive Touch Module | Head touch detection |
| **Audio** | Passive Buzzer (GPIO 2) | Sound effects, chimes, and timer alarms |

---

## 📂 Repository Directory Map

```text
PommAI/
├── firmware/                 # ESP32-C3 Firmware (PlatformIO)
│   ├── lib/
│   │   ├── gif_player/       # Optimized QGIF binary animation engine
│   │   └── web_dashboard/    # On-board AsyncWebServer & REST API
│   ├── src/
│   │   ├── ble_task.cpp      # Bluetooth Low Energy service & commands
│   │   ├── display_task.cpp  # FreeRTOS display state machine & face selector
│   │   ├── time_manager.cpp  # RTC sync & NTP timezone handling
│   │   └── main.cpp          # FreeRTOS task launcher & hardware setup
│   ├── data/                 # On-chip Web Dashboard (HTML, JS, CSS, LittleFS)
│   └── platformio.ini        # Build flags, COM port & partition table
├── web/                      # Phone / Desktop Web Companion (Vite + TypeScript)
│   ├── src/
│   │   ├── main.ts           # Companion controller & BLE tools
│   │   └── style.css         # Modern dark dashboard styling
│   └── index.html            # Web dashboard interface
├── 3D_Models/                # 3D Printable desktop stands & robot body shell
└── README.md                 # Complete project documentation
```

---

## 🚀 Getting Started & Flashing Firmware

1. **Open in VS Code with PlatformIO:**
   ```bash
   git clone https://github.com/vistaratech/pomm-ai.git
   cd pomm-ai
   ```

2. **Connect ESP32-C3 via USB Type-C:**
   Verify COM port in Device Manager.

3. **Upload Firmware:**
   ```bash
   pio run -d firmware -e seeed_xiao_esp32c3 -t upload
   ```

4. **Upload LittleFS Filesystem (52 Animation Faces):**
   ```bash
   pio run -d firmware -e seeed_xiao_esp32c3 -t uploadfs
   ```

---

## 📜 License & Credits

Developed with ❤️ by Yohesh & Vistara Tech.  
Open-source under the [MIT License](LICENSE).
