# ART QA — Issue #9 The Riftwright

**Status:** lettered (procedural plates) — Grok pending

## Summary

| Metric | Value |
|--------|------:|
| Book pages | 38 |
| Art OK | 38 |
| Lettering OK | 38 |
| Grok | 0 |
| Procedural | 38 |
| Errors | 0 |

## Pipeline

- Stage 1: text-free plates (procedural fallback — `XAI_API_KEY` not set at generate time)
- Stage 2: programmatic SVG lettering with private `ComicNeue-Bold` (not in `/public`)
- Flattened WebP → `public/assets/comics/the-riftwright/issue-009/pages/`
- Cover → `public/assets/comics/covers/09-the-riftwright.png`

## Resume (Grok upgrade)

```bash
# Windows PowerShell
$env:XAI_API_KEY="..."
node scripts/comics/issue-009/generate-and-letter.mjs --force

# Or page ranges
node scripts/comics/issue-009/generate-and-letter.mjs --force --pages=1-10
node scripts/comics/issue-009/generate-and-letter.mjs --letter-only
```

## Notes

- No HTML/DOM speech bubbles in reader — `bakedLettering: true`
- Negative prompts forbid Cal Reed and cartoon-villain Riftwright
