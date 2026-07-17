import { describe, expect, it } from "vitest";
import { allocateForTransactionType } from "@/lib/revenue/allocate";
import {
  computeWalletEpochShare,
  evaluatePetRewardEligibility,
  HOLDER_REWARD_CONFIG,
} from "@/lib/revenue/eligibility";
import { solToLamports, lamportsToSolString, mulBps } from "@/lib/items/lamports";
import { splitBreedingFee } from "@/lib/economy/breeding-rules";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

describe("holder reward vault math (integer lamports)", () => {
  it("shop 15% vault is exact for 1 SOL", () => {
    const gross = solToLamports("1");
    const result = allocateForTransactionType(gross, "SHOP_PURCHASE");
    const vault = result.lines.find((l) => l.destination === "PET_HOLDER_REWARD_VAULT")!;
    expect(vault.allocatedAmountLamports).toBe(solToLamports("0.15"));
    expect(mulBps(gross, 1500)).toBe(vault.allocatedAmountLamports);
  });

  it("epoch shares use integer division without inventing lamports", () => {
    const pool = 10007n;
    const a = computeWalletEpochShare({
      availableEpochRewardLamports: pool,
      walletEligibleWeight: 1,
      totalEligibleWeight: 3,
    });
    const b = computeWalletEpochShare({
      availableEpochRewardLamports: pool,
      walletEligibleWeight: 1,
      totalEligibleWeight: 3,
    });
    const c = computeWalletEpochShare({
      availableEpochRewardLamports: pool,
      walletEligibleWeight: 1,
      totalEligibleWeight: 3,
    });
    expect(a + b + c).toBeLessThanOrEqual(pool);
    expect(a).toBe(pool / 3n);
  });

  it("breeding fee split sums to fee", () => {
    const fee = solToLamports("0.20");
    const split = splitBreedingFee(fee);
    expect(
      split.projectReserve + split.holderVault + split.development + split.communityEvents,
    ).toBe(fee);
  });

  it("caps reward-bearing pets and keeps settlement flags OFF", () => {
    expect(HOLDER_REWARD_CONFIG.maxRewardBearingPets).toBe(3);
    const over = evaluatePetRewardEligibility({
      ownsEligibleLivingPet: true,
      meetsMinTokenBalance: true,
      petSelectedForRewards: true,
      careScore: 80,
      isSick: false,
      isDormant: false,
      isDeceased: false,
      isListedForSale: false,
      ownershipHours: 48,
      tokenHoldHours: 0,
      walletBlocked: false,
      rewardPetSlotsUsed: 4,
    });
    expect(over.eligible).toBe(false);
    expect(featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED).toBe(false);
    expect(featureFlagDefaults.REWARD_CLAIMS_ENABLED).toBe(false);
    expect(featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED).toBe(false);
    expect(featureFlagDefaults.SOL_PURCHASES_ENABLED).toBe(false);
  });

  it("formats lamports without float drift", () => {
    expect(lamportsToSolString(solToLamports("0.123456789"))).toBe("0.123456789");
  });
});
