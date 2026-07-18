/**
 * Optional Instant Spirit Recall — wallet + treasury gated.
 * Never required. Pool-empty → Credits substitute. Audited requestIds.
 */

import { quoteSolInstantRecall } from "@/game/spirit/fees";
import { SPIRIT_RECOVERY_CONFIG } from "@/game/spirit/config";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type SolRecallAttempt = {
  attempted: boolean;
  granted: boolean;
  lamports: number;
  signature: string | null;
  substitutedNonSol: boolean;
  substituteCredits: number;
  failReason:
    | "flag_off"
    | "no_wallet"
    | "treasury_invalid"
    | "pool_empty"
    | "duplicate"
    | "fraud"
    | "cap_exceeded"
    | "not_recoverable"
    | null;
};

export function canAttemptSolSpiritRecall(): { ok: true } | { ok: false; reason: "flag_off" } {
  if (!isFeatureEnabled("SOL_SPIRIT_RECALL_ENABLED")) {
    return { ok: false, reason: "flag_off" };
  }
  return { ok: true };
}

export function attemptSolSpiritRecall(params: {
  userId: string;
  walletAddress?: string | null;
  petPublicId: string;
  level: number;
  poolLamports: number;
  requestId: string;
  alreadyProcessed: boolean;
  fraudRisk: number;
  treasuryValidated: boolean;
}): {
  attempt: SolRecallAttempt;
  poolLamports: number;
  quote: ReturnType<typeof quoteSolInstantRecall>;
} {
  const quote = quoteSolInstantRecall({ level: params.level });
  const substitute = (): ReturnType<typeof attemptSolSpiritRecall> => ({
    attempt: {
      attempted: true,
      granted: false,
      lamports: 0,
      signature: null,
      substitutedNonSol: true,
      substituteCredits: SPIRIT_RECOVERY_CONFIG.solRecall.substituteCredits,
      failReason: null,
    },
    poolLamports: params.poolLamports,
    quote,
  });

  const fail = (
    reason: NonNullable<SolRecallAttempt["failReason"]>,
  ): ReturnType<typeof attemptSolSpiritRecall> => ({
    attempt: {
      attempted: true,
      granted: false,
      lamports: 0,
      signature: null,
      substitutedNonSol: true,
      substituteCredits: SPIRIT_RECOVERY_CONFIG.solRecall.substituteCredits,
      failReason: reason,
    },
    poolLamports: params.poolLamports,
    quote,
  });

  const gate = canAttemptSolSpiritRecall();
  if (!gate.ok) return fail("flag_off");
  if (params.alreadyProcessed) return fail("duplicate");
  if (params.fraudRisk >= 0.7) return fail("fraud");
  if (!params.walletAddress) return fail("no_wallet");
  if (!params.treasuryValidated) return fail("treasury_invalid");
  const feeLamports = Number(quote.lamports);
  if (params.poolLamports < feeLamports) {
    // Pool empty → safe substitute path (caller credits substitute Credits).
    return {
      ...substitute(),
      attempt: {
        ...substitute().attempt,
        failReason: "pool_empty",
      },
    };
  }

  // Phase-1 stub signature — real chain settlement stays off until treasury tooling is armed.
  const signature = `spirit_recall_stub_${params.requestId}_${params.petPublicId.slice(0, 8)}_${feeLamports}`;

  return {
    attempt: {
      attempted: true,
      granted: true,
      lamports: feeLamports,
      signature,
      substitutedNonSol: false,
      substituteCredits: 0,
      failReason: null,
    },
    poolLamports: params.poolLamports - feeLamports,
    quote,
  };
}
