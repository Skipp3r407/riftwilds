"""Remove baked checkerboard/white backgrounds; write real RGBA PNGs in place."""

from __future__ import annotations

import sys
import time
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1] / "public" / "assets"

# Product art only — skip wallpapers / placeholders
TARGETS = [
    ROOT / "eggs" / "mystery-rift-egg.png",
    *sorted((ROOT / "pets").glob("*.png")),
    *sorted((ROOT / "items").rglob("*.png")),
]


def already_has_useful_alpha(path: Path) -> bool:
    with Image.open(path) as im:
        if im.mode not in ("RGBA", "LA") and not (im.mode == "P" and "transparency" in im.info):
            return False
        rgba = im.convert("RGBA")
        alpha = rgba.getchannel("A")
        # Consider useful if >5% of pixels are fully transparent
        hist = alpha.histogram()
        transparent = hist[0]
        return transparent > (rgba.width * rgba.height * 0.05)


def process(path: Path, session) -> str:
    if not path.exists():
        return "missing"
    if already_has_useful_alpha(path):
        return "skip-alpha"

    with open(path, "rb") as f:
        data = f.read()

    out = remove(
        data,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=5,
    )

    # Ensure PNG with alpha, overwrite in place
    img = Image.open(__import__("io").BytesIO(out)).convert("RGBA")
    img.save(path, format="PNG", optimize=True)
    return "ok"


def main() -> int:
    # Priority order already encoded in TARGETS list construction
    print(f"Processing {len(TARGETS)} PNGs with rembg...", flush=True)
    session = new_session("u2net")
    ok = skip = fail = 0
    t0 = time.time()

    for i, path in enumerate(TARGETS, 1):
        rel = path.relative_to(ROOT)
        try:
            status = process(path, session)
            if status == "ok":
                ok += 1
            elif status.startswith("skip"):
                skip += 1
            else:
                fail += 1
            print(f"[{i}/{len(TARGETS)}] {status}: {rel}", flush=True)
        except Exception as e:
            fail += 1
            print(f"[{i}/{len(TARGETS)}] FAIL: {rel} — {e}", flush=True)

    elapsed = time.time() - t0
    print(f"\nDone in {elapsed:.1f}s — ok={ok} skip={skip} fail={fail}", flush=True)
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
