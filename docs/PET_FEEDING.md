# PET_FEEDING

Feeding is Companion Care only — never a combat SPELL.

## Basic Pet Meal

| Field | Value |
|-------|-------|
| Inventory id | `basic-pet-meal` |
| Care catalog id | `basic-meal` |
| Legacy card id (preserved) | `rotr-s-item-basic-pet-meal` |
| Domain | Food |
| Hunger | +25 (profile) / care engine FEED deltas |
| Happiness | +5 |
| Bond | +3 |
| Care XP | ~8 |
| Stack max | 50+ |

## Player flow

1. Obtain meal (shop, quest, demo starter bag, deck migration grant)
2. `/inventory` → Food tab
3. `/companion-care` or `/pets/[publicPetId]` Care tab → **Feed** / Use Basic Meal
4. Hunger / bond / XP update; **no Rift Energy** spent

## ID bridge

Shop/TCG `basic-pet-meal` ↔ care catalog `basic-meal`. `performCareAction` accepts either id in the pet bag.

## What changed

Practice Board no longer deals Basic Pet Meal. Classification marks it inventory-only; deck validation rejects it with the Inventory message; launch/practice pools exclude it.

## Related food

Premium Pet Meal, Crystal Berry Snack, Aurora Treat, Happiness Treat — Inventory Food path.  
*(Battle energy juices like Sparkfruit Juice stay combat Utility.)*
