# ITEM_DATABASE

Bridges TCG mirror cards, shop potions, and Companion Care catalog ids.

## Sources

| Layer | Path |
|-------|------|
| Inventory defs | `src/lib/inventory/item-database.ts` |
| Migration map | `src/lib/items/card-inventory-migration.ts` |
| Shop potions | `src/lib/items/catalog/potions.ts` |
| Care catalog | `src/game/creatures/care-catalog.ts` (`CARE_ITEM_CATALOG`) |
| Eligibility | `src/content/tcg/framework/combat-eligibility.ts` |

## Key ids

| Display | Inventory id | Care id | TCG mirror (preserved) |
|---------|--------------|---------|------------------------|
| Basic Pet Meal | `basic-pet-meal` | `basic-meal` | `rotr-s-item-basic-pet-meal` |
| Premium Pet Meal | `premium-pet-meal` | `premium-meal` | `rotr-s-item-premium-pet-meal` |
| Medicine Pack | `medicine-pack` | `field-medicine` | `rotr-s-item-medicine-pack` |

Full migrated list: `docs/CARD_MIGRATION_REPORT.md`.
