# CARD_BALANCE_REPORT

Generated: 2026-07-19T16:51:00.000Z

## Framework

- Cost 1–10, ATK 0–15, HP 1–30, DEF 0–10, Speed 1–10
- Power budget soft bands in `src/content/tcg/framework/power-budget.ts`
- Element ±15% in `src/game/tcg/combat/formulas.ts`
- Overlay pass: **697** cards (STATS-V2) — units, combat spells, equipment, terrain/trap metadata

## Identity templates (brief)

| Card | Energy | ATK | DEF | HP | Speed | Role / keywords |
|------|-------:|----:|----:|---:|------:|-----------------|
| Bramblefox | 2 | 3 | 1 | 5 | 7 | bruiser · Bloom |
| Mossprig | 3 | 2 | 3 | 8 | 3 | tank · Bloom/Guardian |
| Thornling | 1 | 1 | 0 | 3 | 6 | swarm · Bloom |

## Engine keywords (support)

| Keyword | Support |
|---------|---------|
| Charge, Guardian, Flying, Poison, Ward, Bloom, Heal | full |
| Echo, Awaken | full (this pass) |
| Shatter, Corrupt, Overflow, Empower | partial |
| Riftbond, Soulbind, Harmony, Ancient | stub |

## Equipment

Attach mods derived from cost curve + ability text (e.g. Moss Cloak → Bloom). ATK/DEF on equipment overlays are **modifiers**, not unit body stats.

## Warnings policy

Deck atelier / admin studio surface soft warnings only — no silent stat rewrites. Cosmetics never alter competitive defs.
