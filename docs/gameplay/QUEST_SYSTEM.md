# Quest System — Reborn Overview

**Status:** Extend existing catalog; do not create a second quest engine  
**Sources:** `src/game/quests/` · [QUEST_MAP_INTEGRATION.md](../world/QUEST_MAP_INTEGRATION.md) · [QUEST_DISCOVERY.md](../npc/QUEST_DISCOVERY.md)

## Reborn direction

Quests onboard players into the **living world + TCG** loop: meet NPCs, learn Rift Energy basics, win first board matches, unlock binder pages, return to towns.

## Reuse

| Piece | Path |
|-------|------|
| Catalog | `quest-catalog.ts` / expansion |
| Demo progress | `quest-demo-store.ts` |
| Map markers | `quest-map-bridge.ts` |
| NPC discovery | `npc-ai/quest-discovery.ts` |
| Credits faucet | `grantQuestCredits` |

## Soft updates (upcoming phases)

- Retarget `spar_win` / battle-training objectives toward **TCG match wins**.  
- Add reward kinds: `CARD_UNLOCK`, `STARTER_DECK_PACK` (Credits-funded, no SOL).  
- Keep single source of truth — map JSON must not duplicate quest defs.

## Flag

`QUESTS_ENABLED` remains the product gate; Live World starter quests already run via local play-state for onboarding demos.
