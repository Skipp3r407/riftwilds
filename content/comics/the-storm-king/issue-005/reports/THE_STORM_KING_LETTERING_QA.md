# The Storm King — Lettering QA

**Date:** 2026-07-20  
**Status:** PASS (baked programmatic)

## Pipeline

Two-stage only:

1. Text-free art plate (Grok or procedural)
2. Programmatic SVG lettering composite → flattened WebP

**No HTML/DOM speech bubbles in the reader** — pages use `bakedLettering: true` / `composedPlate: true`.

## Font

- Private: `assets/fonts/comics/ComicNeue-Bold.ttf`
- **Not** served from `/public`

## Checks

| Check | Result |
|-------|--------|
| All 38 pages lettered | PASS |
| Bubbles sorted by readOrder | PASS |
| SFX / narration / speech styles distinct | PASS |
| Page numbers baked | PASS |
| a11yTranscript / transcript on pages | PASS |
| Reader alt text | PASS (`artAlt`) |

## Resume

```bash
node scripts/comics/issue-005/generate-and-letter.mjs --letter-only
node scripts/comics/issue-005/generate-and-letter.mjs --letter-only --pages=5-29
```
