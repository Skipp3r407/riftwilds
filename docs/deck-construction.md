# Deck Construction

**Config:** `STANDARD_BATTLE_RULES.deck` · validator `src/content/tcg/framework/deck-rules.ts`

## Standard list

- **30 total pieces** = 1 Keeper Commander (not shuffled) + **29** main-deck cards
- Min **14** creature/companion cards
- Max **10** spells
- Max **6** equipment / artifact / terrain / support combined
- Max **3** Legendary + Mythic + Ancient combined

## Copy limits

| Rarity | Max copies |
|--------|------------|
| Common, Uncommon, Rare, Epic | 2 |
| Legendary, Mythic, Ancient | 1 |

Cosmetic rarity never affects legality or power. Ranked uses normalized competitive stats only.

## Migration

Legacy 30-card main decks are trimmed/flagged via `src/game/tcg/rules/deck-migration.ts`. Collections are never deleted.
