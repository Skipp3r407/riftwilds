# Reward Tables

Admin-configurable stubs live in:

- `src/lib/loyalty/config.ts` — `DAILY_AIRDROP_TABLE`, `RIFT_STORM_TABLE`, milestones, shop
- `src/lib/loyalty/rift-storm-config.ts` — `STORM_WAVE_TABLES`, waves, SOL caps

## Reward kinds

Credits · Loyalty Tokens · Cosmetics · Titles · Badges · Housing · Items (mats, maps, emotes, coupons, egg vouchers, rare stubs)

## Loyalty Shop categories (enforced)

`cosmetic` | `title` | `badge` | `housing` — `gameplayAdvantage` must be `false`.

## SOL

Optional promo ticket entries resolve through `rift-storm-sol.ts`. Default flag off; empty pool / caps / fraud → substitute Credits. Never promises financial return.
