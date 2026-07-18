/**
 * Recovery insurance — Credits / guild / season sources.
 * Grants free or reduced recovery + optional extra timer.
 */

import { SPIRIT_RECOVERY_CONFIG } from "@/game/spirit/config";
import type { InsurancePolicy } from "@/game/spirit/types";

export function purchaseCreditsInsurance(params: {
  ownerKey: string;
  petPublicId: string | null;
  nowIso?: string;
}): InsurancePolicy {
  const cfg = SPIRIT_RECOVERY_CONFIG.insurance;
  const purchasedAt = params.nowIso ?? new Date().toISOString();
  return {
    id: `ins_${params.ownerKey}_${Date.now()}`,
    ownerKey: params.ownerKey,
    petPublicId: params.petPublicId,
    source: "CREDITS",
    freeRecoveriesRemaining: cfg.freeRecoveries,
    costReductionBps: cfg.costReductionBps,
    extraTimerMs: cfg.extraTimerMs,
    expiresAt: null,
    purchasedAt,
  };
}

export function grantGuildInsurance(params: {
  ownerKey: string;
  petPublicId: string | null;
}): InsurancePolicy {
  return {
    ...purchaseCreditsInsurance(params),
    id: `ins_guild_${params.ownerKey}_${Date.now()}`,
    source: "GUILD",
    freeRecoveriesRemaining: 1,
    costReductionBps: 5000,
  };
}

export function grantSeasonInsurance(params: {
  ownerKey: string;
  petPublicId: string | null;
  expiresAt: string;
}): InsurancePolicy {
  return {
    ...purchaseCreditsInsurance(params),
    id: `ins_season_${params.ownerKey}_${Date.now()}`,
    source: "SEASON",
    freeRecoveriesRemaining: 2,
    costReductionBps: 3000,
    expiresAt: params.expiresAt,
  };
}

export function consumeInsuranceFreeRecovery(policy: InsurancePolicy): InsurancePolicy {
  return {
    ...policy,
    freeRecoveriesRemaining: Math.max(0, policy.freeRecoveriesRemaining - 1),
  };
}

export function insuranceStillValid(policy: InsurancePolicy, nowMs: number = Date.now()): boolean {
  if (!policy.expiresAt) return true;
  return new Date(policy.expiresAt).getTime() > nowMs;
}
