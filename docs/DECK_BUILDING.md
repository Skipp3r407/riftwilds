# DECK_BUILDING.md

**Authority:** Rules v2.1.0 · [RULEBOOK.md](./RULEBOOK.md) · `deck-rules.ts`

## Standard constructed

| Constraint | Value |
|------------|-------|
| Main deck | Exactly **29** |
| Commander | Exactly **1** (not shuffled) |
| Min creatures | 14 companions/evolutions |
| Max spells | 10 |
| Max support | 6 (equip/terrain/relic/trap) |
| Power rarities | Max 3 Legendary/Mythic/Ancient/Founder |
| Copies | Max **1** per cardId |
| Zero-cost | Max **4** collectible 0-cost combat cards |

## Curve guidance (soft)

Deck Atelier shows Energy curve (0–7+) with amber bars for turn-1-affordable costs.

Warnings:

- No cards ≤ turn-1 Energy
- Thin early curve (<4 T1-affordable)
- Average cost ≥ 3.6
- At zero-cost cap

Hard fail: zero-cost count > cap; inventory cards; wrong size.

## Companion Care

Food is **not** a combat card. See inventory reject message in [DECK_VALIDATION.md](./DECK_VALIDATION.md).
