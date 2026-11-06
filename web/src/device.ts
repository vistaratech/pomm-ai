// ============================================================
//  PommAI CRT Dashboard — Device Status Module
//  Fetches device info from the ESP32 API endpoints
// ============================================================

function fmtUptime(sec: number): string {
  sec = Math.floor(Number(sec) || 0);
  if (sec < 0) sec = 0;
  if (sec < 60) return '< 1 min';
  const totalMin = Math.floor(sec / 60);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(d + 'd');
  if (h > 0) parts.push(h + 'h');
  if (m > 0) parts.push(m + 'm');
  return parts.length ? parts.join(' ') : '< 1 min';
}

function fmtBytes(b: number): string {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function fmtFwVer(ver: string | null | undefined): string {
  if (!ver) return '—';
  const s = String(ver);
  if (s.charAt(0) === 'v' || s.charAt(0) === 'V') return s;
  if (s.charAt(0) >= '0' && s.charAt(0) <= '9') return 'v' + s;
  return s;
}

let _uptimeSeconds = 0;
let _localTimer: ReturnType<typeof setInterval> | null = null;

function updateLocalUptime(): void {
  _uptimeSeconds++;
  const el = document.getElementById('mini-uptime');
  if (el) el.textContent = fmtUptime(_uptimeSeconds);
  const bootEl = document.getElementById('dev-uptime-boot');
  if (bootEl) bootEl.textContent = fmtUptime(_uptimeSeconds);
}

async function fetchDeviceInfo(): Promise<void> {
  try {
    const resp = await fetch('/api/device');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const d = await resp.json();

    // Identity
    const nameEl = document.getElementById('dev-name');
    if (nameEl) nameEl.textContent = d.name || 'PommAI';

    const idEl = document.getElementById('dev-id');
    if (idEl) idEl.textContent = d.id || '--';

    const fwEl = document.getElementById('dev-firmware');
    if (fwEl) fwEl.textContent = fmtFwVer(d.firmware);

    const miniFw = document.getElementById('mini-firmware');
    if (miniFw) miniFw.textContent = fmtFwVer(d.firmware);

    // Network
    const statusDot = document.getElementById('dev-status-dot');
    const statusText = document.getElementById('dev-status-text');
    const miniDot = document.getElementById('mini-status-dot');
    const miniText = document.getElementById('mini-status-text');

    if (d.server_connected) {
      statusDot?.classList.add('online');
      statusDot?.classList.remove('offline');
      if (statusText) statusText.textContent = 'Connected';
      miniDot?.classList.add('online');
      miniDot?.classList.remove('offline');
      if (miniText) miniText.textContent = 'Online';
    } else {
      statusDot?.classList.add('offline');
      statusDot?.classList.remove('online');
      if (statusText) statusText.textContent = 'Disconnected';
      miniDot?.classList.add('offline');
      miniDot?.classList.remove('online');
      if (miniText) miniText.textContent = 'Offline';
    }

    const serverEl = document.getElementById('dev-server');
    if (serverEl) serverEl.textContent = d.server_connected ? 'Connected' : 'Disconnected';

    const mqttEl = document.getElementById('dev-mqtt');
    if (mqttEl) {
      if (!d.mqtt_enabled) mqttEl.textContent = 'Off';
      else mqttEl.textContent = d.mqtt_connected ? 'Connected' : 'Disconnected';
    }

    // Uptime
    _uptimeSeconds = Number(d.uptime_s) || 0;
    const bootEl = document.getElementById('dev-uptime-boot');
    if (bootEl) bootEl.textContent = fmtUptime(d.uptime_s);

    const miniUptime = document.getElementById('mini-uptime');
    if (miniUptime) miniUptime.textContent = fmtUptime(d.uptime_s);

    const serverUpEl = document.getElementById('dev-uptime-server');
    if (serverUpEl) {
      serverUpEl.textContent = d.server_connected
        ? fmtUptime(d.server_uptime_s)
        : '—';
    }

    // Power LED
    const led = document.getElementById('power-led');
    if (led) led.classList.remove('offline');
  } catch {
    // Device not reachable — show offline state
    setOfflineState();
  }
}

async function fetchStorageInfo(): Promise<void> {
  try {
    const resp = await fetch('/api/storage');
    if (!resp.ok) return;
    const d = await resp.json();

    const usedEl = document.getElementById('dev-storage-used');
    if (usedEl) usedEl.textContent = fmtBytes(d.used);

    const totalEl = document.getElementById('dev-storage-total');
    if (totalEl) totalEl.textContent = fmtBytes(d.total);

    const fillEl = document.getElementById('dev-storage-fill') as HTMLElement;
    if (fillEl && d.total > 0) {
      const pct = Math.min(100, (d.used / d.total) * 100);
      fillEl.style.width = pct.toFixed(1) + '%';
    }
  } catch {
    // Ignore
  }
}

function setOfflineState(): void {
  const miniDot = document.getElementById('mini-status-dot');
  const miniText = document.getElementById('mini-status-text');
  miniDot?.classList.add('offline');
  miniDot?.classList.remove('online');
  if (miniText) miniText.textContent = 'Local';

  const devDot = document.getElementById('dev-status-dot');
  const devText = document.getElementById('dev-status-text');
  devDot?.classList.remove('online');
  if (devText) devText.textContent = 'Not connected';

  // Show local uptime instead
  const miniUptime = document.getElementById('mini-uptime');
  if (miniUptime) miniUptime.textContent = fmtUptime(_uptimeSeconds);
}

export function initDevice(): void {
  // Start local uptime counter
  _localTimer = setInterval(updateLocalUptime, 1000);

  // Initial fetch
  fetchDeviceInfo();
  fetchStorageInfo();

  // Poll device info every 5 seconds
  setInterval(fetchDeviceInfo, 5000);
  setInterval(fetchStorageInfo, 10000);
}

// Cleanup
export function destroyDevice(): void {
  if (_localTimer) {
    clearInterval(_localTimer);
    _localTimer = null;
  }
}

