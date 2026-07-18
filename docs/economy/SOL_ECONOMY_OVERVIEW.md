# SOL Economy Overview

**Status:** Scaffold / feature-flagged OFF  
**Audit:** [SOL_ECONOMY_PHASE1_AUDIT.md](./SOL_ECONOMY_PHASE1_AUDIT.md)  
**Invariant:** Core gameplay never requires SOL. Gold + Rift Shards power play.

## Layers

| Layer | Currency | Required? |
|-------|----------|-----------|
| Core play | Gold (= Credits ledger) | Yes |
| Soft premium | Rift Shards | No |
| Optional real-money | SOL | No — all `SOL_*` flags default false |

## Code home

- Foundation: `src/lib/economy/sol/`
- Credits settlement (Gold): `src/lib/credits/`, `src/lib/economy/core/`
- SIWS auth: `src/lib/auth/siws.ts`
- Flags: `src/lib/config/feature-flags.ts`

## Mandate flags (default false)

`SOL_WALLET_ENABLED`, `SOL_PURCHASES_ENABLED`, `SOL_MARKETPLACE_ENABLED`, `SOL_TOURNAMENTS_ENABLED`, `SOL_MINTING_ENABLED`, `SOL_WITHDRAWALS_ENABLED`, `SOL_CREATOR_MARKETPLACE_ENABLED`, `SOL_COMMUNITY_FUNDING_ENABLED`

Legacy gates remain: `REAL_SOL_MARKETPLACE_ENABLED`, `NFT_MINTING_ENABLED`, etc.

## What is live vs stub

| Capability | Status |
|------------|--------|
| Gold via Credits | Live soft path |
| Rift Shards ledger | In-memory scaffold |
| Collectible editions | Types + grants (off-chain) |
| SOL marketplace settle | Blocked |
| SOL minting | Blocked / opt-in pipeline |
| Free tournaments | Config present |
| Dev network | `devnet` (never mainnet default) |
