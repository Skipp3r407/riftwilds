# The Traveling Circus — Art QA

**Pipeline:** Stage 1 Grok (or procedural fallback) → Stage 2 programmatic lettering → flattened public webp  
**Font:** `assets/fonts/comics/` (not `/public`)

## Consistency locks

| Asset | Lock |
|-------|------|
| Mira Eggwarden | Hatchery mentor look; satchel; Compact charm |
| Spark | Cyan-gold Glowpup-line Riftborn |
| Lumenhare | Indigo + gold stars + lantern tail |
| Lanternmaster | Deep blue / ember-gold / half-mask |
| Shellward crystal | Same as Issue #2 empty pedestal relic |
| Meridian sigil | Three-arc continuity |

## Status

See `GENERATION_STATUS.json` after `npm run comics:issue-003:generate`.

## Resume

```bash
npm run comics:issue-003:generate -- --pages=1-10
npm run comics:issue-003:generate -- --force --pages=11-20
# with Grok:
# set XAI_API_KEY=... && npm run comics:issue-003:generate -- --force
```

## Gaps

- Reference sheets are prompt-embedded; dedicated sheet PNGs optional follow-up.
- Pre-existing legacy `/public/assets/comics/pages/the-traveling-circus/page-*.webp` may be overwritten by this pipeline.
