# Collectible Ownership

## Gameplay card ≠ collectible edition

| Concept | Module | Purpose |
|---------|--------|---------|
| Gameplay card | `src/content/tcg` | Battle stats / deck legality |
| Collectible edition | `src/lib/economy/sol/collectible-editions.ts` | Cosmetic ownership linked by `gameplayCardId` |

## Ownership

- Off-chain grants via entitlements + in-memory ownership map
- Prisma proposal: `CollectibleEditionOwnership`
- Minting: delayed opt-in; `queueCollectibleMint` returns `BLOCKED` while flags off

## Treatments

Alternate art, foil, animated, signed, founder, seasonal, holiday — **never** gameplay power.

## Browser UI

- Page: `/collectibles`
- Helper: `listCollectibleEditionBrowser()` — joins TCG `resolveCardImagePath` (`/assets/tcg/cards/…`)
- API: `GET /api/economy/sol/collectibles`
- Detail panel: gameplay card link, supply, prices, trade/mint flags, deck note (use gameplay copy)
- Mint requests stay `BLOCKED` while mint flags are off
