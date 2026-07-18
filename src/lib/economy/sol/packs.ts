/**
 * Standard gameplay packs (Gold / Rift Shards) vs Premium collector packs (SOL optional).
 * Odds are server-side; historical oddsVersionId is immutable per open.
 */

import { appendEconomyLedgerEvent } from "@/lib/economy/sol/ledger";
import { grantEntitlement } from "@/lib/economy/sol/entitlements";
import { isSolPurchaseLive } from "@/lib/economy/sol/flags";
import { debitRiftShards } from "@/lib/economy/sol/rift-shards";
import { settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";

export type PackOddsEntry = {
  rewardKey: string;
  kind: "GAMEPLAY_CARD" | "COSMETIC" | "COLLECTIBLE_EDITION" | "MATERIAL";
  weight: number;
  gameplayCardId?: string;
};

export type PackOddsVersion = {
  oddsVersionId: string;
  packSku: string;
  pool: PackOddsEntry[];
  pityThreshold: number | null;
  duplicatePolicy: "MATERIAL" | "COSMETIC_PROGRESS" | "KEEP";
  disclosures: {
    rewardPool: string;
    dropRatesNote: string;
    refundPolicy: string;
    tradeability: string;
    mintability: string;
  };
};

export const STANDARD_PACK_ODDS_V1: PackOddsVersion = {
  oddsVersionId: "odds-standard-v1",
  packSku: "gameplay-pack-standard-v1",
  pool: [
    { rewardKey: "card-common", kind: "GAMEPLAY_CARD", weight: 70 },
    { rewardKey: "card-uncommon", kind: "GAMEPLAY_CARD", weight: 25 },
    { rewardKey: "card-rare", kind: "GAMEPLAY_CARD", weight: 5 },
  ],
  pityThreshold: 40,
  duplicatePolicy: "MATERIAL",
  disclosures: {
    rewardPool: "Standard gameplay cards from the active set.",
    dropRatesNote: "Weights 70/25/5 common/uncommon/rare.",
    refundPolicy: "Soft-currency packs are non-refundable after open.",
    tradeability: "Gameplay copies follow binder trade rules (Credits market).",
    mintability: "Not mintable.",
  },
};

export const PREMIUM_PACK_ODDS_V1: PackOddsVersion = {
  oddsVersionId: "odds-premium-v1",
  packSku: "premium-collector-pack-v1",
  pool: [
    { rewardKey: "alt-art", kind: "COLLECTIBLE_EDITION", weight: 50 },
    { rewardKey: "foil", kind: "COLLECTIBLE_EDITION", weight: 30 },
    { rewardKey: "card-back", kind: "COSMETIC", weight: 15 },
    { rewardKey: "animated", kind: "COLLECTIBLE_EDITION", weight: 5 },
  ],
  pityThreshold: 20,
  duplicatePolicy: "KEEP",
  disclosures: {
    rewardPool: "Cosmetic collectible editions, foils, card backs — no exclusive gameplay power.",
    dropRatesNote: "Weights 50/30/15/5 alt/foil/back/animated.",
    refundPolicy: "SOL packs subject to regional refund policy when live (currently disabled).",
    tradeability: "Collectible editions may be tradeable when marketplace flags allow.",
    mintability: "Minting opt-in pipeline; SOL_MINTING_ENABLED=false.",
  },
};

export const PACK_ODDS_REGISTRY: Record<string, PackOddsVersion> = {
  [STANDARD_PACK_ODDS_V1.oddsVersionId]: STANDARD_PACK_ODDS_V1,
  [PREMIUM_PACK_ODDS_V1.oddsVersionId]: PREMIUM_PACK_ODDS_V1,
};

export function getPackDisclosures(oddsVersionId: string): PackOddsVersion["disclosures"] | null {
  return PACK_ODDS_REGISTRY[oddsVersionId]?.disclosures ?? null;
}

function pickWeighted(pool: PackOddsEntry[], rng: () => number): PackOddsEntry {
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let roll = rng() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return pool[pool.length - 1]!;
}

export type PackOpenResult = {
  openId: string;
  packSku: string;
  oddsVersionId: string;
  rewardKey: string;
  kind: PackOddsEntry["kind"];
};

/**
 * Open a standard pack with Gold (Credits) or Rift Shards.
 * Server-authoritative RNG — never trust client reward picks.
 */
export function openStandardPack(params: {
  userId: string;
  requestId: string;
  payWith: "GOLD" | "RIFT_SHARDS";
  rng?: () => number;
}): { ok: true; result: PackOpenResult } | { ok: false; error: string; message: string } {
  const odds = STANDARD_PACK_ODDS_V1;
  if (params.payWith === "GOLD") {
    settleEnsureStarter(params.userId);
    const debit = settleDebit({
      userId: params.userId,
      amount: 100,
      reason: "SHOP_BUY",
      requestId: `${params.requestId}:gold`,
      metadata: { packSku: odds.packSku },
    });
    if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  } else {
    const debit = debitRiftShards({
      userId: params.userId,
      amount: 10,
      requestId: `${params.requestId}:shards`,
      reason: "STANDARD_PACK",
    });
    if (!debit.ok) {
      return { ok: false, error: debit.error, message: "Insufficient Rift Shards" };
    }
  }

  const picked = pickWeighted(odds.pool, params.rng ?? Math.random);
  const result: PackOpenResult = {
    openId: `open_${params.requestId}`,
    packSku: odds.packSku,
    oddsVersionId: odds.oddsVersionId,
    rewardKey: picked.rewardKey,
    kind: picked.kind,
  };

  grantEntitlement({
    userId: params.userId,
    kind: "PACK_OPEN_RESULT",
    assetKey: picked.rewardKey,
    requestId: params.requestId,
    source: "standard_pack",
    gameplayCardId: picked.gameplayCardId ?? null,
    metadata: { oddsVersionId: odds.oddsVersionId },
  });

  appendEconomyLedgerEvent({
    userId: params.userId,
    eventType: "PACK_OPEN",
    requestId: `pack:${params.requestId}`,
    metadata: { ...result, payWith: params.payWith },
  });

  return { ok: true, result };
}

/** Premium collector pack — SOL path blocked unless purchase flags live. */
export function openPremiumCollectorPack(params: {
  userId: string;
  requestId: string;
  payWith: "SOL" | "RIFT_SHARDS";
  rng?: () => number;
}): { ok: true; result: PackOpenResult } | { ok: false; error: string; message: string } {
  if (params.payWith === "SOL" && !isSolPurchaseLive()) {
    return {
      ok: false,
      error: "sol_disabled",
      message:
        "Premium SOL packs are disabled (SOL_PURCHASES_ENABLED / SOL_WALLET_ENABLED=false). Use Rift Shards or wait for approved enablement.",
    };
  }
  if (params.payWith === "RIFT_SHARDS") {
    const debit = debitRiftShards({
      userId: params.userId,
      amount: 50,
      requestId: `${params.requestId}:shards`,
      reason: "PREMIUM_PACK",
    });
    if (!debit.ok) {
      return { ok: false, error: debit.error, message: "Insufficient Rift Shards" };
    }
  }

  const odds = PREMIUM_PACK_ODDS_V1;
  const picked = pickWeighted(odds.pool, params.rng ?? Math.random);
  const result: PackOpenResult = {
    openId: `open_${params.requestId}`,
    packSku: odds.packSku,
    oddsVersionId: odds.oddsVersionId,
    rewardKey: picked.rewardKey,
    kind: picked.kind,
  };

  grantEntitlement({
    userId: params.userId,
    kind: "PACK_OPEN_RESULT",
    assetKey: picked.rewardKey,
    requestId: params.requestId,
    source: "premium_collector_pack",
    metadata: {
      oddsVersionId: odds.oddsVersionId,
      grantsGameplayPower: false,
    },
  });

  appendEconomyLedgerEvent({
    userId: params.userId,
    eventType: "PACK_OPEN",
    requestId: `pack:${params.requestId}`,
    metadata: { ...result, payWith: params.payWith, cosmeticOnly: true },
  });

  return { ok: true, result };
}
