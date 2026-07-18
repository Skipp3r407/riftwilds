# Rested Camping & Logout-Friendly Hubs

While-online rest bonuses for inns, campfires, safe zones, and logout benches.

## What this is

Keepers who **meaningfully rest** in hubs (sit, campfire, talk, pet care nearby) get a small Presence XP rest bonus. Riftlings can play ambient rest behaviors (doze, curl, watch crowd) — cosmetic stubs only.

## What this is not

- Not AFK farming
- Not persistent world camping after logout (default: **remove-from-world on logout**)
- Not SOL rewards
- Not combat power or P2W buffs

## Zone kinds

| Kind | Role |
| --- | --- |
| `safe_zone` | Reuses world-map safe zones |
| `town_plaza` | Social hub |
| `inn` | Deeper rest; logout-friendly |
| `campfire` | Ambient rest with companions |
| `homestead` | Home hearth |
| `fishing_dock` | Quiet presence |
| `festival_grounds` | Celebration rest |
| `market_square` | Trade-hub rest |
| `logout_rest` | Calm bench while online |

## Integration

- Catalog: `REST_HUB_CATALOG` in social-presence config
- Mapping from world object types: `restKindFromWorldObjectType`
- Live World HUD shows rest bonus % when `inRestZone`
- Ambience / crowd LOD stubs under `src/game/social-presence/`

See also: [Living World Presence](../social/LIVING_WORLD_PRESENCE.md)
