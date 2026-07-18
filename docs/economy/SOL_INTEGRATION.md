# SOL Integration — Optional Only

**Status:** Binding  
**Related:** [ECONOMY.md](./ECONOMY.md) · [SOL_ECONOMY_OVERVIEW.md](./SOL_ECONOMY_OVERVIEW.md) · `src/lib/economy/sol-adapter.ts` · `src/lib/economy/sol/` · feature flags in `feature-flags.ts`

## Rule

SOL may unlock **convenience and cosmetics** (and future marketplace escrow when explicitly enabled). SOL must **never** be required to:

- Enter Live World  
- Play TCG matches  
- Progress quests  
- Obtain a starter deck / basic binder  
- Care for Riftlings  
- Claim housing basics  

Soft play currencies: **Gold** (Credits ledger) + **Rift Shards**. See [CURRENCY_MODEL.md](./CURRENCY_MODEL.md).

## Current defaults (selected)

| Flag | Default |
|------|---------|
| `SOL_WALLET_ENABLED` | `false` |
| `SOL_PURCHASES_ENABLED` | `false` |
| `SOL_MARKETPLACE_ENABLED` | `false` |
| `SOL_TOURNAMENTS_ENABLED` | `false` |
| `SOL_MINTING_ENABLED` | `false` |
| `SOL_WITHDRAWALS_ENABLED` | `false` |
| `SOL_CREATOR_MARKETPLACE_ENABLED` | `false` |
| `SOL_COMMUNITY_FUNDING_ENABLED` | `false` |
| `SOL_ITEM_PURCHASES_ENABLED` | `false` |
| `REAL_SOL_MARKETPLACE_ENABLED` | `false` |
| `SOL_SPIRIT_RECALL_ENABLED` | `false` |
| `RIFT_STORM_SOL_ENABLED` | `false` |
| `AUTH_WALLET_OPTIONAL_PLAY` | `true` |

Wallet SIWS remains an **identity** path, not a payment requirement for play.

## Adapter policy

`sol-adapter.ts` and `src/lib/economy/sol/*` stay dry-run / blocked until product + compliance explicitly enable a path. TCG code must call Credits/Gold settlement only.
