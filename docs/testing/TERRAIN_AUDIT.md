# Terrain Audit — Live World

**Date:** 2026-07-18  
**Scope:** Phaser blueprint regions + terrain paint language

## Summary

All 12 regions now paint multi-kind terrain (ground / path / settlement / water / lava / cliff / hazard / danger) from blueprint pathways, zones, safe zones, and colliders. Commons remains `FULL`; other regions are `PARTIAL` enterable stubs with hazard colliders and landmark decorations.

## Region status

| Region | Playability | Terrain language | Hazards | Landmarks / roads |
|--------|-------------|------------------|---------|-------------------|
| Riftwild Commons | playable FULL | Plaza paths, pond water, safe checker | Pond water | Pathways to hatchery/arena/market/guild/portals + scatter labels |
| Ember Crater | enterable_stub | Ash ground, lava strips, forge paths | Lava + cliff | Lava Bridge, Forge Spire |
| Moonwater Coast | enterable_stub | Sand path, deep water | Water | Tide Marker, Beacon Rock |
| Elderwood Forest | enterable_stub | Grove paths, stream | Water + cliff | Heartwood / Moss Arch |
| Stormspire Peaks | enterable_stub | Cliff paths, wind hazard | Cliff + hazard | Storm Spire |
| Stoneheart Canyon | enterable_stub | Canyon rim, quarry | Cliff + hazard | Fossil Shelf |
| Frostveil Basin | enterable_stub | Ice water, glacier | Water + cliff | Aurora Cairn |
| Radiant Citadel | enterable_stub | Plaza paths, mirror pool | Water | Sun Dial |
| Alloy Ruins | enterable_stub | Scrap paths, spark pit | Hazard + cliff | Gear Court |
| Spirit Marsh | enterable_stub | Reed paths, bog water | Water | Memory Lantern |
| Void Hollow | enterable_stub | Void rifts | Hazard + cliff | Null Obelisk |
| Celestial Rift | enterable_stub | Starfall gaps | Hazard + cliff | Star Anchor |

## Collision

- Border walls on every map
- Building / landmark solid colliders
- Water / lava / cliff / hazard kinds visualized + solid-blocked
- F3 collision debug overlay (dev, or `localStorage riftwilds-debug-allowed=1` in production)

## Art

- Runtime prefers `public/assets/terrain/*` masters when loaded
- Procedural tinted 32×32 tiles remain as fallback
- Region overview PNGs under `public/assets/maps/`

## Gaps / honesty

- Tile art is overview + seamless masters, not a full autotile atlas per region
- Interiors / multi-floor still stub dialogue
- Hazard damage-over-time not implemented (solid block only)
