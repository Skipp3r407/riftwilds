# Card System — Riftwilds TCG (unified)

> Combat stats + dynamic master template + versioned migrations.  
> Deep dives: `docs/tcg/CARD_SYSTEM.md`, `docs/CARD_AUDIT_REPORT.md`.

## Architecture

```
cards.json (immutable source)
    ↓ migrate overlays (card-stats-v2)
normalizeCard → registry / catalog
    ↓
engine TcgCardDef + match board units
    ↓
MasterCardTemplate / field overlay (UI)
```

## Stats in battle

ATK, DEF, HP, Speed, Energy, keywords, statuses, exhaustion — engine-authoritative.

## Migration

Overlays only; see `docs/CARD_MIGRATION_REPORT.md`.

## UI routes

`/tcg/collection` · `/tcg/deck-builder` · `/tcg/battle` · `/tcg/codex` · `/tcg/admin`

## Docs index

- `card-stats.md` · `combat-formulas.md` · `card-keywords.md` · `balance-framework.md`
- `card-template.md` · `card-ui.md` · `card-data-schema.md` · `card-asset-pipeline.md`
- `card-responsive-design.md` · `card-admin-studio.md` · `companion-card-integration.md`
- `CARD_AUDIT_REPORT.md` · `CARD_BALANCE_REPORT.md` · `CARD_MIGRATION_REPORT.md`
- `CARD_VISUAL_QA_REPORT.md` · `CARD_REGENERATION_PLAN.md` · `QA_CARD_SYSTEM_REPORT.md`
