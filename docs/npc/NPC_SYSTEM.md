# NPC System — Reborn Overview

**Status:** Dialogue + AI stubs remain; add TCG tutors/duelists  
**Related:** [QUEST_DISCOVERY.md](./QUEST_DISCOVERY.md) · `src/game/npcs/` · `src/game/npc-ai/`

## Role

NPCs populate towns, teach systems, hand quests, and (upcoming) offer **practice TCG duels** and deck advice. They are not a second quest catalog.

## Reuse

- Blueprint NPC defs + overworld sprites  
- Dialogue runtime / menus  
- Starter quests + play-state  
- NPC AI dialogue flag (never grants rewards client-side)

## Upcoming

- “Challenge me” → `/tcg/battle` with fixed trainer decks  
- Deck mentor lines explaining Rift Energy  
- No SOL vendors for required cards
