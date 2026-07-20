# The First Rift — Lettering QA

## Pipeline

1. Stage 1 art: text-free plates (empty balloon-safe zones)
2. Stage 2: programmatic SVG balloons/captions/SFX via Sharp flatten
3. Font: **Comic Neue Bold** at `assets/fonts/comics/ComicNeue-Bold.ttf` (**not** under `/public`)
4. Reader: `bakedLettering: true` on every Issue #1 page — **no HTML/DOM speech bubbles**

## Checks

| Check | Result |
|---|---|
| Dialogue baked into WebP | PASS (38/38) |
| No HTML overlays for Issue #1 | PASS (`bakedLettering`) |
| Transcript drawer only | PASS (reader aside + size control) |
| Font not in /public | PASS |
| Speaker labels + tails | PASS (programmatic) |
| Page numbers in plate | PASS |

## Known soft issues

- Procedural bases have large empty zones; after Grok art, re-run `--letter-only` or `--force` to re-letter.
- Manual overlap QA against painted faces should be redone once Grok pages land.
