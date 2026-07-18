/**
 * Economy catalog types — separates gameplay power from optional SOL cosmetics.
 */

import type { EconomyCurrency } from "@/lib/economy/sol/currencies";

export type CatalogItemKind =
  | "GAMEPLAY_CARD"
  | "STANDARD_PACK"
  | "PREMIUM_COLLECTOR_PACK"
  | "COLLECTIBLE_EDITION"
  | "COSMETIC"
  | "CARD_BACK"
  | "BOARD_THEME"
  | "PROFILE_FRAME"
  | "TITLE"
  | "EMOTE"
  | "HOUSING_COSMETIC"
  | "FOUNDER_ITEM"
  | "SEASON_PASS_PREMIUM"
  | "TOURNAMENT_ENTRY"
  | "CREATOR_PRODUCT"
  | "COMMUNITY_CAMPAIGN";

export type CatalogItem = {
  sku: string;
  name: string;
  kind: CatalogItemKind;
  /** Soft currencies and/or optional SOL. */
  prices: Partial<Record<EconomyCurrency, number | string>>;
  /** True if purchase grants competitive gameplay power. Must be false for SOL-only SKUs. */
  grantsGameplayPower: boolean;
  /** When true, essential card — must be earnable without SOL. */
  essentialGameplay: boolean;
  earnableWithoutSol: boolean;
  solOptionalOnly: boolean;
  /** Link to TCG gameplay card id when relevant. */
  gameplayCardId?: string;
  oddsVersionId?: string;
  active: boolean;
};

/**
 * Pay-to-win guard: SOL-priced items must not grant exclusive gameplay power.
 * Essential gameplay items must remain earnable without SOL.
 */
export function validateCatalogNoPayToWin(item: CatalogItem): {
  ok: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  const hasSolPrice = item.prices.SOL != null && item.prices.SOL !== "" && item.prices.SOL !== 0;

  if (item.grantsGameplayPower && hasSolPrice && !item.earnableWithoutSol) {
    violations.push("sol_exclusive_gameplay_power");
  }
  if (item.essentialGameplay && !item.earnableWithoutSol) {
    violations.push("essential_not_earnable_without_sol");
  }
  if (item.kind === "COLLECTIBLE_EDITION" && item.grantsGameplayPower) {
    violations.push("collectible_edition_must_not_grant_power");
  }
  if (item.kind === "PREMIUM_COLLECTOR_PACK" && item.grantsGameplayPower) {
    violations.push("premium_pack_must_not_grant_exclusive_power");
  }
  if (item.solOptionalOnly && !item.earnableWithoutSol && item.essentialGameplay) {
    violations.push("sol_optional_flag_conflict");
  }

  return { ok: violations.length === 0, violations };
}

export function validateCatalogList(items: CatalogItem[]): {
  ok: boolean;
  failures: { sku: string; violations: string[] }[];
} {
  const failures: { sku: string; violations: string[] }[] = [];
  for (const item of items) {
    const r = validateCatalogNoPayToWin(item);
    if (!r.ok) failures.push({ sku: item.sku, violations: r.violations });
  }
  return { ok: failures.length === 0, failures };
}

/** Seed catalog for scaffolding / tests — not live checkout. */
export const SOL_ECONOMY_SEED_CATALOG: CatalogItem[] = [
  {
    sku: "gameplay-pack-standard-v1",
    name: "Standard Rift Pack",
    kind: "STANDARD_PACK",
    prices: { GOLD: 100, RIFT_SHARDS: 10 },
    grantsGameplayPower: false,
    essentialGameplay: false,
    earnableWithoutSol: true,
    solOptionalOnly: false,
    oddsVersionId: "odds-standard-v1",
    active: true,
  },
  {
    sku: "premium-collector-pack-v1",
    name: "Premium Collector Pack",
    kind: "PREMIUM_COLLECTOR_PACK",
    prices: { SOL: "0.05", RIFT_SHARDS: 50 },
    grantsGameplayPower: false,
    essentialGameplay: false,
    earnableWithoutSol: true,
    solOptionalOnly: true,
    oddsVersionId: "odds-premium-v1",
    active: true,
  },
  {
    sku: "cosmetic-card-back-aurora",
    name: "Aurora Card Back",
    kind: "CARD_BACK",
    prices: { GOLD: 200, SOL: "0.02" },
    grantsGameplayPower: false,
    essentialGameplay: false,
    earnableWithoutSol: true,
    solOptionalOnly: true,
    active: true,
  },
  {
    sku: "essential-starter-ashwing",
    name: "Ashwing (gameplay copy)",
    kind: "GAMEPLAY_CARD",
    prices: { GOLD: 0 },
    grantsGameplayPower: true,
    essentialGameplay: true,
    earnableWithoutSol: true,
    solOptionalOnly: false,
    gameplayCardId: "rotr-c-ashwing",
    active: true,
  },
];
