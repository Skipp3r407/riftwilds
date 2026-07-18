# Navigation Mesh — Status & Backlog

## Current (interim)

Live World uses:

- Phaser Arcade physics + static AABB colliders from `MapBlueprint.colliders`
- Coarse A* guidance (`pathfinding.ts`) for HUD / world-map direction only
- Soft NPC leash (`clampEntityToNav`) around home + playable inset
- Enemy zone AABB leash stubs (`clampEnemyLeash`)
- Projectile world clamp stub (`clampProjectileToWorld` / `containProjectile`)

There is **no** baked navmesh, funnel smoothing, or agent crowd avoidance yet.

## Why interim is acceptable

- Blueprint maps are rectangle-authored; tile-accurate meshes would thrash during layout churn
- Edge walls + natural barriers already prevent void walks
- Guidance pathfinding is HUD-only (players still steer with WASD)

## Backlog (full navmesh)

When region art freezes:

1. Rasterize walkable mask from solids (tile or 16px grid)
2. Generate polygons (e.g. hull / Recast-style) per region
3. Persist `public/maps/<slug>/navmesh.json`
4. Runtime query: closest point, path, random point in volume
5. NPC / enemy / Riftling agents follow mesh + leash
6. Validate mesh coverage vs spawn / portals in `validate:boundaries`

## Honesty note

Until that ships, treat AABB collision + playable inset as the source of truth for containment. Do not claim mesh-based AI pathing in player-facing docs.
