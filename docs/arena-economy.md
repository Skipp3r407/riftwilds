# Arena Economy

## Free path (default)

- Practice vs AI, free matchmaking, private invites — **Credits / cosmetics only** where applicable
- Arena Points (legacy pet battler) remain earn-only, non-transferable, non-redeemable
- No wallet required

## Optional SOL Arena (Phase 2 scaffold)

- Separate UX panel on `/arena` labeled **SOL Arena (optional · OFF)**
- Stake tiers documented in `riftArenaConfig.SOL_STAKE_TIERS_LAMPORTS_DOC`
- Requires **all** of:
  - `RIFT_ARENA_SOL_STAKES_ENABLED`
  - `RIFT_ARENA_SOL_ESCROW_ENABLED`
  - `SOL_WALLET_ENABLED`
  - `REAL_VALUE_WAGERING_ENABLED` (hard-disabled today)

Until then, escrow proposals return `SOL_ARENA_STAKES_DISABLED`.

## Forbidden

- Guaranteed earnings copy
- Paid RNG loot boxes for competitive power
- User-funded gambling / sportsbook patterns
- Soft-gating free play behind wallet connect

## Rewards language

Use entertainment / seasonal recognition framing only. Never “earn SOL by queuing.”
