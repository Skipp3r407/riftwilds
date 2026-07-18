# Phase 1 Persistence Backlog (Honest)

## Done this pass

- World session + heartbeat + autosave + restore APIs
- Safe/unsafe logout with countdown UI
- Disconnect / reconnect grace + combat non-invulnerability
- Position validation + fallback chain
- Dirty flags, snapshots, idempotency, shutdown flush stubs
- Prisma schema + migration **files prepared** (not applied)
- Admin session inspect / force-end stubs
- Unit tests for save / logout / session
- Docs under `docs/persistence/`, security, admin, QA

## Explicitly not done (multiplayer WS lease)

| Item | Notes |
|------|-------|
| WebSocket instance lease | `multiplayer-client.ts` still Phase-1 local stub |
| Cross-node session affinity | Needs Redis / shared store |
| Authoritative movement replication | Phase 2+ MMO authority |
| Prisma applied in production | Awaiting migration approval |
| Full inventory/quest Prisma wiring | Schema exists; Live World still demo stores |
| Sleeping character visibility in Phaser | Flag default OFF; stub record only |
| Rest bonus economy grant | Stub disabled |

## Recommended next steps (post-approval)

1. Apply `20260718060000_world_persistence` on staging → `prisma generate`
2. Flip `WORLD_PERSISTENCE_PRISMA_ENABLED=true` on staging
3. Wire WS lease to `WorldPlaySession` on connect/heartbeat
4. Replace in-memory store with Redis for multi-instance Next.js
5. Hydrate quests/inventory from Prisma on restore when those flags go live
