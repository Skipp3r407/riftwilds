# Map System Report

**Date:** 2026-07-18

## Delivered

1. **Blueprint schema** (`MapBlueprint` v1) — layers, zones, pathways, objects, colliders, minimap pins, fog-friendly camera bounds
2. **Terrain paint** — `paintTerrainGrid` derives roads from pathways, water/lava from colliders, settlement tints from zones
3. **Full-screen World Map** — React overlay, M toggle, Esc close, world ↔ region modes, zoom/pan, filters, waypoint guidance
4. **HUD Minimap** — top-right, player facing chevron, fog cells, landmark pins, modes fixed-north / rotate / hidden; click opens full map
5. **Exploration fog** — `riftwilds-exploration-fog-v1` localStorage; visit cells + discover landmarks/waypoints
6. **Waypoints** — pathfinding A* with pathway preference; direction+distance fallback string
7. **All 12 regions enterable** via registered Phaser scenes (`create-game.ts` + `region-scenes.ts`)
8. **Admin map tools** — `/admin/maps` blueprint inspector + art links

## Code map

| Area | Path |
|------|------|
| Types | `src/game/world-maps/types.ts` |
| Blueprints | `src/game/world-maps/blueprints/` |
| Terrain | `src/game/live-world/systems/terrain-paint.ts` |
| Fog | `src/game/live-world/systems/exploration-fog.ts` |
| Pathfinding | `src/game/live-world/systems/pathfinding.ts` |
| Scene | `src/game/live-world/scenes/BlueprintRegionScene.ts` |
| World map UI | `src/components/live-world/world-map-overlay.tsx` |
| Minimap | `src/components/live-world/minimap.tsx` |
| Admin | `src/app/admin/maps/page.tsx` |

## Validation

```bash
npm run validate:maps
npx vitest run tests/unit/live-world-maps.test.ts
```

## Playability notes

- Portal travel works for enterable stubs when portal metadata is unlocked
- Mid/late/endgame portals may still show locked until story flags clear
- Map UI does not spend SOL; all local
