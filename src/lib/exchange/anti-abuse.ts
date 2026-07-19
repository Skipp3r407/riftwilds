/**
 * Anti-abuse stubs for Rift Exchange / Marketplace.
 * Be honest: heuristics are local/demo; production graph analysis is TODO.
 */

import { detectWashTradingRisk } from "@/lib/marketplace/integrity";

export type AbuseSignal = {
  code: string;
  severity: "info" | "warn" | "block";
  message: string;
  /** true = enforced in this codebase path; false = scaffold only */
  enforced: boolean;
};

export function evaluateMarketplaceAbuseStubs(input: {
  buyerId?: string | null;
  sellerId?: string | null;
  priceLamports?: bigint;
  requestRatePerMinute?: number;
}): AbuseSignal[] {
  const signals: AbuseSignal[] = [];

  if (input.buyerId && input.sellerId && input.buyerId === input.sellerId) {
    signals.push({
      code: "self_trade",
      severity: "block",
      message: "Buyer and seller resolve to the same account.",
      enforced: true,
    });
  }

  if (input.priceLamports != null) {
    const wash = detectWashTradingRisk({
      buyerWallet: input.buyerId,
      sellerWallet: input.sellerId,
      priceLamports: input.priceLamports,
    });
    if (wash.flagged) {
      signals.push({
        code: "wash_heuristic",
        severity: "warn",
        message: `Wash-risk heuristic score ${wash.score}: ${wash.reasons.join(", ")}`,
        enforced: false,
      });
    }
  }

  if ((input.requestRatePerMinute ?? 0) > 30) {
    signals.push({
      code: "rate_limit",
      severity: "warn",
      message: "Listing/purchase rate exceeds demo soft cap (30/min).",
      enforced: true,
    });
  }

  signals.push({
    code: "multi_account",
    severity: "info",
    message: "Multi-account / device graph detection is scaffolded — not production-ready.",
    enforced: false,
  });

  signals.push({
    code: "collusion",
    severity: "info",
    message: "Tournament collusion detection is scaffolded — brackets stay Credits/demo.",
    enforced: false,
  });

  return signals;
}

export function exchangeAntiAbuseSummary() {
  return {
    real: [
      "Ownership mismatch blocks listing create when seller ≠ asset owner (integrity hook).",
      "Duplicate purchase requestId rejected in-memory for demo settlement.",
      "Self-trade buyer===seller blocked in abuse evaluator.",
      "Soft rate-limit stub flags >30 listing/purchase attempts per minute.",
      "Listing eligibility blocks base competitive power / property-not-enabled paths.",
    ],
    scaffold: [
      "Full wash-trading wallet-graph analysis (TODO when SOL marketplace live).",
      "Multi-account / device fingerprint clustering.",
      "Tournament collusion & ring detection.",
      "Production escrow holds and dispute SLA.",
      "Referral fraud scoring before any SOL referral rewards.",
    ],
  };
}
