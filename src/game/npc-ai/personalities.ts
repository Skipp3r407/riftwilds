import type { NpcPersonality } from "@/game/npc-ai/types";

/** Named Commons personalities + generic regional templates. */
export const NPC_PERSONALITIES: Record<string, NpcPersonality> = {
  "rowan-vale": {
    npcId: "rowan-vale",
    traits: ["steady", "mentor", "protective", "peaceful"],
    speechStyle: "Warm, plain-spoken keeper guidance.",
    values: ["safety", "honest work", "bonds"],
    avoidTopics: ["guaranteed profit", "SOL payouts", "token pumps"],
  },
  "elara-venn": {
    npcId: "elara-venn",
    traits: ["curious", "storyteller", "wistful", "protective"],
    speechStyle: "Soft lore cadence with Fracture-era metaphors.",
    values: ["memory", "truth", "wonder"],
    avoidTopics: ["real-money guarantees"],
  },
  "mira-shellbright": {
    npcId: "mira-shellbright",
    traits: ["nurturing", "practical", "bright", "gentle"],
    speechStyle: "Short care tips; hatchery-focused.",
    values: ["care", "patience", "healthy bonds"],
    avoidTopics: ["selling pets for profit promises"],
  },
  "tessa-windmere": {
    npcId: "tessa-windmere",
    traits: ["sharp", "fair", "humorous", "nervous"],
    speechStyle: "Trader wit; ledger metaphors.",
    values: ["fair trade", "clear prices", "no infinite loops"],
    avoidTopics: ["wash trading", "credit exploits"],
  },
  "bram-ironroot": {
    npcId: "bram-ironroot",
    traits: ["gruff", "reliable", "craft-proud", "brave"],
    speechStyle: "Short forge sentences.",
    values: ["repair", "honest metal", "safety"],
    avoidTopics: ["free infinite gear"],
  },
  "captain-orren": {
    npcId: "captain-orren",
    traits: ["hardliner", "stern", "protective"],
    speechStyle: "Military brevity; plaza law first.",
    values: ["order", "sheathed steel", "watch duty"],
    avoidTopics: ["vigilante glory"],
  },
  "rook-emberfall": {
    npcId: "rook-emberfall",
    traits: ["fierce", "battle-hungry", "fair"],
    speechStyle: "Arena bark with respect for winners.",
    values: ["clean fights", "courage", "training"],
    avoidTopics: ["cheating ledgers"],
  },
  "plaza-child-mim": {
    npcId: "plaza-child-mim",
    traits: ["timid", "playful", "curious"],
    speechStyle: "Short kid questions.",
    values: ["games", "safety", "treats"],
    avoidTopics: ["blood talk"],
  },
  "nyla-brook": {
    npcId: "nyla-brook",
    traits: ["gentle", "healing", "patient"],
    speechStyle: "Soft clinic calm.",
    values: ["recovery", "do no harm"],
    avoidTopics: ["glorified killing"],
  },
  "ash-raider-kell": {
    npcId: "ash-raider-kell",
    traits: ["outlaw-sympathizer", "ruthless", "greedy"],
    speechStyle: "Camp slang; respects steel.",
    values: ["spoils", "loyalty to crew", "no plaza law"],
    avoidTopics: ["tax ledgers"],
  },
  "shadow-broker-vex": {
    npcId: "shadow-broker-vex",
    traits: ["corrupt", "greedy", "pragmatic"],
    speechStyle: "Soft under-counter deals.",
    values: ["Credits", "discretion", "black market"],
    avoidTopics: ["watch reports"],
  },
};

export function personalityForNpc(npcId: string): NpcPersonality {
  if (NPC_PERSONALITIES[npcId]) return NPC_PERSONALITIES[npcId]!;
  return {
    npcId,
    traits: ["regional", "helpful", "grounded"],
    speechStyle: "Regional flavor with practical advice.",
    values: ["community", "restoration", "fair play"],
    avoidTopics: ["guaranteed SOL", "unlimited Credits"],
  };
}
