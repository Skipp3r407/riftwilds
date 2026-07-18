/**
 * Spirit Realm NPCs — recovery / lore roles (original Riftwilds IP).
 */

import type { SpiritNpcDef } from "@/game/spirit/types";

export const SPIRIT_REALM_NPCS: SpiritNpcDef[] = [
  {
    id: "npc-spirit-keeper",
    name: "Spirit Keeper",
    role: "Recovery guide",
    dialogueIdle: [
      "Your companion is not gone — only between breaths.",
      "Credits, items, loyalty, friends, guild — many roads home. SOL is never required.",
    ],
    regionId: "spirit-realm",
  },
  {
    id: "npc-ancient-guardian",
    name: "Ancient Guardian",
    role: "Temple warden",
    dialogueIdle: [
      "Corruption fears patient keepers.",
      "I bar the nightmare gates until you are ready.",
    ],
    regionId: "spirit-realm",
  },
  {
    id: "npc-memory-weaver",
    name: "Memory Weaver",
    role: "Memory restoration",
    dialogueIdle: [
      "Bring fragments. I will rethread what love remembers.",
    ],
    regionId: "spirit-realm",
  },
  {
    id: "npc-soul-blacksmith",
    name: "Soul Blacksmith",
    role: "Bridge forge",
    dialogueIdle: [
      "Soul bridges break soft. We rebuild them softer.",
    ],
    regionId: "spirit-realm",
  },
  {
    id: "npc-ancestor-council",
    name: "Ancestor Council",
    role: "Legendary lore",
    dialogueIdle: [
      "Ancestors grant stories and titles — never arena power.",
    ],
    regionId: "spirit-realm",
  },
  {
    id: "npc-dream-walker",
    name: "Dream Walker",
    role: "Escort guide",
    dialogueIdle: [
      "Walk light. Wisps startle at shouting.",
    ],
    regionId: "spirit-realm",
  },
  {
    id: "npc-lost-child",
    name: "Lost Child",
    role: "Puzzle hint",
    dialogueIdle: [
      "The rings want to hear the aurora again.",
    ],
    regionId: "spirit-realm",
  },
  {
    id: "npc-ghost-merchant",
    name: "Ghost Merchant",
    role: "Fragment maps",
    dialogueIdle: [
      "Maps for Credits. Never for guilt. Never for SOL demands.",
    ],
    regionId: "spirit-realm",
  },
];

export function getSpiritNpc(id: string): SpiritNpcDef | undefined {
  return SPIRIT_REALM_NPCS.find((n) => n.id === id);
}
