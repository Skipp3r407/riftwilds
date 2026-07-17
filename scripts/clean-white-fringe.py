"""Reduce white/light fringe on semi-transparent edges of RGBA PNGs."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "assets"
TARGETS = [
    ROOT / "eggs" / "mystery-rift-egg.png",
    *sorted((ROOT / "pets").glob("*.png")),
    *sorted((ROOT / "items").rglob("*.png")),
]


def clean_fringe(path: Path) -> bool:
    img = Image.open(path).convert("RGBA")
    arr = np.array(img, dtype=np.uint8)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    soft = (a > 0) & (a < 255)
    avg = (r.astype(np.uint16) + g.astype(np.uint16) + b.astype(np.uint16)) // 3

    # Drop near-white fringe entirely
    kill = soft & (r > 230) & (g > 230) & (b > 230)
    # Soften light gray fringe
    soften = soft & ~kill & (r > 200) & (g > 200) & (b > 200) & (a < 180)

    if not kill.any() and not soften.any():
        return False

    arr[..., 3] = np.where(kill, 0, a)
    if soften.any():
        factor = np.clip((230 - avg.astype(np.float32)) / 30.0, 0.0, 1.0)
        new_a = (a.astype(np.float32) * factor).astype(np.uint8)
        arr[..., 3] = np.where(soften, new_a, arr[..., 3])

    Image.fromarray(arr, "RGBA").save(path, format="PNG", optimize=True)
    return True


def main() -> int:
    n = 0
    for p in TARGETS:
        if not p.exists():
            continue
        try:
            if clean_fringe(p):
                n += 1
                print(f"cleaned: {p.relative_to(ROOT)}", flush=True)
        except Exception as e:
            print(f"FAIL: {p.relative_to(ROOT)} — {e}", flush=True)
    print(f"Fringe-cleaned {n} files", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
