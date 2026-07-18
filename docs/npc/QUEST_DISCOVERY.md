# Quest Discovery from NPCs

## Principle

Discovery **references** existing quest keys from NPC dialogue / quest catalog. It does not duplicate quest definitions.

## Roller

`rollNpcDiscovery` in `src/game/npc-ai/quest-discovery.ts`:

- Sparse `quest_offer` (yellow `!`) when gates pass  
- Otherwise greeting / tip / lore / rumor / shop  

Gates: day phase, weather, min level, min relationship, flags, quest status.

## Map markers

When a quest is accepted through normal dialogue/`accept_quest`, existing `quest-map-bridge` / exploration markers pick it up. Living AI only surfaces attention + optional offer — it does not invent map pins with spoilers.

## Rumors

`src/game/npc-ai/rumors.ts` — soft region hints for exploration, no coords.
