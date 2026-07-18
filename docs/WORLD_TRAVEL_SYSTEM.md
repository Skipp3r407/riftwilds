# World Travel System

Extends Live World maps, portals, world map (M), fog, and waypoints with Gateway Stones, fast travel, unlock teasers, and seamless region transitions.

## Principles

- **Walking is primary.** Gateways unlock only after physical discovery (first visit).
- **Fast travel fees are Credits or free early** — never SOL / paid pets / paid region passes.
- **Locked regions stay visible** on the world map with teasers + unmet requirements.
- Extends existing blueprints / Phaser scenes — does not replace the map stack.

## Module map

| Path | Role |
|------|------|
| `src/game/world-travel/` | Progress, Gateways, unlocks, fast travel, transitions, streaming stubs |
| `src/game/world-maps/regions.ts` | Unlock gates (spine + story/level/boss/reputation/restoration) |
| `src/game/world-maps/defs/portals.ts` | Hub + return + spine peer portals |
| `src/components/live-world/world-map-overlay.tsx` | World map UI, Gateway preview, travel CTA |
| `src/game/live-world/scenes/BlueprintRegionScene.ts` | Portal/Gateway interact, travel, discovery cinematic stub |
| `public/assets/ui/map/gateway-stone.png` | Gateway map art |
| `public/assets/ui/travel/travel-loading.png` | Transition loading art |

## Persistence

Local key: `riftwilds-world-travel-v1`

- Activated Gateway ids
- Regions discovered
- One-time discovery reward claims
- Exploration XP / points
- Story chapters, bosses, restoration keys, reputation, quests

## Player flow

1. Walk into a region → Gateway Stone activates permanently + discovery rewards (once).
2. Press **M** → world map shows continents, fog %, sealed teasers, activated stones.
3. Select activated destination → preview fee → **Travel via Gateway**.
4. Travel blocked during combat / active dialogue / cutscene stubs.
5. Music/ambient crossfade + streaming stubs run on transition.

## Related docs

- [REGION_PROGRESS.md](./REGION_PROGRESS.md)
- [GATEWAY_NETWORK.md](./GATEWAY_NETWORK.md)
- [TRAVEL_SYSTEM_QA.md](./TRAVEL_SYSTEM_QA.md)
- [WORLD_MAPS.md](./WORLD_MAPS.md)
