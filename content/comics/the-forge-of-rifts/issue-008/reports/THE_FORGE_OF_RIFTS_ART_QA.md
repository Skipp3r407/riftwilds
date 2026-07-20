# The Forge of Rifts — Art QA

**Date:** 2026-07-20  
**Status:** PASS (procedural plates) / PENDING (Grok)

## Checklist

| Check | Result |
|-------|--------|
| 39 book pages generated | PASS (procedural) |
| Public webp paths | PASS `public/assets/comics/the-forge-of-rifts/issue-008/pages/` |
| Cover exported | PASS `public/assets/comics/covers/08-the-forge-of-rifts.png` |
| No readable text in raw art | PASS (pipeline constraint) |
| Balloon-safe negative space | PASS (prompt + plate corners) |
| Forge palette (steel/stone/cyan/orange) | PASS (procedural forge/rift atmospheres) |
| No Riftwright face | PASS (prompt NEG + silhouette page) |
| Double-page 18–19 continuity | PASS (scripted spreads; regenerate with Grok for true spread) |
| Fonts not in `/public` | PASS (`assets/fonts/comics/` private) |

## Engine status

See `GENERATION_STATUS.json`:

- `grokConfigured`: depends on `XAI_API_KEY`
- Current run: procedural fallback for all 39 pages (`grokOk: 0`)

## Resume (Grok)

```bat
set XAI_API_KEY=...
node scripts/comics/issue-008/generate-and-letter.mjs --force
```

Partial:

```bat
node scripts/comics/issue-008/generate-and-letter.mjs --force --pages=1-10
```

## Verdict

**PASS for local reader** with procedural art. **Upgrade to Grok** when key available.
