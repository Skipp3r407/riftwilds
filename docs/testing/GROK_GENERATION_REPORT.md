# Grok Generation Report — Live World Showcase

**Date:** 2026-07-18  
**Tooling:** Cursor `GenerateImage` + `install-live-world-showcase-art.mjs` + `mask-npc-black.mjs` + `build-npc-overworld-sheets.mjs`  
**IP:** Original Riftwilds only

## Commons showcase (this pass)

| Element | Status | Notes |
|---------|--------|-------|
| Player Keeper | **Generated + wired** | `game/actors/player-keeper.png` — no circle when loaded |
| Pet / Riftling follower | **Generated + wired** | `game/actors/pet-riftling.png` |
| Riftstone Monument | **Generated + wired** | Dedicated prop (not crystal stand-in) |
| Training dummies | **Generated + wired** | Replaces signpost alias |
| Resource berry / herb / fish | **Generated + wired** | No green circle when textures present |
| Portal plaza facade | **Wired** | Uses existing `portal-circle` building tex at hub |
| Cal Reed | **Complete** | Distinct full-body, dialogue portrait, sprite, sheet, thumbnail |
| Ambient Commons NPCs | **Full-bodies + sheets** | 11 ambient humans + 3 riftlings |
| Named Commons cast | **Sheets rebuilt** | Existing Grok art retained; sheets refreshed |
| Minimap icons | **Generated + wired** | portal / waypoint / player / quest crops |
| Premium terrain / buildings | **Previously installed** | Not thrash-regenerated this pass |

## Catalog

`generate-npc-catalog.mjs` now sets `artStatus` from disk (`generated` when portrait + full-body + sprite > 2KB).

## Blockers / remaining (honest)

| Item | Status |
|------|--------|
| Multi-frame hand-authored walk cycles | Procedural 4-frame sheets from single pose |
| Non-Commons region terrain premium pass | Still legacy paint until `isPremiumRegion` expanded |
| Enterable interiors | Stub inspect lines only |
| Enemy combat sprites in Commons wilds | PvE zones remain soft markers when flag on |
| True RGBA from Grok at source | Studio white → flood-fill mask (good, not perfect on pale cloth) |
| Parallel masking / isometric polish agents | Coordinate — do not overwrite their terrain masters blindly |

## Commands

```bash
node scripts/assets/install-live-world-showcase-art.mjs
node scripts/assets/install-premium-world-art.mjs
npm run assets:mask:npc-black -- --all-png public/assets/game/actors
npm run assets:npc-sheets
node scripts/npcs/generate-npc-catalog.mjs
```
