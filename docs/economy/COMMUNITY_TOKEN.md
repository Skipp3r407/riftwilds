# Community Token

Account-bound social currency for Living Server Population.

## Properties

- Earned via social participation / helpers / tasks / engagement checks
- **Non-transferable**, non-sellable
- **Unavailable for SOL purchase**
- Daily and weekly caps
- Spends on cosmetics only (emotes, frames, furniture stubs, titles, toys, instruments)

## Shop

`COMMUNITY_SHOP` + `GET/POST /api/social-presence/tokens`

## Economy safety

Paired with soft sinks (housing / NPC shop / restoration conceptually). Never converts to SOL. Never grants combat power.

## Ledger

In-memory with idempotent `requestId`. Prisma `CommunityTokenLedger` prepared in migration (not applied).
