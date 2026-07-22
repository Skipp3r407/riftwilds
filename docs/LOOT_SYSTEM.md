# LOOT_SYSTEM

Loot and rewards must land in the correct ledger.

## Combat rewards

- Binder card copies (`grantCardCopies`) — combat-legal cards only for deckability
- Rift Energy / battle progression unchanged by this redesign

## World / Care loot

- Food, care kits, materials, tools, quest tokens → **Inventory** stacks
- Quest catalog care rewards already use inventory keys (e.g. `basic-pet-meal`)
- Migrated TCG care cards grant inventory on deck strip — they do not stay in active decks

## Packs

Card packs grant binder cards. Care goods from shop/NPC use inventory grant APIs (`/api/inventory/grant`, demo inventory).

## Rule of thumb

If it feeds, cleans, houses, or crafts outside battle → Inventory.  
If it is played with Rift Energy in a duel → Combat Deck.
