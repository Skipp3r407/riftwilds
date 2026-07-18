/**
 * Spirit Realm rescue quest stubs — unique kinds, playable via recovery flow.
 */

import type { SpiritQuestDef } from "@/game/spirit/types";

export const SPIRIT_QUEST_CATALOG: SpiritQuestDef[] = [
  {
    id: "sq-restore-memories",
    name: "Restore Scattered Memories",
    blurb: "Gather memory fragments and return them to your Riftling's lantern.",
    kind: "RESTORE_MEMORIES",
    npcId: "npc-memory-weaver",
    creditReward: 90,
    steps: [
      { id: "find-fragment-a", label: "Find the first memory fragment" },
      { id: "find-fragment-b", label: "Find the second memory fragment" },
      { id: "return-lantern", label: "Return fragments to the Memory Weaver" },
    ],
  },
  {
    id: "sq-escort-spirit",
    name: "Escort the Lost Wisp",
    blurb: "Guide a gentle spirit across the light bridge without startling it.",
    kind: "ESCORT_SPIRIT",
    npcId: "npc-dream-walker",
    creditReward: 75,
    steps: [
      { id: "meet-wisp", label: "Meet the lost wisp" },
      { id: "cross-bridge", label: "Cross the light bridge" },
      { id: "home-shrine", label: "Arrive at the home shrine" },
    ],
  },
  {
    id: "sq-cleanse-corruption",
    name: "Cleanse the Corrupted Grove",
    blurb: "Purge nightmare residue from three shrines.",
    kind: "CLEANSE_CORRUPTION",
    npcId: "npc-spirit-keeper",
    creditReward: 110,
    steps: [
      { id: "shrine-1", label: "Cleanse the east shrine" },
      { id: "shrine-2", label: "Cleanse the west shrine" },
      { id: "shrine-3", label: "Cleanse the heart shrine" },
    ],
  },
  {
    id: "sq-defeat-nightmare",
    name: "Defeat the Nightmare Echo",
    blurb: "Face the corruption that stole your companion's voice.",
    kind: "DEFEAT_NIGHTMARE",
    npcId: "npc-ancient-guardian",
    creditReward: 140,
    steps: [
      { id: "find-echo", label: "Locate the Nightmare Echo" },
      { id: "battle", label: "Defeat the Nightmare Echo (stub)" },
      { id: "claim-soul", label: "Claim the restored soul spark" },
    ],
  },
  {
    id: "sq-puzzle-shrine",
    name: "Solve the Ancient Puzzle Shrine",
    blurb: "Align aurora glyphs to reopen a soul gate.",
    kind: "PUZZLE_SHRINE",
    npcId: "npc-lost-child",
    creditReward: 85,
    steps: [
      { id: "read-glyphs", label: "Read the aurora glyphs" },
      { id: "align", label: "Align the shrine rings" },
      { id: "open-gate", label: "Open the soul gate" },
    ],
  },
  {
    id: "sq-soul-bridge",
    name: "Rebuild the Broken Soul Bridge",
    blurb: "Collect bridge stones and restore the path home.",
    kind: "SOUL_BRIDGE",
    npcId: "npc-soul-blacksmith",
    creditReward: 100,
    steps: [
      { id: "gather-stones", label: "Gather bridge stones" },
      { id: "forge", label: "Forge the span with the Soul Blacksmith" },
      { id: "cross", label: "Cross with your Riftling" },
    ],
  },
  {
    id: "sq-speak-ancestors",
    name: "Speak with the Ancestor Council",
    blurb: "Earn a blessing that guides your companion home.",
    kind: "SPEAK_ANCESTORS",
    npcId: "npc-ancestor-council",
    creditReward: 95,
    steps: [
      { id: "audience", label: "Request an audience" },
      { id: "listen", label: "Listen to three ancestor memories" },
      { id: "blessing", label: "Receive the return blessing" },
    ],
  },
  {
    id: "sq-find-fragments",
    name: "Find the Lost Soul Fragments",
    blurb: "Trade with the Ghost Merchant for the final fragment map.",
    kind: "FIND_FRAGMENTS",
    npcId: "npc-ghost-merchant",
    creditReward: 80,
    steps: [
      { id: "map", label: "Buy the fragment map (Credits stub)" },
      { id: "collect", label: "Collect three soul fragments" },
      { id: "reweave", label: "Reweave the spirit thread" },
    ],
  },
];

export function getSpiritQuest(id: string): SpiritQuestDef | undefined {
  return SPIRIT_QUEST_CATALOG.find((q) => q.id === id);
}

/** Pick a rescue quest — bond-unique path when eligible. */
export function pickRescueQuest(params: { bond: number; petPublicId: string }): SpiritQuestDef {
  const unique = params.bond >= 75;
  if (unique) {
    return SPIRIT_QUEST_CATALOG.find((q) => q.id === "sq-speak-ancestors") ?? SPIRIT_QUEST_CATALOG[0];
  }
  const idx =
    Math.abs(
      [...params.petPublicId].reduce((a, c) => a + c.charCodeAt(0), 0),
    ) % SPIRIT_QUEST_CATALOG.length;
  return SPIRIT_QUEST_CATALOG[idx];
}

export type SpiritQuestProgress = {
  questId: string;
  petPublicId: string;
  completedStepIds: string[];
  completed: boolean;
};

export function advanceQuestStep(
  progress: SpiritQuestProgress,
  stepId: string,
): SpiritQuestProgress {
  const quest = getSpiritQuest(progress.questId);
  if (!quest || progress.completed) return progress;
  if (!quest.steps.some((s) => s.id === stepId)) return progress;
  if (progress.completedStepIds.includes(stepId)) return progress;
  const completedStepIds = [...progress.completedStepIds, stepId];
  const completed = quest.steps.every((s) => completedStepIds.includes(s.id));
  return { ...progress, completedStepIds, completed };
}
