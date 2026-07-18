# Housing — Reborn Overview

**Status:** Homes stay a social/expression pillar; TCG trophies later  
**Canonical:** [ARCHITECTURE.md](./ARCHITECTURE.md) · [BUILD_SYSTEM.md](./BUILD_SYSTEM.md) · [FURNITURE_ENGINE.md](./FURNITURE_ENGINE.md)

## Role

Housing and neighborhoods make the world feel lived-in. Reborn does **not** replace the housing runtime — it adds optional display for decks, match trophies, and seasonal décor.

## Reuse

- `src/lib/housing/`, `src/game/housing/`  
- Neighborhood deeds / capacity (`src/lib/neighborhoods/`, world-expansion)  
- Live World door entry stubs (`live-world/housing/entry-stubs.ts`)  
- Housing Credits economy (`HOUSING_ECONOMY_ENABLED`)

## Upcoming (do not block Phase 1)

- Wall frames for favorite cards / binder showcase  
- Visit guestbook notes about recent TCG wins (cosmetics only)  
- No battle advantage from furniture placement
