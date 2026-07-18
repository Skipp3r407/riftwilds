# Playable Live World — Browser Multiplayer Habitat

The Live World is a **playable browser game**, not a passive livestream. Keepers enter Riftwild Commons, control an avatar, walk with a pet companion, and interact with the habitat. Spectator/stream views are secondary and disabled by default.

## Primary UX

| Item | Value |
|------|--------|
| Route | `/live-world` |
| Legacy redirect | `/live` → `/live-world` |
| Primary CTA | **ENTER THE LIVE WORLD** |
| Spectator | `/live-world/spectate` (`LIVE_WORLD_SPECTATOR_MODE_ENABLED=false`) |
| Legacy stream | `/live/stream` → spectate |

## Authority model

- **Phase 1:** Client/local authoritative for movement, camera, pet follow, and NPC dialogue (demo).
- **Phase 2+:** WebSocket Live World service becomes authoritative for presence, chat, gathering rewards, combat, and ownership-sensitive outcomes.
- Client must never be trusted for rewards, ownership, or combat results.

## Feature flags

Defaults in `src/lib/config/feature-flags.ts`:

| Flag | Default | Notes |
|------|---------|--------|
| `PLAYABLE_LIVE_WORLD_ENABLED` | `true` | Gates enter / Phaser shell |
| `LIVE_WORLD_ENABLED` | `true` | Legacy alias for older UI checks |
| `LIVE_WORLD_MULTIPLAYER_ENABLED` | `true` | Hooks scaffolded; Phase 1 still local |
| `LIVE_WORLD_CHAT_ENABLED` | `true` | Stub only until Phase 2 |
| `LIVE_WORLD_PVE_ENABLED` | `true` | Stub until Phase 4 |
| `LIVE_WORLD_GATHERING_ENABLED` | `true` | Stub until Phase 3 |
| `LIVE_WORLD_EVENTS_ENABLED` | `true` | Dynamic World Events engine live (see `docs/world/DYNAMIC_WORLD_EVENTS.md`) |
| `LIVE_WORLD_WORLD_BOSSES_ENABLED` | `true` | Stub until Phase 4 |
| `LIVE_WORLD_HOMESTEADS_ENABLED` | `false` | Phase 5 |
| `LIVE_WORLD_GUILDS_ENABLED` | `false` | Phase 5 |
| `LIVE_WORLD_SPECTATOR_MODE_ENABLED` | `false` | Not default UX |
| `LIVE_WORLD_MOBILE_CONTROLS_ENABLED` | `true` | Virtual joystick + Talk/Run |

## Code map

```
src/app/(game)/live-world/          # Enter page + spectate
src/components/live-world/          # React shell, overlays, mobile controls
src/game/live-world/
  create-game.ts                    # Phaser boot (Commons + 3 enterable regions)
  bridge.ts                         # React ↔ Phaser
  map/commons-map.ts                # Legacy helpers → world-maps blueprint
  scenes/BootScene.ts               # Placeholder textures
  scenes/BlueprintRegionScene.ts    # Shared blueprint-driven scene
  scenes/CommonsScene.ts            # Playable hub
  scenes/*Scene.ts                  # Ember / Coast / Elderwood stubs
  persistence/position-save.ts      # localStorage last position
  network/multiplayer-client.ts     # Phase 2 stub
  systems/*-stub.ts                 # Chat / gathering / PvE stubs
src/game/world-maps/                # All 12 region blueprints + defs
docs/WORLD_MAPS.md                  # Map structure & unlock progression
```

## Phase roadmap

### Phase 1 — Playable demo (current)

- [x] Phaser 3 shell inside Next.js + React overlays
- [x] Riftwild Commons blueprint map (plaza, buildings, portal circle, NPCs)
- [x] Player movement (WASD / arrows / Shift run)
- [x] Smooth follow camera
- [x] Collisions + map boundaries
- [x] One active pet companion (follow + teleport recovery)
- [x] Clickable companion → Equipment panel → owned equip → world layers
- [x] Appearance broadcast stub via Live World multiplayer client
- [x] Basic NPC + Space/E interact
- [x] Desktop + mobile virtual controls
- [x] Save last position (`localStorage`)
- [x] Loading screen + connection/status stub
- [x] Feature flags + nav/copy (Enter Live World)
- [x] Docs (this file)
- [x] 12-region world-map blueprints + unlock gates (`docs/WORLD_MAPS.md`)
- [x] Enterable stub portals: Ember Crater, Moonwater Coast, Elderwood Forest

See also: `docs/EQUIPMENT_AND_LOADOUTS.md` (ownership, presets, anchor backlog).

### Phase 2 — Multiplayer social

- WebSocket instances / shards
- Nearby-player rendering
- Chat, emotes, friends, parties
- Server-validated presence
- Pet social interactions
- Full pet appearance sync (Phase 1 only stashes `sendAppearance` stubs locally)

### Phase 3 — Activities & destinations

- Gathering nodes
- Quests in-world
- Inventory integration
- Hatchery / Marketplace / Crafting building interiors or portals
- Waypoints + region portals

### Phase 4 — PvE & spectacle

- Wild encounters (server authoritative)
- World events + bosses — **Dynamic World Events + open-world boss stubs landed** (`docs/world/DYNAMIC_WORLD_EVENTS.md`, retention roadmap)
- Pet traversal abilities
- Additional regions
- Weather / day-night (optional)

### Phase 5 — Housing & orgs

- Homesteads
- Guild spaces
- Player businesses
- Seasonal events
- Optional spectator mode polish

## Controls

**Desktop:** WASD or arrow keys · Shift run · E or Space talk/advance dialogue  

**Mobile:** Left virtual joystick · Run · Talk

## Social presence (while online)

Living World Presence XP, rest hubs, Town Featured titles, and anti-AFK live under:

- `docs/social/LIVING_WORLD_PRESENCE.md`
- `docs/world/RESTED_CAMPING.md`
- Live World HUD: Presence panel · town activity · featured banner

Presence rewards meaningful social/rest activity only — never SOL for idling. Logout still removes keepers from the world by default.

## Ops notes

- Lazy-load Phaser from the client only (no SSR import of the game factory).
- Realtime service must run outside pure serverless (see `docs/MMO_ARCHITECTURE.md`).
- Admin: pause via `PLAYABLE_LIVE_WORLD_ENABLED`, audit later for moderation / stuck-player tools.
