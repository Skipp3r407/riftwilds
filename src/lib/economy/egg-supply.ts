/**
 * Authoritative egg supply / release caps.
 * Starter eggs are account-bound and never sellable.
 * Exact hatch outcomes stay unknown until hatch — only disclosed ranges.
 */

import { solToLamports } from "@/lib/items/lamports";

export type EggSourceKind =
  | "STARTER"
  | "OFFICIAL_SEASONAL"
  | "STORY_ACHIEVEMENT"
  | "BREEDING"
  | "COMMUNITY_EVENT"
  | "LIMITED_COLLECTOR";

export type EggSupplyDefinition = {
  kind: EggSourceKind;
  key: string;
  displayName: string;
  description: string;
  /** Account-bound starter eggs cannot be listed or transferred. */
  accountBound: boolean;
  sellable: boolean;
  /** Absolute max that may ever exist for this source key (null = uncapped by design). */
  maxTotalSupply: number | null;
  maxReleasedPerDay: number | null;
  maxReleasedPerWeek: number | null;
  maxPerWallet: number | null;
  hatchTimerHours: { min: number; max: number };
  /** Hours before a newly acquired egg may be traded (0 if not sellable). */
  tradeCooldownHours: number;
  possibleSpecies: string[];
  possibleAffinities: string[];
  /** Disclosed rarity range only — never a guaranteed outcome. */
  disclosedRarityRange: string[];
  /** Disclosed cosmetic trait family names (ranges, not exact rolls). */
  disclosedCosmeticTraitFamilies: string[];
  breedableAfterHatch: boolean;
  holderRewardEligibleDefault: boolean;
  slowRelease: boolean;
};

/** Global supply envelope (configurable). */
export const EGG_SUPPLY_GLOBAL = {
  /** Initial starter-generation pool across all players. */
  starterGenerationCap: { min: 500, max: 1000, active: 750 },
  /** Weekly official release after starter wave. */
  weeklyOfficialRelease: { min: 25, max: 100, active: 50 },
  /** One reward-generating egg or pet per player at launch. */
  initialRewardGeneratingAssetsPerPlayer: 1,
  /** Do not dump the full supply on day one. */
  slowReleaseEnabled: true,
  /** Fraction of weekly cap that may release on any single day. */
  maxDailyFractionOfWeekly: 0.35,
  /** Global breeding eggs per ISO week (UTC). */
  maxBreedingEggsPerWeekGlobal: 120,
} as const;

const COMMON_SPECIES = [
  "cindercub",
  "bubbloon",
  "mossprig",
  "voltkit",
  "pebblit",
  "frostnip",
] as const;

const WIDE_AFFINITIES = [
  "EMBER",
  "TIDE",
  "GROVE",
  "STORM",
  "STONE",
  "FROST",
  "RADIANT",
  "VOID",
  "ALLOY",
  "SPIRIT",
] as const;

const STANDARD_RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC"] as const;
const COLLECTOR_RARITIES = ["RARE", "EPIC", "LEGENDARY", "MYTHIC"] as const;

export const EGG_SUPPLY_CATALOG: Record<EggSourceKind, EggSupplyDefinition> = {
  STARTER: {
    kind: "STARTER",
    key: "starter-gen-1",
    displayName: "Starter Egg",
    description:
      "Account-bound first egg. Cannot be sold, transferred, or listed on the marketplace.",
    accountBound: true,
    sellable: false,
    maxTotalSupply: EGG_SUPPLY_GLOBAL.starterGenerationCap.active,
    maxReleasedPerDay: 80,
    maxReleasedPerWeek: EGG_SUPPLY_GLOBAL.starterGenerationCap.active,
    maxPerWallet: 1,
    hatchTimerHours: { min: 0.05, max: 6 },
    tradeCooldownHours: 0,
    possibleSpecies: [...COMMON_SPECIES],
    possibleAffinities: [...WIDE_AFFINITIES],
    disclosedRarityRange: [...STANDARD_RARITIES],
    disclosedCosmeticTraitFamilies: ["shell-pattern", "glow-intensity"],
    breedableAfterHatch: true,
    holderRewardEligibleDefault: true,
    slowRelease: true,
  },
  OFFICIAL_SEASONAL: {
    kind: "OFFICIAL_SEASONAL",
    key: "official-seasonal",
    displayName: "Official Seasonal Egg",
    description: "Slow-released seasonal drops from the project supply schedule.",
    accountBound: false,
    sellable: true,
    maxTotalSupply: 5000,
    maxReleasedPerDay: Math.ceil(EGG_SUPPLY_GLOBAL.weeklyOfficialRelease.active * 0.35),
    maxReleasedPerWeek: EGG_SUPPLY_GLOBAL.weeklyOfficialRelease.active,
    maxPerWallet: 3,
    hatchTimerHours: { min: 12, max: 48 },
    tradeCooldownHours: 24,
    possibleSpecies: [...COMMON_SPECIES, "luminara", "hollowshade", "gearling", "wisplet"],
    possibleAffinities: [...WIDE_AFFINITIES],
    disclosedRarityRange: [...STANDARD_RARITIES, "LEGENDARY"],
    disclosedCosmeticTraitFamilies: ["seasonal-mark", "shell-pattern", "aura-tint"],
    breedableAfterHatch: true,
    holderRewardEligibleDefault: true,
    slowRelease: true,
  },
  STORY_ACHIEVEMENT: {
    kind: "STORY_ACHIEVEMENT",
    key: "story-achievement",
    displayName: "Story / Achievement Egg",
    description: "Earned through story beats or published achievements — not shop gacha.",
    accountBound: false,
    sellable: true,
    maxTotalSupply: 2000,
    maxReleasedPerDay: 40,
    maxReleasedPerWeek: 200,
    maxPerWallet: 5,
    hatchTimerHours: { min: 6, max: 24 },
    tradeCooldownHours: 48,
    possibleSpecies: [...COMMON_SPECIES, "luminara", "wisplet"],
    possibleAffinities: [...WIDE_AFFINITIES],
    disclosedRarityRange: [...STANDARD_RARITIES],
    disclosedCosmeticTraitFamilies: ["story-sigil", "shell-pattern"],
    breedableAfterHatch: true,
    holderRewardEligibleDefault: true,
    slowRelease: true,
  },
  BREEDING: {
    kind: "BREEDING",
    key: "breeding-generated",
    displayName: "Breeding Egg",
    description:
      "Generated by controlled breeding. Parents disclosed; rarity is never guaranteed.",
    accountBound: false,
    sellable: true,
    maxTotalSupply: null,
    maxReleasedPerDay: 30,
    maxReleasedPerWeek: EGG_SUPPLY_GLOBAL.maxBreedingEggsPerWeekGlobal,
    maxPerWallet: null,
    hatchTimerHours: { min: 24, max: 72 },
    tradeCooldownHours: 72,
    possibleSpecies: [...COMMON_SPECIES, "luminara", "hollowshade", "gearling", "wisplet"],
    possibleAffinities: [...WIDE_AFFINITIES],
    disclosedRarityRange: [...STANDARD_RARITIES, "LEGENDARY"],
    disclosedCosmeticTraitFamilies: ["inherited-mark", "shell-pattern", "parent-echo"],
    breedableAfterHatch: true,
    holderRewardEligibleDefault: true,
    slowRelease: true,
  },
  COMMUNITY_EVENT: {
    kind: "COMMUNITY_EVENT",
    key: "community-event",
    displayName: "Community Event Egg",
    description: "Limited eggs from funded community events — schedule published per event.",
    accountBound: false,
    sellable: true,
    maxTotalSupply: 1500,
    maxReleasedPerDay: 25,
    maxReleasedPerWeek: 100,
    maxPerWallet: 2,
    hatchTimerHours: { min: 8, max: 36 },
    tradeCooldownHours: 24,
    possibleSpecies: [...COMMON_SPECIES, "hollowshade", "gearling"],
    possibleAffinities: [...WIDE_AFFINITIES],
    disclosedRarityRange: [...STANDARD_RARITIES, "LEGENDARY"],
    disclosedCosmeticTraitFamilies: ["event-stamp", "shell-pattern"],
    breedableAfterHatch: true,
    holderRewardEligibleDefault: true,
    slowRelease: true,
  },
  LIMITED_COLLECTOR: {
    kind: "LIMITED_COLLECTOR",
    key: "limited-collector",
    displayName: "Limited Collector Egg",
    description: "Hard-capped collector drops. Exact creature remains unknown until hatch.",
    accountBound: false,
    sellable: true,
    maxTotalSupply: 250,
    maxReleasedPerDay: 10,
    maxReleasedPerWeek: 25,
    maxPerWallet: 1,
    hatchTimerHours: { min: 36, max: 96 },
    tradeCooldownHours: 96,
    possibleSpecies: ["luminara", "hollowshade", "gearling", "wisplet"],
    possibleAffinities: ["RADIANT", "VOID", "ALLOY", "SPIRIT", "STORM"],
    disclosedRarityRange: [...COLLECTOR_RARITIES],
    disclosedCosmeticTraitFamilies: ["collector-seal", "aura-tint", "prismatic-chance"],
    breedableAfterHatch: true,
    holderRewardEligibleDefault: true,
    slowRelease: true,
  },
};

export function getEggSupplyDefinition(kind: EggSourceKind): EggSupplyDefinition {
  return EGG_SUPPLY_CATALOG[kind];
}

export function isEggSellable(kind: EggSourceKind): boolean {
  const def = EGG_SUPPLY_CATALOG[kind];
  return def.sellable && !def.accountBound;
}

export type EggReleaseWindowStats = {
  kind: EggSourceKind;
  releasedToday: number;
  releasedThisWeek: number;
  totalReleased: number;
  remainingToday: number | null;
  remainingThisWeek: number | null;
  remainingTotal: number | null;
};

/** Pure helper for remaining supply math (counters supplied by DB / demo store). */
export function computeRemainingSupply(
  def: EggSupplyDefinition,
  counters: { releasedToday: number; releasedThisWeek: number; totalReleased: number },
): Pick<EggReleaseWindowStats, "remainingToday" | "remainingThisWeek" | "remainingTotal"> {
  return {
    remainingToday:
      def.maxReleasedPerDay == null
        ? null
        : Math.max(0, def.maxReleasedPerDay - counters.releasedToday),
    remainingThisWeek:
      def.maxReleasedPerWeek == null
        ? null
        : Math.max(0, def.maxReleasedPerWeek - counters.releasedThisWeek),
    remainingTotal:
      def.maxTotalSupply == null
        ? null
        : Math.max(0, def.maxTotalSupply - counters.totalReleased),
  };
}

/** Listing disclosure payload for unopened eggs (ranges only). */
export function eggListingDisclosure(kind: EggSourceKind) {
  const def = getEggSupplyDefinition(kind);
  return {
    eggType: def.displayName,
    sourceKind: def.kind,
    originalSource: def.key,
    accountBound: def.accountBound,
    sellable: isEggSellable(kind),
    hatchTimeHours: def.hatchTimerHours,
    tradeCooldownHours: def.tradeCooldownHours,
    possibleSpecies: def.possibleSpecies,
    possibleAffinities: def.possibleAffinities,
    possibleRarityRange: def.disclosedRarityRange,
    possibleCosmeticTraits: def.disclosedCosmeticTraitFamilies,
    breedable: def.breedableAfterHatch,
    holderRewardEligible: def.holderRewardEligibleDefault,
    exactCreatureKnown: false as const,
    note: "Exact species, rarity, and traits stay unknown until hatch. Only disclosed ranges are shown.",
  };
}

/** Optional SOL cost metadata for future paid limited drops (settlement still flag-gated). */
export const LIMITED_DROP_REFERENCE_PRICES = {
  communityEventClaimFeeLamports: solToLamports("0"),
  collectorReservePriceLamports: solToLamports("0.15"),
} as const;

/**
 * Premium hatchery egg — Credits sink when the free starter pool is exhausted
 * (or the keeper already claimed their free egg).
 *
 * Price choice: **5_000 Credits** (~25× starter grant of 200, ~25× top care action).
 * Early keepers claim free; late joiners burn a punishing late-game sink. Never SOL.
 */
export const PREMIUM_EGG_CREDITS_PRICE = 5_000;

/** Free starter pool size enforced by the live hatchery claim path. */
export const FREE_STARTER_POOL_CAP = EGG_SUPPLY_GLOBAL.starterGenerationCap.active;
