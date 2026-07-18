# Furniture Engine

## Catalog

`src/lib/housing/furniture-catalog.ts` — **60+** SKUs across walls, floors, roofs, doors, windows, stairs, fences, seating, tables, beds, storage, lighting, decor, display (incl. comic cover frames), plants, music, care, farming, workshop, riftling, secret, exterior.

Legacy thin catalog remains in `src/game/housing/catalog.ts` for Homestead shell pages.

## Art

Thumbs under `/public/assets/housing/*.svg` (art bible warm earth + cyan/amber accents). Generator: `scripts/generate-housing-thumbs.mjs`.

## Stations

SKU `stationTrack` tags wire to life-skills: `crafting` | `farming` | `care`.

## Marketplace

Blueprints: hash-deduped listings via `blueprint-service`. Browse categories `HOUSING` / `FURNITURE` enabled.

## Backlog

Hundreds of themed SKUs (seasonal sets, rarity expansions, pack DLC) — data-driven append only.
