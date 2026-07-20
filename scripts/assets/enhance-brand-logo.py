"""Enhance Theme4 brand PNGs for AAA chrome: deeper glow, sharper edges, crisp favicons.

Operates on existing public/assets/brand masters (no AI regen). Local-only.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

DST = Path(__file__).resolve().parents[2] / "public" / "assets" / "brand"


def to_rgba(im: Image.Image) -> Image.Image:
    return im.convert("RGBA")


def soft_bloom(arr: np.ndarray, mask: np.ndarray, color: tuple[int, int, int], strength: float) -> np.ndarray:
    """Add colored bloom where mask is hot (0..1)."""
    out = arr.astype(np.float32)
    a = out[..., 3:4] / 255.0
    m = mask.astype(np.float32)[..., None] * strength
    for i, c in enumerate(color):
        out[..., i] = np.clip(out[..., i] + m[..., 0] * c * a[..., 0], 0, 255)
    # Slightly lift alpha on bloom edges for glow on dark headers
    out[..., 3] = np.clip(out[..., 3] + m[..., 0] * 40.0 * (out[..., 3] > 8), 0, 255)
    return out.astype(np.uint8)


def cyan_mask(arr: np.ndarray) -> np.ndarray:
    r, g, b, a = [arr[..., i].astype(np.float32) for i in range(4)]
    live = a > 20
    # Electric cyan / teal rift energy
    score = (b - r) * 0.55 + (g - r) * 0.25 + (b - 140) * 0.15
    score = np.clip(score / 120.0, 0, 1) * live
    return score


def amber_mask(arr: np.ndarray) -> np.ndarray:
    r, g, b, a = [arr[..., i].astype(np.float32) for i in range(4)]
    live = a > 20
    # Warm amber / gold crystal
    score = (r - b) * 0.45 + (g - b) * 0.25 + ((r + g) * 0.5 - 160) * 0.1
    score = np.clip(score / 110.0, 0, 1) * live
    return score


def sharpen_rgba(im: Image.Image, amount: float = 1.35) -> Image.Image:
    rgb = im.convert("RGB").filter(ImageFilter.UnsharpMask(radius=1.4, percent=int(amount * 100), threshold=2))
    out = im.copy()
    out.paste(rgb, mask=im.split()[-1])
    # Keep original alpha
    out.putalpha(im.split()[-1])
    return out


def outer_rim_glow(im: Image.Image, color: tuple[int, int, int], blur: float = 6.0, strength: float = 0.55) -> Image.Image:
    """Soft silhouette rim for contrast on dark headers."""
    a = im.split()[-1]
    glow = Image.new("RGBA", im.size, (*color, 0))
    # Expand alpha silhouette
    expanded = a.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(blur))
    glow_arr = np.array(glow, dtype=np.float32)
    exp = np.array(expanded, dtype=np.float32) / 255.0
    base_a = np.array(a, dtype=np.float32) / 255.0
    rim = np.clip(exp - base_a * 0.85, 0, 1) * strength
    for i, c in enumerate(color):
        glow_arr[..., i] = c
    glow_arr[..., 3] = rim * 255.0
    glow_im = Image.fromarray(glow_arr.astype(np.uint8), "RGBA")
    return Image.alpha_composite(glow_im, im)


def enhance_mark(src: Path) -> Image.Image:
    im = to_rgba(Image.open(src))
    arr = np.array(im, dtype=np.uint8)

    c_mask = cyan_mask(arr)
    a_mask = amber_mask(arr)

    # Deeper crystal + clearer rift energy
    arr = soft_bloom(arr, c_mask, (40, 220, 255), 0.42)
    arr = soft_bloom(arr, a_mask, (255, 170, 50), 0.48)
    # Hot core punch on amber
    arr = soft_bloom(arr, np.clip(a_mask * 1.4, 0, 1), (255, 240, 180), 0.28)

    im = Image.fromarray(arr, "RGBA")
    im = ImageEnhance.Contrast(im).enhance(1.08)
    im = ImageEnhance.Color(im).enhance(1.12)
    im = sharpen_rgba(im, amount=1.45)
    im = outer_rim_glow(im, (61, 231, 255), blur=5.5, strength=0.42)
    return im


def add_i_spark(im: Image.Image) -> Image.Image:
    """Amber spark near the I in RIFTWILDS (2nd glyph)."""
    w, h = im.size
    # Approximate I stem center for centered 9-letter lockup
    cx = int(w * 0.195)
    cy = int(h * 0.38)
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # Soft bloom
    for r, alpha in ((10, 40), (6, 90), (3, 160)):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 170, 50, alpha))
    # Diamond spark
    d.polygon([(cx, cy - 5), (cx + 4, cy), (cx, cy + 5), (cx - 4, cy)], fill=(255, 230, 160, 230))
    d.polygon([(cx, cy - 2), (cx + 2, cy), (cx, cy + 2), (cx - 2, cy)], fill=(255, 248, 220, 255))
    layer = layer.filter(ImageFilter.GaussianBlur(0.6))
    return Image.alpha_composite(im, layer)


def enhance_wordmark(src: Path) -> Image.Image:
    im = to_rgba(Image.open(src))
    arr = np.array(im, dtype=np.uint8)

    c_mask = cyan_mask(arr)
    a_mask = amber_mask(arr)
    # Lift metallic midtones slightly for dark-header contrast
    r, g, b, a = [arr[..., i].astype(np.float32) for i in range(4)]
    live = a > 30
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    metal = live & (lum > 35) & (lum < 200)
    lift = np.where(metal, 14.0, 0.0)
    arr[..., 0] = np.clip(r + lift * 0.85, 0, 255).astype(np.uint8)
    arr[..., 1] = np.clip(g + lift * 0.95, 0, 255).astype(np.uint8)
    arr[..., 2] = np.clip(b + lift * 1.15, 0, 255).astype(np.uint8)

    arr = soft_bloom(arr, c_mask, (80, 235, 255), 0.38)
    arr = soft_bloom(arr, a_mask, (255, 175, 55), 0.4)

    im = Image.fromarray(arr, "RGBA")
    im = ImageEnhance.Contrast(im).enhance(1.1)
    im = ImageEnhance.Color(im).enhance(1.1)
    im = sharpen_rgba(im, amount=1.55)
    im = add_i_spark(im)
    im = outer_rim_glow(im, (90, 210, 240), blur=3.5, strength=0.28)
    return im


def composite_logo(mark: Image.Image, word: Image.Image) -> Image.Image:
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
    return canvas


def save_png(im: Image.Image, path: Path) -> None:
    im.save(path, format="PNG", optimize=True)
    print(f"  saved {path.name} {im.size}")


def main() -> None:
    mark_src = DST / "riftwilds-mark.png"
    word_src = DST / "riftwilds-wordmark.png"
    if not mark_src.exists() or not word_src.exists():
        raise SystemExit("Missing brand PNG masters under public/assets/brand/")

    # Backup originals once (idempotent enhance of already-enhanced is mild; backup if absent)
    bak = DST / "_pre_enhance"
    bak.mkdir(exist_ok=True)
    for name in ("riftwilds-mark.png", "riftwilds-wordmark.png"):
        target = bak / name
        if not target.exists():
            Image.open(DST / name).save(target)

    print("Enhancing mark...")
    mark = enhance_mark(bak / "riftwilds-mark.png" if (bak / "riftwilds-mark.png").exists() else mark_src)
    print("Enhancing wordmark...")
    word = enhance_wordmark(bak / "riftwilds-wordmark.png" if (bak / "riftwilds-wordmark.png").exists() else word_src)

    save_png(mark, DST / "riftwilds-mark.png")
    save_png(mark.resize((1024, 1024), Image.Resampling.LANCZOS), DST / "riftwilds-mark@2x.png")

    save_png(word, DST / "riftwilds-wordmark.png")
    save_png(
        word.resize((word.width * 2, word.height * 2), Image.Resampling.LANCZOS),
        DST / "riftwilds-wordmark@2x.png",
    )

    logo = composite_logo(mark, word)
    save_png(logo, DST / "riftwilds-logo.png")
    save_png(
        logo.resize((logo.width * 2, logo.height * 2), Image.Resampling.LANCZOS),
        DST / "riftwilds-logo@2x.png",
    )

    # Favicons / apple touch from enhanced mark (tight crop, crisp downsample)
    bbox = mark.getbbox()
    cropped = mark.crop(bbox) if bbox else mark
    side = max(cropped.width, cropped.height)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(cropped, ((side - cropped.width) // 2, (side - cropped.height) // 2), cropped)

    for size, name in ((16, "favicon-16.png"), (32, "favicon-32.png"), (180, "apple-touch-icon.png")):
        # Pad slightly so glow isn't clipped at tiny sizes
        pad = max(1, size // 16)
        inner = size - pad * 2
        resized = square.resize((inner, inner), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        canvas.paste(resized, (pad, pad), resized)
        if size <= 32:
            canvas = sharpen_rgba(canvas, amount=1.8)
        save_png(canvas, DST / name)

    print("done")


if __name__ == "__main__":
    main()
