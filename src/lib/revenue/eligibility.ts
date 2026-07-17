/**
 * Holder reward eligibility rules (Model A launch).
 * Pure helpers — no browser-trusted balances.
 */

export const HOLDER_REWARD_CONFIG = {
  model: "ACTIVE_PET_HOLDERS" as const,
  maxRewardBearingPets: 3,
  maxRewardBearingEggs: 2,
  petWeight: 1.0,
  eggWeight: 0.25,
  minCareScore: 40,
  minPetOwnershipHours: 24,
  minTokenHoldHours: 0,
  epochDurationHours: 24,
  claimAvailabilityDays: 90,
} as const;

export type EligibilityInput = {
  ownsEligibleLivingPet: boolean;
  meetsMinTokenBalance: boolean;
  petSelectedForRewards: boolean;
  careScore: number;
  isSick: boolean;
  isDormant: boolean;
  isDeceased: boolean;
  isListedForSale: boolean;
  ownershipHours: number;
  tokenHoldHours: number;
  walletBlocked: boolean;
  rewardPetSlotsUsed: number;
};

export type EligibilityResult = {
  eligible: boolean;
  weight: number;
  failures: string[];
};

export function evaluatePetRewardEligibility(input: EligibilityInput): EligibilityResult {
  const failures: string[] = [];

  if (input.walletBlocked) failures.push("Wallet under fraud review or blocked");
  if (!input.ownsEligibleLivingPet) failures.push("No eligible living Riftling");
  if (!input.meetsMinTokenBalance) failures.push("Below minimum token balance");
  if (!input.petSelectedForRewards) failures.push("Pet not selected for rewards");
  if (input.careScore < HOLDER_REWARD_CONFIG.minCareScore) {
    failures.push(`Care score below ${HOLDER_REWARD_CONFIG.minCareScore}`);
  }
  if (input.isSick) failures.push("Pet is sick");
  if (input.isDormant) failures.push("Pet is dormant");
  if (input.isDeceased) failures.push("Pet is deceased");
  if (input.isListedForSale) failures.push("Pet is listed for sale");
  if (input.ownershipHours < HOLDER_REWARD_CONFIG.minPetOwnershipHours) {
    failures.push(`Ownership duration below ${HOLDER_REWARD_CONFIG.minPetOwnershipHours}h`);
  }
  if (input.tokenHoldHours < HOLDER_REWARD_CONFIG.minTokenHoldHours) {
    failures.push("Token hold duration not met");
  }
  if (input.rewardPetSlotsUsed > HOLDER_REWARD_CONFIG.maxRewardBearingPets) {
    failures.push(`Exceeds max ${HOLDER_REWARD_CONFIG.maxRewardBearingPets} reward-bearing pets`);
  }

  const eligible = failures.length === 0;
  return {
    eligible,
    weight: eligible ? HOLDER_REWARD_CONFIG.petWeight : 0,
    failures,
  };
}

/** Equal-weight epoch share in lamports (integer division; remainder not assigned here). */
export function computeWalletEpochShare(params: {
  availableEpochRewardLamports: bigint;
  walletEligibleWeight: number;
  totalEligibleWeight: number;
}): bigint {
  if (params.totalEligibleWeight <= 0 || params.walletEligibleWeight <= 0) return 0n;
  // Weight expressed in milliwights (×1000) to stay integer
  const w = BigInt(Math.round(params.walletEligibleWeight * 1000));
  const t = BigInt(Math.round(params.totalEligibleWeight * 1000));
  return (params.availableEpochRewardLamports * w) / t;
}
