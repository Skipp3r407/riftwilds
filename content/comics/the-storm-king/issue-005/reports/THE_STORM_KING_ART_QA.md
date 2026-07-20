# The Storm King — Art QA

**Date:** 2026-07-20  
**Status:** PASS (procedural plates) / PENDING (Grok)

## Paths

| Kind | Path |
|------|------|
| Raw art | `content/comics/the-storm-king/issue-005/generated/raw-art/` |
| Lettered | `content/comics/the-storm-king/issue-005/generated/lettered-pages/` |
| Public lettered | `public/assets/comics/the-storm-king/issue-005/pages/` |
| Cover | `public/assets/comics/covers/05-the-storm-king.png` |

## Consistency locks

- Mira Eggwarden: hatchery robes, satchel, Compact lantern charm
- Spark: Glowpup-line Riftborn — cyan-gold, no franchise mascot
- Vaelor Tempest: silver-cyan crown, lightning scars, storm gauntlet
- Thundervane: massive winged storm-lion, armor fragments, exhaustion
- Galesprig: pale gray fox-bird, blue feathered ears, ribbon tail
- Tempestria: slate / silver / electric cyan / deep indigo storm (no purple neon)

## Generation status

See `GENERATION_STATUS.json`:

- **38/38** pages art + lettering OK
- **Engine:** procedural (Grok not configured at run time)
- **Lettering font:** Comic Neue Bold under `assets/fonts/comics/` (not in `/public`)

## Resume

```bash
# Re-letter only
node scripts/comics/issue-005/generate-and-letter.mjs --letter-only

# Force Grok for all pages
# PowerShell:
$env:XAI_API_KEY="…"; $env:COMIC_IMAGE_PROVIDER="grok"; node scripts/comics/issue-005/generate-and-letter.mjs --force

# Range
node scripts/comics/issue-005/generate-and-letter.mjs --force --pages=1-10
```

## Gaps

- Grok painted art not yet generated — procedural storytelling plates stand in.
- Variant covers described in `covers.json` but not separately rendered beyond main cover bake.
