# Card data schema

## Content (`TcgCard`)

Authority: `src/content/tcg/types.ts` + `src/content/tcg/data/cards.json`.

Key combat fields: `energyCost`, `attack`, `health`, `defense`, `speed`, `role`, `keywords`, `abilities[]`.

## Versioned overlays

`src/content/tcg/data/migrations/card-stats-v2.json` merges at normalize time via `apply-stat-migration.ts`. Does not rewrite `cards.json`.

## Engine (`TcgCardDef` / `TcgBoardUnit`)

`src/game/tcg/types.ts` — runtime board carries live ATK/DEF/HP/Speed/keywords/statuses/exhausted.

## Competitive vs collection

- Competitive / ranked: base migrated stats only.
- Collection: finishes and binder cosmetics allowed; never change engine power.
