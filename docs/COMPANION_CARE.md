# COMPANION_CARE

Outside-battle companion wellbeing. Never shuffled into combat decks.

## Routes

- **`/companion-care`** — hub (actions, demo companions, Feed from Inventory)
- **`/pets/[publicPetId]`** — full Care profile (`LiveCarePanel`)
- **`/pets`** / collection — pick a companion

## Stats

Hunger · Energy · Mood · Trust · Bond · Care XP · Favorites

## Actions

Feed · Play · Train · Heal · Clean · Sleep · Customize · Rename (profile) · Pet · Water

Credits-based care actions remain; inventory meals (Basic Pet Meal) consume a stack instead of Credits.

## Basic Pet Meal

Inventory Food → Companion Care Feed. See `PET_FEEDING.md`.

## Code

- Care engine: `src/game/creatures/care.ts`, `care-catalog.ts`, `care-service.ts`
- UI: `companion-care-hub.tsx`, `live-care-panel.tsx`
