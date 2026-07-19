/**
 * Optional $RIFT holder cosmetic perk tiers.
 * COSMETICS / COMMUNITY ONLY — never competitive power, never exclusive core access.
 * All real payout / claim flags stay OFF by default (see feature-flags).
 *
 * Admin-configurable thresholds live here + GameSetting overrides later.
 */

export type KeeperCosmeticTierKey =
  | "EXPLORER"
  | "GUARDIAN"
  | "ANCIENT"
  | "MYTHIC_KEEPER";

export type CosmeticPerkDefinition = {
  key: KeeperCosmeticTierKey;
  label: string;
  /** Illustrative raw token threshold — not enforced on hatchery/TCG. */
  minAmountRaw: bigint;
  perks: {
    id: string;
    label: string;
    kind: "aura" | "title" | "card_back" | "frame" | "emote" | "habitat_decor" | "badge";
    competitivePower: false;
    exclusiveCoreAccess: false;
  }[];
  /** Explicit anti-P2W copy for UI / docs. */
  antiPayToWinNote: string;
};

/**
 * Explorer → Guardian → Ancient → Mythic Keeper.
 * Thresholds are placeholders until mint decimals / supply are final.
 * Holding tokens never unlocks stronger cards, better hatch odds, or exclusive battles.
 */
export const KEEPER_COSMETIC_TIERS: CosmeticPerkDefinition[] = [
  {
    key: "EXPLORER",
    label: "Explorer",
    minAmountRaw: 1_000_000n,
    perks: [
      {
        id: "explorer-title",
        label: "Explorer title flair",
        kind: "title",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
      {
        id: "explorer-card-back",
        label: "Explorer card back",
        kind: "card_back",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
    ],
    antiPayToWinNote: "Cosmetic title + card back only. No hatch odds, stats, or exclusive quests.",
  },
  {
    key: "GUARDIAN",
    label: "Guardian",
    minAmountRaw: 10_000_000n,
    perks: [
      {
        id: "guardian-aura",
        label: "Guardian soft aura",
        kind: "aura",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
      {
        id: "guardian-frame",
        label: "Guardian profile frame",
        kind: "frame",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
      {
        id: "guardian-emote",
        label: "Guardian emote",
        kind: "emote",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
    ],
    antiPayToWinNote: "Visual aura/frame/emote only. Arena & TCG power unchanged.",
  },
  {
    key: "ANCIENT",
    label: "Ancient",
    minAmountRaw: 100_000_000n,
    perks: [
      {
        id: "ancient-badge",
        label: "Ancient Keeper badge",
        kind: "badge",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
      {
        id: "ancient-habitat",
        label: "Ancient habitat decor kit",
        kind: "habitat_decor",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
      {
        id: "ancient-card-back",
        label: "Ancient foil card back",
        kind: "card_back",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
    ],
    antiPayToWinNote: "Decor + badge cosmetics. No exclusive eggs, cards, or ranked advantages.",
  },
  {
    key: "MYTHIC_KEEPER",
    label: "Mythic Keeper",
    minAmountRaw: 1_000_000_000n,
    perks: [
      {
        id: "mythic-title",
        label: "Mythic Keeper title",
        kind: "title",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
      {
        id: "mythic-aura",
        label: "Mythic prismatic aura",
        kind: "aura",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
      {
        id: "mythic-frame",
        label: "Mythic animated frame",
        kind: "frame",
        competitivePower: false,
        exclusiveCoreAccess: false,
      },
    ],
    antiPayToWinNote:
      "Top cosmetic flair only. Core play (hatch, battle, quests, Codex) stays fully free.",
  },
];

export type CosmeticPerkConfig = {
  /** Master switch — when false, tiers never grant anything at runtime. */
  enabled: boolean;
  /** When false, balance reads are scaffolding only (default). */
  enforceOnChainBalance: boolean;
  /** Real payout / claim rails — must stay false unless explicitly enabled. */
  realPayoutsEnabled: boolean;
  tiers: CosmeticPerkDefinition[];
};

/** Defaults: scaffold visible in docs/admin; runtime grants OFF. */
export const DEFAULT_COSMETIC_PERK_CONFIG: CosmeticPerkConfig = {
  enabled: false,
  enforceOnChainBalance: false,
  realPayoutsEnabled: false,
  tiers: KEEPER_COSMETIC_TIERS,
};

export function evaluateCosmeticTier(
  amountRaw: bigint,
  config: CosmeticPerkConfig = DEFAULT_COSMETIC_PERK_CONFIG,
): KeeperCosmeticTierKey[] {
  if (!config.enabled) return [];
  return config.tiers.filter((t) => amountRaw >= t.minAmountRaw).map((t) => t.key);
}

export function listCosmeticPerksForTier(
  tier: KeeperCosmeticTierKey,
  config: CosmeticPerkConfig = DEFAULT_COSMETIC_PERK_CONFIG,
): CosmeticPerkDefinition["perks"] {
  return config.tiers.find((t) => t.key === tier)?.perks ?? [];
}

/** Safety: never treat cosmetic tiers as competitive unlocks. */
export function cosmeticPerksAffectGameplay(): false {
  return false;
}
