# Creator Program

Creators publish **cosmetic packs, lore drops, and event kits**. Tips and revenue cuts are entertainment — not investment products.

## Surfaces

- Creator Hub UI: `/creators`
- Exchange method card: `creator_program` → `/creators`
- Commissions scaffold: `/marketplace/commissions`
- Streamer / content drops: scaffold via Exchange

## Rules

1. Catalog items must be cosmetic / collectible / lore — never exclusive competitive power.
2. No guaranteed income language in creator onboarding.
3. Tips remain opt-in and may stay disabled until payout rails exist.
4. Sponsorship activations are brand/cosmetic only (see `docs/esports.md`).

## Status

| Piece | Status |
|-------|--------|
| Creator profiles & offer stubs | Partial |
| Purchase → creator cut ledger | Scaffold |
| Tips | Disabled / stub |
| Guidelines copy on hub | Live in snapshot |

Code: `src/lib/ecosystem/creator-hub.ts`, `src/lib/economy/creator-marketplace.ts`, `src/lib/economy/sol/creator-sol.ts`.
