#!/usr/bin/env python3
"""
Generate sample OLED animations in .qgif format matching the PommAI library.
Each is 128x64 monochrome (white on black).
"""

import math
import struct
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path(r"d:\PommAI\web\public")
OUT_DIR.mkdir(parents=True, exist_ok=True)

WIDTH = 128
HEIGHT = 64
FRAME_SIZE = (WIDTH // 8) * HEIGHT  # 1024 bytes


def save_qgif(filepath, frames, delays):
    """
    Format:
      [0]       uint8   frame_count
      [1..2]    uint16  width (LE)
      [3..4]    uint16  height (LE)
      [5..]     uint16  delays[N] (LE, ms)
      [..]      uint8   frames[N][1024] (bit=0 lit, bit=1 dark)
    """
    frame_count = len(frames)
    header = struct.pack("<BHH", frame_count, WIDTH, HEIGHT)
    delays_bytes = b"".join(struct.pack("<H", d) for d in delays)

    bitmaps = []
    for img in frames:
        gray = img.convert("L")
        pixels = gray.load()
        bitmap = bytearray(FRAME_SIZE)
        for y in range(HEIGHT):
            for x in range(WIDTH):
                # In QGIF: dark pixel -> bit 1. Lit pixel -> bit 0
                is_dark = pixels[x, y] < 128
                if is_dark:
                    byte_idx = y * (WIDTH // 8) + (x // 8)
                    bit_idx = 7 - (x % 8)
                    bitmap[byte_idx] |= (1 << bit_idx)
        bitmaps.append(bytes(bitmap))

    data = header + delays_bytes + b"".join(bitmaps)
    filepath.write_bytes(data)
    print(f"Generated {filepath.name} ({frame_count} frames, {len(data)} bytes)")


# 1. Hello.qgif ("ciao")
def gen_hello():
    frames = []
    delays = []
    for i in range(16):
        img = Image.new("L", (WIDTH, HEIGHT), 0)
        draw = ImageDraw.Draw(img)
        # Bouncing "ciao" text
        y_offset = int(math.sin(i * math.pi / 8) * 4)
        draw.text((36, 24 + y_offset), "ciao", fill=255)
        frames.append(img)
        delays.append(100)
    save_qgif(OUT_DIR / "Hello.qgif", frames, delays)


# 2. eye_squint.qgif
def gen_eye_squint():
    frames = []
    delays = []
    # Eye heights from 20 down to 4 and back
    heights = [20, 18, 14, 8, 4, 4, 8, 14, 18, 20, 20, 20]
    for h in heights:
        img = Image.new("L", (WIDTH, HEIGHT), 0)
        draw = ImageDraw.Draw(img)
        # Left eye
        draw.rounded_rectangle([24, 32 - h // 2, 54, 32 + h // 2], radius=4, fill=255)
        # Right eye
        draw.rounded_rectangle([74, 32 - h // 2, 104, 32 + h // 2], radius=4, fill=255)
        # Mouth
        if h > 8:
            draw.arc([56, 38, 72, 48], 0, 180, fill=255, width=2)
        frames.append(img)
        delays.append(110)
    save_qgif(OUT_DIR / "eye_squint.qgif", frames, delays)


# 3. emotion_dizzy.qgif (swirly spiral eyes)
def gen_dizzy():
    frames = []
    delays = []
    for step in range(12):
        img = Image.new("L", (WIDTH, HEIGHT), 0)
        draw = ImageDraw.Draw(img)
        angle_base = step * (math.pi / 6)
        # Draw 2 spirals
        for cx in [38, 90]:
            cy = 32
            pts = []
            for t in range(40):
                r = t * 0.4
                a = angle_base + t * 0.35
                px = cx + r * math.cos(a)
                py = cy + r * math.sin(a)
                pts.append((px, py))
            draw.line(pts, fill=255, width=2)
        # Wavy mouth
        draw.line([(54, 48), (60, 45), (68, 51), (74, 48)], fill=255, width=2)
        frames.append(img)
        delays.append(90)
    save_qgif(OUT_DIR / "emotion_dizzy.qgif", frames, delays)


# 4. emotion_uwu.qgif (> w <)
def gen_uwu():
    frames = []
    delays = []
    for step in range(8):
        img = Image.new("L", (WIDTH, HEIGHT), 0)
        draw = ImageDraw.Draw(img)
        squish = int(math.sin(step * math.pi / 4) * 2)
        # Left closed eye '>'
        draw.line([(22, 26 + squish), (44, 34), (22, 42 - squish)], fill=255, width=3)
        # Right closed eye '<'
        draw.line([(106, 26 + squish), (84, 34), (106, 42 - squish)], fill=255, width=3)
        # 'w' mouth
        draw.arc([52, 34, 64, 46], 0, 180, fill=255, width=2)
        draw.arc([64, 34, 76, 46], 0, 180, fill=255, width=2)
        # Cheeks
        draw.ellipse([14, 38, 22, 44], fill=255)
        draw.ellipse([106, 38, 114, 44], fill=255)
        frames.append(img)
        delays.append(120)
    save_qgif(OUT_DIR / "emotion_uwu.qgif", frames, delays)


# 5. eye_peek.qgif (eyes look left, look right)
def gen_eye_peek():
    frames = []
    delays = []
    # Offsets: center, look left, center, look right, center
    offsets = [0, -6, -12, -12, -6, 0, 6, 12, 12, 6, 0]
    for ox in offsets:
        img = Image.new("L", (WIDTH, HEIGHT), 0)
        draw = ImageDraw.Draw(img)
        # Left eye outline
        draw.rounded_rectangle([20, 20, 56, 44], radius=6, fill=255)
        # Pupil inside
        draw.rounded_rectangle([28 + ox // 2, 26, 48 + ox // 2, 38], radius=3, fill=0)

        # Right eye outline
        draw.rounded_rectangle([72, 20, 108, 44], radius=6, fill=255)
        # Pupil inside
        draw.rounded_rectangle([80 + ox // 2, 26, 100 + ox // 2, 38], radius=3, fill=0)
        frames.append(img)
        delays.append(130)
    save_qgif(OUT_DIR / "eye_peek.qgif", frames, delays)


# 6. emotion_love_02.qgif (happy face with hearts)
def gen_love():
    frames = []
    delays = []
    for step in range(12):
        img = Image.new("L", (WIDTH, HEIGHT), 0)
        draw = ImageDraw.Draw(img)
        # Happy eyes (curved arcs ^ ^)
        draw.arc([24, 24, 52, 48], 180, 360, fill=255, width=3)
        draw.arc([76, 24, 104, 48], 180, 360, fill=255, width=3)
        # Big smile
        draw.arc([52, 32, 76, 52], 0, 180, fill=255, width=2)
        # Floating heart
        hy = 18 - (step % 6) * 2
        hx = 64
        # Draw little heart
        draw.polygon([(hx, hy + 6), (hx - 5, hy), (hx, hy - 4), (hx + 5, hy)], fill=255)
        frames.append(img)
        delays.append(100)
    save_qgif(OUT_DIR / "emotion_love_02.qgif", frames, delays)


# 7. bird.qgif (cute flapping birds)
def gen_bird():
    frames = []
    delays = []
    for step in range(10):
        img = Image.new("L", (WIDTH, HEIGHT), 0)
        draw = ImageDraw.Draw(img)
        wing = int(math.sin(step * math.pi / 2.5) * 6)
        # Bird 1 (left)
        draw.ellipse([42, 30, 54, 42], fill=255)  # body
        draw.polygon([(36, 34), (44, 30 - wing), (46, 36)], fill=255)  # left wing
        draw.polygon([(52, 36), (54, 30 - wing), (60, 34)], fill=255)  # right wing
        draw.polygon([(47, 42), (49, 45), (51, 42)], fill=255)  # beak

        # Bird 2 (right)
        draw.ellipse([74, 30, 86, 42], fill=255)  # body
        draw.polygon([(68, 34), (76, 30 + wing), (78, 36)], fill=255)  # left wing
        draw.polygon([(84, 36), (86, 30 + wing), (92, 34)], fill=255)  # right wing
        draw.polygon([(79, 42), (81, 45), (83, 42)], fill=255)  # beak

        frames.append(img)
        delays.append(90)
    save_qgif(OUT_DIR / "bird.qgif", frames, delays)


if __name__ == "__main__":
    gen_hello()
    gen_eye_squint()
    gen_dizzy()
    gen_uwu()
    gen_eye_peek()
    gen_love()
    gen_bird()
    print("Done generating all library faces!")

