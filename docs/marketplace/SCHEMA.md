# Player Marketplace / Rift Exchange — table plan

**Proposal only.** Do not apply to production without review. Prefer extending existing `MarketplaceListing` / `MarketplaceSale` in `prisma/schema.prisma` when ready.

See also: `prisma/schema-proposals/rift-exchange.prisma`.

## Tables (planned)

| Table | Purpose |
|-------|---------|
| `PlayerShop` | Shop slug, name, banner, owner, specialties |
| `PlayerShopRating` | Non-authoritative until moderation pipeline |
| `MarketplaceWishlist` | Wishlist / watchlist rows |
| `TradeRequest` | Double-confirm trade shell persistence |
| `MarketplaceOffer` | Best-offer bids |
| `MarketplaceAuctionBid` | Auction bids |
| `MarketplaceRental` | Future rental leases |
| `CommissionBrief` | Future commissions |
| `ExchangeEarningEvent` | Claim/history hooks (entertainment ledger) |
| `KeeperReputationSnapshot` | Cached reputation (derived) |
| `MarketplaceAbuseSignal` | Wash / rate / collusion signals |
| `MarketplaceTxLog` | Append-only audit types |

## Extend existing

- `MarketplaceListing` — add `listingType`, auction/offer JSON or child tables
- `MarketplaceSale` — already settles purchases
- `MarketplaceFeePolicy` — already present
- Currency ledger — Credits settlement remains authoritative for soft path

## Migration policy

1. Land proposal file + docs.
2. Local `prisma migrate dev` on a disposable DB after explicit approval.
3. Never auto-deploy.
