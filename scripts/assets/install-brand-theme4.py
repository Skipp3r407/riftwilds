"""Remask generated brand logos (theme4) → true RGBA, install into public/assets/brand.

Also writes SVG masters + @2x PNG companions for fan-kit / retina.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from rembg import remove

SRC_DIR = Path(
    r"C:\Users\Skipp3r407\.cursor\projects\c-Users-Skipp3r407-Desktop-Websites-egg-meme-project\assets"
)
DST_DIR = Path(__file__).resolve().parents[2] / "public" / "assets" / "brand"

jobs = [
    ("riftwilds-mark-theme4.png", "riftwilds-mark.png", 512, 512, True),
    ("riftwilds-wordmark-theme4.png", "riftwilds-wordmark.png", None, 140, False),
]


def crop_alpha(im: Image.Image, pad: int = 8) -> Image.Image:
    a = np.array(im.split()[-1])
    ys, xs = np.where(a > 8)
    if len(xs) == 0:
        return im
    x0, x1 = max(0, int(xs.min()) - pad), min(im.width, int(xs.max()) + 1 + pad)
    y0, y1 = max(0, int(ys.min()) - pad), min(im.height, int(ys.max()) + 1 + pad)
    return im.crop((x0, y0, x1, y1))


def clean_light_fringe(arr: np.ndarray) -> np.ndarray:
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    soft = (a > 0) & (a < 255)
    chroma = np.maximum(np.maximum(r, g), b).astype(np.int16) - np.minimum(
        np.minimum(r, g), b
    ).astype(np.int16)
    kill = soft & (r > 220) & (g > 220) & (b > 220)
    bgish = (a > 0) & (r > 200) & (g > 200) & (b > 200) & (chroma < 18)
    arr[..., 3] = np.where(kill | bgish, 0, a)
    a2 = arr[..., 3]
    soft2 = (a2 > 0) & (a2 < 220) & (r > 160) & (g > 160) & (b > 160) & (chroma < 30)
    if soft2.any():
        arr[..., 0] = np.where(soft2, np.minimum(r, 20), arr[..., 0])
        arr[..., 1] = np.where(soft2, np.minimum(g, 30), arr[..., 1])
        arr[..., 2] = np.where(soft2, np.minimum(b, 50), arr[..., 2])
    return arr


def key_near_white(arr: np.ndarray) -> np.ndarray:
    r = arr[..., 0].astype(np.int16)
    g = arr[..., 1].astype(np.int16)
    b = arr[..., 2].astype(np.int16)
    a = arr[..., 3]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    chroma = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    matte = (a > 0) & (lum > 185) & (chroma < 22)
    arr[..., 3] = np.where(matte, 0, a)
    return arr


def key_near_black(arr: np.ndarray) -> np.ndarray:
    r = arr[..., 0].astype(np.int16)
    g = arr[..., 1].astype(np.int16)
    b = arr[..., 2].astype(np.int16)
    a = arr[..., 3]
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    chroma = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
    matte = (a > 0) & (lum < 28) & (chroma < 18)
    arr[..., 3] = np.where(matte, 0, a)
    return arr


def write_svg_mark(path: Path) -> None:
    """Vector egg mark — original IP, matches theme4 palette for scalable chrome."""
    svg = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Riftwilds egg mark">
  <defs>
    <radialGradient id="shell" cx="46%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#2a3142"/>
      <stop offset="55%" stop-color="#12161f"/>
      <stop offset="100%" stop-color="#07090e"/>
    </radialGradient>
    <linearGradient id="vein" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c9a15a"/>
      <stop offset="50%" stop-color="#e0b86a"/>
      <stop offset="100%" stop-color="#8a6230"/>
    </linearGradient>
    <linearGradient id="rift" x1="50%" y1="8%" x2="50%" y2="92%">
      <stop offset="0%" stop-color="#7ef7ff" stop-opacity="0.35"/>
      <stop offset="35%" stop-color="#3de7ff"/>
      <stop offset="55%" stop-color="#9af6ff"/>
      <stop offset="100%" stop-color="#1aa8c4" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe2a0"/>
      <stop offset="40%" stop-color="#ffb84d"/>
      <stop offset="100%" stop-color="#c46a18"/>
    </radialGradient>
    <filter id="bloom" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.2"/>
    </filter>
  </defs>
  <ellipse cx="256" cy="258" rx="148" ry="198" fill="url(#shell)" stroke="#1e2430" stroke-width="3"/>
  <ellipse cx="256" cy="258" rx="148" ry="198" fill="none" stroke="#3de7ff" stroke-opacity="0.22" stroke-width="2" filter="url(#soft)"/>
  <!-- copper vein / circuit filigree -->
  <g stroke="url(#vein)" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.9">
    <path d="M190 140 C210 170 215 210 205 250 C195 290 200 330 220 360"/>
    <path d="M322 138 C302 172 298 212 308 252 C318 292 312 332 292 362"/>
    <path d="M175 220 H210 M302 220 H337"/>
    <path d="M185 280 H215 M297 280 H327"/>
    <path d="M210 170 L230 185 L230 205"/>
    <path d="M302 170 L282 185 L282 205"/>
    <path d="M220 320 L240 335 M292 320 L272 335"/>
    <circle cx="210" cy="250" r="2.4" fill="#e0b86a" stroke="none"/>
    <circle cx="302" cy="250" r="2.4" fill="#e0b86a" stroke="none"/>
    <circle cx="230" cy="185" r="2" fill="#c9a15a" stroke="none"/>
    <circle cx="282" cy="185" r="2" fill="#c9a15a" stroke="none"/>
  </g>
  <!-- cyan rift -->
  <path d="M256 78 C248 120 236 160 232 210 C228 250 230 290 236 330 C242 370 250 410 256 442
           C262 410 270 370 276 330 C282 290 284 250 280 210 C276 160 264 120 256 78 Z"
        fill="url(#rift)" filter="url(#bloom)" opacity="0.95"/>
  <path d="M256 96 C250 140 242 185 240 230 C238 275 242 320 248 365 C252 395 255 420 256 430
           C257 420 260 395 264 365 C270 320 274 275 272 230 C270 185 262 140 256 96 Z"
        fill="#b8fbff" opacity="0.55"/>
  <!-- amber core -->
  <g filter="url(#bloom)">
    <polygon points="256,214 278,256 256,298 234,256" fill="url(#core)"/>
    <polygon points="256,228 268,256 256,284 244,256" fill="#fff1c8" opacity="0.75"/>
  </g>
  <!-- pole caps -->
  <polygon points="256,62 268,78 256,94 244,78" fill="#1a1f2a" stroke="#c9a15a" stroke-width="1.4"/>
  <polygon points="256,430 268,446 256,462 244,446" fill="#1a1f2a" stroke="#c9a15a" stroke-width="1.4"/>
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def write_svg_wordmark(path: Path) -> None:
    """Vector wordmark — chiseled steel-blue/silver with cyan underline + amber diamond."""
    svg = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 160" role="img" aria-label="Riftwilds">
  <defs>
    <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e8f0f8"/>
      <stop offset="28%" stop-color="#9eb4c9"/>
      <stop offset="55%" stop-color="#5d738c"/>
      <stop offset="78%" stop-color="#c5d4e4"/>
      <stop offset="100%" stop-color="#7f93a8"/>
    </linearGradient>
    <linearGradient id="edge" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8fefff"/>
      <stop offset="50%" stop-color="#d7f8ff"/>
      <stop offset="100%" stop-color="#8fefff"/>
    </linearGradient>
    <radialGradient id="gem" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe2a0"/>
      <stop offset="45%" stop-color="#ffb84d"/>
      <stop offset="100%" stop-color="#c46a18"/>
    </radialGradient>
    <filter id="textBloom" x="-10%" y="-30%" width="120%" height="160%">
      <feGaussianBlur stdDeviation="1.4" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <text x="360" y="92" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="72" font-weight="700" letter-spacing="10"
        fill="url(#metal)" stroke="#1a2430" stroke-width="1.2"
        filter="url(#textBloom)">RIFTWILDS</text>
  <text x="360" y="92" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="72" font-weight="700" letter-spacing="10"
        fill="none" stroke="url(#edge)" stroke-width="0.9" opacity="0.55">RIFTWILDS</text>
  <!-- underline -->
  <line x1="78" y1="118" x2="330" y2="118" stroke="#3de7ff" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
  <line x1="390" y1="118" x2="642" y2="118" stroke="#3de7ff" stroke-width="1.6" stroke-linecap="round" opacity="0.85"/>
  <polygon points="360,104 372,118 360,132 348,118" fill="url(#gem)"/>
  <polygon points="360,110 366,118 360,126 354,118" fill="#fff1c8" opacity="0.8"/>
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def write_svg_logo(path: Path) -> None:
    """Horizontal lockup SVG referencing mark + wordmark geometry inline."""
    svg = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220" role="img" aria-label="Riftwilds logo">
  <defs>
    <radialGradient id="shell" cx="46%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#2a3142"/>
      <stop offset="55%" stop-color="#12161f"/>
      <stop offset="100%" stop-color="#07090e"/>
    </radialGradient>
    <linearGradient id="vein" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c9a15a"/>
      <stop offset="100%" stop-color="#8a6230"/>
    </linearGradient>
    <linearGradient id="rift" x1="50%" y1="8%" x2="50%" y2="92%">
      <stop offset="0%" stop-color="#7ef7ff" stop-opacity="0.35"/>
      <stop offset="40%" stop-color="#3de7ff"/>
      <stop offset="100%" stop-color="#1aa8c4" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe2a0"/>
      <stop offset="45%" stop-color="#ffb84d"/>
      <stop offset="100%" stop-color="#c46a18"/>
    </radialGradient>
    <linearGradient id="metal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e8f0f8"/>
      <stop offset="35%" stop-color="#9eb4c9"/>
      <stop offset="70%" stop-color="#5d738c"/>
      <stop offset="100%" stop-color="#c5d4e4"/>
    </linearGradient>
    <filter id="bloom" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge>
        <feMergeNode in="b"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g transform="translate(8,10)">
    <ellipse cx="100" cy="100" rx="78" ry="100" fill="url(#shell)" stroke="#1e2430" stroke-width="2"/>
    <g stroke="url(#vein)" stroke-width="1.2" fill="none" opacity="0.9">
      <path d="M62 50 C75 70 78 95 72 120 C66 145 70 165 82 180"/>
      <path d="M138 50 C125 70 122 95 128 120 C134 145 130 165 118 180"/>
      <circle cx="72" cy="110" r="1.8" fill="#e0b86a" stroke="none"/>
      <circle cx="128" cy="110" r="1.8" fill="#e0b86a" stroke="none"/>
    </g>
    <path d="M100 18 C94 45 86 70 84 95 C82 120 84 145 88 168 C92 188 97 200 100 205
             C103 200 108 188 112 168 C116 145 118 120 116 95 C114 70 106 45 100 18 Z"
          fill="url(#rift)" filter="url(#bloom)"/>
    <polygon points="100,78 112,100 100,122 88,100" fill="url(#core)" filter="url(#bloom)"/>
    <polygon points="100,20 108,30 100,40 92,30" fill="#1a1f2a" stroke="#c9a15a" stroke-width="1"/>
    <polygon points="100,190 108,200 100,210 92,200" fill="#1a1f2a" stroke="#c9a15a" stroke-width="1"/>
  </g>
  <g transform="translate(210,40)">
    <text x="310" y="72" text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="64" font-weight="700" letter-spacing="8"
          fill="url(#metal)" stroke="#1a2430" stroke-width="1">RIFTWILDS</text>
    <line x1="40" y1="96" x2="280" y2="96" stroke="#3de7ff" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
    <line x1="340" y1="96" x2="580" y2="96" stroke="#3de7ff" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/>
    <polygon points="310,84 322,96 310,108 298,96" fill="url(#core)"/>
  </g>
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def main() -> None:
    DST_DIR.mkdir(parents=True, exist_ok=True)
    remasked: dict[str, Image.Image] = {}

    for src_name, dst_name, tw, th, square in jobs:
        src = SRC_DIR / src_name
        print(f"Processing {src_name}...")
        raw = Image.open(src).convert("RGBA")
        out = remove(
            raw,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=6,
        )
        out = out.convert("RGBA")
        arr = np.array(out, dtype=np.uint8)
        arr = clean_light_fringe(arr)
        arr = key_near_white(arr)
        arr = key_near_black(arr)
        out = Image.fromarray(arr, "RGBA")
        out = crop_alpha(out, pad=12)

        if square:
            s = max(out.width, out.height)
            canvas = Image.new("RGBA", (s, s), (0, 0, 0, 0))
            canvas.paste(out, ((s - out.width) // 2, (s - out.height) // 2), out)
            out = canvas.resize((tw, th), Image.Resampling.LANCZOS)
        else:
            if th is not None:
                ratio = th / out.height
                nw = max(1, int(round(out.width * ratio)))
                out = out.resize((nw, th), Image.Resampling.LANCZOS)
            out = crop_alpha(out, pad=4)

        dst = DST_DIR / dst_name
        out.save(dst, format="PNG", optimize=True)
        remasked[dst_name] = out
        px = list(out.getdata())
        t = sum(1 for p in px if p[3] < 5)
        o = sum(1 for p in px if p[3] > 250)
        corners = [px[0], px[out.width - 1], px[(out.height - 1) * out.width], px[-1]]
        print(f"  saved {dst} {out.size} mode={out.mode}")
        print(f"  corners={corners}")
        print(f"  transparent={t} opaque={o} pct_t={100 * t / len(px):.1f}%")

        # @2x companion
        if square:
            hi = out.resize((tw * 2, th * 2), Image.Resampling.LANCZOS)
        else:
            hi = out.resize((out.width * 2, out.height * 2), Image.Resampling.LANCZOS)
        hi_name = dst_name.replace(".png", "@2x.png")
        hi.save(DST_DIR / hi_name, format="PNG", optimize=True)
        print(f"  saved {DST_DIR / hi_name} {hi.size}")

    # Horizontal lockup from remasked pieces (true RGBA, no black matte).
    mark = remasked["riftwilds-mark.png"]
    word = remasked["riftwilds-wordmark.png"]
    target_h = 180
    m_ratio = target_h / mark.height
    mw, mh = int(round(mark.width * m_ratio)), target_h
    mark_r = mark.resize((mw, mh), Image.Resampling.LANCZOS)
    ww_target_h = 100
    w_ratio = ww_target_h / word.height
    ww, wh = int(round(word.width * w_ratio)), ww_target_h
    word_r = word.resize((ww, wh), Image.Resampling.LANCZOS)
    gap, pad = 18, 8
    canvas = Image.new("RGBA", (pad + mw + gap + ww + pad, pad + target_h + pad), (0, 0, 0, 0))
    canvas.paste(mark_r, (pad, pad), mark_r)
    canvas.paste(word_r, (pad + mw + gap, pad + (target_h - wh) // 2), word_r)
    logo_dst = DST_DIR / "riftwilds-logo.png"
    canvas.save(logo_dst, format="PNG", optimize=True)
    print(f"  composited lockup {logo_dst} {canvas.size}")
    logo2 = canvas.resize((canvas.width * 2, canvas.height * 2), Image.Resampling.LANCZOS)
    logo2.save(DST_DIR / "riftwilds-logo@2x.png", format="PNG", optimize=True)
    print(f"  saved {DST_DIR / 'riftwilds-logo@2x.png'} {logo2.size}")

    write_svg_mark(DST_DIR / "riftwilds-mark.svg")
    write_svg_wordmark(DST_DIR / "riftwilds-wordmark.svg")
    write_svg_logo(DST_DIR / "riftwilds-logo.svg")
    print("  wrote SVG masters (mark, wordmark, logo)")
    print("done")


if __name__ == "__main__":
    main()
