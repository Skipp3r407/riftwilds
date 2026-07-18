# No Pay-To-Win Policy

## Rules

1. **Essential competitive cards** must be earnable without SOL (quests, Gold packs, battle rewards).
2. **Collectible editions** (alt art, foil, animated) never grant ATK/HP/energy or exclusive competitive effects.
3. **Premium collector packs** may sell cosmetics only — not exclusive gameplay power.
4. **Season pass premium** may add cosmetics/convenience; free track must remain viable.
5. Catalog validator: `validateCatalogNoPayToWin()` in `src/lib/economy/sol/catalog.ts`.

## Separation

| Asset | Competitive? |
|-------|----------------|
| Gameplay card copy (`GAMEPLAY_CARD_COPY`) | Yes — soft earn/spend |
| Collectible edition | No — cosmetic ownership |
| Card backs / boards / frames | No |

## Enforcement

- Unit tests reject SOL-exclusive essential power SKUs.
- `collectibleAffectsGameplay()` always returns `false`.
- Minting does not unlock stronger cards.
