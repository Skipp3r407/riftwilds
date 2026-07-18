# Map Legend

**Date:** 2026-07-18

## Categories

| Key | Contents |
|-----|----------|
| `quests` | Catalog quests (non-locked) |
| `services` | Buildings, shops, labelled NPCs |
| `portals` | Portal rings |
| `waypoints` | Discovered / nearby waypoints |
| `gateways` | Gateway Stones |
| `treasures` | Discovered caches (+ clue hints) |
| `enemies` | Enemy territories |
| `bosses` | World boss arenas |
| `pois` | POIs / landmarks / hidden areas (when known) |
| `habitats` | Rare Riftling habitats (after discovery) |
| `events` | Active Living World disasters |
| `custom` | Player pins |
| `perks` | Earned exploration perks only |

## UI

- **Filter chips** — exclusive focus on one category (`all` = use legend toggles)
- **Legend panel** — persistent checkboxes stored in exploration progress
- **Search** — case-insensitive match on label / subtitle / searchText
- **Drop pin** — place custom waypoint; removable from detail pane

## Icons

See `src/game/world-exploration/map-icons.ts` and `public/assets/ui/map/`.
