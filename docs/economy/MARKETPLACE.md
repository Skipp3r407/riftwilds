# Marketplace (Credits + optional SOL)

## Credits path (existing)

- `src/lib/marketplace/*` — listings, fees, integrity, Credits settle
- Categories include CARDS, PACKS, and now **COLLECTIBLES**

## SOL path (scaffold)

- `src/lib/economy/sol/marketplace-sol.ts`
- Live only if `SOL_MARKETPLACE_ENABLED` ∧ `REAL_SOL_MARKETPLACE_ENABLED` ∧ `SOL_PURCHASES_ENABLED`
- Fee preview before confirmation
- Settlement state machine; double-settle prevented via requestId + order state

## Disclosures

- No guaranteed monetary value
- Listing fees non-refundable when live
- Collectibles ≠ competitive power
