# Deck Migration Report

**Rules:** v2 — 29 main + Commander, composition limits, copy caps.
**Collections:** preserved; illegal lists flagged (not deleted).

| Deck | Original | Migrated | Legal | Flags |
|------|----------|----------|-------|-------|
| starter-nature | 66 | 29 | yes | TRIMMED_TO_29 |
| starter-fire | 66 | 29 | yes | TRIMMED_TO_29 |
| starter-water | 68 | 29 | yes | TRIMMED_TO_29 |
| starter-storm | 66 | 29 | yes | TRIMMED_TO_29 |
| starter-earth | 68 | 29 | yes | TRIMMED_TO_29 |
| starter-crystal | 36 | 29 | no | TRIMMED_TO_29, MIN_CREATURES, MAX_SUPPORT, MAX_POWER_RARITY |
| starter-shadow | 38 | 29 | no | TRIMMED_TO_29, MIN_CREATURES, MAX_SUPPORT, MAX_POWER_RARITY |
| starter-light | 67 | 29 | yes | TRIMMED_TO_29 |
| starter-spirit | 62 | 29 | yes | TRIMMED_TO_29 |
| starter-celestial | 36 | 29 | no | TRIMMED_TO_29, MIN_CREATURES, MAX_SUPPORT, MAX_POWER_RARITY |
| npc-mira | 67 | 29 | yes | TRIMMED_TO_29 |
| npc-blacksmith | 66 | 29 | yes | TRIMMED_TO_29 |
| starter-showcase-20 | 30 | 29 | yes | TRIMMED_TO_29 |

## Summary

- Audited: 13
- Illegal / needs edit: 3
- Auto-trim applied when size > 29 (`TRIMMED_TO_29`)

## Next steps

1. Deck builder surfaces flags from `auditDeckMigration`
2. Practice Board continues to use legal slices via `toConstructedSlice`
3. Ranked queue rejects illegal lists
