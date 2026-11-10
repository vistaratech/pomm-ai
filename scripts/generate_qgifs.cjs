/**
 * QGIF Library Generator
 * Generates 40 crisp, expressive monochrome robot animations in authentic QGIF format
 * Output: d:/PommAI/web/public/*.qgif and d:/PommAI/firmware/data/*.qgif
 */

const fs = require('fs');
const path = require('path');

const W = 128;
const H = 64;
const FRAME_BYTES = (W * H) / 8; // 1024 bytes per frame

class QgifCanvas {
  constructor() {
    this.w = W;
    this.h = H;
    this.buf = Buffer.alloc(FRAME_BYTES, 0xFF); // 0xFF = all black (0 = lit/white, 1 = dark)
  }

  clear() {
    this.buf.fill(0xFF);
  }

  setPixel(x, y, white = true) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    const bitIndex = y * this.w + x;
    const byteIndex = Math.floor(bitIndex / 8);
    const bitPos = 7 - (bitIndex % 8);
    if (white) {
      this.buf[byteIndex] &= ~(1 << bitPos); // 0 = white/lit
    } else {
      this.buf[byteIndex] |= (1 << bitPos);  // 1 = black
    }
  }

  drawLine(x0, y0, x1, y1, white = true) {
    x0 = Math.round(x0); y0 = Math.round(y0);
    x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      this.setPixel(x0, y0, white);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  drawThickLine(x0, y0, x1, y1, thickness = 2, white = true) {
    const half = Math.floor(thickness / 2);
    for (let ox = -half; ox <= half; ox++) {
      for (let oy = -half; oy <= half; oy++) {
        this.drawLine(x0 + ox, y0 + oy, x1 + ox, y1 + oy, white);
      }
    }
  }

  drawRect(x, y, w, h, fill = false, white = true) {
    x = Math.round(x); y = Math.round(y);
    w = Math.round(w); h = Math.round(h);
    if (fill) {
      for (let py = y; py < y + h; py++) {
        for (let px = x; px < x + w; px++) {
          this.setPixel(px, py, white);
        }
      }
    } else {
      for (let px = x; px < x + w; px++) {
        this.setPixel(px, y, white);
        this.setPixel(px, y + h - 1, white);
      }
      for (let py = y; py < y + h; py++) {
        this.setPixel(x, py, white);
        this.setPixel(x + w - 1, py, white);
      }
    }
  }

  drawCircle(cx, cy, r, fill = false, white = true) {
    cx = Math.round(cx); cy = Math.round(cy); r = Math.round(r);
    if (r <= 0) {
      this.setPixel(cx, cy, white);
      return;
    }
    if (fill) {
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          if (x * x + y * y <= r * r) {
            this.setPixel(cx + x, cy + y, white);
          }
        }
      }
    } else {
      let x = r;
      let y = 0;
      let err = 0;
      while (x >= y) {
        this.setPixel(cx + x, cy + y, white);
        this.setPixel(cx + y, cy + x, white);
        this.setPixel(cx - y, cy + x, white);
        this.setPixel(cx - x, cy + y, white);
        this.setPixel(cx - x, cy - y, white);
        this.setPixel(cx - y, cy - x, white);
        this.setPixel(cx + y, cy - x, white);
        this.setPixel(cx + x, cy - y, white);
        if (err <= 0) {
          y += 1;
          err += 2 * y + 1;
        }
        if (err > 0) {
          x -= 1;
          err -= 2 * x + 1;
        }
      }
    }
  }

  getBuffer() {
    return Buffer.from(this.buf);
  }
}

function buildQgif(frames, delayMs = 80) {
  const frameCount = frames.length;
  const headerSize = 5 + frameCount * 2;
  const totalSize = headerSize + frameCount * FRAME_BYTES;
  const out = Buffer.alloc(totalSize);

  out.writeUInt8(frameCount, 0);
  out.writeUInt16LE(W, 1);
  out.writeUInt16LE(H, 3);

  for (let i = 0; i < frameCount; i++) {
    const d = Array.isArray(delayMs) ? delayMs[i] : delayMs;
    out.writeUInt16LE(d || 80, 5 + i * 2);
  }

  for (let i = 0; i < frameCount; i++) {
    frames[i].copy(out, headerSize + i * FRAME_BYTES);
  }

  return out;
}

const generators = {
  // 1. emotion_happy: Bouncy curved ^ ^ smiling eyes with rosy cheek dots
  emotion_happy: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const bounce = Math.round(Math.sin((f / count) * Math.PI * 2) * 3);
      const cy = 30 + bounce;

      // Left Eye: curved ^ shape
      c.drawThickLine(30, cy + 6, 46, cy - 6, 2);
      c.drawThickLine(46, cy - 6, 62, cy + 6, 2);

      // Right Eye: curved ^ shape
      c.drawThickLine(66, cy + 6, 82, cy - 6, 2);
      c.drawThickLine(82, cy - 6, 98, cy + 6, 2);

      // Blush dots
      c.drawCircle(24, cy + 12, 3, true);
      c.drawCircle(104, cy + 12, 3, true);

      // Small smile
      c.drawThickLine(58, cy + 16, 64, cy + 20, 2);
      c.drawThickLine(64, cy + 20, 70, cy + 16, 2);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 70);
  },

  // 2. emotion_excited: Wide sparkling bouncing eyes radiating joy sparkles
  emotion_excited: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const bounce = Math.round(Math.abs(Math.sin((f / count) * Math.PI * 2)) * 5);
      const cy = 32 - bounce;
      const r = 14 + (f % 4);

      // Big round eyes
      c.drawCircle(42, cy, r, true);
      c.drawCircle(86, cy, r, true);

      // Inner sparkle highlights (black pupils + white star glint)
      c.drawCircle(42, cy, 6, true, false);
      c.drawCircle(86, cy, 6, true, false);
      c.drawCircle(40, cy - 3, 2, true, true);
      c.drawCircle(84, cy - 3, 2, true, true);

      // Radiating sparkles
      const sparkDist = 26 + (f % 6) * 2;
      const angle = (f / count) * Math.PI * 2;
      for (let i = 0; i < 4; i++) {
        const a = angle + (i * Math.PI) / 2;
        const sx = 64 + Math.cos(a) * sparkDist;
        const sy = cy + Math.sin(a) * (sparkDist * 0.6);
        c.drawRect(sx - 1, sy - 1, 3, 3, true);
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 3. emotion_laughing: >< eyes bouncing vigorously with tear drops
  emotion_laughing: () => {
    const frames = [];
    const count = 14;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const bounce = (f % 2 === 0) ? -2 : 2;
      const cy = 32 + bounce;

      // Left Eye: >
      c.drawThickLine(32, cy - 8, 48, cy, 3);
      c.drawThickLine(48, cy, 32, cy + 8, 3);

      // Right Eye: <
      c.drawThickLine(96, cy - 8, 80, cy, 3);
      c.drawThickLine(80, cy, 96, cy + 8, 3);

      // Big open laughing mouth
      c.drawCircle(64, cy + 12, 10, true);
      c.drawRect(52, cy + 2, 24, 10, true, false);

      // Tears flying out
      const tearDist = 12 + (f % 5) * 4;
      c.drawCircle(24 - tearDist, cy + (f % 4), 2, true);
      c.drawCircle(104 + tearDist, cy + (f % 4), 2, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 60);
  },

  // 4. emotion_angry: Furious slanted robot eyes with lightning brows
  emotion_angry: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const shake = (f % 2 === 0) ? -1 : 1;
      const cy = 32;

      // Furious slanted eyes \  /
      c.drawThickLine(28, cy - 8 + shake, 56, cy + 6 + shake, 3);
      c.drawThickLine(100, cy - 8 - shake, 72, cy + 6 - shake, 3);

      // Under-eye glow
      c.drawRect(34, cy + 8, 18, 4, true);
      c.drawRect(76, cy + 8, 18, 4, true);

      // Angry steam/frown
      c.drawLine(56, cy + 20, 72, cy + 20);
      c.drawLine(56, cy + 20, 52, cy + 24);
      c.drawLine(72, cy + 20, 76, cy + 24);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 75);
  },

  // 5. emotion_sad: Slanted drooping eyes with falling tear
  emotion_sad: () => {
    const frames = [];
    const count = 18;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const cy = 30;

      // Drooping / \ eyes
      c.drawThickLine(30, cy + 6, 52, cy - 4, 3);
      c.drawThickLine(98, cy + 6, 76, cy - 4, 3);

      // Sad pupils
      c.drawCircle(44, cy + 6, 6, true);
      c.drawCircle(84, cy + 6, 6, true);

      // Sad mouth
      c.drawThickLine(56, cy + 22, 64, cy + 18, 2);
      c.drawThickLine(64, cy + 18, 72, cy + 22, 2);

      // Falling tear on right eye
      const tearY = cy + 10 + Math.floor((f / count) * 22);
      c.drawCircle(88, tearY, 2, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 80);
  },

  // 6. emotion_crying: Streaming anime waterfall tears
  emotion_crying: () => {
    const frames = [];
    const count = 14;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const cy = 24;

      // Closed weeping eyes T_T style
      c.drawThickLine(30, cy, 54, cy, 3);
      c.drawThickLine(74, cy, 98, cy, 3);

      // Waterfall tears streaming down
      for (let y = cy + 4; y < H - 4; y += 3) {
        const offset = (y + f * 4) % 12;
        if (offset < 7) {
          c.drawRect(34, y, 4, 2, true);
          c.drawRect(46, y, 4, 2, true);
          c.drawRect(78, y, 4, 2, true);
          c.drawRect(90, y, 4, 2, true);
        }
      }

      // Wobbly open crying mouth
      c.drawRect(58, cy + 14, 12, 12, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 7. emotion_shocked: Huge dilated circle eyes vibrating with exclamation mark
  emotion_shocked: () => {
    const frames = [];
    const count = 12;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const jiggle = (f % 2 === 0) ? -1 : 1;

      // Huge round eyes
      c.drawCircle(38 + jiggle, 32, 18, false);
      c.drawCircle(38 + jiggle, 32, 17, false);
      c.drawCircle(90 - jiggle, 32, 18, false);
      c.drawCircle(90 - jiggle, 32, 17, false);

      // Tiny pinpoint pupils
      c.drawCircle(38, 32, 3, true);
      c.drawCircle(90, 32, 3, true);

      // Floating '!' in center
      c.drawRect(63, 16, 3, 14, true);
      c.drawRect(63, 34, 3, 3, true);

      // Little mouth O
      c.drawCircle(64, 48, 5, false);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 70);
  },

  // 8. emotion_thinking: Eyes looking up-right with floating thought bubbles
  emotion_thinking: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();

      // Eye sockets
      c.drawCircle(40, 36, 12, false);
      c.drawCircle(78, 36, 12, false);

      // Looking up-right pupils
      c.drawCircle(44, 30, 5, true);
      c.drawCircle(82, 30, 5, true);

      // Wobbly thinking mouth
      c.drawLine(56, 52, 66, 50);

      // Thought bubbles floating
      const bPhase = (f / count);
      c.drawCircle(96, 26, 2, true);
      c.drawCircle(104, 18, 3, true);
      c.drawCircle(114, 10 + Math.sin(bPhase * Math.PI * 2) * 2, 5, false);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 80);
  },

  // 9. emotion_confused: One eye big, one eye small with rotating question mark
  emotion_confused: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();

      // Left eye: big curious circle
      c.drawCircle(38, 34, 14, false);
      c.drawCircle(38, 34, 5, true);

      // Right eye: narrow squint line
      c.drawThickLine(76, 34, 98, 34, 3);

      // Slanted mouth
      c.drawLine(54, 52, 70, 48);

      // Question mark above right eye
      const qy = 12 + Math.sin((f / count) * Math.PI * 2) * 2;
      c.drawCircle(88, qy, 4, false);
      c.drawLine(88, qy + 4, 88, qy + 8);
      c.drawRect(87, qy + 11, 2, 2, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 80);
  },

  // 10. emotion_sleepy: Heavy eyelids with drifting Z z z
  emotion_sleepy: () => {
    const frames = [];
    const count = 20;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const lidDrop = Math.floor(Math.sin((f / count) * Math.PI) * 8);

      // Sleepy eyelids
      c.drawCircle(40, 36, 12, false);
      c.drawCircle(80, 36, 12, false);
      // Eyelid covering top
      c.drawRect(28, 24, 24, 6 + lidDrop, true, true);
      c.drawRect(68, 24, 24, 6 + lidDrop, true, true);

      // Small peaceful smile
      c.drawLine(56, 52, 64, 54);
      c.drawLine(64, 54, 72, 52);

      // Floating Zs
      const zOffset = f * 1.5;
      const z1Y = 36 - ((zOffset) % 30);
      const z2Y = 36 - ((zOffset + 10) % 30);

      // Draw 'Z'
      if (z1Y > 4) {
        c.drawLine(96, z1Y, 102, z1Y);
        c.drawLine(102, z1Y, 96, z1Y + 6);
        c.drawLine(96, z1Y + 6, 102, z1Y + 6);
      }
      if (z2Y > 4) {
        c.drawLine(106, z2Y, 110, z2Y);
        c.drawLine(110, z2Y, 106, z2Y + 4);
        c.drawLine(106, z2Y + 4, 110, z2Y + 4);
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 90);
  },

  // 11. emotion_star_eyes: Twinkling anime star eyes pulsing
  emotion_star_eyes: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const r = 8 + Math.round(Math.sin((f / count) * Math.PI * 2) * 5);

      function drawStar(cx, cy, radius) {
        // 4-point star
        c.drawThickLine(cx - radius, cy, cx + radius, cy, 2);
        c.drawThickLine(cx, cy - radius, cx, cy + radius, 2);
        const diag = Math.round(radius * 0.6);
        c.drawLine(cx - diag, cy - diag, cx + diag, cy + diag);
        c.drawLine(cx - diag, cy + diag, cx + diag, cy - diag);
        c.drawCircle(cx, cy, 3, true);
      }

      drawStar(42, 32, r);
      drawStar(86, 32, r);

      // Cute open smile
      c.drawCircle(64, 46, 5, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 70);
  },

  // 12. emotion_cool: 8-bit black pixel sunglasses dropping with bounce
  emotion_cool: () => {
    const frames = [];
    const count = 18;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Regular eyes
      c.drawCircle(42, 32, 8, true);
      c.drawCircle(86, 32, 8, true);

      // Sunglasses animation: drop from y = -20 to y = 26
      const dropProgress = Math.min(1, f / 10);
      const glassY = Math.round(-15 + dropProgress * 41);

      // Glasses frame
      c.drawRect(26, glassY, 34, 14, true);
      c.drawRect(68, glassY, 34, 14, true);
      c.drawRect(60, glassY + 4, 8, 4, true); // bridge

      // White shine gleam on glasses
      const gleam = (f > 11) ? (f - 11) * 6 : 0;
      if (f > 10) {
        c.drawLine(30 + gleam, glassY + 2, 36 + gleam, glassY + 10, false);
        c.drawLine(72 + gleam, glassY + 2, 78 + gleam, glassY + 10, false);
      }

      // Smirk smile
      c.drawLine(58, 52, 68, 52);
      c.drawLine(68, 52, 74, 48);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 75);
  },

  // 13. emotion_smug: Cocked eyebrow smirk with sideways glance
  emotion_smug: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const browLift = Math.round(Math.sin((f / count) * Math.PI * 2) * 3);

      // Left eye normal
      c.drawThickLine(30, 32, 54, 32, 3);
      // Left pupil looking right
      c.drawCircle(48, 36, 4, true);

      // Right eye high arched brow
      c.drawThickLine(74, 24 - browLift, 98, 20 - browLift, 3);
      c.drawCircle(86, 34, 6, false);
      c.drawCircle(90, 34, 3, true);

      // Smug asymmetric smirk
      c.drawThickLine(56, 50, 68, 50, 2);
      c.drawThickLine(68, 50, 76, 44, 2);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 80);
  },

  // 14. emotion_blush: Shy blinking anime eyes with hatched blush marks
  emotion_blush: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const blink = (f % 8 < 2);

      if (blink) {
        c.drawThickLine(32, 34, 52, 34, 2);
        c.drawThickLine(76, 34, 96, 34, 2);
      } else {
        c.drawCircle(42, 32, 9, false);
        c.drawCircle(86, 32, 9, false);
        c.drawCircle(42, 32, 5, true);
        c.drawCircle(86, 32, 5, true);
        c.drawCircle(40, 30, 2, true, false);
        c.drawCircle(84, 30, 2, true, false);
      }

      // Diagonal hatched blush lines on cheeks
      for (let i = 0; i < 3; i++) {
        c.drawLine(24 + i * 4, 46, 27 + i * 4, 41);
        c.drawLine(96 + i * 4, 46, 99 + i * 4, 41);
      }

      // Small timid mouth
      c.drawLine(60, 48, 68, 48);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 90);
  },

  // 15. emotion_pout: Grumpy squint looking sideways away with puffed cheeks
  emotion_pout: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const puff = Math.round(Math.sin((f / count) * Math.PI * 2) * 2);

      // Eyes shifted all the way to the left
      c.drawThickLine(30, 30, 48, 30, 2);
      c.drawCircle(34, 34, 4, true);

      c.drawThickLine(70, 30, 88, 30, 2);
      c.drawCircle(74, 34, 4, true);

      // Puffed cheek circle bump
      c.drawCircle(22, 38, 6 + puff, false);

      // Grumpy wavy pout mouth
      c.drawLine(48, 48, 54, 46);
      c.drawLine(54, 46, 60, 48);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 85);
  },

  // 16. cyber_scanner: Cylon / Knight Rider horizontal laser beam sweep
  cyber_scanner: () => {
    const frames = [];
    const count = 24;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Visor boundary
      c.drawRect(16, 26, 96, 12, false);

      // Beam position sweeps from x=22 to x=94
      const t = f < 12 ? (f / 11) : (1 - (f - 12) / 11);
      const bx = Math.round(22 + t * 72);

      // Center bright core
      c.drawRect(bx - 5, 28, 10, 8, true);

      // Decay trail
      c.drawRect(bx - 12, 30, 6, 4, true);
      c.drawRect(bx + 7, 30, 6, 4, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 50);
  },

  // 17. cyber_matrix: Cascading digital rain glyph streams
  cyber_matrix: () => {
    const frames = [];
    const count = 18;
    const cols = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
    const speeds = [3, 4, 2, 5, 3, 4, 5, 2, 4, 3];

    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      for (let i = 0; i < cols.length; i++) {
        const x = cols[i];
        const headY = (f * speeds[i] * 3) % (H + 30);
        // Head bright glyph
        c.drawRect(x, headY, 3, 4, true);
        // Trailing bits
        for (let trail = 1; trail <= 6; trail++) {
          const ty = headY - trail * 4;
          if (ty >= 0 && ty < H && (trail + f) % 2 === 0) {
            c.setPixel(x + 1, ty, true);
            c.setPixel(x + 1, ty + 1, true);
          }
        }
      }
      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 18. cyber_radar: 360-degree circular radar sweep line with blips
  cyber_radar: () => {
    const frames = [];
    const count = 20;
    const cx = 64;
    const cy = 32;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Concentric rings
      c.drawCircle(cx, cy, 10, false);
      c.drawCircle(cx, cy, 20, false);
      c.drawCircle(cx, cy, 28, false);
      c.drawLine(cx - 28, cy, cx + 28, cy);
      c.drawLine(cx, cy - 28, cx, cy + 28);

      // Sweeping line
      const angle = (f / count) * Math.PI * 2;
      const lx = cx + Math.round(Math.cos(angle) * 28);
      const ly = cy + Math.round(Math.sin(angle) * 28);
      c.drawLine(cx, cy, lx, ly);

      // Radar blips
      c.drawRect(80, 22, 3, 3, true);
      c.drawRect(50, 44, 3, 3, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 60);
  },

  // 19. cyber_glitch: Futuristic robot eyes with CRT tearing glitch shifts
  cyber_glitch: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const isGlitch = (f === 3 || f === 4 || f === 9 || f === 10);
      const shiftY = isGlitch ? 28 : -100;
      const shiftX = isGlitch ? (f % 2 === 0 ? 8 : -8) : 0;

      // Draw base robot eyes
      for (let y = 0; y < H; y++) {
        const applyShift = (y >= shiftY && y <= shiftY + 8) ? shiftX : 0;
        // Left eye
        c.drawRect(30 + applyShift, 20, 24, 24, false);
        c.drawRect(36 + applyShift, 26, 12, 12, true);
        // Right eye
        c.drawRect(74 + applyShift, 20, 24, 24, false);
        c.drawRect(80 + applyShift, 26, 12, 12, true);
      }

      // Glitch scanline bar
      if (isGlitch) {
        c.drawLine(0, shiftY + 4, W - 1, shiftY + 4);
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 70);
  },

  // 20. cyber_reticle: HUD targeting crosshair locking on target
  cyber_reticle: () => {
    const frames = [];
    const count = 18;
    const cx = 64;
    const cy = 32;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const lockSize = 16 + Math.round(Math.abs(Math.sin((f / count) * Math.PI * 2)) * 6);

      // 4 Corner brackets [ ]
      const bLen = 6;
      // Top-Left
      c.drawLine(cx - lockSize, cy - lockSize, cx - lockSize + bLen, cy - lockSize);
      c.drawLine(cx - lockSize, cy - lockSize, cx - lockSize, cy - lockSize + bLen);
      // Top-Right
      c.drawLine(cx + lockSize, cy - lockSize, cx + lockSize - bLen, cy - lockSize);
      c.drawLine(cx + lockSize, cy - lockSize, cx + lockSize, cy - lockSize + bLen);
      // Bottom-Left
      c.drawLine(cx - lockSize, cy + lockSize, cx - lockSize + bLen, cy + lockSize);
      c.drawLine(cx - lockSize, cy + lockSize, cx - lockSize, cy + lockSize - bLen);
      // Bottom-Right
      c.drawLine(cx + lockSize, cy + lockSize, cx + lockSize - bLen, cy + lockSize);
      c.drawLine(cx + lockSize, cy + lockSize, cx + lockSize, cy + lockSize - bLen);

      // Center crosshair
      c.drawCircle(cx, cy, 6, false);
      c.drawLine(cx - 10, cy, cx - 7, cy);
      c.drawLine(cx + 7, cy, cx + 10, cy);
      c.drawLine(cx, cy - 10, cx, cy - 7);
      c.drawLine(cx, cy + 7, cx, cy + 10);
      c.setPixel(cx, cy, true);

      // Lock text indicators
      if (f % 4 < 2) {
        c.drawRect(cx - 14, cy + lockSize + 4, 28, 2, true);
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 21. cyber_binary: Scrolling 0s and 1s matrix stream
  cyber_binary: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Draw rows of binary 0 and 1 glyphs
      for (let col = 12; col < 116; col += 14) {
        for (let row = 6; row < 58; row += 10) {
          const val = (col * 7 + row * 13 + f * 5) % 2;
          const y = (row + f * 2) % 52 + 6;
          if (val === 0) {
            // Draw 0
            c.drawRect(col, y, 6, 7, false);
          } else {
            // Draw 1
            c.drawLine(col + 3, y, col + 3, y + 6);
            c.drawLine(col + 1, y + 1, col + 3, y);
            c.drawLine(col + 1, y + 6, col + 5, y + 6);
          }
        }
      }
      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 70);
  },

  // 22. cyber_loading: Sci-fi segmented circular spinner ring
  cyber_loading: () => {
    const frames = [];
    const count = 16;
    const cx = 64;
    const cy = 32;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const numSegments = 12;
      for (let s = 0; s < numSegments; s++) {
        const angle = (s / numSegments) * Math.PI * 2;
        const activeS = (s + f) % numSegments;
        const rInner = 14;
        const rOuter = 20;
        const x1 = cx + Math.cos(angle) * rInner;
        const y1 = cy + Math.sin(angle) * rInner;
        const x2 = cx + Math.cos(angle) * rOuter;
        const y2 = cy + Math.sin(angle) * rOuter;

        if (activeS < 7) {
          c.drawThickLine(x1, y1, x2, y2, 2);
        }
      }
      c.drawCircle(cx, cy, 5, true);
      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 60);
  },

  // 23. action_wave: Waving robotic mechanical hand
  action_wave: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Eyes looking at hand
      c.drawCircle(36, 32, 10, false);
      c.drawCircle(68, 32, 10, false);
      c.drawCircle(40, 32, 4, true);
      c.drawCircle(72, 32, 4, true);

      // Waving hand on right side
      const waveAngle = Math.sin((f / count) * Math.PI * 2) * 0.35;
      const hx = 100;
      const hy = 34;

      // Arm
      c.drawThickLine(hx, hy + 16, hx, hy, 4);
      // Palm
      c.drawCircle(hx, hy, 6, true);
      // 4 Fingers angled by wave
      for (let i = -2; i <= 2; i++) {
        const fx = hx + Math.sin(waveAngle + i * 0.2) * 12;
        const fy = hy - Math.cos(waveAngle + i * 0.2) * 12;
        c.drawLine(hx, hy, fx, fy);
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 70);
  },

  // 24. action_nod: Eyes bouncing vertically agreeing "Yes Yes!"
  action_nod: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const nodY = Math.round(Math.sin((f / count) * Math.PI * 4) * 6);
      const cy = 32 + nodY;

      // Smiling nodding eyes
      c.drawCircle(42, cy, 12, false);
      c.drawCircle(86, cy, 12, false);
      c.drawCircle(42, cy + 2, 5, true);
      c.drawCircle(86, cy + 2, 5, true);

      // Cheerful mouth
      c.drawLine(58, cy + 14, 64, cy + 18);
      c.drawLine(64, cy + 18, 70, cy + 14);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 25. action_shake: Eyes shaking horizontally saying "No No!"
  action_shake: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const shakeX = Math.round(Math.sin((f / count) * Math.PI * 4) * 8);

      c.drawCircle(42 + shakeX, 32, 12, false);
      c.drawCircle(86 + shakeX, 32, 12, false);
      c.drawCircle(42 + shakeX, 32, 5, true);
      c.drawCircle(86 + shakeX, 32, 5, true);

      // Flat mouth
      c.drawLine(58 + shakeX, 48, 70 + shakeX, 48);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 26. action_roll_eyes: Pupils tracing a full 360-degree circle inside eye sockets
  action_roll_eyes: () => {
    const frames = [];
    const count = 20;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const angle = -(f / count) * Math.PI * 2;
      const px = Math.round(Math.cos(angle) * 6);
      const py = Math.round(Math.sin(angle) * 6);

      // Big round eye sockets
      c.drawCircle(42, 32, 14, false);
      c.drawCircle(86, 32, 14, false);

      // Rolling pupils
      c.drawCircle(42 + px, 32 + py, 6, true);
      c.drawCircle(86 + px, 32 + py, 6, true);

      // Meh mouth
      c.drawLine(58, 52, 70, 52);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 75);
  },

  // 27. action_heartbeat: Medical ECG heartbeat spike traveling left to right
  action_heartbeat: () => {
    const frames = [];
    const count = 20;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const pulseX = Math.round((f / count) * W);

      // Baseline
      for (let x = 0; x < W; x++) {
        let y = 34;
        const dx = x - pulseX;
        if (dx >= -12 && dx <= 12) {
          // Heartbeat spike waveform
          if (dx === -6) y = 30;
          else if (dx === -3) y = 42;
          else if (dx === 0) y = 14;  // big R peak
          else if (dx === 3) y = 50;  // S drop
          else if (dx === 6) y = 32;
          else if (dx === 9) y = 28;  // T wave
        }
        c.setPixel(x, y, true);
        c.setPixel(x, y + 1, true);
      }

      // Small glowing heart in top-right
      c.drawCircle(112, 14, 4, true);
      c.drawCircle(120, 14, 4, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 60);
  },

  // 28. action_battery: Battery charging bar with animated lightning bolt
  action_battery: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Battery frame
      c.drawRect(24, 20, 76, 26, false);
      c.drawRect(100, 28, 6, 10, true); // terminal

      // 4 bars inside filling up
      const barsToFill = (Math.floor(f / 4) + 1);
      for (let b = 0; b < barsToFill; b++) {
        c.drawRect(28 + b * 17, 24, 14, 18, true);
      }

      // Lightning bolt icon flash
      if (f % 2 === 0) {
        c.drawLine(60, 10, 56, 18);
        c.drawLine(56, 18, 64, 18);
        c.drawLine(64, 18, 58, 28);
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 100);
  },

  // 29. action_equalizer: 9-band audio equalizer visualizer bouncing
  action_equalizer: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const numBars = 9;
      for (let i = 0; i < numBars; i++) {
        const height = Math.round(10 + Math.abs(Math.sin((f * 0.4) + i * 0.8)) * 36);
        const bx = 16 + i * 11;
        const by = 54 - height;
        c.drawRect(bx, by, 8, height, true);
        // Peak dot
        c.drawRect(bx, by - 4, 8, 2, true);
      }
      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 30. action_wifi: Pulsing Wi-Fi signal arcs radiating outwards
  action_wifi: () => {
    const frames = [];
    const count = 16;
    const cx = 64;
    const cy = 48;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const maxArc = (f % 4);

      // Center dot
      c.drawCircle(cx, cy, 3, true);

      // Arc 1
      if (maxArc >= 1) {
        for (let a = -45; a <= 45; a += 2) {
          const rad = (a - 90) * (Math.PI / 180);
          c.setPixel(cx + Math.cos(rad) * 12, cy + Math.sin(rad) * 12, true);
        }
      }
      // Arc 2
      if (maxArc >= 2) {
        for (let a = -45; a <= 45; a += 2) {
          const rad = (a - 90) * (Math.PI / 180);
          c.setPixel(cx + Math.cos(rad) * 22, cy + Math.sin(rad) * 22, true);
        }
      }
      // Arc 3
      if (maxArc >= 3) {
        for (let a = -45; a <= 45; a += 2) {
          const rad = (a - 90) * (Math.PI / 180);
          c.setPixel(cx + Math.cos(rad) * 32, cy + Math.sin(rad) * 32, true);
        }
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 90);
  },

  // 31. action_countdown: Big retro digital countdown 3.. 2.. 1.. GO!
  action_countdown: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const step = Math.floor(f / 4); // 0=3, 1=2, 2=1, 3=GO
      const scale = 1 + (f % 4) * 0.2;

      // Draw countdown circle
      c.drawCircle(64, 32, 24, false);

      if (step === 0) {
        // Draw 3
        c.drawThickLine(54, 18, 74, 18, 3);
        c.drawThickLine(74, 18, 64, 28, 3);
        c.drawThickLine(64, 28, 74, 36, 3);
        c.drawThickLine(74, 36, 54, 46, 3);
      } else if (step === 1) {
        // Draw 2
        c.drawThickLine(54, 20, 74, 20, 3);
        c.drawThickLine(74, 20, 74, 30, 3);
        c.drawThickLine(74, 30, 54, 46, 3);
        c.drawThickLine(54, 46, 74, 46, 3);
      } else if (step === 2) {
        // Draw 1
        c.drawThickLine(64, 18, 64, 46, 4);
        c.drawThickLine(56, 26, 64, 18, 3);
      } else {
        // GO!
        c.drawCircle(52, 32, 10, true);
        c.drawCircle(76, 32, 10, true);
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 100);
  },

  // 32. game_pacman: Pacman chomping across the screen eating white dots
  game_pacman: () => {
    const frames = [];
    const count = 20;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const px = Math.round((f / count) * 110) + 10;
      const mouthOpen = (f % 4 < 2);

      // Draw Pacman
      const r = 14;
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          if (x * x + y * y <= r * r) {
            // Mouth wedge cutout if open
            if (mouthOpen && x > 0 && Math.abs(y) < x * 0.8) {
              continue;
            }
            c.setPixel(px + x, 32 + y, true);
          }
        }
      }

      // Draw food dots ahead of Pacman
      for (let dotX = 24; dotX < W - 10; dotX += 16) {
        if (dotX > px + 10) {
          c.drawRect(dotX - 1, 31, 3, 3, true);
        }
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 33. game_invader: Classic 8-bit space invader marching
  game_invader: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const shiftX = Math.round(Math.sin((f / count) * Math.PI * 2) * 12);
      const armsUp = (f % 4 < 2);
      const cx = 64 + shiftX;
      const cy = 32;

      // Invader pixel sprite
      c.drawRect(cx - 16, cy - 8, 32, 16, true);
      // Eye cutouts
      c.drawRect(cx - 10, cy - 4, 6, 6, true, false);
      c.drawRect(cx + 4, cy - 4, 6, 6, true, false);
      // Antennae
      c.drawRect(cx - 12, cy - 14, 4, 6, true);
      c.drawRect(cx + 8, cy - 14, 4, 6, true);
      // Legs / Arms toggled
      if (armsUp) {
        c.drawRect(cx - 20, cy - 12, 4, 10, true);
        c.drawRect(cx + 16, cy - 12, 4, 10, true);
      } else {
        c.drawRect(cx - 20, cy + 2, 4, 10, true);
        c.drawRect(cx + 16, cy + 2, 4, 10, true);
      }

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 80);
  },

  // 34. game_dino: Running T-Rex jumping over cactus
  game_dino: () => {
    const frames = [];
    const count = 20;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Ground line
      c.drawLine(0, 52, W - 1, 52);

      // Dino jump physics
      const isJump = (f >= 6 && f <= 14);
      const jumpHeight = isJump ? Math.round(Math.sin(((f - 6) / 8) * Math.PI) * 18) : 0;
      const dy = 44 - jumpHeight;

      // Dino body
      c.drawRect(24, dy - 14, 14, 14, true);
      c.drawRect(32, dy - 20, 10, 8, true); // head
      c.drawRect(38, dy - 18, 2, 2, true, false); // eye
      // Legs
      if (f % 2 === 0) {
        c.drawLine(26, dy, 26, dy + 6);
      } else {
        c.drawLine(34, dy, 34, dy + 6);
      }

      // Cactus moving left
      const cactusX = Math.round(W - ((f / count) * (W + 20)));
      c.drawRect(cactusX, 36, 6, 16, true);
      c.drawRect(cactusX - 4, 40, 4, 6, true);
      c.drawRect(cactusX + 6, 38, 4, 6, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 35. game_snake: Classic arcade snake eating food pellet
  game_snake: () => {
    const frames = [];
    const count = 18;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Arena border
      c.drawRect(14, 10, 100, 44, false);

      // Snake segments crawling
      const headX = 24 + f * 4;
      for (let s = 0; s < 5; s++) {
        const sx = headX - s * 4;
        c.drawRect(sx, 30, 4, 4, true);
      }

      // Food pellet
      c.drawRect(96, 30, 4, 4, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 75);
  },

  // 36. game_pong: Dual paddle table tennis ball rally
  game_pong: () => {
    const frames = [];
    const count = 20;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Net line
      for (let y = 4; y < H - 4; y += 6) {
        c.drawLine(64, y, 64, y + 3);
      }

      // Ball movement
      const bx = f < 10 ? 20 + f * 9 : 110 - (f - 10) * 9;
      const by = 20 + Math.round(Math.sin((f / 10) * Math.PI) * 24);

      // Ball
      c.drawRect(bx, by, 4, 4, true);

      // Left paddle
      const p1Y = by - 6;
      c.drawRect(12, Math.max(6, Math.min(42, p1Y)), 4, 16, true);

      // Right paddle
      const p2Y = by - 4;
      c.drawRect(112, Math.max(6, Math.min(42, p2Y)), 4, 16, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 60);
  },

  // 37. theme_cat: Cute cat with twitching ears, whiskers, and blinking eyes
  theme_cat: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const earTwitch = (f % 8 === 0) ? -2 : 0;

      // Triangular cat ears
      c.drawLine(34, 26, 26, 12 + earTwitch);
      c.drawLine(26, 12 + earTwitch, 44, 18);
      c.drawLine(94, 26, 102, 12 + earTwitch);
      c.drawLine(102, 12 + earTwitch, 84, 18);

      // Face silhouette
      c.drawCircle(64, 34, 26, false);

      // Blinking almond eyes
      const blink = (f % 10 === 0);
      if (blink) {
        c.drawLine(44, 32, 54, 32);
        c.drawLine(74, 32, 84, 32);
      } else {
        c.drawCircle(48, 32, 5, true);
        c.drawCircle(80, 32, 5, true);
      }

      // Nose & 3 whiskers
      c.drawCircle(64, 42, 2, true);
      // Whiskers left
      c.drawLine(38, 40, 22, 38);
      c.drawLine(38, 42, 20, 42);
      c.drawLine(38, 44, 22, 46);
      // Whiskers right
      c.drawLine(90, 40, 106, 38);
      c.drawLine(90, 42, 108, 42);
      c.drawLine(90, 44, 106, 46);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 80);
  },

  // 38. theme_fire: Flickering 8-bit campfire flame tongues
  theme_fire: () => {
    const frames = [];
    const count = 16;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      // Campfire logs
      c.drawThickLine(44, 52, 84, 56, 3);
      c.drawThickLine(44, 56, 84, 52, 3);

      // Flame tongues rising
      const t1 = Math.round(Math.sin(f * 0.8) * 4);
      const t2 = Math.round(Math.cos(f * 0.9) * 5);
      const t3 = Math.round(Math.sin(f * 1.1) * 3);

      // Main center flame
      c.drawCircle(64, 40, 14 + t1, true);
      c.drawLine(64, 16 + t2, 56, 34);
      c.drawLine(64, 16 + t2, 72, 34);

      // Side flickers
      c.drawCircle(54, 42, 8 + t3, true);
      c.drawCircle(74, 42, 8 - t3, true);

      // Floating sparks
      const sparkY = (H - (f * 4) % 40);
      c.setPixel(60 + t1, sparkY, true);
      c.setPixel(68 - t2, sparkY + 6, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },

  // 39. theme_ghost: Wavy floating cute spooky ghost bobbing up and down
  theme_ghost: () => {
    const frames = [];
    const count = 18;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const floatY = Math.round(Math.sin((f / count) * Math.PI * 2) * 4);
      const gy = 24 + floatY;

      // Rounded ghost head
      c.drawCircle(64, gy, 18, true);
      // Ghost body
      c.drawRect(46, gy, 36, 18, true);

      // Wavy bottom skirt
      const wave = (f % 4);
      for (let x = 46; x < 82; x += 6) {
        const tipY = gy + 18 + ((x / 6 + wave) % 2 === 0 ? 5 : 0);
        c.drawLine(x, gy + 18, x + 3, tipY);
        c.drawLine(x + 3, tipY, x + 6, gy + 18);
      }

      // Spooky round black eyes
      c.drawCircle(56, gy + 2, 4, true, false);
      c.drawCircle(72, gy + 2, 4, true, false);

      // Boo mouth O
      c.drawCircle(64, gy + 10, 3, true, false);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 75);
  },

  // 40. theme_rocket: Pixel rocket blasting off with exhaust particle flame
  theme_rocket: () => {
    const frames = [];
    const count = 18;
    for (let f = 0; f < count; f++) {
      const c = new QgifCanvas();
      const rx = 64;
      const ry = 24 + Math.round(Math.sin((f / count) * Math.PI * 2) * 2);

      // Rocket nose cone
      c.drawLine(rx, ry - 14, rx - 8, ry);
      c.drawLine(rx, ry - 14, rx + 8, ry);
      // Rocket body
      c.drawRect(rx - 8, ry, 16, 16, true);
      // Porthole window
      c.drawCircle(rx, ry + 6, 3, true, false);
      // Side fins
      c.drawLine(rx - 8, ry + 8, rx - 14, ry + 16);
      c.drawLine(rx + 8, ry + 8, rx + 14, ry + 16);

      // Animated exhaust flame
      const flameLen = 8 + (f % 4) * 3;
      c.drawThickLine(rx - 4, ry + 16, rx, ry + 16 + flameLen, 2);
      c.drawThickLine(rx + 4, ry + 16, rx, ry + 16 + flameLen, 2);

      // Trailing smoke particles
      const smokeY = ry + 22 + (f % 5) * 4;
      c.drawCircle(rx - 6 + (f % 3), smokeY, 2, true);
      c.drawCircle(rx + 6 - (f % 3), smokeY + 6, 3, true);

      frames.push(c.getBuffer());
    }
    return buildQgif(frames, 65);
  },
};

// Target directories
const publicDir = path.resolve(__dirname, '../web/public');
const dataDir = path.resolve(__dirname, '../firmware/data');

console.log('Generating 40 high-fidelity robot animations into:');
console.log(' - ' + publicDir);
console.log(' - ' + dataDir);

let generatedCount = 0;

for (const [name, fn] of Object.entries(generators)) {
  const filename = `${name}.qgif`;
  const buf = fn();

  fs.writeFileSync(path.join(publicDir, filename), buf);
  if (fs.existsSync(dataDir)) {
    fs.writeFileSync(path.join(dataDir, filename), buf);
  }
  generatedCount++;
}

console.log(`Successfully generated ${generatedCount} QGIF animation files!`);
