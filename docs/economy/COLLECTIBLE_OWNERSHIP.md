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
