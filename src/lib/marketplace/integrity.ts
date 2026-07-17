/**
 * Ownership verification helpers + wash-trading / suspicious-price hooks.
 * Chain settlement is not enabled by default — stubs return clear TODOs.
 */

import { LISTING_RULES } from "@/lib/marketplace/listing-rules";

export type OwnershipCheckInput = {
  sellerId: string;
  assetOwnerId: string;
  assetLocked?: boolean;
  listedElsewhere?: boolean;
};

export type OwnershipCheckResult =
  | { ok: true }
  | { ok: false; reason: string };

export function verifyListingOwnership(input: OwnershipCheckInput): OwnershipCheckResult {
  if (!LISTING_RULES.ownership.requireVerifiedOwnership) {
    return { ok: true };
  }
  if (input.sellerId !== input.assetOwnerId) {
    return { ok: false, reason: "seller_not_owner" };
  }
  if (input.assetLocked) {
    return { ok: false, reason: "asset_locked" };
  }
  if (input.listedElsewhere) {
    return { ok: false, reason: "already_listed" };
  }
  return { ok: true };
}

const seenRequestIds = new Map<string, number>();

/** In-memory duplicate purchase protection for demo/API shells. */
export function assertUniqueRequestId(requestId: string): { ok: true } | { ok: false; reason: string } {
  if (!LISTING_RULES.ownership.blockDuplicatePurchaseRequestIds) {
    return { ok: true };
  }
  if (!requestId || requestId.length < 8) {
    return { ok: false, reason: "invalid_request_id" };
  }
  if (seenRequestIds.has(requestId)) {
    return { ok: false, reason: "duplicate_request_id" };
  }
  seenRequestIds.set(requestId, Date.now());
  // Bound memory
  if (seenRequestIds.size > 5000) {
    const first = seenRequestIds.keys().next().value;
    if (first) seenRequestIds.delete(first);
  }
  return { ok: true };
}

export type WashTradeSignal = {
  flagged: boolean;
  score: number;
  reasons: string[];
  /** Clear TODO until on-chain graph analysis lands. */
  todo: string;
};

/**
 * Heuristic wash-trading detection stub.
 * TODO(chain): Replace with wallet-graph + escrow settlement analysis when
 * REAL_SOL_MARKETPLACE_ENABLED and on-chain programs are live.
 */
export function detectWashTradingRisk(input: {
  buyerWallet?: string | null;
  sellerWallet?: string | null;
  recentBuyerSellerPairs?: { buyer: string; seller: string; count: number }[];
  priceLamports: bigint;
  avgSimilarLamports?: bigint | null;
}): WashTradeSignal {
  const reasons: string[] = [];
  let score = 0;

  if (input.buyerWallet && input.sellerWallet && input.buyerWallet === input.sellerWallet) {
    reasons.push("buyer_equals_seller");
    score += 100;
  }

  const pair = input.recentBuyerSellerPairs?.find(
    (p) => p.buyer === input.buyerWallet && p.seller === input.sellerWallet,
  );
  if (pair && pair.count >= 3) {
    reasons.push("repeated_buyer_seller_pair");
    score += 40;
  }

  if (
    input.avgSimilarLamports &&
    input.avgSimilarLamports > 0n &&
    input.priceLamports > 0n &&
    input.priceLamports < input.avgSimilarLamports / 10n
  ) {
    reasons.push("far_below_similar_avg");
    score += 25;
  }

  return {
    flagged: score >= 40,
    score,
    reasons,
    todo: "TODO(chain): Persist wash signals to AuditLog + block settlement when REAL_SOL_MARKETPLACE_ENABLED.",
  };
}

export type SettlementGate = {
  allowed: boolean;
  mode: "demo_credits" | "blocked" | "sol_escrow";
  reason: string;
};

export function resolveSettlementGate(flags: {
  marketplaceEnabled: boolean;
  realSolMarketplaceEnabled: boolean;
  solPurchasesEnabled: boolean;
}): SettlementGate {
  if (!flags.marketplaceEnabled) {
    return {
      allowed: false,
      mode: "blocked",
      reason: "MARKETPLACE_ENABLED is false — writes and purchases are disabled.",
    };
  }
  if (!flags.realSolMarketplaceEnabled || !flags.solPurchasesEnabled) {
    return {
      allowed: true,
      mode: "demo_credits",
      reason:
        "SOL settlement is off (REAL_SOL_MARKETPLACE_ENABLED / SOL_PURCHASES_ENABLED). Demo-credit purchase stubs only.",
    };
  }
  return {
    allowed: true,
    mode: "sol_escrow",
    reason: "SOL escrow path selected — requires audited programs before production use.",
  };
}
