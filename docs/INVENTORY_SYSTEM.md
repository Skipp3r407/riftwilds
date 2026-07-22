# INVENTORY_SYSTEM

Keeper pack for non-combat goods. Combat cards live in the Card Binder / Deck Builder.

## Route

- **`/inventory`** — categories, search, sort, stack quantities
- Linked from Companion Care, shop, and nav Pack

## Categories (tabs)

Food · Care · Recovery · Potions · Tools · Materials · Quests · Weapons · Armor · Abilities · Cosmetics · Collectibles

## Stacks & ownership

- Demo bag: `useDemoInventory` + `DEMO_INVENTORY_STORAGE_KEY` (local)
- Server stub: `src/lib/inventory/player-inventory-store.ts` (`grantInventoryItem`, `consumeInventoryItem`)
- Typed defs: `src/lib/inventory/item-database.ts` + `src/lib/inventory/types.ts`

## Migration into Inventory

When binders still contain inventory-only TCG ids, `getActiveDeckList` strips them and calls `grantFromTcgMigration` so stacks accumulate instead of deleting the item.

## Never combat

Food, care, housing, care-medicine, materials, tools, quests — see `CARD_CLASSIFICATION.md`.
