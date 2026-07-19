# Player Marketplace

Social hub for **buy / sell / trade / auction / (future) rent / showcase** of eligible cosmetics and collectibles. One earning path inside **Rift Exchange**.

## Design rules

- No guaranteed competitive advantages via marketplace.
- Base progression achievable without marketplace.
- Credits-first; SOL optional prestige.
- Sellers set prices; Riftwilds never assigns guaranteed monetary value.

## Routes

| Route | Status |
|-------|--------|
| `/marketplace` | Live demo desk (search/sort, categories, purchase stub) |
| `/marketplace/auctions` | Live demo (auction + best offer samples) |
| `/marketplace/shops` | Partial player shops |
| `/marketplace/shops/[slug]` | Partial shop page |
| `/marketplace/trade` | Shell + double-confirm |
| `/marketplace/wishlist` | Live demo (session memory) |
| `/marketplace/rentals` | Coming stub |
| `/marketplace/commissions` | Coming stub |
| `/marketplace/guild` | Coming stub |
| `/admin/marketplace` | Moderation / eligibility board |
| `/tcg/museum` | List-from-exhibit hooks |

## Listing types

| Type | Phase |
|------|-------|
| FIXED_PRICE | Live demo |
| AUCTION | Live demo |
| BEST_OFFER | Live demo |
| TRADE / RENTAL / SHOWCASE / COMMISSION / MUSEUM_EXHIBIT | Scaffold in model |

## Eligibility (summary)

**Allowed:** cosmetics, alt-art, collectible editions, binder presentation, disclosed companion market.  
**Blocked:** base competitive power, account-bound starters, property (until enabled).

Code: `src/lib/marketplace/eligibility.ts`.

## Fees

Configurable display — pets/eggs ~90/5/3/1/1; items lighter ~5% band. Listing fee disclosure non-refundable when SOL path live. See `src/lib/marketplace/fee-policy.ts`.

## Security honesty

**Real foundations:** ownership check, duplicate requestId, self-trade block, soft rate limit, listability gate, demo tx log.  
**Not done:** production escrow, full wash-graph, multi-account clustering, anti-bot farm.

## Schema

Proposal only (do not migrate prod blindly): `prisma/schema-proposals/rift-exchange.prisma` and `docs/marketplace/SCHEMA.md`.

## Related

- `docs/economy/MARKETPLACE.md` (Credits + SOL flags)
- `docs/economy/NO_PAY_TO_WIN_POLICY.md`
- `docs/player-economy.md`
