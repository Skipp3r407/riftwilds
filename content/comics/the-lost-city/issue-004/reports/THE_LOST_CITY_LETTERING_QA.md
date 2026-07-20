# The Lost City — Lettering QA

**Date:** 2026-07-20  
**Status:** PASS (baked flatten)

## Pipeline

1. Stage 1: text-free art (procedural or Grok)  
2. Stage 2: SVG balloon overlay via private Comic Neue Bold  
3. Flatten → `generated/lettered-pages/` + `public/.../pages/`

## Checklist

| Check | Result |
|-------|--------|
| No HTML/DOM speech bubbles in reader | PASS (`bakedLettering: true`, `composedPlate: true`) |
| Fonts not served from `/public` | PASS (`assets/fonts/comics/`) |
| Transcripts stored for a11y | PASS (`ISSUE_004_TRANSCRIPTS` + page JSON) |
| Page numbers baked | PASS |
| Captions / SFX / speech kinds supported | PASS |
| All 38 pages letteringStatus ok | PASS |

## Gaps

- Balloon placement is script-estimated (x/y %); after Grok art, re-letter with `--letter-only` and nudge coordinates if faces overlap.
- Visual QA of tail-to-mouth after final art still needed.
