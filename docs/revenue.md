# Revenue sources (Project Treasury Ops)

All sources ingest into the **single Project Treasury Wallet**, then distribute by rules.

| Source key | Description |
|------------|-------------|
| `pumpfun_creator_fees` | Pump.fun creator fees (conceptual single landing) |
| `marketplace_fees` | Marketplace platform fee share |
| `nft_sales` / `nft_royalties` | NFT primary / royalty adapters |
| `battle_pass` | Battle pass product fees (not PvP escrow) |
| `cosmetic_shop` | Cosmetic shop |
| `creator_guild_marketplace` | Creator / guild market fees |
| `arena_tournament_fees` | Product fees; prizes may be treasury-funded |
| `sponsored_events` | Sponsors |
| `merch` / `donations` / `ads` / `website_sales` | Extensible |
| `other` | Catch-all |

Adapters: `src/lib/treasury-ops/adapters/`. See [treasury-system.md](./treasury-system.md).
