/**
 * SettlementService — single entry for durable Credits money moves.
 * SOL never required. Optional SOL intents stay behind flags (Phase 15).
 */

import {
  creditCredits,
  debitCredits,
  getCreditBalance,
  ensureStarterCredits,
} from "@/lib/credits/ledger";
import type { CreditFaucetReason, CreditSinkReason } from "@/lib/credits/types";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import type {
  SettleCreditsParams,
  SettlementResult,
  SolIntentResult,
  TransferCreditsParams,
} from "@/lib/economy/core/types";

const FAUCET_REASONS = new Set<string>([
  "QUEST_REWARD",
  "DAILY_GOAL",
  "WEEKLY_GOAL",
  "GATHER",
  "CRAFT",
  "EVENT_REWARD",
  "JOB_BOARD",
  "ACHIEVEMENT",
  "RIFTLING_BONUS",
  "RESTORATION_PARTICIPATION",
  "STARTER_GRANT",
  "NPC_SELL_BACK",
  "STREAK_AIRDROP",
  "LOYALTY_MILESTONE",
  "PRESENCE_IDLE",
  "ADMIN_ADJUST",
  "MARKETPLACE_SALE",
  "GUILD_PAYOUT",
  "TOURNAMENT_PRIZE",
  "SEASON_PASS_REFUND",
  "LAND_SALE",
  "PLAYER_SHOP_SALE",
  "CREATOR_ROYALTY",
]);

function isFaucet(reason: string): reason is CreditFaucetReason {
  return FAUCET_REASONS.has(reason);
}

export function economyCoreEnabled(): boolean {
  return isFeatureEnabled("CREDITS_LEDGER_ENABLED");
}

/** Ensure starter Credits exist for a play session. */
export function settleEnsureStarter(userId: string, requestId?: string): SettlementResult {
  if (!economyCoreEnabled()) {
    return { ok: false, error: "feature_disabled", message: "Credits ledger disabled" };
  }
  const r = ensureStarterCredits(userId, requestId);
  if (!r.ok) {
    return { ok: false, error: r.error, message: r.message, balance: r.balance };
  }
  return {
    ok: true,
    asset: "CREDITS",
    balance: r.balance,
    idempotentReplay: r.idempotentReplay,
  };
}

export function settleCredit(params: SettleCreditsParams): SettlementResult {
  if (!economyCoreEnabled()) {
    return { ok: false, error: "feature_disabled", message: "Credits ledger disabled" };
  }
  if (!isFaucet(params.reason)) {
    return {
      ok: false,
      error: "invalid_reason",
      message: `Reason ${params.reason} is not a credit faucet`,
    };
  }
  const r = creditCredits({
    userId: params.userId,
    amount: params.amount,
    reason: params.reason,
    requestId: params.requestId,
    // AI-originated grants are rejected by the ledger via metadata.source.
    metadata: params.fromAi
      ? { ...params.metadata, source: "ai_npc" }
      : params.metadata,
  });
  if (!r.ok) {
    return { ok: false, error: r.error, message: r.message, balance: r.balance };
  }
  return {
    ok: true,
    asset: "CREDITS",
    balance: r.balance,
    idempotentReplay: r.idempotentReplay,
  };
}

export function settleDebit(params: SettleCreditsParams): SettlementResult {
  if (!economyCoreEnabled()) {
    return { ok: false, error: "feature_disabled", message: "Credits ledger disabled" };
  }
  if (isFaucet(params.reason) && params.reason !== "ADMIN_ADJUST") {
    return {
      ok: false,
      error: "invalid_reason",
      message: `Reason ${params.reason} is not a debit sink`,
    };
  }
  const r = debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: params.reason as CreditSinkReason,
    requestId: params.requestId,
    metadata: params.metadata,
  });
  if (!r.ok) {
    return { ok: false, error: r.error, message: r.message, balance: r.balance };
  }
  return {
    ok: true,
    asset: "CREDITS",
    balance: r.balance,
    idempotentReplay: r.idempotentReplay,
  };
}

/**
 * Atomic-ish P2P Credits transfer: debit buyer gross, credit seller net, burn fee.
 * Uses three idempotent requestIds. Caller should verify ownership separately.
 */
export function settleTransfer(params: TransferCreditsParams): SettlementResult {
  if (!economyCoreEnabled()) {
    return { ok: false, error: "feature_disabled", message: "Credits ledger disabled" };
  }
  if (
    !Number.isInteger(params.grossAmount) ||
    !Number.isInteger(params.feeAmount) ||
    params.grossAmount < 1 ||
    params.feeAmount < 0 ||
    params.feeAmount >= params.grossAmount
  ) {
    return { ok: false, error: "invalid_amount", message: "Invalid transfer amounts" };
  }
  if (params.fromUserId === params.toUserId) {
    return { ok: false, error: "same_party", message: "Buyer and seller must differ" };
  }

  const buyReason = params.buyReason ?? ("MARKETPLACE_PURCHASE" as CreditSinkReason);
  const sellReason = params.sellReason ?? ("MARKETPLACE_SALE" as CreditFaucetReason);
  const feeReason = params.feeReason ?? ("MARKETPLACE_FEE" as CreditSinkReason);
  const net = params.grossAmount - params.feeAmount;

  const buyerDebit = debitCredits({
    userId: params.fromUserId,
    amount: params.grossAmount,
    reason: buyReason,
    requestId: params.buyerRequestId,
    metadata: { ...params.metadata, leg: "buyer_gross" },
  });
  if (!buyerDebit.ok) {
    return {
      ok: false,
      error: buyerDebit.error,
      message: buyerDebit.message,
      balance: buyerDebit.balance,
    };
  }

  // Fee is part of buyer gross already removed from circulation via leavesCirculation on fee sink.
  // Record fee burn as separate ledger line on buyer (0 net extra) OR skip if fee=0.
  let feeBurned = 0;
  if (params.feeAmount > 0) {
    // Fee already included in buyer debit; credit a synthetic burn marker via fee sink on system? 
    // Simpler: seller receives net; fee leaves via metadata on buyer debit.
    // Also debit a 0-impact tracking: use fee sink only when we need explicit burn accounting
    // by crediting nothing — buyer already paid gross. Track feeBurned for callers.
    feeBurned = params.feeAmount;
    void feeReason;
  }

  const sellerCredit = creditCredits({
    userId: params.toUserId,
    amount: net,
    reason: sellReason,
    requestId: params.sellerRequestId,
    metadata: { ...params.metadata, leg: "seller_net", feeAmount: params.feeAmount },
  });
  if (!sellerCredit.ok) {
    // Best-effort compensating credit back to buyer (idempotent separate id).
    creditCredits({
      userId: params.fromUserId,
      amount: params.grossAmount,
      reason: "ADMIN_ADJUST",
      requestId: `${params.buyerRequestId}:rollback`,
      metadata: { rollback: true, of: params.buyerRequestId },
    });
    return {
      ok: false,
      error: sellerCredit.error,
      message: `Seller credit failed: ${sellerCredit.message}`,
    };
  }

  return {
    ok: true,
    asset: "CREDITS",
    buyerBalance: buyerDebit.balance,
    sellerBalance: sellerCredit.balance,
    feeBurned,
    idempotentReplay: buyerDebit.idempotentReplay || sellerCredit.idempotentReplay,
    entries: [buyerDebit, sellerCredit],
  };
}

export function getPlayBalance(userId: string): number {
  return getCreditBalance(userId);
}

/**
 * Optional SOL payment intent — always dry-run / blocked unless Phase 15 flags allow.
 * Never required for play.
 */
export function settleSolIntent(params: {
  userId: string;
  lamports: bigint;
  requestId: string;
  purpose: string;
}): SolIntentResult {
  if (!isFeatureEnabled("SOL_PURCHASES_ENABLED")) {
    return {
      ok: true,
      mode: "blocked",
      note: `SOL intent blocked (SOL_PURCHASES_ENABLED=false). Use Credits. purpose=${params.purpose}`,
    };
  }
  return {
    ok: true,
    mode: "dry_run",
    note: `SOL dry-run only — no chain write. purpose=${params.purpose} lamports=${params.lamports.toString()} requestId=${params.requestId}`,
  };
}
