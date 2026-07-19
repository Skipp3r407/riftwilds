/**
 * Keeper reputation stubs for shops / trades.
 * Not authoritative — local demo score only.
 */

import type { ExchangeReputationStub } from "@/lib/exchange/types";

export function getDemoReputation(seed?: string): ExchangeReputationStub {
  const hash = [...(seed ?? "demo-keeper")].reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = 55 + (hash % 40);
  const tierLabel =
    score >= 90 ? "Trusted stall" : score >= 75 ? "Steady trader" : score >= 60 ? "Keeper" : "New stall";

  return {
    score,
    tierLabel,
    notes: [
      "Demo score from local seed — not ledger-backed.",
      "Successful Credits trades and clean cancellations raise score (when wired).",
      "Wash / dispute flags lower score (scaffold).",
    ],
    authoritative: false,
  };
}
