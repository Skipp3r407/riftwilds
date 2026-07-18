/**
 * AI NPC layer — personality + memory summaries + contextual dialogue.
 * CRITICAL: AI NEVER grants currency, items, or quest completions.
 */

export type NpcPersonality = {
  npcId: string;
  traits: string[];
  speechStyle: string;
  values: string[];
  avoidTopics: string[];
};

export type NpcMemorySummary = {
  npcId: string;
  playerId: string;
  /** Short rolling summary — not a reward channel. */
  summary: string;
  flagsMentioned: string[];
  lastTopics: string[];
  updatedAt: string;
};

export type AiDialogueRequest = {
  npcId: string;
  playerId: string;
  playerMessage?: string;
  regionId?: string;
  knownFlags?: string[];
};

export type AiDialogueResponse = {
  lines: string[];
  source: "ai" | "authored_fallback";
  /** Always false — server must ignore any client claim otherwise. */
  grantsRewards: false;
  personalityTraits: string[];
  memorySummary?: string;
  fallbackReason?: string;
};
