/**
 * NPC rumors → exploration hints (no spoilers / no secret coords).
 * Callers may surface these in map UI as vague clues only.
 */

import { rumorForNpc, formatRumorLine, type RumorHint } from "@/game/npc-ai/rumors";

export type ExplorationRumorClue = {
  id: string;
  text: string;
  regionHint?: string;
  sourceNpcSlug: string;
};

/** Soft clue for exploration HUD — never includes coordinates. */
export function explorationClueFromNpc(
  npcSlug: string,
  seed = 0,
): ExplorationRumorClue {
  const rumor: RumorHint = rumorForNpc(npcSlug, seed);
  return {
    id: rumor.id,
    text: formatRumorLine(rumor),
    regionHint: rumor.regionHint,
    sourceNpcSlug: npcSlug,
  };
}
