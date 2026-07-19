# Replays

## Phase 1

Lightweight **replay hooks** append on match create / turn actions:

- `src/game/rift-arena/replay-hooks.ts`
- In-memory, capped lists — not a deterministic full replay yet

## Phase 2+

- Persist ordered event log + RNG seed + balance version
- Spectate VOD from event stream
- Shareable replay IDs on history rows

## Non-goals now

- Client-trusted timelines
- Betting on replay outcomes
