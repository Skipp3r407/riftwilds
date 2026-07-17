"""Remask generated brand logos → true RGBA, install into public/assets/brand."""

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
    ("riftwilds-mark-theme1.png", "riftwilds-mark.png", 512, 512, True),
    ("riftwilds-wordmark-theme1.png", "riftwilds-wordmark.png", None, 140, False),
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


def main() -> None:
    DST_DIR.mkdir(parents=True, exist_ok=True)
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
        px = list(out.getdata())
        t = sum(1 for p in px if p[3] < 5)
        o = sum(1 for p in px if p[3] > 250)
        corners = [px[0], px[out.width - 1], px[(out.height - 1) * out.width], px[-1]]
        cyan = amber = navy = silver = 0
        for p in px:
            if p[3] < 180:
                continue
            r, g, b = p[:3]
            if b > 140 and g > 150 and r < 140:
                cyan += 1
            elif r > 170 and g > 110 and b < 120:
                amber += 1
            elif b > 40 and r < 90 and g < 110:
                navy += 1
            elif min(r, g, b) > 160 and max(r, g, b) - min(r, g, b) < 40:
                silver += 1
        print(f"  saved {dst} {out.size} mode={out.mode}")
        print(f"  corners={corners}")
        print(f"  transparent={t} opaque={o} pct_t={100 * t / len(px):.1f}%")
        print(f"  cyan={cyan} amber={amber} navy={navy} silver={silver}")
    print("done")


if __name__ == "__main__":
    main()
