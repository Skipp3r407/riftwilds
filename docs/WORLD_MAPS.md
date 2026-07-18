# Riftwilds Playable World Maps

Machine-readable region maps for the **Playable Live World** (Phaser 3). Blueprints drive collision, NPCs, portals, resources, enemies, waypoints, hidden areas, camera bounds, and minimap pins.

## Feature flags

| Flag | Role |
|------|------|
| `PLAYABLE_LIVE_WORLD_ENABLED` | Master gate for Phaser enter / `createLiveWorldGame` |
| `LIVE_WORLD_GATHERING_ENABLED` | Shows resource node markers (rewards still Phase 3 stub) |
| `LIVE_WORLD_PVE_ENABLED` | Enemy spawn zones encoded; combat still stubbed |
| `LIVE_WORLD_MULTIPLAYER_ENABLED` | Instance hooks; Phase 1 remains local |

Never unlock a region with a paid pet or paid pass — gates use story / level / bosses / gateway restoration only (`REGION_UNLOCK_GATES`).

## Code map

```
src/game/world-maps/
  types.ts                 # WorldMapObject, layers, MapBlueprint
  regions.ts               # 12 region identities + unlock gates
  defs/                    # resources, enemies, NPCs, portals
  blueprint-helpers.ts     # builders
  blueprints/              # Commons + factory for other regions
  blueprints/json/         # exported JSON (validate:maps)
  load-blueprint.ts        # runtime loader + enter checks
src/game/live-world/scenes/
  BlueprintRegionScene.ts  # shared Phaser scene
  CommonsScene.ts          # playable hub
  EmberCraterScene.ts      # enterable stub
  MoonwaterCoastScene.ts
  ElderwoodForestScene.ts
public/maps/{slug}/blueprint.json
artifacts/maps/*-report.html
```

## Loading a map

```ts
import { loadMap, getBlueprint } from "@/game/world-maps";

const loaded = loadMap("riftwild-commons");
// loaded.blueprint.colliders / portals / npcs …
// Phaser: scene.start("CommonsScene", { bridge, regionSlug: "riftwild-commons" })
```

Portal travel is handled inside `BlueprintRegionScene` when the player interacts with an unlocked portal marker.

## Unlock progression

| Tier | Regions |
|------|---------|
| Start | Riftwild Commons, Ember Crater, Moonwater Coast, Elderwood Forest |
| Early | Stormspire Peaks, Stoneheart Canyon, Frostveil Basin |
| Mid | Radiant Citadel, Alloy Ruins, Spirit Marsh |
| Late | Void Hollow |
| Endgame | Celestial Rift |

## Playable vs enterable

| Status | Regions |
|--------|---------|
| **Playable (FULL)** | Riftwild Commons — plaza, buildings, NPCs, portal circle, collision, safe zones, terrain paint |
| **Enterable stub (PARTIAL)** | All other 11 regions — registered Phaser scenes, hazard colliders, pathways, landmarks; portal gates still apply |

## Validation

```bash
npm run validate:maps
```

Writes:

- `artifacts/maps/{slug}-report.html` + `index.html`
- `src/game/world-maps/blueprints/json/{slug}.json`
- `public/maps/{slug}/blueprint.json`

Reports mark incomplete regions as **PARTIAL** honestly.

## Layers (every blueprint)

`ground` · `decorative` · `collision` · `interactive` · `overhead` · `effects`

Object types follow `WorldMapObject` in `types.ts` (resource, npc, portal, waypoint, hidden_area, boss_arena, …).

## Asset prompts

Missing tiles/props prompts: `asset-prompts/world-maps/`.

## Premium Commons presentation

Riftwild Commons uses the premium Live World pass (layered terrain, props, atmosphere, soft camera). See `docs/gameplay/LIVE_WORLD_PREMIUM_REDESIGN.md`. Art lives under `public/assets/game/`; regenerate with `node scripts/assets/install-premium-world-art.mjs`.
