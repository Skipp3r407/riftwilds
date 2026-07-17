import { economyConfig } from "@/lib/config/economy";
import { isFeatureEnabled, type FeatureFlagOverrides } from "@/lib/config/feature-flags";

export type PetEpochSnapshot = {
  petId: string;
  ownerId: string;
  lifecycle: string;
  careActionsInEpoch: number;
  isListed: boolean;
};

export type EpochRewardPlan = {
  epochId: string;
  softCurrencyEnabled: boolean;
  realMoneyEnabled: boolean;
  perPetSoft: number;
  maxPetsPerUser: number;
  globalSoftCap: number;
};

export type EpochPayoutLine = {
  petId: string;
  ownerId: string;
  softCurrency: number;
  realMoneyRaw: bigint;
};

export type EpochPayoutResult = {
  epochId: string;
  lines: EpochPayoutLine[];
  totalSoft: number;
  skipped: { petId: string; reason: string }[];
};

const INELIGIBLE_LIFECYCLES = new Set([
  "DORMANT",
  "CRITICAL",
  "MEMORIALIZED",
  "RETIRED",
]);

export function isPetEpochEligible(pet: PetEpochSnapshot): { ok: true } | { ok: false; reason: string } {
  if (economyConfig.EPOCH_REQUIRE_LIVING && INELIGIBLE_LIFECYCLES.has(pet.lifecycle)) {
    return { ok: false, reason: `lifecycle_${pet.lifecycle.toLowerCase()}` };
  }
  if (pet.isListed) {
    return { ok: false, reason: "listed_on_marketplace" };
  }
  if (pet.careActionsInEpoch < economyConfig.EPOCH_MIN_CARE_ACTIONS) {
    return { ok: false, reason: "insufficient_care" };
  }
  return { ok: true };
}

export function getEpochRewardPlan(epochId: string): EpochRewardPlan {
  return {
    epochId,
    softCurrencyEnabled: isFeatureEnabled("EPOCH_REWARDS_ENABLED"),
    realMoneyEnabled: isFeatureEnabled("REAL_MONEY_REWARDS_ENABLED"),
    perPetSoft: economyConfig.EPOCH_REWARD_SOFT_CURRENCY_PER_PET,
    maxPetsPerUser: economyConfig.EPOCH_MAX_PETS_PER_USER,
    globalSoftCap: economyConfig.EPOCH_MAX_GLOBAL_PAYOUT_SOFT,
  };
}

/**
 * Pure planner for epoch payouts. Does not write to DB.
 * Enforces per-user pet caps and global soft-currency caps.
 */
export function planEpochPayouts(
  epochId: string,
  pets: PetEpochSnapshot[],
  flags: FeatureFlagOverrides = {},
): EpochPayoutResult {
  const softOn = isFeatureEnabled("EPOCH_REWARDS_ENABLED", flags);
  const realOn = isFeatureEnabled("REAL_MONEY_REWARDS_ENABLED", flags);

  const skipped: EpochPayoutResult["skipped"] = [];
  if (!softOn && !realOn) {
    return {
      epochId,
      lines: [],
      totalSoft: 0,
      skipped: pets.map((p) => ({ petId: p.petId, reason: "epoch_rewards_disabled" })),
    };
  }

  const perUserCount = new Map<string, number>();
  const lines: EpochPayoutLine[] = [];
  let totalSoft = 0;

  for (const pet of pets) {
    const eligibility = isPetEpochEligible(pet);
    if (!eligibility.ok) {
      skipped.push({ petId: pet.petId, reason: eligibility.reason });
      continue;
    }

    const used = perUserCount.get(pet.ownerId) ?? 0;
    if (used >= economyConfig.EPOCH_MAX_PETS_PER_USER) {
      skipped.push({ petId: pet.petId, reason: "per_user_cap" });
      continue;
    }

    const soft = softOn ? economyConfig.EPOCH_REWARD_SOFT_CURRENCY_PER_PET : 0;
    if (softOn && totalSoft + soft > economyConfig.EPOCH_MAX_GLOBAL_PAYOUT_SOFT) {
      skipped.push({ petId: pet.petId, reason: "global_soft_cap" });
      continue;
    }

    const realMoneyRaw =
      realOn && economyConfig.EPOCH_REAL_MONEY_PER_PET_RAW > 0n
        ? economyConfig.EPOCH_REAL_MONEY_PER_PET_RAW
        : 0n;

    if (soft === 0 && realMoneyRaw === 0n) {
      skipped.push({ petId: pet.petId, reason: "zero_payout_configured" });
      continue;
    }

    lines.push({
      petId: pet.petId,
      ownerId: pet.ownerId,
      softCurrency: soft,
      realMoneyRaw,
    });
    totalSoft += soft;
    perUserCount.set(pet.ownerId, used + 1);
  }

  return { epochId, lines, totalSoft, skipped };
}
