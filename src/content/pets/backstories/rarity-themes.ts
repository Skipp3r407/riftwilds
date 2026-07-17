import type { StoryTemplate } from "@/lib/pets/lore-types";

export const RARITY_THEME_TEMPLATES: StoryTemplate[] = [
  {
    id: "common-daily",
    tags: ["COMMON"],
    text: "Its story emphasizes daily courage: friendship, local paths, and talents that shine in ordinary hours.",
  },
  {
    id: "uncommon-twist",
    tags: ["UNCOMMON"],
    minimumRarity: "UNCOMMON",
    text: "An unusual birthplace detail marks its history—not louder, just stranger around the edges.",
  },
  {
    id: "rare-survival",
    tags: ["RARE"],
    minimumRarity: "RARE",
    text: "A difficult survival event sits in its past, remembered as grit rather than glory.",
  },
  {
    id: "epic-relic",
    tags: ["EPIC"],
    minimumRarity: "EPIC",
    text: "A significant relic or regional event brushes its origin, leaving a clue rather than a crown.",
  },
  {
    id: "legendary-lineage",
    tags: ["LEGENDARY"],
    minimumRarity: "LEGENDARY",
    text: "Guardian lineage or a known historical Rift phenomenon shadows its hatch—never as a price tag, only as weight.",
  },
  {
    id: "mythic-pact",
    tags: ["MYTHIC"],
    minimumRarity: "MYTHIC",
    text: "A forgotten pact or dimensional hush colors its earliest memory without promising destiny.",
  },
  {
    id: "celestial-gateway",
    tags: ["CELESTIAL"],
    minimumRarity: "CELESTIAL",
    text: "A cosmic Rift gateway memory threads its birth—time-thin, lonely, and unfinished.",
  },
];

export const RARITY_ORDER = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
  "CELESTIAL",
] as const;
