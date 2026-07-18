/**
 * Optional SOL promotional grants for Rift Storm — treasury/promo pool only.
 * Aligns with existing flagged-off SOL patterns. Never promises financial return.
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { STORM_SOL, STORM_SOL_SUBSTITUTE } from "@/lib/loyalty/rift-storm-config";
import type { AirdropRewardDef } from "@/lib/loyalty/types";
import type { StormSolGrantAttempt } from "@/lib/loyalty/rift-storm-types";

/**
 * Promo SOL is a separate admin arm. Default OFF.
 * Does not enable marketplace or item SOL purchases.
 */
export function canAttemptStormSol(): {
  ok: true;
} | {
  ok: false;
  reason: NonNullable<StormSolGrantAttempt["failReason"]>;
} {
  if (!isFeatureEnabled("RIFT_STORM_SOL_ENABLED")) {
    return { ok: false, reason: "flag_off" };
  }
  return { ok: true };
}

export function attemptStormSolGrant(params: {
  userId: string;
  walletAddress?: string | null;
  poolLamports: number;
  grantedThisStorm: number;
  grantsThisStorm: number;
  userGrantsToday: number;
  fraudRisk: number;
  alreadyGrantedKey: boolean;
  dayKey: string;
}): {
  attempt: StormSolGrantAttempt;
  poolLamports: number;
  grantedThisStorm: number;
  grantsThisStorm: number;
  substitute?: AirdropRewardDef;
} {
  const fail = (
    reason: NonNullable<StormSolGrantAttempt["failReason"]>,
  ): ReturnType<typeof attemptStormSolGrant> => ({
    attempt: {
      attempted: true,
      granted: false,
      substitutedNonSol: true,
      substituteRewardId: STORM_SOL_SUBSTITUTE.id,
      failReason: reason,
    },
    poolLamports: params.poolLamports,
    grantedThisStorm: params.grantedThisStorm,
    grantsThisStorm: params.grantsThisStorm,
    substitute: STORM_SOL_SUBSTITUTE,
  });

  const gate = canAttemptStormSol();
  if (!gate.ok) return fail(gate.reason);
  if (params.alreadyGrantedKey) return fail("duplicate");
  if (params.fraudRisk >= 0.7) return fail("fraud");
  if (!params.walletAddress) return fail("no_wallet");
  if (
    params.grantsThisStorm >= STORM_SOL.maxGrantsPerStorm ||
    params.grantedThisStorm + STORM_SOL.maxLamportsPerGrant > STORM_SOL.maxLamportsPerStorm ||
    params.userGrantsToday >= STORM_SOL.maxGrantsPerUserPerDay
  ) {
    return fail("cap_exceeded");
  }
  if (params.poolLamports < STORM_SOL.maxLamportsPerGrant) return fail("pool_empty");

  // Phase-1 stub signature — real chain send stays off until ops arms treasury tooling.
  const lamports = STORM_SOL.maxLamportsPerGrant;
  const signature = `storm_sol_stub_${params.dayKey}_${params.userId.slice(0, 8)}_${lamports}`;

  return {
    attempt: {
      attempted: true,
      granted: true,
      lamports,
      signature,
      substitutedNonSol: false,
    },
    poolLamports: params.poolLamports - lamports,
    grantedThisStorm: params.grantedThisStorm + lamports,
    grantsThisStorm: params.grantsThisStorm + 1,
  };
}

export { STORM_SOL, STORM_SOL_SUBSTITUTE };
