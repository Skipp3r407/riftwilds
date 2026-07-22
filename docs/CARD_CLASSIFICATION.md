# CARD_CLASSIFICATION

Combat cards and Inventory goods are separate systems. Artwork and lore stay in `cards.json`; eligibility decides which system may use each id.

## Combat (deck-legal)

| Kind | Content categories | Notes |
|------|--------------------|--------|
| Companions / Units | `companion` | Core board units |
| Evolutions | `evolution` | Count as creatures |
| Commanders | `commander` | Separate slot, not shuffled |
| Spells | `spell` + combat-named `rotr-s-item-*` | Rift Energy cost on play |
| Equipment | `equipment` | Attach to companions |
| Relics | `relic` (non-material) | Board artifacts |
| Terrain | `terrain` | One per player |
| Traps | `trap` | Face-down set |
| Rift Events / Utility | combat utility spells | Never care/food |

Canonical allowlist for combat-named `rotr-s-item-*` spells: `S_ITEM_COMBAT_SPELL_SUFFIXES` in `src/content/tcg/framework/card-categories.ts`.

## Inventory (never shuffled into combat)

| Domain | Sources | Destination |
|--------|---------|-------------|
| Food | Meals, snacks, treats, juice/tea | Inventory → Companion Care Feed |
| Care | Water, cleaning, bond charms | Inventory → Care actions |
| Toy | Toys | Inventory → Play |
| Housing | Nest, pillow, blanket, lullaby | Inventory → Rest |
| Medicine / Recovery / Potion | Packs, revival, salves, flasks | Inventory (bag use, not deck) |
| Material | `rotr-r-mat-*` | Inventory Materials |
| Tool | `rotr-prop-tool-*` | Inventory Tools |
| Quest | `rotr-x-quest-*` | Quests / Collectibles |

**107** catalog ids classified inventory-only; **587** main-deck combat-eligible.

## Code

- `classifyCardSystem` / `isCombatEligibleCard` / `isInventoryOnlyCard` — `src/content/tcg/framework/combat-eligibility.ts`
- Reject message: `"This item belongs in your Inventory, not your Combat Deck."`

## Example

**Basic Pet Meal** (`rotr-s-item-basic-pet-meal`) → Inventory / Food / Feed Companion — **not** a Practice Board SPELL.
