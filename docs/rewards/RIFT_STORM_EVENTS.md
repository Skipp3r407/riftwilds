# Rift Storm Events

Server-side global / regional airdrop events integrated with the loyalty system (not a duplicate economy).

## Activation

Triggers (admin + scheduler stubs):

- Random during active hours (UTC window stub)
- Seasonal / anniversary
- After world boss / community milestones / region objectives
- Admin events / emergency stimulation

Activation commits a seed hash; reveal after end for audit. Not fully predictable from the client.

## Phases

1. **WARNING** — “A strange energy is gathering…” + countdown; show timer, regions, duration, requirements, tier bonus, reward categories. **No winners revealed.**
2. **ACTIVE** — participation scoring + waves
3. **ENDED / CANCELLED** — temp quests expire; emergency cancel supported

## Intensities

Minor · Greater · Legendary · Seasonal · Cataclysm — different warning/active durations, qualify scores, and frequency hints.

## Waves

1. Small drops → 2. Rare → 3. Major → Final guaranteed participation gift for qualified keepers.

## Regional storms

Selected regions get weather, empowered enemies, rare Riftlings, treasure nodes, NPC reactions, temp quests, map markers. Must travel unless `global`.

## World presentation (stub)

Rift skies, particles (`full` / `reduced` / `off`), audio, portals, spawns, NPC warnings — a11y reduced motion / no-flash defaults. **Live World VFX polish is backlog.**

## Player UI

`/loyalty` banner + `GET/POST /api/loyalty/storm` · admin `POST /api/loyalty/storm/trigger`
