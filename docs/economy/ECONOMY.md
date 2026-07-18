# Economy — Reborn Overview

**Status:** Gold/Credits-first universe; TCG spends/earns soft currency  
**Canonical detail:** [MASTER_ECONOMY_ROADMAP.md](./MASTER_ECONOMY_ROADMAP.md) · [CREDIT_LEDGER.md](./CREDIT_LEDGER.md) · [SOL_INTEGRATION.md](./SOL_INTEGRATION.md) · [SOL_ECONOMY_OVERVIEW.md](./SOL_ECONOMY_OVERVIEW.md)

## Invariant

**Gameplay never requires SOL.** **Gold** (Credits ledger) + **Rift Shards** power play: shop, care, marketplace settle path, season pass, TCG rewards/sinks. SOL is optional cosmetics/collectibles/market/tournaments only.

## Reborn additions (planned)

| Loop | Notes |
|------|-------|
| Match rewards | Small Credits / XP / binder progress (capped like Arena AP) |
| Deck cosmetics | Card backs, board skins via Credits / loyalty |
| Packs | Credits or quest — never paid random real-money gacha |
| Marketplace | Extend categories for card cosmetics / later card trades |

## Reuse

- `src/lib/credits/` ledger + faucets/sinks  
- `src/lib/economy/core` settlement  
- Marketplace Credits path  
- Season pass / guild bank / collectibles modules  

## Do not

- Duplicate ledgers for “TCG coins”  
- Enable real-value wagering  
- Gate starter decks behind wallet
