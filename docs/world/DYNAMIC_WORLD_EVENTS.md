# Dynamic World Events

Server-authoritative living-world spectacle — stories that interrupt the Commons and beyond.

## Principles

- Soft **Credits** / cosmetics / temp quests only — **never SOL**.
- **Anti-AFK**: motionless standing earns nothing (MOVE / INTERACT / COMBAT required).
- Extends Live World, exploration map markers, social presence “Happening now”, NPC reaction stubs — does not replace Rift Storm airdrops or Living World disasters.
- Original Riftwilds IP only.

## Catalog (10)

| Key | Spectacle |
| --- | --- |
| `dragon_city_attack` | Ashwing raid on Commons |
| `caravan_ambush` | Riftroad caravan ambush |
| `goblin_invasion` | Goblin wave on plaza edge |
| `bridge_collapse` | Bridge rubble / repair |
| `wandering_world_boss` | Rift Colossus (boss stub) |
| `traveling_circus` | Traveling circus |
| `meteor_crash` | Meteor crash site |
| `rare_rift_opening` | Rare rift tear |
| `shipwreck` | Coastal shipwreck |
| `haunted_forest_night` | Haunted forest vigil |

## Phases

`SCHEDULED` → `ANNOUNCED` → `ACTIVE` → `RESOLVING` → `ENDED` / `CANCELLED`

## Code map

| Path | Role |
| --- | --- |
| `src/lib/world-events/**` | Catalog, store, participation, engine |
| `GET/POST /api/world-events` | Player view + participate |
| `GET/POST /api/world-events/admin` | Trigger / cancel / schedule tick |
| `HappeningNowBanner` + `TownActivityPanel` | Live World HUD |
| `buildWorldEventMarkers` | Exploration map |
| `/admin/events` | Ops UI stub |

## Feature flag

`LIVE_WORLD_EVENTS_ENABLED` (default true)

## Honest backlog — multiplayer scale

See `WORLD_EVENT_MULTIPLAYER_BACKLOG` in config: 100-player boss sync, lockstep ticks, physics-validated hits, Prisma TTL for world changes, cinema cams — require dedicated Live World realtime service beyond serverless.

## Related

- Rift Storm: loyalty airdrop events (separate)
- Living World disasters: day/season clock layer (separate)
- Open-world bosses (#8): extends wandering boss / BOSS_HIT path
