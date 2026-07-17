"""Force true RGBA alpha for hero egg + affinity pets (overwrite public assets)."""

from __future__ import annotations

import io
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

GEN = Path(
    r"C:\Users\Skipp3r407\.cursor\projects\c-Users-Skipp3r407-Desktop-Websites-egg-meme-project\assets"
)
PUB = Path(__file__).resolve().parents[1] / "public" / "assets"

MAP = {
    "mystery-rift-egg.png": PUB / "eggs" / "mystery-rift-egg.png",
    "cindercub.png": PUB / "pets" / "cindercub.png",
    "mossprig.png": PUB / "pets" / "mossprig.png",
    "bubbloon.png": PUB / "pets" / "bubbloon.png",
}


def is_checker_or_white(r: int, g: int, b: int) -> bool:
    mx, mn = max(r, g, b), min(r, g, b)
    chroma = mx - mn
    if chroma < 28 and mn > 165:
        return True
    if r > 235 and g > 235 and b > 235:
        return True
    if chroma < 22 and 175 <= (r + g + b) / 3 <= 245:
        return True
    return False


def color_key_and_fringe(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if is_checker_or_white(r, g, b):
                px[x, y] = (r, g, b, 0)
                continue
            if a < 255 and r > 200 and g > 200 and b > 200:
                px[x, y] = (r, g, b, 0)
                continue
            if a < 250 and a > 0:
                af = a / 255.0
                if af > 0.05:
                    nr = max(0, min(255, int((r - 255 * (1 - af)) / af)))
                    ng = max(0, min(255, int((g - 255 * (1 - af)) / af)))
                    nb = max(0, min(255, int((b - 255 * (1 - af)) / af)))
                else:
                    nr, ng, nb = r, g, b
                if a < 140 and nr > 220 and ng > 220 and nb > 220:
                    px[x, y] = (nr, ng, nb, 0)
                else:
                    px[x, y] = (nr, ng, nb, a)
    return img


def flood_clear_bg(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    visited: set[tuple[int, int]] = set()
    stack = [
        (0, 0),
        (w - 1, 0),
        (0, h - 1),
        (w - 1, h - 1),
        (w // 2, 0),
        (0, h // 2),
        (w - 1, h // 2),
        (w // 2, h - 1),
    ]
    while stack:
        x, y = stack.pop()
        if (x, y) in visited or x < 0 or y < 0 or x >= w or y >= h:
            continue
        visited.add((x, y))
        r, g, b, a = px[x, y]
        if a == 0:
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if (nx, ny) not in visited:
                    stack.append((nx, ny))
            continue
        if is_checker_or_white(r, g, b) or (
            max(r, g, b) - min(r, g, b) < 30 and (r + g + b) / 3 > 190
        ):
            px[x, y] = (r, g, b, 0)
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if (nx, ny) not in visited:
                    stack.append((nx, ny))
    return img


def stats(path: Path) -> str:
    rgba = Image.open(path).convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    a0 = sum(1 for y in range(h) for x in range(w) if px[x, y][3] == 0)
    nw = sum(
        1
        for y in range(h)
        for x in range(w)
        if px[x, y][3] > 250
        and px[x, y][0] > 245
        and px[x, y][1] > 245
        and px[x, y][2] > 245
    )
    c = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    return f"{w}x{h} a0={a0 / (w * h):.1%} near_white_opaque={nw} corners={c}"


def main() -> None:
    session = new_session("u2net")
    print("session ready", flush=True)

    for src_name, dest in MAP.items():
        src = GEN / src_name
        print(f"\n=== {src_name} ===", flush=True)
        raw = src.read_bytes()
        cut = remove(
            raw,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=6,
        )
        img = Image.open(io.BytesIO(cut)).convert("RGBA")
        img = color_key_and_fringe(img)
        img = flood_clear_bg(img)
        img = color_key_and_fringe(img)
        dest.parent.mkdir(parents=True, exist_ok=True)
        img.save(dest, format="PNG", optimize=True)
        print(f"wrote {dest} | {stats(dest)}", flush=True)

    print("\nALL DONE", flush=True)


if __name__ == "__main__":
    main()
