# Rift Arena Escrow (Phase 2 scaffold)

## Status

**Not live.** Types + reject path only (`src/game/rift-arena/escrow-scaffold.ts`). Schema proposal: `prisma/schema-proposals/rift-arena.prisma`.

## Intended flow (future)

1. Both players opt into a stake tier on a **SOL Arena** match (never default queue)
2. Escrow funds to platform vault with idempotency keys
3. Match resolves server-authoritatively
4. Release to winner or refund on abort / dispute
5. Full audit log + anti-collusion review before high tiers

## Hard gates

`proposeEscrowStub` refuses unless stakes + escrow + wallet + `REAL_VALUE_WAGERING_ENABLED` are all true. Today wagering is permanently false in `src/lib/config/arena.ts`.

## Non-goals

- Client-side balance mutation
- Auto-stake from free matchmaking
- Spectators wagering
