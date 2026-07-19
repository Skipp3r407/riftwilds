/**
 * Egg type / rarity catalog for Hatchery + earn paths.
 * Live claim/purchase still defaults to COMMON_RIFT; affinity eggs come from gameplay grants.
 * Never gates core play behind wallet / SOL / $RIFT.
 */

export type EggTypeKey =
  | "COMMON_RIFT"
  | "EMBER"
  | "TIDE"
  | "GROVE"
  | "STORM"
  | "STONE"
  | "FROST"
  | "RADIANT"
  | "VOID"
  | "ALLOY"
  | "SPIRIT"
  | "CELESTIAL"
  | "SEASONAL"
  | "EVENT"
  | "FOUNDER";

export type EggRarityBand =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHIC"
  | "CELESTIAL";

export type EggTypeDefinition = {
  key: EggTypeKey;
  label: string;
  /** Affinity bias for species pick (COMMON_RIFT = any). */
  affinityBias: string | null;
  disclosedRarityRange: EggRarityBand[];
  /** How keepers typically earn this shell (cosmetics purchases never required). */
  earnHints: string[];
  accountBoundStarterEligible: boolean;
};

export const EGG_TYPE_CATALOG: Record<EggTypeKey, EggTypeDefinition> = {
  COMMON_RIFT: {
    key: "COMMON_RIFT",
    label: "Common Rift Egg",
    affinityBias: null,
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC", "CELESTIAL"],
    earnHints: ["Guaranteed free starter", "Credits premium sink", "Quest / login rewards"],
    accountBoundStarterEligible: true,
  },
  EMBER: {
    key: "EMBER",
    label: "Ember Egg",
    affinityBias: "EMBER",
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
    earnHints: ["Boss clears", "Battle pass free track", "Seasonal events"],
    accountBoundStarterEligible: false,
  },
  TIDE: {
    key: "TIDE",
    label: "Tide Egg",
    affinityBias: "TIDE",
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
    earnHints: ["Exploration goals", "Weekly quests"],
    accountBoundStarterEligible: false,
  },
  GROVE: {
    key: "GROVE",
    label: "Grove Egg",
    affinityBias: "GROVE",
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
    earnHints: ["Care streaks", "Guild community goals"],
    accountBoundStarterEligible: false,
  },
  STORM: {
    key: "STORM",
    label: "Storm Egg",
    affinityBias: "STORM",
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
    earnHints: ["Rift Battle milestones", "Achievements"],
    accountBoundStarterEligible: false,
  },
  STONE: {
    key: "STONE",
    label: "Stone Egg",
    affinityBias: "STONE",
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC"],
    earnHints: ["Exploration", "Crafting milestones"],
    accountBoundStarterEligible: false,
  },
  FROST: {
    key: "FROST",
    label: "Frost Egg",
    affinityBias: "FROST",
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
    earnHints: ["Seasonal events", "Login calendars"],
    accountBoundStarterEligible: false,
  },
  RADIANT: {
    key: "RADIANT",
    label: "Radiant Egg",
    affinityBias: "RADIANT",
    disclosedRarityRange: ["UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"],
    earnHints: ["Story achievements", "Community events"],
    accountBoundStarterEligible: false,
  },
  VOID: {
    key: "VOID",
    label: "Void Egg",
    affinityBias: "VOID",
    disclosedRarityRange: ["UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"],
    earnHints: ["Endgame quests", "Boss raids (scaffolded)"],
    accountBoundStarterEligible: false,
  },
  ALLOY: {
    key: "ALLOY",
    label: "Alloy Egg",
    affinityBias: "ALLOY",
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
    earnHints: ["Crafting", "Player shop milestones"],
    accountBoundStarterEligible: false,
  },
  SPIRIT: {
    key: "SPIRIT",
    label: "Spirit Egg",
    affinityBias: "SPIRIT",
    disclosedRarityRange: ["UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"],
    earnHints: ["Spirit recovery story", "Memorial events"],
    accountBoundStarterEligible: false,
  },
  CELESTIAL: {
    key: "CELESTIAL",
    label: "Celestial Egg",
    affinityBias: "RADIANT",
    disclosedRarityRange: ["RARE", "EPIC", "LEGENDARY", "MYTHIC", "CELESTIAL"],
    earnHints: ["Major community events", "Hard achievements"],
    accountBoundStarterEligible: false,
  },
  SEASONAL: {
    key: "SEASONAL",
    label: "Seasonal Egg",
    affinityBias: null,
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
    earnHints: ["Official seasonal schedule", "Festival calendar"],
    accountBoundStarterEligible: false,
  },
  EVENT: {
    key: "EVENT",
    label: "Event Egg",
    affinityBias: null,
    disclosedRarityRange: ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"],
    earnHints: ["Timed community events", "Live ops drops"],
    accountBoundStarterEligible: false,
  },
  FOUNDER: {
    key: "FOUNDER",
    label: "Founder Egg",
    affinityBias: null,
    disclosedRarityRange: ["RARE", "EPIC", "LEGENDARY", "MYTHIC"],
    earnHints: ["Legacy founder cosmetic wave (not competitive power)"],
    accountBoundStarterEligible: false,
  },
};

export function getEggTypeDefinition(key: EggTypeKey): EggTypeDefinition {
  return EGG_TYPE_CATALOG[key];
}

export function listEggTypeKeys(): EggTypeKey[] {
  return Object.keys(EGG_TYPE_CATALOG) as EggTypeKey[];
}
