# Riftwilds Combat — Overview

Original IP turn-based battle system for Riftwilds Arena. Server-authoritative: clients request actions; the server decides damage, crits, turn order, status, victory, and rewards. No SOL for basic play. Credits/XP/Arena Points are capped.

## Playable now

- **Practice 1v1 vs AI** at `/arena/training`
- Full turn pipeline, weather/terrain, status catalog, energy, Rift Burst ultimate meter
- 30s turn timer with auto-defend timeout
- Accessibility: animation speed, reduced motion, keyboard + mobile-friendly actions

## Architecture

```
Client (TrainingBattle UI)
  → POST /api/arena/training/start | /turn
  → training-store (session ownership, rate limit, idempotency)
  → engine.resolveRound (pure TS, seeded RNG)
  → event log → UI animation / replay stub
```

Core modules live under `src/game/arena/`:

| Module | Role |
|--------|------|
| `engine.ts` | Turn pipeline + resolution |
| `types.ts` | Combatant/action/state contracts |
| `weather-terrain.ts` | Field conditions |
| `status-catalog.ts` | Status definitions |
| `ai.ts` | NPC difficulty tiers |
| `anti-cheat.ts` | Validation, rate limit, idempotency |
| `rewards.ts` | Capped Credits/XP/AP |
| `arenas.ts` | Biome arenas + art paths |
| `matchmaking.ts` / `ranked-ladder.ts` / `replay.ts` | Phase 2 stubs |

## Battle types

See `battle-types.ts`: PRACTICE (playable), DUEL/RANKED/NPC/ARENA/PVE (stubs), TOURNAMENT/GUILD/BOSS/RAID/STORY/EVENT (planned).

## Compliance

`REAL_VALUE_WAGERING_ENABLED = false`. Arena Points are earn-only, non-transferable, non-redeemable.
