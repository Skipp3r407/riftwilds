# Marketplace (Credits + optional SOL)

> Player-facing hub doc: [`docs/marketplace.md`](../marketplace.md) · Exchange: [`docs/player-economy.md`](../player-economy.md)

## Credits path (existing)

- `src/lib/marketplace/*` — listings, fees, integrity, Credits settle, eligibility, shops, trade shell
- Categories include CARDS, PACKS, and now **COLLECTIBLES**
- Phase 1–2 hub: `/marketplace` (+ auctions, shops, trade, wishlist)

## SOL path (scaffold)

- `src/lib/economy/sol/marketplace-sol.ts`
- Live only if `SOL_MARKETPLACE_ENABLED` ∧ `REAL_SOL_MARKETPLACE_ENABLED` ∧ `SOL_PURCHASES_ENABLED`
- Fee preview before confirmation
- Settlement state machine; double-settle prevented via requestId + order state

## Fee display stub

- `getSolMarketplaceFeeDisplayStub()` + `SolMarketplaceFeeStub` on `/marketplace`
- Shows seller / platform / creator / community split before confirmation
- Settlement path remains blocked while SOL marketplace flags are off
- Credits fee calculator (`MarketplaceFeeBreakdown`) unchanged for soft trades

## Disclosures

- No guaranteed monetary value
- Listing fees non-refundable when live
- Collectibles ≠ competitive power
- Blockchain purchases may be irreversible when live
