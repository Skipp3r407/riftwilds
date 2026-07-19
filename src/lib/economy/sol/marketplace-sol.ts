/**
 * SOL marketplace listing types + configurable fees.
 * Live settlement requires SOL_MARKETPLACE_ENABLED ∩ REAL_SOL_MARKETPLACE_ENABLED ∩ SOL_PURCHASES_ENABLED.
 * Extends Credits marketplace — does not replace it.
 */

import { isSolMarketplaceLive } from "@/lib/economy/sol/flags";
import {
  createSettlementOrder,
  type SettlementOrder,
} from "@/lib/economy/sol/transaction-states";
import { appendEconomyLedgerEvent } from "@/lib/economy/sol/ledger";

export type SolListingCategory =
  | "COLLECTIBLE_EDITION"
  | "COSMETIC"
  | "CARD_BACK"
  | "BOARD_THEME"
  | "CREATOR_PRODUCT"
  | "FOUNDER_ITEM";

export type SolMarketplaceFeeConfig = {
  /** Basis points of sale price to seller. */
  sellerBps: number;
  platformBps: number;
  creatorRoyaltyBps: number;
  communityFundBps: number;
  listingFeeLamports: bigint;
};

/** Configurable defaults — administrators may override via admin config later. */
export const DEFAULT_SOL_MARKETPLACE_FEES: SolMarketplaceFeeConfig = {
  sellerBps: 9000,
  platformBps: 500,
  creatorRoyaltyBps: 300,
  communityFundBps: 200,
  listingFeeLamports: 2_000_000n, // 0.002 SOL
};

export type SolFeeBreakdown = {
  grossLamports: bigint;
  sellerLamports: bigint;
  platformLamports: bigint;
  creatorRoyaltyLamports: bigint;
  communityFundLamports: bigint;
  feeConfig: SolMarketplaceFeeConfig;
};

export function calculateSolMarketplaceFees(
  grossLamports: bigint,
  config: SolMarketplaceFeeConfig = DEFAULT_SOL_MARKETPLACE_FEES,
): SolFeeBreakdown {
  if (grossLamports < 0n) {
    throw new Error("grossLamports must be non-negative");
  }
  const totalBps =
    config.sellerBps + config.platformBps + config.creatorRoyaltyBps + config.communityFundBps;
  if (totalBps !== 10_000) {
    throw new Error(`fee bps must sum to 10000, got ${totalBps}`);
  }
  const sellerLamports = (grossLamports * BigInt(config.sellerBps)) / 10_000n;
  const platformLamports = (grossLamports * BigInt(config.platformBps)) / 10_000n;
  const creatorRoyaltyLamports = (grossLamports * BigInt(config.creatorRoyaltyBps)) / 10_000n;
  const communityFundLamports =
    grossLamports - sellerLamports - platformLamports - creatorRoyaltyLamports;
  return {
    grossLamports,
    sellerLamports,
    platformLamports,
    creatorRoyaltyLamports,
    communityFundLamports,
    feeConfig: config,
  };
}

/** Visible fee preview before confirmation. */
export function serializeFeePreview(breakdown: SolFeeBreakdown) {
  return {
    grossLamports: breakdown.grossLamports.toString(),
    sellerLamports: breakdown.sellerLamports.toString(),
    platformLamports: breakdown.platformLamports.toString(),
    creatorRoyaltyLamports: breakdown.creatorRoyaltyLamports.toString(),
    communityFundLamports: breakdown.communityFundLamports.toString(),
    sellerPercent: breakdown.feeConfig.sellerBps / 100,
    platformPercent: breakdown.feeConfig.platformBps / 100,
    creatorPercent: breakdown.feeConfig.creatorRoyaltyBps / 100,
    communityPercent: breakdown.feeConfig.communityFundBps / 100,
    listingFeeLamports: breakdown.feeConfig.listingFeeLamports.toString(),
  };
}

/**
 * Player-facing SOL fee stub for marketplace UI.
 * Settlement remains blocked while marketplace SOL flags are off.
 */
export function getSolMarketplaceFeeDisplayStub(grossLamports: bigint = 1_000_000_000n) {
  const breakdown = calculateSolMarketplaceFees(grossLamports);
  const preview = serializeFeePreview(breakdown);
  const live = isSolMarketplaceLive();
  return {
    live,
    blockedReason: live
      ? null
      : "SOL marketplace path blocked (SOL_MARKETPLACE_ENABLED / REAL_SOL_MARKETPLACE_ENABLED / SOL_PURCHASES_ENABLED).",
    disclosures: [
      "Blockchain purchases may be irreversible when live.",
      "Verify item details before confirming.",
      "Prices fluctuate; fiat estimates are informational only.",
      "Network fees may apply on-chain.",
      "Digital collectibles do not guarantee future value.",
      "Credits marketplace remains the soft play path.",
    ],
    preview,
    listingFeeNote: `Listing fee ${preview.listingFeeLamports} lamports (non-refundable when live).`,
  };
}

export type SolListingDraft = {
  listingId: string;
  sellerUserId: string;
  category: SolListingCategory;
  assetKey: string;
  priceLamports: string;
  status: "DRAFT" | "BLOCKED" | "ACTIVE_CREDITS_ONLY";
  note: string;
};

/**
 * Create a SOL listing draft. Live ACTIVE SOL listings stay blocked while flags are off.
 */
export function createSolListingDraft(params: {
  sellerUserId: string;
  category: SolListingCategory;
  assetKey: string;
  priceLamports: bigint;
  requestId: string;
}): SolListingDraft {
  const live = isSolMarketplaceLive();
  const draft: SolListingDraft = {
    listingId: `sol_list_${params.requestId}`,
    sellerUserId: params.sellerUserId,
    category: params.category,
    assetKey: params.assetKey,
    priceLamports: params.priceLamports.toString(),
    status: live ? "DRAFT" : "BLOCKED",
    note: live
      ? "Flags enabled but chain escrow not wired — refusing live settle."
      : "SOL marketplace disabled. Use Credits marketplace for soft trades.",
  };
  appendEconomyLedgerEvent({
    userId: params.sellerUserId,
    eventType: "MARKETPLACE_STATE",
    currency: "SOL",
    amount: params.priceLamports,
    requestId: params.requestId,
    metadata: { listingId: draft.listingId, status: draft.status, category: params.category },
  });
  return draft;
}

export function beginSolMarketplacePurchase(params: {
  buyerUserId: string;
  listingId: string;
  priceLamports: bigint;
  requestId: string;
}): { ok: false; error: string; message: string } | { ok: true; order: SettlementOrder; fees: SolFeeBreakdown } {
  if (!isSolMarketplaceLive()) {
    return {
      ok: false,
      error: "sol_marketplace_disabled",
      message:
        "SOL marketplace is off (SOL_MARKETPLACE_ENABLED / REAL_SOL_MARKETPLACE_ENABLED / SOL_PURCHASES_ENABLED).",
    };
  }
  const fees = calculateSolMarketplaceFees(params.priceLamports);
  const order = createSettlementOrder({
    userId: params.buyerUserId,
    requestId: params.requestId,
    lamports: params.priceLamports.toString(),
    purpose: `marketplace:${params.listingId}`,
  });
  return { ok: true, order, fees };
}
