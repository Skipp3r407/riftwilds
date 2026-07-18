# World Boundary System

Containment for Live World regions: playable inset bounds, edge colliders, natural barriers, locked seals, and transition zones.

## Goals

- Players cannot walk off Commons (or any blueprint region) into the void
- Prefer **natural** barriers (cliffs, deep water, forests, gates) before invisible walls
- Invisible walls remain as **map-edge backup** only (`borderColliders`)
- Transition corridors stay walkable when unlocked; locked exits get physical seals + contextual copy
- NPCs, companions, enemies, and projectiles stay inside nav / world bounds

## Pipeline

```
MapBlueprint.colliders
  → finalizeBlueprint prepends edge walls + auto transition zones
  → BlueprintRegionScene.buildColliders()
       · solids → Arcade staticGroup
       · locked portal seals (runtime)
  → resolveSafeSpawn() clamps saved / portal arrival
  → update loop: transition overlaps, NPC/pet containment
```

## Key modules

| Path | Role |
|------|------|
| `src/game/world-maps/boundaries/` | Pure helpers (semantics, spawn clamp, seals, audit) |
| `src/game/world-maps/blueprint-helpers.ts` | Edge walls + auto transitions at finalize |
| `src/game/live-world/scenes/BlueprintRegionScene.ts` | Phaser wiring |

## Collider kinds

| Kind | Solid? | Notes |
|------|--------|-------|
| `wall` | yes | Edge backup |
| `building` / `cliff` / `lava` / `hazard` | yes | Authored props / hazards |
| `water` / `deep_water` | yes | Block without swim/boat |
| `shallow_water` | no | Ford / splash |
| `transition` | no | Walk-in travel when unlocked |
| `blocker` / `seal` | yes | Quest / locked natural blockade |

## Debug

- F3 / `debugCollision` (dev or `localStorage riftwilds-debug-allowed=1`)
- Overlay colors: magenta walls, blue deep water, cyan transitions, amber seals, green playable inset

## Validation

```bash
npm run validate:boundaries
npm run validate:maps
```

## Backlog (navmesh)

Phaser Arcade + AABB colliders are the **interim** solution. Full navmesh generation (walkable polygons, agent avoidance, enemy pathing) is deferred — see `NAVIGATION_MESH.md`.
