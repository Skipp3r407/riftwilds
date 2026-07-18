/**
 * Master Economy Core types.
 * Credits are the only required play currency. SOL is optional and flagged.
 */

import type { CreditFaucetReason, CreditMutationResult, CreditSinkReason } from "@/lib/credits/types";
import { CREDITS_CURRENCY } from "@/lib/credits/types";

/** Canonical play currency. DEMO_CREDITS is a legacy alias — never a separate money. */
export const PLAY_CURRENCY = CREDITS_CURRENCY;
export const LEGACY_DEMO_CREDITS_ALIAS = "DEMO_CREDITS" as const;

export type EconomyAssetKind =
  | "CREDITS"
  | "SOL_OPTIONAL"
  | "LOYALTY_TOKEN"
  | "ARENA_POINTS";

export type SettlementKind =
  | "credit"
  | "debit"
  | "transfer"
  | "fee_burn"
  | "sol_intent";

export type SettleCreditsParams = {
  userId: string;
  amount: number;
  reason: CreditFaucetReason | CreditSinkReason;
  requestId: string;
  metadata?: Record<string, unknown>;
  /** When true, reject AI-originated grants (Credits ledger already enforces). */
  fromAi?: boolean;
};

export type TransferCreditsParams = {
  fromUserId: string;
  toUserId: string;
  grossAmount: number;
  /** Fee taken from gross (burn / treasury). */
  feeAmount: number;
  buyerRequestId: string;
  sellerRequestId: string;
  feeRequestId: string;
  buyReason?: CreditSinkReason;
  sellReason?: CreditFaucetReason;
  feeReason?: CreditSinkReason;
  metadata?: Record<string, unknown>;
};

export type SettlementResult =
  | {
      ok: true;
      asset: "CREDITS";
      balance?: number;
      buyerBalance?: number;
      sellerBalance?: number;
      feeBurned?: number;
      idempotentReplay?: boolean;
      entries?: CreditMutationResult[];
    }
  | {
      ok: false;
      error: string;
      message: string;
      balance?: number;
    };

export type SolIntentResult =
  | {
      ok: true;
      mode: "dry_run" | "blocked";
      paymentIntentId?: string;
      note: string;
    }
  | { ok: false; error: string; message: string };

/** Normalize listing / UI currency labels to canonical Credits. */
export function normalizePlayCurrency(raw: string | null | undefined): typeof PLAY_CURRENCY {
  const u = (raw ?? PLAY_CURRENCY).toUpperCase();
  if (u === PLAY_CURRENCY || u === LEGACY_DEMO_CREDITS_ALIAS || u === "DEMO") {
    return PLAY_CURRENCY;
  }
  return PLAY_CURRENCY;
}

export function isPlayCurrency(raw: string | null | undefined): boolean {
  const u = (raw ?? "").toUpperCase();
  return u === PLAY_CURRENCY || u === LEGACY_DEMO_CREDITS_ALIAS || u === "DEMO";
}
