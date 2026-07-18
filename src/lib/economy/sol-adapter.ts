/**
 * Phase 15 — SOL Blockchain adapter (scaffolding).
 * All live writes stay behind flags. Credits remain the play path.
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { settleSolIntent } from "@/lib/economy/core/settlement";

export type SolPaymentIntentDraft = {
  intentId: string;
  userId: string;
  lamports: string;
  purpose: string;
  destinationLabel: string;
  status: "BLOCKED" | "DRY_RUN" | "PENDING_VERIFY";
  createdAt: string;
  note: string;
};

type Store = { intents: Map<string, SolPaymentIntentDraft> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsSolAdapter?: Store };
  if (!g.__riftwildsSolAdapter) g.__riftwildsSolAdapter = { intents: new Map() };
  return g.__riftwildsSolAdapter;
}

/**
 * Create a PaymentIntent shell. Never broadcasts transactions.
 */
export function createSolPaymentIntent(params: {
  userId: string;
  lamports: bigint;
  purpose: string;
  requestId: string;
}): SolPaymentIntentDraft {
  const settle = settleSolIntent({
    userId: params.userId,
    lamports: params.lamports,
    requestId: params.requestId,
    purpose: params.purpose,
  });

  const status: SolPaymentIntentDraft["status"] =
    !settle.ok || (settle.ok && settle.mode === "blocked")
      ? "BLOCKED"
      : isFeatureEnabled("SOL_PURCHASES_ENABLED")
        ? "DRY_RUN"
        : "BLOCKED";

  const draft: SolPaymentIntentDraft = {
    intentId: `spi_${params.requestId}`,
    userId: params.userId,
    lamports: params.lamports.toString(),
    purpose: params.purpose,
    destinationLabel: "TREASURY_COMING_SOON",
    status,
    createdAt: new Date().toISOString(),
    note:
      settle.ok
        ? settle.note
        : "SOL adapter blocked — use Credits for play. Escrow programs not wired.",
  };
  store().intents.set(draft.intentId, draft);
  return draft;
}

/**
 * Dry-run verify — never marks real chain settlement complete while flags are off.
 */
export function verifySolPaymentIntentDryRun(intentId: string): {
  ok: boolean;
  intent: SolPaymentIntentDraft | null;
  verified: false;
  message: string;
} {
  const intent = store().intents.get(intentId) ?? null;
  if (!intent) {
    return { ok: false, intent: null, verified: false, message: "Intent not found" };
  }
  if (!isFeatureEnabled("SOL_PURCHASES_ENABLED") || !isFeatureEnabled("AUTOMATIC_SETTLEMENT_ENABLED")) {
    return {
      ok: true,
      intent,
      verified: false,
      message:
        "Dry-run only. SOL_PURCHASES_ENABLED / AUTOMATIC_SETTLEMENT_ENABLED must stay false until audited escrow + legal review.",
    };
  }
  return {
    ok: true,
    intent,
    verified: false,
    message: "Flags on but chain verify not implemented — refusing to mark paid.",
  };
}

export function listSolPaymentIntents(userId: string): SolPaymentIntentDraft[] {
  return [...store().intents.values()].filter((i) => i.userId === userId);
}
