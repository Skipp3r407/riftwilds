# Live Events — Reborn Overview

**Status:** Extend world-events + festivals; attach TCG skirmishes later  
**Related:** [DYNAMIC_WORLD_EVENTS.md](../world/DYNAMIC_WORLD_EVENTS.md) · social community events docs

## Role

Live events keep the hub feeling alive: merchant visits, Rift Storm airdrops, town spectacles, boss HP races. Reborn adds optional **event TCG boards** (shared modifiers, limited rewards) without replacing event engines.

## Reuse

- `src/lib/world-events/` + HUD banners  
- Festivals participation  
- Loyalty / Rift Storm (SOL path stays off)  
- World bosses (shared HP — separate from TCG; may later open a raid-style board)

## Soft-deprecate

Treating AABB enemy zones as “resolved combat” without a board — replaced by encounter → TCG when flags enable it.
