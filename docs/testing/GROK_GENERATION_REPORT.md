# Grok NPC Generation Report

**Date:** 2026-07-17  
**Tooling:** Cursor `GenerateImage` + project `scripts/npcs/sync-npc-assets.mjs`  
**IP:** Original Riftwilds only (no Pokémon / Zelda / WoW / FF / RuneScape / Genshin / Disney / Marvel / DC / anime franchise / NFT clones)

## Summary

| Asset type | Named NPCs (54) | Notes |
|---|---|---|
| Portrait | **54 / 54 generated** | Distinct Grok images per named NPC |
| Full-body | **54 / 54 distinct** | Dedicated full-body gens (not portrait copies) |
| Thumbnail | **54 / 54** | Derived from portrait for dialogue/UI scale |
| Sprite | **20 distinct + 34 portrait-reuse** | Dedicated sprites for Commons cast + region guides; others use portrait as interim game sprite |
| Ambient NPCs | Labeled SVG/PNG placeholders | Density NPCs share templates; named cast prioritized |

## Commons starter cast (priority)

All ten named Commons NPCs have portrait + full-body + thumbnail installed under:

`public/assets/npcs/riftwild-commons/{slug}/`

Dedicated sprites generated for: Rowan, Elara, Mira, Orren, Bram, Tessa, Pip, Kael (guide).

## Regional named cast

Portraits + distinct full-bodies generated for Ember, Coast, Elderwood, Stormspire, Stoneheart, Frostveil, Radiant, Void, Alloy, Spirit Marsh, and Celestial (NPCs 11–54).

## Blockers / honesty

- **Sprite sheets (idle/walk frames):** not authored as multi-frame atlases yet. Engine uses single-frame textures with ambient bob/face-player motion in Phaser.
- **Ambient citizen unique art:** placeholders + varied names/positions; not 58 unique Grok portraits (named cast completed first).
- **Transparent cutouts:** studio/dark backgrounds used; automated mask pass not run on every file.
- **No false claims:** see `NPC_ASSET_MANIFEST.json` for per-NPC `fullBodyDistinct` / `spriteDistinct` flags.

## Regeneration queue (optional polish)

1. Multi-frame sprite sheets for Commons 10 + region guides  
2. Aggressive transparency mask on full-body assets  
3. Unique ambient portraits for Commons 8 citizens + 3 guards  

## Commands used

```bash
node scripts/npcs/generate-npc-catalog.mjs
node scripts/npcs/generate-placeholders.mjs
# GenerateImage × portraits/full-bodies/sprites (Cursor)
node scripts/npcs/sync-npc-assets.mjs
```
