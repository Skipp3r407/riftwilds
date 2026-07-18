# Player Housing Architecture

**Status:** Production core (in-memory hot path). Prisma prepare-only.  
**Do not apply migrations without approval.**

## Best-of-both-worlds

| Layer | Ownership | Purpose |
|-------|-----------|---------|
| **Neighborhood exterior** | Shared Live World | Roads, parks, shops, other players visible |
| **Home interior** | Private instance per `HomeID` + `PlayerID` | Unlimited décor creativity + performance isolation |

Kingdoms / nations / wars are **future** — not implemented.

## Extends (does not rebuild)

- Homestead economy (`src/lib/economy/housing-service.ts`)
- Land parcels (`src/lib/economy/land.ts`)
- Social home visits / likes
- Housing competitions ratings
- Marketplace browse (furniture + blueprints)
- Guild bank → guild hall stub
- Credits settlement (SOL never required for basics)
- Live World entry stubs + housing panel keybind
- Life-skills / crafting station tags on furniture SKUs

## Key modules

| Module | Role |
|--------|------|
| `src/lib/housing/instance-service.ts` | Purchase/build, rooms, events, Riftling care |
| `src/lib/housing/build-mode.ts` | Place/move/copy/delete, grid snap, collision, undo/redo |
| `src/lib/housing/permissions.ts` | Owner → Public role flags |
| `src/lib/housing/storage-service.ts` | Categorized storage + deposit-token anti-dupe |
| `src/lib/housing/furniture-catalog.ts` | Dozens of SKUs (hundreds backlog) |
| `src/lib/housing/property-catalog.ts` | Starter Cabin → Observatory |
| `src/lib/housing/blueprint-service.ts` | Share/sell layouts with hash anti-dupe |
| `src/lib/housing/visitor-browser.ts` | Public/featured/friends/guild discovery |
| `src/lib/neighborhoods/*` | Shared exteriors (see `docs/neighborhoods/`) |

## Flags

- `PLAYER_HOUSING_ENABLED` (default true)
- `PLAYER_HOUSING_PRISMA_ENABLED` (default **false**)
- `HOMESTEADS_ENABLED` / `HOUSING_ECONOMY_ENABLED` / `LIVE_WORLD_HOMESTEADS_ENABLED`

## APIs & UI

- `GET/POST /api/housing` — playable hub actions
- `GET /api/housing/catalog` — catalogs
- `/housing` — hub UI (build mode + visitor browser)
- `/homestead` — classic shell, links to new hub
- Live World: `src/game/live-world/housing/entry-stubs.ts`

## Related docs

- [DB](./DB.md) · [Build system](./BUILD_SYSTEM.md) · [Instances](./INSTANCES.md)
- [Furniture engine](./FURNITURE_ENGINE.md) · [Permissions](./PERMISSIONS.md) · [Performance](./PERFORMANCE.md)
- [Neighborhoods](../neighborhoods/ARCHITECTURE.md)
