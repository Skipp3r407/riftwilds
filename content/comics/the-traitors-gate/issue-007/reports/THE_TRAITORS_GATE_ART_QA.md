# The Traitor's Gate — Art QA

**Date:** 2026-07-20  
**Status:** PASS with gaps (procedural baseline)

## Checklist

| Check | Result |
|-------|--------|
| 39 book pages raw + lettered | PASS |
| Public reader plates installed | PASS (`public/assets/comics/the-traitors-gate/issue-007/pages/`) |
| Front cover exported | PASS (`07-the-traitors-gate.png/.webp`) |
| Fonts not in `/public` | PASS (`assets/fonts/comics/ComicNeue-Bold.ttf`) |
| No HTML/DOM bubbles | PASS (flattened composite) |
| Balloon-safe negative space in prompts | PASS |
| Palette: black stone / silver / cyan / red runes | PASS (prompt locks) |
| Spark / egg / Oathwarden design locks | PASS (prompt locks) |
| Grok live consistency | GAP — procedural plates only until `XAI_API_KEY` run |

## Resume (Grok)

```bash
set XAI_API_KEY=...
node scripts/comics/issue-007/generate-and-letter.mjs --force
```

Partial:

```bash
node scripts/comics/issue-007/generate-and-letter.mjs --force --pages=1-10
```
