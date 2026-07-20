# The Forge of Rifts — Lettering QA

**Date:** 2026-07-20  
**Status:** PASS

## Pipeline

| Stage | Result |
|-------|--------|
| Stage 1 text-free art | PASS (procedural / Grok-ready) |
| Stage 2 programmatic balloons | PASS (Sharp SVG overlay) |
| Flattened webp | PASS (public + lettered) |
| No HTML/DOM bubbles in reader | PASS (`bakedLettering: true`, `composedPlate: true`) |
| Private font | PASS Comic Neue Bold under `assets/fonts/comics/` (not `/public`) |
| Page numbers baked | PASS |
| a11y transcripts | PASS per page JSON |

## Resume

```bat
node scripts/comics/issue-008/generate-and-letter.mjs --letter-only
node scripts/comics/issue-008/generate-and-letter.mjs --force --pages=18-19
```

## Verdict

**PASS**
