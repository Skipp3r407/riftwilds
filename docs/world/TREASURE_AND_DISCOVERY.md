# Treasure and Discovery

**Date:** 2026-07-18

## Catalog

`src/game/world-exploration/discovery-catalog.ts` merges:

1. Hand-authored secrets (treasures, habitats, POIs, perk sites)
2. Blueprint-derived chests, hidden areas, enemy spawns, boss arenas, landmarks

## Visibility contract (no spoilers)

| State | Map shows |
|-------|-----------|
| Undiscovered, no clue | Nothing |
| Undiscovered + clue quest active/complete (or Treasure Sense perk for caches) | **Region hint** only — vague text, **no coordinates**, generic label “Uncharted lead” |
| Discovered | Named pin + coords; Codex link when available |
| Habitats after discovery | Region-level habitat pin (species Codex when slug known) |

Secret names like “Cascade Cache” never appear in UI until `discoverById` / proximity success.

## Enemy territories & world bosses

Built from blueprint `enemy_spawn` / `boss_arena` + `ENEMY_DEFS`. Same spoiler rules: clue → hint; discover → pin; defeat tracked separately (`defeatedBossIds`).

## Claiming

`claimTreasure(id)` marks loot claimed after discovery (demo Credits hooks can extend later).

## Codex

`codex-links.ts` — habitats → `/codex/riftlings/{slug}`; regions → `/world#region-{slug}`. Links only on discovered markers.
