/**
 * Riftwilds currency model (SOL economy foundation).
 *
 * GOLD  — primary soft play currency (player-facing name for Credits ledger)
 * RIFT_SHARDS — secondary soft currency (cosmetics / mid-tier sinks)
 * SOL — optional real-money path; never required for core play
 *
 * Does not replace `src/lib/credits` — Gold settles through Credits.
 */

import { CREDITS_CURRENCY } from "@/lib/credits/types";

export const CURRENCY = {
  GOLD: "GOLD",
  RIFT_SHARDS: "RIFT_SHARDS",
  SOL: "SOL",
  /** Ledger storage key for Gold (existing Credits system). */
  CREDITS_LEDGER: CREDITS_CURRENCY,
} as const;

export type SoftCurrency = typeof CURRENCY.GOLD | typeof CURRENCY.RIFT_SHARDS;
export type EconomyCurrency = SoftCurrency | typeof CURRENCY.SOL;

export type CurrencyRole =
  | "gameplay_required"
  | "gameplay_optional_soft"
  | "real_money_optional";

export type CurrencyDef = {
  id: EconomyCurrency;
  displayName: string;
  role: CurrencyRole;
  /** Prisma / Credits ledger key when applicable. */
  ledgerKey: string;
  requiredForCorePlay: boolean;
  transferablePlayerToPlayer: boolean;
  notes: string;
};

export const CURRENCY_CATALOG: Record<EconomyCurrency, CurrencyDef> = {
  GOLD: {
    id: "GOLD",
    displayName: "Gold",
    role: "gameplay_required",
    ledgerKey: CREDITS_CURRENCY,
    requiredForCorePlay: true,
    transferablePlayerToPlayer: true,
    notes:
      "Player-facing name for Credits. All Gold earn/spend goes through SettlementService / Credits ledger.",
  },
  RIFT_SHARDS: {
    id: "RIFT_SHARDS",
    displayName: "Rift Shards",
    role: "gameplay_optional_soft",
    ledgerKey: "RIFT_SHARDS",
    requiredForCorePlay: false,
    transferablePlayerToPlayer: false,
    notes:
      "Soft premium currency for cosmetics, pack pity, and convenience. Never SOL. Not required to play TCG or Live World.",
  },
  SOL: {
    id: "SOL",
    displayName: "SOL",
    role: "real_money_optional",
    ledgerKey: "SOL_LAMPORTS",
    requiredForCorePlay: false,
    transferablePlayerToPlayer: false,
    notes:
      "Optional real-money path for cosmetics, collectible editions, marketplace, tournaments, creators, campaigns. All behind SOL_* flags default false.",
  },
};

/** Map UI / API currency labels onto settlement targets. */
export function resolveCurrency(raw: string | null | undefined): EconomyCurrency {
  const u = (raw ?? "GOLD").trim().toUpperCase();
  if (u === "GOLD" || u === "CREDITS" || u === "DEMO_CREDITS" || u === "DEMO") {
    return "GOLD";
  }
  if (u === "RIFT_SHARDS" || u === "SHARDS" || u === "RIFTSHARDS") {
    return "RIFT_SHARDS";
  }
  if (u === "SOL" || u === "SOLANA" || u === "LAMPORTS") {
    return "SOL";
  }
  return "GOLD";
}

export function isSoftCurrency(c: EconomyCurrency): c is SoftCurrency {
  return c === "GOLD" || c === "RIFT_SHARDS";
}

export function isRealMoneyCurrency(c: EconomyCurrency): boolean {
  return c === "SOL";
}

/** Core play may only require soft currencies. */
export function assertNoSolRequiredForCorePlay(): void {
  if (CURRENCY_CATALOG.SOL.requiredForCorePlay) {
    throw new Error("Invariant broken: SOL must never be required for core play");
  }
  if (!CURRENCY_CATALOG.GOLD.requiredForCorePlay) {
    throw new Error("Invariant broken: Gold must remain the required play currency");
  }
}
