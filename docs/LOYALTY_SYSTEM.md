# Loyalty System

Account-wide streaks, weighted airdrops, milestones, Loyalty Tokens, and the cosmetics-only Loyalty Shop. Integrates with Credits ledger faucets `STREAK_AIRDROP` and `LOYALTY_MILESTONE`.

## Principles

- **Fair, not P2W** — odds improve with streak tier; never buy gameplay power.
- **Credits primary** — SOL never required; optional promo SOL is separate and flagged off.
- **Community Reward Treasury framing** — rewards are not “buy coin → pet SOL”.
- **Anti-AFK** — meaningful activity required before daily claims.
- **Pity protection** — bad luck streaks force UNCOMMON+ after a configurable threshold.

## Player surfaces

| Route | Purpose |
|-------|---------|
| `/loyalty` | Claim UI, streaks, shop, Rift Storm banner |
| `/rewards` | Links to loyalty + community treasury framing |
| `/admin/loyalty` | Config stubs |

## API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/loyalty/status` | Full status |
| POST | `/api/loyalty/check-in` | Daily streak |
| POST | `/api/loyalty/activity` | Anti-AFK activity |
| POST | `/api/loyalty/claim` | `daily` or `milestone` |
| GET/POST | `/api/loyalty/shop` | Catalog / buy |
| GET/POST | `/api/loyalty/storm` | Storm view / participate / roll |
| POST | `/api/loyalty/storm/trigger` | Admin trigger / cancel / schedule |

## Feature flags

- `LOYALTY_SYSTEM_ENABLED`
- `LOYALTY_DAILY_AIRDROP_ENABLED`
- `LOYALTY_SHOP_ENABLED`
- `RIFT_STORM_ENABLED`
- `RIFT_STORM_SOL_ENABLED` (default **false**)
- `LOYALTY_SOCIAL_ANNOUNCE_ENABLED`

## Code map

- `src/lib/loyalty/` — core logic
- `src/components/loyalty/` — claim UI
- Related: `docs/STREAK_TIERS.md`, `docs/AIRDROPS.md`, `docs/REWARD_TABLES.md`, `docs/rewards/RIFT_STORM_*.md`
