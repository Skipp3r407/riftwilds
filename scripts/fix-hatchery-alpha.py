"""Punch black backgrounds out of Hatchery premium PNGs."""

from __future__ import annotations

import io
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1] / "public" / "assets" / "hatchery"
FILES = [
    ROOT / "claim-starter-egg.png",
    ROOT / "empty-eggs.png",
    ROOT / "empty-riftlings.png",
    *sorted((ROOT / "rarity").glob("*.png")),
]


def punch_near_black(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0 and max(r, g, b) < 28:
                px[x, y] = (r, g, b, 0)
            elif a < 255 and max(r, g, b) < 40:
                px[x, y] = (r, g, b, 0)
    return img


def main() -> None:
    session = new_session("u2net")
    for path in FILES:
        print(f"processing {path.name}...", flush=True)
        raw = path.read_bytes()
        cut = remove(
            raw,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=6,
        )
        img = Image.open(io.BytesIO(cut)).convert("RGBA")
        img = punch_near_black(img)
        img.save(path, format="PNG", optimize=True)
        hist = img.getchannel("A").histogram()
        transparent = hist[0] / (img.width * img.height)
        print(f"  -> {img.size} transparent={transparent:.1%}", flush=True)
    print("DONE", flush=True)


if __name__ == "__main__":
    main()
