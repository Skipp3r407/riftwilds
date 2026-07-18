# Live World Persistence Architecture

**Status:** Phase 1 implemented (REST session + in-memory/optional Prisma).  
**Do not apply production migrations without approval.**

## Goals

- Server-authoritative save for progression that matters
- Safe logout at inn / home / camp with countdown
- Disconnect recovery with reconnect grace
- Combat disconnect never grants invulnerability
- Category A (credits / ownership) stays on existing immediate ledgers
- Never rely solely on `localStorage` for critical data
- Never charge SOL or delete items on logout

## Layers

| Layer | Role |
|-------|------|
| Auth `Session` | Cookie SIWS / identity (unchanged) |
| `WorldPlaySession` | Live World presence lease + heartbeat |
| `WorldSaveState` | Category B/C blob + last safe checkpoint refs |
| `SafeLogoutCheckpoint` | Last confirmed rest logout |
| `CurrencyLedger` / inventory ledgers | Category A immediate |
| Client `localStorage` | Cache / offline UX only |

## Data flow

```
Phaser persistPosition (2.5s)
  → local position-save (cache)
  → POST /api/persistence/heartbeat
  → POST /api/persistence/autosave (Category B cadence)

Pause → Rest / Log out
  → preview logout safety
  → countdown (cancelable)
  → POST /api/persistence/logout (safe | unsafe)

Crash / tab close
  → shutdown force autosave + disconnect mark
  → restore: active session → save → safe checkpoint → default spawn
```

## Key modules

- `src/lib/persistence/*` — server core
- `src/game/live-world/persistence/safe-logout-zones.ts` — inn/home/camp catalog
- `src/game/live-world/persistence/server-sync.ts` — client sync
- `src/app/api/persistence/*` — REST APIs
- `prisma/migrations/20260718060000_world_persistence/` — prepared only

## Phase 1 honesty

- Hot path is **in-process memory** (same pattern as Credits)
- Prisma adapter is optional (`WORLD_PERSISTENCE_PRISMA_ENABLED`, default false)
- Multiplayer WebSocket lease is **not** live — see `PHASE1_BACKLOG.md`

## Related

- `docs/persistence/SAVE_CATEGORIES.md`
- `docs/persistence/SAFE_LOGOUT.md`
- `docs/persistence/DISCONNECT_RECOVERY.md`
- `docs/security/SAVE_STATE_SECURITY.md`
- `docs/economy/CREDIT_LEDGER.md`
