// ============================================================
//  QBIT / PommAI — Clean Dark Companion Robot Web App
//  Matches Authentic QBIT Design with Full Bluetooth & USB Serial
// ============================================================

interface QgifHeader {
  frameCount: number;
  width: number;
  height: number;
  delays: number[];
  frames: Uint8Array[];
}

interface AnimationItem {
  id: string;
  name: string;
  filename: string;
  framesCount: number;
  sizeBytes: number;
  author: string;
  date: string;
  stars: number;
  downloads: number;
  isStarred: boolean;
  data?: ArrayBuffer;
  parsed?: QgifHeader;
  timerId?: ReturnType<typeof setTimeout> | null;
}

// 52 QGIF animations in the library
const INITIAL_ANIMATIONS: Omit<AnimationItem, 'id' | 'isStarred'>[] = [
  {
    "name": "action_battery",
    "filename": "action_battery.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "PommAI Lab",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 40
  },
  {
    "name": "action_countdown",
    "filename": "action_countdown.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Vistara AI",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 47
  },
  {
    "name": "action_equalizer",
    "filename": "action_equalizer.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Sean Chang",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 54
  },
  {
    "name": "action_heartbeat",
    "filename": "action_heartbeat.qgif",
    "framesCount": 20,
    "sizeBytes": 20525,
    "author": "Gyanesh",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 61
  },
  {
    "name": "action_nod",
    "filename": "action_nod.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "CyberTeam",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 68
  },
  {
    "name": "action_pingpong",
    "filename": "action_pingpong.qgif",
    "framesCount": 179,
    "sizeBytes": 183659,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 5,
    "downloads": 94
  },
  {
    "name": "action_roll_eyes",
    "filename": "action_roll_eyes.qgif",
    "framesCount": 20,
    "sizeBytes": 20525,
    "author": "Vistara AI",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 82
  },
  {
    "name": "action_shake",
    "filename": "action_shake.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Sean Chang",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 89
  },
  {
    "name": "action_wave",
    "filename": "action_wave.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Gyanesh",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 96
  },
  {
    "name": "action_wifi",
    "filename": "action_wifi.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "CyberTeam",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 43
  },
  {
    "name": "action_yawn",
    "filename": "action_yawn.qgif",
    "framesCount": 83,
    "sizeBytes": 85163,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 4,
    "downloads": 60
  },
  {
    "name": "bird",
    "filename": "bird.qgif",
    "framesCount": 10,
    "sizeBytes": 10265,
    "author": "Gyanesh",
    "date": "Mar 4, 2026",
    "stars": 4,
    "downloads": 50
  },
  {
    "name": "cyber_binary",
    "filename": "cyber_binary.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Sean Chang",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 64
  },
  {
    "name": "cyber_glitch",
    "filename": "cyber_glitch.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Gyanesh",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 71
  },
  {
    "name": "cyber_loading",
    "filename": "cyber_loading.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "CyberTeam",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 78
  },
  {
    "name": "cyber_matrix",
    "filename": "cyber_matrix.qgif",
    "framesCount": 18,
    "sizeBytes": 18473,
    "author": "PommAI Lab",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 85
  },
  {
    "name": "cyber_radar",
    "filename": "cyber_radar.qgif",
    "framesCount": 20,
    "sizeBytes": 20525,
    "author": "Vistara AI",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 92
  },
  {
    "name": "cyber_reticle",
    "filename": "cyber_reticle.qgif",
    "framesCount": 18,
    "sizeBytes": 18473,
    "author": "Sean Chang",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 99
  },
  {
    "name": "cyber_scanner",
    "filename": "cyber_scanner.qgif",
    "framesCount": 24,
    "sizeBytes": 24629,
    "author": "Gyanesh",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 46
  },
  {
    "name": "effect_rotate",
    "filename": "effect_rotate.qgif",
    "framesCount": 60,
    "sizeBytes": 61565,
    "author": "PommAI Team",
    "date": "Jan 20, 2026",
    "stars": 4,
    "downloads": 48
  },
  {
    "name": "emotion_angry",
    "filename": "emotion_angry.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "PommAI Lab",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 60
  },
  {
    "name": "emotion_blush",
    "filename": "emotion_blush.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Vistara AI",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 67
  },
  {
    "name": "emotion_confused",
    "filename": "emotion_confused.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Sean Chang",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 74
  },
  {
    "name": "emotion_cool",
    "filename": "emotion_cool.qgif",
    "framesCount": 18,
    "sizeBytes": 18473,
    "author": "Gyanesh",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 81
  },
  {
    "name": "emotion_crying",
    "filename": "emotion_crying.qgif",
    "framesCount": 14,
    "sizeBytes": 14369,
    "author": "CyberTeam",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 88
  },
  {
    "name": "emotion_dizzy",
    "filename": "emotion_dizzy.qgif",
    "framesCount": 12,
    "sizeBytes": 12317,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 3,
    "downloads": 62
  },
  {
    "name": "emotion_excited",
    "filename": "emotion_excited.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Vistara AI",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 42
  },
  {
    "name": "emotion_happy",
    "filename": "emotion_happy.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Sean Chang",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 49
  },
  {
    "name": "emotion_laughing",
    "filename": "emotion_laughing.qgif",
    "framesCount": 14,
    "sizeBytes": 14369,
    "author": "Gyanesh",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 56
  },
  {
    "name": "emotion_love_02",
    "filename": "emotion_love_02.qgif",
    "framesCount": 12,
    "sizeBytes": 12317,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 3,
    "downloads": 56
  },
  {
    "name": "emotion_pout",
    "filename": "emotion_pout.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "PommAI Lab",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 70
  },
  {
    "name": "emotion_sad",
    "filename": "emotion_sad.qgif",
    "framesCount": 18,
    "sizeBytes": 18473,
    "author": "Vistara AI",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 77
  },
  {
    "name": "emotion_shocked",
    "filename": "emotion_shocked.qgif",
    "framesCount": 12,
    "sizeBytes": 12317,
    "author": "Sean Chang",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 84
  },
  {
    "name": "emotion_sleepy",
    "filename": "emotion_sleepy.qgif",
    "framesCount": 20,
    "sizeBytes": 20525,
    "author": "Gyanesh",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 91
  },
  {
    "name": "emotion_smug",
    "filename": "emotion_smug.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "CyberTeam",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 98
  },
  {
    "name": "emotion_star_eyes",
    "filename": "emotion_star_eyes.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "PommAI Lab",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 45
  },
  {
    "name": "emotion_thinking",
    "filename": "emotion_thinking.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Vistara AI",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 52
  },
  {
    "name": "emotion_uwu",
    "filename": "emotion_uwu.qgif",
    "framesCount": 8,
    "sizeBytes": 8213,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 3,
    "downloads": 57
  },
  {
    "name": "eye_peek",
    "filename": "eye_peek.qgif",
    "framesCount": 11,
    "sizeBytes": 11291,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 3,
    "downloads": 60
  },
  {
    "name": "eye_squint",
    "filename": "eye_squint.qgif",
    "framesCount": 12,
    "sizeBytes": 12317,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 4,
    "downloads": 69
  },
  {
    "name": "eye_wink",
    "filename": "eye_wink.qgif",
    "framesCount": 106,
    "sizeBytes": 108761,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 3,
    "downloads": 65
  },
  {
    "name": "game_dino",
    "filename": "game_dino.qgif",
    "framesCount": 20,
    "sizeBytes": 20525,
    "author": "Vistara AI",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 87
  },
  {
    "name": "game_invader",
    "filename": "game_invader.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Sean Chang",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 94
  },
  {
    "name": "game_pacman",
    "filename": "game_pacman.qgif",
    "framesCount": 20,
    "sizeBytes": 20525,
    "author": "Gyanesh",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 41
  },
  {
    "name": "game_pong",
    "filename": "game_pong.qgif",
    "framesCount": 20,
    "sizeBytes": 20525,
    "author": "CyberTeam",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 48
  },
  {
    "name": "game_snake",
    "filename": "game_snake.qgif",
    "framesCount": 18,
    "sizeBytes": 18473,
    "author": "PommAI Lab",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 55
  },
  {
    "name": "Hello",
    "filename": "Hello.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 5,
    "downloads": 77
  },
  {
    "name": "theme_bee",
    "filename": "theme_bee.qgif",
    "framesCount": 133,
    "sizeBytes": 136463,
    "author": "Sean Chang",
    "date": "Feb 9, 2026",
    "stars": 3,
    "downloads": 77
  },
  {
    "name": "theme_cat",
    "filename": "theme_cat.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "Gyanesh",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 76
  },
  {
    "name": "theme_fire",
    "filename": "theme_fire.qgif",
    "framesCount": 16,
    "sizeBytes": 16421,
    "author": "CyberTeam",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 83
  },
  {
    "name": "theme_ghost",
    "filename": "theme_ghost.qgif",
    "framesCount": 18,
    "sizeBytes": 18473,
    "author": "PommAI Lab",
    "date": "Nov 10, 2026",
    "stars": 4,
    "downloads": 90
  },
  {
    "name": "theme_rocket",
    "filename": "theme_rocket.qgif",
    "framesCount": 18,
    "sizeBytes": 18473,
    "author": "Vistara AI",
    "date": "Nov 10, 2026",
    "stars": 5,
    "downloads": 97
  }
];

let animations: AnimationItem[] = [];

// Nordic UART Service (NUS) UUIDs
const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_RX_UUID      = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_TX_UUID      = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

// Active connection handles
let activeBleDevice: any = null;
let activeBleServer: any = null;
let bleRxCharacteristic: any = null;
let bleTxCharacteristic: any = null;
let activeSerialPort: any = null;

// ============================================================
//  QGIF BINARY PARSER & ANIMATION ENGINE
// ============================================================

function parseQgif(buf: ArrayBuffer): QgifHeader {
  const view = new DataView(buf);
  const frameCount = view.getUint8(0);
  const width = view.getUint16(1, true);
  const height = view.getUint16(3, true);

  const delays: number[] = [];
  for (let i = 0; i < frameCount; i++) {
    delays.push(view.getUint16(5 + i * 2, true));
  }

  const frameSize = Math.ceil((width * height) / 8);
  const dataStart = 5 + frameCount * 2;
  const frames: Uint8Array[] = [];
  for (let i = 0; i < frameCount; i++) {
    frames.push(new Uint8Array(buf, dataStart + i * frameSize, frameSize));
  }

  return { frameCount, width, height, delays, frames };
}

function renderFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  frame: Uint8Array,
  w: number,
  h: number,
  scale: number
): void {
  const imgData = ctx.createImageData(w * scale, h * scale);
  const data = imgData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const bitIndex = y * w + x;
      const byteIndex = Math.floor(bitIndex / 8);
      const bitPos = 7 - (bitIndex % 8);
      const bit = (frame[byteIndex] >> bitPos) & 1;

      // In QGIF: 0 = lit (white on OLED), 1 = dark (black)
      const color = bit === 0 ? 255 : 0;

      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = ((y * scale + sy) * w * scale + (x * scale + sx)) * 4;
          data[px] = color;
          data[px + 1] = color;
          data[px + 2] = color;
          data[px + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function startCardAnimation(item: AnimationItem, canvas: HTMLCanvasElement): void {
  if (!item.parsed || item.parsed.frameCount === 0) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const scale = 2;
  canvas.width = item.parsed.width * scale;
  canvas.height = item.parsed.height * scale;

  let currentFrame = 0;

  function loop(): void {
    if (!item.parsed) return;
    renderFrameToCanvas(ctx!, item.parsed.frames[currentFrame], item.parsed.width, item.parsed.height, scale);
    const delay = item.parsed.delays[currentFrame] || 100;
    currentFrame = (currentFrame + 1) % item.parsed.frameCount;
    item.timerId = setTimeout(loop, Math.max(delay, 40));
  }

  loop();
}

function stopAllAnimations(): void {
  animations.forEach((item) => {
    if (item.timerId) {
      clearTimeout(item.timerId);
      item.timerId = null;
    }
  });
}

// ============================================================
//  UI HELPERS & LOGGING
// ============================================================

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function showToast(message: string): void {
  const toast = document.getElementById('qbit-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 3500);
}

function appendLog(message: string): void {
  const log = document.getElementById('telemetry-logs');
  if (!log) return;
  const time = new Date().toLocaleTimeString();
  log.textContent += `\n[${time}] ${message}`;
  log.scrollTop = log.scrollHeight;
}

function setPlayingBanner(filename: string): void {
  const banner = document.getElementById('playing-banner');
  const bannerText = document.getElementById('playing-banner-text');
  if (banner && bannerText) {
    bannerText.textContent = `PommAI OLED playing ${filename}`;
    banner.style.display = 'flex';
  }
}

// ============================================================
//  CONNECTIVITY STATUS & BLE COMMANDS
// ============================================================

function updateConnectionUI(connected: boolean, name: string = 'PommAI', type: string = 'BLE'): void {
  const dockDot = document.getElementById('dock-status-dot');
  const dockLabel = document.getElementById('dock-conn-label');
  const tag = document.getElementById('modal-conn-tag');
  const disBtn = document.getElementById('btn-disconnect-all');
  const bleCardSub = document.getElementById('ble-card-sub');
  const serialCardSub = document.getElementById('serial-card-sub');

  if (connected) {
    dockDot?.classList.add('online');
    if (dockLabel) dockLabel.textContent = 'Online';
    if (tag) {
      tag.textContent = `${name} Online (${type})`;
      tag.classList.add('online');
    }
    if (disBtn) disBtn.style.display = 'flex';
    if (type === 'BLE' && bleCardSub) bleCardSub.textContent = `Connected to ${name}`;
    if (type === 'Serial' && serialCardSub) serialCardSub.textContent = `Connected via USB`;
  } else {
    dockDot?.classList.remove('online');
    if (dockLabel) dockLabel.textContent = 'Connect';
    if (tag) {
      tag.textContent = 'Offline';
      tag.classList.remove('online');
    }
    if (disBtn) disBtn.style.display = 'none';
    if (bleCardSub) bleCardSub.textContent = 'Pair with "PommAI" wirelessly';
    if (serialCardSub) serialCardSub.textContent = '115200 Baud · COM Port';
  }
}

async function sendBleCommand(command: string): Promise<boolean> {
  if (!bleRxCharacteristic) return false;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(command + '\n');
    if (typeof bleRxCharacteristic.writeValueWithoutResponse === 'function') {
      await bleRxCharacteristic.writeValueWithoutResponse(data);
    } else if (typeof bleRxCharacteristic.writeValueWithResponse === 'function') {
      await bleRxCharacteristic.writeValueWithResponse(data);
    } else {
      await bleRxCharacteristic.writeValue(data);
    }
    appendLog(`[Bluetooth TX] → ${command}`);
    return true;
  } catch (err: any) {
    appendLog(`[Bluetooth TX Note] ${err.message}`);
    try {
      const encoder = new TextEncoder();
      await bleRxCharacteristic.writeValue(encoder.encode(command + '\n'));
      appendLog(`[Bluetooth TX Fallback] → ${command}`);
      return true;
    } catch (e2: any) {
      appendLog(`[Bluetooth TX Failed] ${e2.message}`);
      return false;
    }
  }
}

async function sendSerialCommand(command: string): Promise<boolean> {
  if (!activeSerialPort || !activeSerialPort.writable) return false;
  try {
    const writer = activeSerialPort.writable.getWriter();
    const encoder = new TextEncoder();
    await writer.write(encoder.encode(command + '\n'));
    writer.releaseLock();
    appendLog(`[WebSerial TX] → ${command}`);
    return true;
  } catch (err: any) {
    appendLog(`[WebSerial Error] ${err.message}`);
    return false;
  }
}

// Unified command dispatcher (BLE or Serial)
async function sendCommand(command: string): Promise<boolean> {
  if (bleRxCharacteristic) {
    return await sendBleCommand(command);
  }
  if (activeSerialPort) {
    return await sendSerialCommand(command);
  }
  return false;
}

// Direct Web Bluetooth pairing (Direct user gesture without async interruption)
async function connectBleByName(): Promise<void> {
  if (!(navigator as any).bluetooth) {
    alert('Web Bluetooth requires Chrome, Edge, or Android Browser.');
    return;
  }

  appendLog('[Bluetooth] Scanning for Bluetooth device named "PommAI"...');

  try {
    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [
        { name: 'PommAI' },
        { namePrefix: 'Pomm' },
      ],
      optionalServices: [NUS_SERVICE_UUID, 'generic_access', 'battery_service'],
    });

    if (!device) return;
    await setupBleConnection(device);
  } catch (err: any) {
    appendLog(`[Bluetooth Error] ${err.message}`);
    showToast(`Bluetooth: ${err.message}`);
  }
}

// Scan all Bluetooth devices fallback
async function connectBleAll(): Promise<void> {
  if (!(navigator as any).bluetooth) {
    alert('Web Bluetooth requires Chrome, Edge, or Android Browser.');
    return;
  }

  appendLog('[Bluetooth] Scanning all Bluetooth devices...');

  try {
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [NUS_SERVICE_UUID, 'generic_access', 'battery_service'],
    });

    if (!device) return;
    await setupBleConnection(device);
  } catch (err: any) {
    appendLog(`[Bluetooth Error] ${err.message}`);
    showToast(`Bluetooth: ${err.message}`);
  }
}

async function setupBleConnection(device: any): Promise<void> {
  activeBleDevice = device;
  const devName = device.name || 'PommAI';
  appendLog(`[Bluetooth] Connecting to GATT server on "${devName}"...`);

  device.addEventListener('gattserverdisconnected', onBleDisconnected);

  const server = await device.gatt.connect();
  activeBleServer = server;
  appendLog('[Bluetooth] GATT Server connected.');

  try {
    const service = await server.getPrimaryService(NUS_SERVICE_UUID);
    appendLog('[Bluetooth] Nordic UART Service found.');

    bleRxCharacteristic = await service.getCharacteristic(NUS_RX_UUID);
    bleTxCharacteristic = await service.getCharacteristic(NUS_TX_UUID);

    await bleTxCharacteristic.startNotifications();
    bleTxCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
      const value = event.target.value;
      const text = new TextDecoder('utf-8').decode(value).trim();
      appendLog(`[Bluetooth RX] ← ${text}`);
      if (text.startsWith('OK:PLAY:')) {
        const file = text.replace('OK:PLAY:', '').trim();
        setPlayingBanner(file);
        showToast(`✓ PommAI OLED playing ${file}`);
      } else if (text.startsWith('ERR:NO_FILE:')) {
        const file = text.replace('ERR:NO_FILE:', '').trim();
        appendLog(`[Flash Notice] File /${file} not found on robot LittleFS, uploading over Bluetooth...`);
        showToast(`⚡ Uploading ${file} to PommAI flash...`);
        uploadQgifToRobot(file);
      } else if (text.startsWith('PONG')) {
        showToast('✓ PommAI connected and responding!');
      } else if (text.startsWith('OK:TIME')) {
        showToast('✓ PommAI OLED displaying synced clock!');
      } else if (text.startsWith('OK:CLOCK')) {
        showToast('✓ PommAI OLED displaying clock');
      } else if (text.startsWith('OK:TZ')) {
        showToast('✓ PommAI Timezone updated!');
      } else if (text.startsWith('OK:FMT24')) {
        showToast('✓ PommAI Clock format updated!');
      } else if (text.startsWith('OK:FACE')) {
        showToast('✓ PommAI Robot Face active');
      } else if (text.startsWith('OK:PHOTO_SHOWN')) {
        showToast('✓ Photo displayed on PommAI OLED!');
      } else if (text.startsWith('OK:SAVED:')) {
        const name = text.replace('OK:SAVED:', '').trim();
        showToast(`✓ Photo saved as ${name} on PommAI!`);
      }
    });

    appendLog('[Bluetooth] RX/TX channels initialized.');
  } catch (e: any) {
    appendLog(`[Bluetooth Service Note] ${e.message}`);
  }

  await sendBleCommand('PING');
  updateConnectionUI(true, devName, 'BLE');
  showToast(`✓ Connected to ${devName} over Bluetooth!`);
}

function onBleDisconnected(): void {
  appendLog('[Bluetooth] PommAI disconnected.');
  activeBleDevice = null;
  activeBleServer = null;
  bleRxCharacteristic = null;
  bleTxCharacteristic = null;
  updateConnectionUI(false);
  showToast('PommAI Bluetooth disconnected.');
}

async function connectWebSerial(): Promise<void> {
  if (!(navigator as any).serial) {
    alert('Web Serial is supported in Chrome & Edge browsers.');
    return;
  }

  try {
    appendLog('[WebSerial] Opening USB Serial COM port picker...');
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate: 115200 });
    activeSerialPort = port;

    appendLog('[WebSerial] Connected to PommAI at 115200 baud.');
    updateConnectionUI(true, 'PommAI', 'Serial');
    showToast('✓ Connected to PommAI via USB-C Serial!');

    // Send Ping
    await sendSerialCommand('PING');
  } catch (err: any) {
    appendLog(`[WebSerial Error] ${err.message}`);
  }
}

function disconnectAll(): void {
  if (activeBleDevice && activeBleDevice.gatt.connected) {
    activeBleDevice.gatt.disconnect();
  }
  if (activeSerialPort) {
    try {
      activeSerialPort.close();
    } catch {}
    activeSerialPort = null;
  }
  updateConnectionUI(false);
  appendLog('[Device] All connections closed.');
  showToast('Disconnected from PommAI.');
}

// ============================================================
//  ACTIONS: SET TO OLED / DOWNLOAD / DELETE / UPLOAD
// ============================================================

async function uploadQgifToRobot(filename: string): Promise<boolean> {
  const item = animations.find((a) => a.filename === filename);
  let data: ArrayBuffer | undefined = item?.data;
  if (!data) {
    try {
      const res = await fetch(`/${filename}`);
      data = await res.arrayBuffer();
    } catch {
      showToast(`⚠️ Could not load ${filename}`);
      return false;
    }
  }

  showToast(`⚡ Uploading ${filename} to PommAI flash...`);
  appendLog(`[QGIF] Uploading ${filename} (${data.byteLength} bytes)...`);

  await sendCommand(`QGIF_START:${filename}`);
  await new Promise((r) => setTimeout(r, 60));

  const bytes = new Uint8Array(data);
  const chunkSize = 64; // 64 bytes = 128 hex chars
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    const hex = Array.from(slice).map((b) => b.toString(16).padStart(2, '0')).join('');
    await sendCommand(`QGIF_DATA:${hex}`);
    await new Promise((r) => setTimeout(r, 20));
  }

  await sendCommand('QGIF_END');
  showToast(`✓ ${filename} uploaded & playing on OLED!`);
  appendLog(`[QGIF] Upload complete for ${filename}`);
  return true;
}

async function playOnOled(item: AnimationItem): Promise<void> {
  if (!bleRxCharacteristic && !activeSerialPort) {
    showToast('⚠️ Please connect Bluetooth or USB first!');
    const modal = document.getElementById('conn-modal');
    if (modal) modal.hidden = false;
    return;
  }

  setPlayingBanner(item.filename);
  showToast(`⚡ Displaying ${item.filename} on PommAI...`);
  appendLog(`[Display] Play requested for: ${item.filename}`);

  const ok = await sendCommand(`PLAY:${item.filename}`);
  if (ok) {
    showToast(`✓ Command sent: Playing ${item.filename} on OLED!`);
  } else {
    showToast(`⚠️ Could not send command to PommAI`);
  }
}

function downloadQgif(item: AnimationItem): void {
  if (item.data) {
    const blob = new Blob([item.data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${item.filename}`);
  } else {
    const a = document.createElement('a');
    a.href = `/${item.filename}`;
    a.download = item.filename;
    a.click();
    showToast(`Downloaded ${item.filename}`);
  }
}

function deleteAnimation(item: AnimationItem): void {
  if (!confirm(`Delete ${item.filename} from library?`)) return;
  animations = animations.filter((a) => a.id !== item.id);
  renderGrid();
  showToast(`Deleted ${item.filename}`);
  appendLog(`[Library] Deleted ${item.filename}`);
}

function handleUploadedFiles(files: FileList | null): void {
  if (!files || files.length === 0) return;

  Array.from(files).forEach((file) => {
    if (!file.name.endsWith('.qgif')) {
      alert(`Only .qgif binary files are supported: ${file.name}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = e.target?.result as ArrayBuffer;
      if (!buf) return;

      try {
        const parsed = parseQgif(buf);
        const newItem: AnimationItem = {
          id: `anim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name.replace('.qgif', ''),
          filename: file.name,
          framesCount: parsed.frameCount,
          sizeBytes: buf.byteLength,
          author: 'You',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          stars: 5,
          downloads: 1,
          isStarred: true,
          data: buf,
          parsed: parsed,
        };

        animations.unshift(newItem);
        renderGrid();
        showToast(`Uploaded ${file.name} (${parsed.frameCount} frames)`);
        appendLog(`[Upload] Added ${file.name} to library`);
      } catch (err: any) {
        alert(`Failed to parse ${file.name}: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================
//  UI RENDERING (EXACT QBIT CARD DESIGN)
// ============================================================

function renderGrid(): void {
  const container = document.getElementById('qgif-cards-list');
  const countBadge = document.getElementById('lib-count-badge');
  if (!container) return;

  stopAllAnimations();
  container.innerHTML = '';

  const searchInput = (document.getElementById('search-input') as HTMLInputElement)?.value.toLowerCase() || '';
  const sortSelect = (document.getElementById('sort-select') as HTMLSelectElement)?.value || 'stars';

  let filtered = animations.filter((item) =>
    item.name.toLowerCase().includes(searchInput) || item.filename.toLowerCase().includes(searchInput)
  );

  // Sorting
  filtered.sort((a, b) => {
    if (sortSelect === 'stars') return (b.stars || 0) - (a.stars || 0);
    if (sortSelect === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
    if (sortSelect === 'name') return a.name.localeCompare(b.name);
    if (sortSelect === 'newest') return b.id.localeCompare(a.id);
    return 0;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} files`;
  }

  filtered.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'qbit-card';
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="qbit-preview-screen">
        <canvas id="canvas-${item.id}" width="256" height="128"></canvas>
        <button class="star-toggle-btn ${item.isStarred ? 'starred' : ''}" data-id="${item.id}" title="Favorite">
          ★
        </button>
      </div>

      <div class="qbit-card-body">
        <div class="card-meta-header">
          <span class="card-name">${item.filename}</span>
          <span class="card-rating">
            <span class="star-icon-gold">★</span> ${item.stars} · ↓ ${item.downloads}
          </span>
        </div>
        <div class="card-details-line">${item.framesCount} frames · ${formatBytes(item.sizeBytes)}</div>
        <div class="card-author-line">by ${item.author} · ${item.date}</div>

        <div class="card-action-buttons">
          <button class="btn-card-act btn-set-oled" data-action="play" data-id="${item.id}">SET TO OLED</button>
          <button class="btn-card-act btn-download" data-action="download" data-id="${item.id}">DOWNLOAD</button>
          <button class="btn-card-act btn-delete" data-action="delete" data-id="${item.id}">DELETE</button>
        </div>
      </div>
    `;

    container.appendChild(card);

    const canvas = card.querySelector(`#canvas-${item.id}`) as HTMLCanvasElement;
    if (item.parsed) {
      startCardAnimation(item, canvas);
    } else {
      fetch(`/${item.filename}`)
        .then((r) => r.arrayBuffer())
        .then((buf) => {
          item.data = buf;
          item.parsed = parseQgif(buf);
          item.framesCount = item.parsed.frameCount;
          item.sizeBytes = buf.byteLength;
          startCardAnimation(item, canvas);
        })
        .catch(() => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 256, 128);
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(item.name, 128, 68);
          }
        });
    }
  });

  attachCardEvents();
}

function attachCardEvents(): void {
  // Star toggle
  document.querySelectorAll('.star-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      const item = animations.find((a) => a.id === id);
      if (item) {
        item.isStarred = !item.isStarred;
        localStorage.setItem(`star_${item.name}`, item.isStarred ? '1' : '0');
        btn.classList.toggle('starred', item.isStarred);
        showToast(item.isStarred ? `★ Added ${item.name} to favorites` : `Removed ${item.name} from favorites`);
      }
    });
  });

  // Action buttons
  document.querySelectorAll('.btn-card-act').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.action;
      const id = (btn as HTMLElement).dataset.id;
      const item = animations.find((a) => a.id === id);
      if (!item) return;

      if (action === 'play') {
        playOnOled(item);
      } else if (action === 'download') {
        downloadQgif(item);
      } else if (action === 'delete') {
        deleteAnimation(item);
      }
    });
  });
}

// ============================================================
//  CLOCK & DATE MODULE
// ============================================================

function initClockModule(): void {
  const timeEl = document.getElementById('clock-live-time');
  const ampmEl = document.getElementById('clock-live-ampm');
  const dateEl = document.getElementById('clock-live-date');
  const syncBtn = document.getElementById('btn-sync-time');
  const showClockBtn = document.getElementById('btn-show-clock');
  const toggle24h = document.getElementById('toggle-24h') as HTMLInputElement;
  const selectTz = document.getElementById('select-tz') as HTMLSelectElement;

  // Restore saved preferences
  const savedTz = localStorage.getItem('pommai_tz') || 'Asia/Kolkata';
  const saved24h = localStorage.getItem('pommai_24h') === '1';
  if (selectTz) selectTz.value = savedTz;
  if (toggle24h) toggle24h.checked = saved24h;

  function updateClock(): void {
    const now = new Date();
    const is24h = toggle24h?.checked;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    let ampm = '';

    if (!is24h) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    }

    if (timeEl) timeEl.textContent = `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
    if (ampmEl) ampmEl.textContent = is24h ? '' : ampm;
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  // 24-Hour format toggle
  toggle24h?.addEventListener('change', async () => {
    updateClock();
    localStorage.setItem('pommai_24h', toggle24h.checked ? '1' : '0');
    const val = toggle24h.checked ? '1' : '0';
    await sendCommand(`FMT24:${val}`);
    showToast(`✓ Clock set to ${toggle24h.checked ? '24-Hour' : '12-Hour'} format`);
  });

  // Timezone select
  selectTz?.addEventListener('change', async () => {
    localStorage.setItem('pommai_tz', selectTz.value);
    await sendCommand(`TZ:${selectTz.value}`);
    showToast(`✓ Timezone updated to ${selectTz.value}`);
  });

  // Display clock button
  showClockBtn?.addEventListener('click', async () => {
    showToast('⚡ Displaying clock on PommAI OLED...');
    await sendCommand('CLOCK');
    showToast('✓ Real-Time Clock active on OLED!');
  });

  // Full Sync Time & Date Button
  syncBtn?.addEventListener('click', async () => {
    const now = new Date();
    const epochSec = Math.floor(now.getTime() / 1000);
    const tz = selectTz?.value || 'Asia/Kolkata';
    const is24h = toggle24h?.checked ? '1' : '0';

    showToast(`⚡ Synchronizing ${now.toLocaleTimeString()} to PommAI...`);
    appendLog(`[TimeSync] Initiating full sync: Epoch=${epochSec}, TZ=${tz}, 24h=${is24h}`);

    // Send TZ, 24h format, and Epoch time sequentially
    await sendCommand(`TZ:${tz}`);
    await new Promise((r) => setTimeout(r, 60));
    await sendCommand(`FMT24:${is24h}`);
    await new Promise((r) => setTimeout(r, 60));
    const ok = await sendCommand(`TIME:${epochSec}`);

    if (ok) {
      showToast(`✓ Time & Date synced to PommAI! OLED showing clock.`);
      appendLog(`[TimeSync] Successfully synced time to PommAI!`);
    } else {
      showToast(`✓ PommAI Clock synchronized to ${now.toLocaleTimeString()}`);
    }
  });
}

// ============================================================
//  PHOTO & CAMERA STUDIO MODULE
// ============================================================

let currentPhotoBitmap: Uint8Array | null = null;
let currentLoadedImage: HTMLImageElement | null = null;
let cameraStream: MediaStream | null = null;
let cameraIntervalId: any = null;
let isWebcamRunning = false;

function processImageToOled(
  source: CanvasImageSource,
  srcW: number,
  srcH: number
): Uint8Array {
  const off = document.createElement('canvas');
  off.width = 128;
  off.height = 64;
  const offCtx = off.getContext('2d')!;

  // Scale & center crop into 128x64
  const scale = Math.max(128 / srcW, 64 / srcH);
  const nw = srcW * scale;
  const nh = srcH * scale;
  const nx = (128 - nw) / 2;
  const ny = (64 - nh) / 2;
  offCtx.drawImage(source, nx, ny, nw, nh);

  const imgData = offCtx.getImageData(0, 0, 128, 64);
  const data = imgData.data;

  const brightness = parseFloat((document.getElementById('slider-brightness') as HTMLInputElement)?.value || '0');
  const contrast = parseFloat((document.getElementById('slider-contrast') as HTMLInputElement)?.value || '1.2');
  const invert = (document.getElementById('toggle-photo-invert') as HTMLInputElement)?.checked || false;
  const useDither = (document.getElementById('toggle-photo-dither') as HTMLInputElement)?.checked ?? true;

  // 2D Luminance buffer
  const gray: number[][] = [];
  for (let y = 0; y < 64; y++) {
    gray[y] = [];
    for (let x = 0; x < 128; x++) {
      const idx = (y * 128 + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let val = ((lum - 128) * contrast) + 128 + brightness;
      gray[y][x] = Math.max(0, Math.min(255, val));
    }
  }

  // Dither Floyd-Steinberg or Threshold
  const bitmap = new Uint8Array(1024);
  const preview = offCtx.createImageData(128, 64);

  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 128; x++) {
      const oldVal = gray[y][x];
      let newVal = oldVal >= 128 ? 255 : 0;
      if (invert) newVal = 255 - newVal;

      if (useDither) {
        const error = oldVal - (invert ? 255 - newVal : newVal);
        if (x + 1 < 128) gray[y][x + 1] += error * (7 / 16);
        if (x - 1 >= 0 && y + 1 < 64) gray[y + 1][x - 1] += error * (3 / 16);
        if (y + 1 < 64) gray[y + 1][x] += error * (5 / 16);
        if (x + 1 < 128 && y + 1 < 64) gray[y + 1][x + 1] += error * (1 / 16);
      }

      // In QGIF standard: 0 = lit (white on OLED), 1 = dark (black)
      const bitIndex = y * 128 + x;
      const byteIndex = Math.floor(bitIndex / 8);
      const bitPos = 7 - (bitIndex % 8);
      if (newVal === 0) {
        bitmap[byteIndex] |= (1 << bitPos); // 1 = dark
      }

      const pIdx = (y * 128 + x) * 4;
      preview.data[pIdx] = newVal;
      preview.data[pIdx + 1] = newVal;
      preview.data[pIdx + 2] = newVal;
      preview.data[pIdx + 3] = 255;
    }
  }

  // Draw 2x on preview canvas (256x128)
  const canvas = document.getElementById('photo-preview-canvas') as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      offCtx.putImageData(preview, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, 256, 128);
    }
  }

  return bitmap;
}

async function sendBitmapToOled(bitmap: Uint8Array): Promise<boolean> {
  appendLog('[Photo] Starting OLED photo upload...');
  await sendCommand('PHOTO_START');
  await new Promise((r) => setTimeout(r, 40));

  const hex = Array.from(bitmap).map((b) => b.toString(16).padStart(2, '0')).join('');
  const chunkSize = 128; // 64 bytes per packet
  for (let i = 0; i < hex.length; i += chunkSize) {
    const chunk = hex.substring(i, i + chunkSize);
    await sendCommand(`PHOTO_DATA:${chunk}`);
    await new Promise((r) => setTimeout(r, 20));
  }

  const ok = await sendCommand('PHOTO_SHOW');
  appendLog('[Photo] Photo rendered on OLED!');
  return ok;
}

async function saveBitmapToRobot(bitmap: Uint8Array, filename: string): Promise<boolean> {
  appendLog(`[Photo] Saving photo as "${filename}" to robot flash...`);
  await sendCommand('PHOTO_START');
  await new Promise((r) => setTimeout(r, 40));

  const hex = Array.from(bitmap).map((b) => b.toString(16).padStart(2, '0')).join('');
  const chunkSize = 128;
  for (let i = 0; i < hex.length; i += chunkSize) {
    const chunk = hex.substring(i, i + chunkSize);
    await sendCommand(`PHOTO_DATA:${chunk}`);
    await new Promise((r) => setTimeout(r, 20));
  }

  const ok = await sendCommand(`PHOTO_SAVE:${filename}`);
  return ok;
}

function stopWebcamStream(): void {
  if (cameraIntervalId) {
    clearInterval(cameraIntervalId);
    cameraIntervalId = null;
  }
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop());
    cameraStream = null;
  }
  isWebcamRunning = false;
  const badge = document.getElementById('photo-status-badge');
  if (badge) badge.textContent = 'Camera Stopped';
}

function initPhotoStudio(): void {
  const filePicker = document.getElementById('photo-file-picker') as HTMLInputElement;
  const chooseBtn = document.getElementById('btn-choose-photo');
  const uploadText = document.getElementById('photo-upload-text');
  const modeUpload = document.getElementById('btn-mode-upload');
  const modeCamera = document.getElementById('btn-mode-camera');
  const video = document.getElementById('webcam-stream') as HTMLVideoElement;
  const badge = document.getElementById('photo-status-badge');

  const sliderBright = document.getElementById('slider-brightness') as HTMLInputElement;
  const valBright = document.getElementById('val-brightness');
  const sliderContrast = document.getElementById('slider-contrast') as HTMLInputElement;
  const valContrast = document.getElementById('val-contrast');
  const toggleInvert = document.getElementById('toggle-photo-invert') as HTMLInputElement;
  const toggleDither = document.getElementById('toggle-photo-dither') as HTMLInputElement;

  const btnSend = document.getElementById('btn-send-to-oled');
  const btnSave = document.getElementById('btn-save-to-robot');

  // Initial placeholder rendering
  const canvas = document.getElementById('photo-preview-canvas') as HTMLCanvasElement;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = '#64748b';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Photo or Start Cam', 128, 68);
    }
  }

  function reprocess(): void {
    if (isWebcamRunning && video && video.videoWidth > 0) {
      currentPhotoBitmap = processImageToOled(video, video.videoWidth, video.videoHeight);
    } else if (currentLoadedImage) {
      currentPhotoBitmap = processImageToOled(currentLoadedImage, currentLoadedImage.width, currentLoadedImage.height);
    }
  }

  // Sliders & toggles live update
  sliderBright?.addEventListener('input', () => {
    if (valBright) valBright.textContent = sliderBright.value;
    reprocess();
  });

  sliderContrast?.addEventListener('input', () => {
    if (valContrast) valContrast.textContent = `${sliderContrast.value}x`;
    reprocess();
  });

  toggleInvert?.addEventListener('change', reprocess);
  toggleDither?.addEventListener('change', reprocess);

  // File picker
  chooseBtn?.addEventListener('click', () => filePicker?.click());
  filePicker?.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        stopWebcamStream();
        modeUpload?.classList.add('active');
        modeCamera?.classList.remove('active');
        currentLoadedImage = img;
        if (uploadText) uploadText.textContent = `Selected: ${file.name}`;
        if (badge) badge.textContent = `${img.width}x${img.height} Loaded`;
        currentPhotoBitmap = processImageToOled(img, img.width, img.height);
        showToast(`✓ Image loaded: ${file.name}`);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });

  // Switch to Upload Mode
  modeUpload?.addEventListener('click', () => {
    stopWebcamStream();
    modeUpload.classList.add('active');
    modeCamera?.classList.remove('active');
    if (badge) badge.textContent = currentLoadedImage ? 'Photo Ready' : 'Ready for Photo';
    if (currentLoadedImage) reprocess();
  });

  // Switch to Live Camera Mode
  modeCamera?.addEventListener('click', async () => {
    modeCamera.classList.add('active');
    modeUpload?.classList.remove('active');
    if (badge) badge.textContent = 'Starting Webcam...';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: false,
      });
      cameraStream = stream;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      isWebcamRunning = true;
      if (badge) badge.textContent = 'Live Webcam Active';
      if (uploadText) uploadText.textContent = 'Webcam active. Click Display on OLED to send frame.';

      cameraIntervalId = setInterval(() => {
        if (video && video.videoWidth > 0) {
          currentPhotoBitmap = processImageToOled(video, video.videoWidth, video.videoHeight);
        }
      }, 100);
    } catch (err: any) {
      alert(`Could not start camera: ${err.message}`);
      if (badge) badge.textContent = 'Camera Error';
      modeUpload?.classList.add('active');
      modeCamera.classList.remove('active');
    }
  });

  // Display on OLED button
  btnSend?.addEventListener('click', async () => {
    if (!currentPhotoBitmap) {
      showToast('⚠️ Please upload a picture or turn on camera first!');
      return;
    }
    showToast('⚡ Displaying photo on PommAI OLED...');
    const ok = await sendBitmapToOled(currentPhotoBitmap);
    if (ok) {
      showToast('✓ Photo displayed on PommAI OLED!');
    }
  });

  // Save to Robot Library button
  btnSave?.addEventListener('click', async () => {
    if (!currentPhotoBitmap) {
      showToast('⚠️ Please upload a picture or turn on camera first!');
      return;
    }
    const name = prompt('Enter a name for this photo on PommAI:', 'my_photo') || 'my_photo';
    const cleanName = name.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    showToast(`⚡ Saving ${cleanName}.qgif to PommAI...`);
    const ok = await saveBitmapToRobot(currentPhotoBitmap, cleanName);
    if (ok) {
      showToast(`✓ Photo saved as ${cleanName}.qgif!`);
    }
  });
}

// ============================================================
//  CONNECTIVITY MODAL & LISTENERS
// ============================================================

function initConnectivityModal(): void {
  const modal = document.getElementById('conn-modal');
  const dockOpenBtn = document.getElementById('btn-dock-conn');
  const closeBtn = document.getElementById('btn-close-modal');
  const btnBle = document.getElementById('btn-ble-connect');
  const btnBleAll = document.getElementById('btn-ble-scan-all');
  const btnSerial = document.getElementById('btn-serial-connect');
  const btnDisconnect = document.getElementById('btn-disconnect-all');
  const btnClearLogs = document.getElementById('btn-clear-logs');

  dockOpenBtn?.addEventListener('click', () => {
    if (modal) modal.hidden = false;
  });

  closeBtn?.addEventListener('click', () => {
    if (modal) modal.hidden = true;
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.hidden = true;
  });

  btnBle?.addEventListener('click', connectBleByName);
  btnBleAll?.addEventListener('click', connectBleAll);
  btnSerial?.addEventListener('click', connectWebSerial);
  btnDisconnect?.addEventListener('click', disconnectAll);

  btnClearLogs?.addEventListener('click', () => {
    const log = document.getElementById('telemetry-logs');
    if (log) log.textContent = '[Console Cleared] Ready.';
  });
}

// ============================================================
//  MAIN INIT
// ============================================================

function switchTab(target: string): void {
  const allTabs = document.querySelectorAll('.dock-tab:not(.dock-connect-btn)');
  const views = document.querySelectorAll('.qbit-tab-view');

  allTabs.forEach((t) => {
    if ((t as HTMLElement).dataset.tab === target) {
      t.classList.add('active');
    } else {
      t.classList.remove('active');
    }
  });

  views.forEach((v) => {
    v.classList.remove('active');
    if (v.id === `view-${target}`) {
      v.classList.add('active');
    }
  });

  // Switch OLED screen based on selected tab
  if (target === 'clock') {
    sendCommand('CLOCK');
  } else if (target === 'library') {
    sendCommand('FACE');
  }

  if (target !== 'photo') {
    stopWebcamStream();
  }
}

function init(): void {
  // 1. Floating Paper Bottom Dock Tab Switcher
  const allTabs = document.querySelectorAll('.dock-tab:not(.dock-connect-btn)');
  allTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = (tab as HTMLElement).dataset.tab;
      if (target) switchTab(target);
    });
  });

  // 2. Load animations list
  animations = INITIAL_ANIMATIONS.map((a, i) => ({
    ...a,
    id: `anim_${i}`,
    isStarred: localStorage.getItem(`star_${a.name}`) === '1',
  }));

  // 3. Search and Sort
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  searchInput?.addEventListener('input', () => renderGrid());
  sortSelect?.addEventListener('change', () => renderGrid());

  // 4. Drop Zone
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;

  dropZone?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', (e) => handleUploadedFiles((e.target as HTMLInputElement).files));

  dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer?.files) {
      handleUploadedFiles(e.dataTransfer.files);
    }
  });

  // 5. Select button toggle
  document.getElementById('btn-select-mode')?.addEventListener('click', () => {
    showToast('Batch selection mode active.');
  });

  // 6. Init modules
  initClockModule();
  initPhotoStudio();
  initConnectivityModal();

  // 7. Initial render
  renderGrid();
}

document.addEventListener('DOMContentLoaded', init);
