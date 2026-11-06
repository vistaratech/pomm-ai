// ============================================================
//  PommAI CRT Dashboard — QGIF Animation Viewer
//  Parses .qgif binary format and renders on canvas with
//  CRT-style blue phosphor coloring
// ============================================================

interface QgifData {
  frameCount: number;
  width: number;
  height: number;
  delays: number[];
  frames: Uint8Array[];
}

// --- Built-in demo animations (CSS pixel-art faces) ---
// These are shown when no device connection is available

interface AnimEntry {
  name: string;
  size: number;
  playing: boolean;
  data?: ArrayBuffer;
}

let _entries: AnimEntry[] = [];
let _previewTimer: ReturnType<typeof setTimeout> | null = null;
let _activeFile = '';
let _previewCanvas: HTMLCanvasElement | null = null;
let _previewCtx: CanvasRenderingContext2D | null = null;

// ---- QGIF Parser (matches firmware format) ----
function parseQgif(buf: ArrayBuffer): QgifData {
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

// ---- Render a single QGIF frame with CRT blue phosphor look ----
function renderFrame(
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

      // QGIF convention: bit=0 means pixel ON (lit), bit=1 means pixel OFF
      // CRT blue phosphor: ON = bright cyan-blue, OFF = dark
      const isLit = bit === 0;

      // Blue phosphor colors
      const r = isLit ? 0 : 2;
      const g = isLit ? 200 : 8;
      const b = isLit ? 255 : 16;

      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = ((y * scale + sy) * w * scale + (x * scale + sx)) * 4;
          data[px] = r;
          data[px + 1] = g;
          data[px + 2] = b;
          data[px + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

// ---- Start animating a qgif on the preview canvas ----
function startPreview(qgif: QgifData): void {
  if (!_previewCanvas || !_previewCtx) return;

  stopPreview();

  const scale = 2;
  _previewCanvas.width = qgif.width * scale;
  _previewCanvas.height = qgif.height * scale;

  let frameIdx = 0;

  function tick(): void {
    renderFrame(_previewCtx!, qgif.frames[frameIdx], qgif.width, qgif.height, scale);
    const delay = qgif.delays[frameIdx] || 100;
    frameIdx = (frameIdx + 1) % qgif.frameCount;
    _previewTimer = setTimeout(tick, delay);
  }

  tick();
}

function stopPreview(): void {
  if (_previewTimer) {
    clearTimeout(_previewTimer);
    _previewTimer = null;
  }
}

// ---- Format file size ----
function fmtSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ---- Render the animation grid ----
function renderGrid(): void {
  const grid = document.getElementById('anim-grid')!;
  const countEl = document.getElementById('lib-count')!;
  const nameEl = document.getElementById('preview-name')!;

  countEl.textContent = `${_entries.length} file${_entries.length !== 1 ? 's' : ''}`;

  if (_entries.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-dim);">
        No animations found.<br/>
        <span style="font-size: 13px;">Connect to your PommAI device to browse animations.</span>
      </div>
    `;
    return;
  }

  grid.innerHTML = _entries
    .map(
      (e, i) => `
    <div class="anim-card ${e.playing ? 'playing' : ''} ${_activeFile === e.name ? 'active' : ''}"
         data-index="${i}">
      <div class="anim-card-icon">${e.playing ? '▶️' : '🎞️'}</div>
      <div class="anim-card-name">${e.name.replace('.qgif', '')}</div>
      <div class="anim-card-size">${fmtSize(e.size)}</div>
    </div>
  `
    )
    .join('');

  // Click handlers
  grid.querySelectorAll('.anim-card').forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt((card as HTMLElement).dataset.index || '0', 10);
      const entry = _entries[idx];
      if (!entry) return;

      _activeFile = entry.name;
      nameEl.textContent = entry.name;

      // Re-render grid to update active state
      grid.querySelectorAll('.anim-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');

      // If we have the data, preview it
      if (entry.data) {
        try {
          const qgif = parseQgif(entry.data);
          startPreview(qgif);
        } catch {
          nameEl.textContent = `Error parsing ${entry.name}`;
        }
      }
    });
  });
}

// ---- Load demo animations from firmware/data (via fetch, if served) ----
async function loadDemoAnimations(): Promise<void> {
  // Demo animation list — these are the known .qgif files in firmware/data
  const demoFiles = [
    'action_pingpong.qgif',
    'action_yawn.qgif',
    'effect_rotate.qgif',
    'eye_wink.qgif',
    'theme_bee.qgif',
  ];

  _entries = demoFiles.map((name) => ({
    name,
    size: 0,
    playing: false,
  }));

  renderGrid();
}

// ---- Try to load from device API, fallback to demos ----
async function loadAnimations(): Promise<void> {
  try {
    // Try device API first (when connected to PommAI device)
    const resp = await fetch('/api/list');
    if (resp.ok) {
      const files: Array<{ name: string; size: number; playing: boolean }> = await resp.json();
      _entries = files.map((f) => ({
        name: f.name,
        size: f.size,
        playing: f.playing,
      }));

      // Load data for each file
      for (const entry of _entries) {
        try {
          const r = await fetch('/' + encodeURIComponent(entry.name));
          if (r.ok) {
            entry.data = await r.arrayBuffer();
            entry.size = entry.data.byteLength;
          }
        } catch {
          // skip
        }
      }

      renderGrid();

      // Auto-preview the playing one
      const playing = _entries.find((e) => e.playing);
      if (playing && playing.data) {
        _activeFile = playing.name;
        document.getElementById('preview-name')!.textContent = playing.name;
        startPreview(parseQgif(playing.data));
      }
      return;
    }
  } catch {
    // Not connected to device — use demos
  }

  await loadDemoAnimations();
}

export function initAnimations(): void {
  _previewCanvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
  _previewCtx = _previewCanvas.getContext('2d')!;

  // Draw a default "waiting" screen on the preview canvas
  _previewCanvas.width = 256;
  _previewCanvas.height = 128;
  _previewCtx.fillStyle = '#020810';
  _previewCtx.fillRect(0, 0, 256, 128);
  _previewCtx.fillStyle = '#004466';
  _previewCtx.font = '14px "VT323", monospace';
  _previewCtx.textAlign = 'center';
  _previewCtx.fillText('SELECT AN ANIMATION', 128, 68);

  loadAnimations();
}

