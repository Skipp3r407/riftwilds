import { describe, expect, it } from "vitest";
import {
  allocateForTransactionType,
  allocateRevenue,
  buildLedgerEntries,
} from "@/lib/revenue/allocate";
import { getActivePolicy, BOOTSTRAP_POLICIES } from "@/lib/revenue/policies";
import { solToLamports } from "@/lib/items/lamports";
import {
  evaluatePetRewardEligibility,
  computeWalletEpochShare,
} from "@/lib/revenue/eligibility";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { ACTIVE_TREASURY_POLICY } from "@/lib/config/treasury-policy";

describe("revenue allocation policies", () => {
  it("shop policy sums to 10000 bps (70/15/10/5)", () => {
    const shop = getActivePolicy("SHOP_PURCHASE");
    expect(shop.entries.reduce((s, e) => s + e.basisPoints, 0)).toBe(10_000);
    expect(shop.entries.find((e) => e.destination === "GROWTH_RESERVE")?.basisPoints).toBe(7000);
    expect(
      shop.entries.find((e) => e.destination === "PET_HOLDER_REWARD_VAULT")?.basisPoints,
    ).toBe(1500);
  });

  it("marketplace policy is 90/5/3/1/1", () => {
    const m = getActivePolicy("MARKETPLACE_SALE");
    expect(m.entries.find((e) => e.destination === "SELLER")?.basisPoints).toBe(9000);
    expect(ACTIVE_TREASURY_POLICY.marketplaceFee.sellerPercent).toBe(90);
    expect(ACTIVE_TREASURY_POLICY.marketplaceFee.petRewardPercent).toBe(3);
  });

  it("bootstrap policies all total 10000 bps", () => {
    for (const p of BOOTSTRAP_POLICIES) {
      expect(p.entries.reduce((s, e) => s + e.basisPoints, 0)).toBe(10_000);
    }
  });
});

describe("lamport allocation invariant", () => {
  it("1 SOL shop purchase splits exactly", () => {
    const gross = solToLamports("1");
    const result = allocateForTransactionType(gross, "SHOP_PURCHASE");
    const sum = result.lines.reduce((s, l) => s + l.allocatedAmountLamports, 0n);
    expect(sum).toBe(gross);
    expect(result.lines.find((l) => l.destination === "GROWTH_RESERVE")?.allocatedAmountLamports).toBe(
      solToLamports("0.7"),
    );
    expect(
      result.lines.find((l) => l.destination === "PET_HOLDER_REWARD_VAULT")?.allocatedAmountLamports,
    ).toBe(solToLamports("0.15"));
  });

  it("assigns rounding remainder to growth", () => {
    const gross = 10007n; // not evenly divisible by all buckets
    const policy = getActivePolicy("SHOP_PURCHASE");
    const result = allocateRevenue(gross, policy);
    const sum = result.lines.reduce((s, l) => s + l.allocatedAmountLamports, 0n);
    expect(sum).toBe(gross);
    expect(result.remainderLamports).toBeGreaterThanOrEqual(0n);
    const growth = result.lines.find((l) => l.destination === "GROWTH_RESERVE")!;
    expect(growth.roundingAdjustmentLamports).toBe(result.remainderLamports);
  });

  it("marketplace 1 SOL seller gets 0.9", () => {
    const result = allocateForTransactionType(solToLamports("1"), "MARKETPLACE_SALE");
    expect(result.lines.find((l) => l.destination === "SELLER")?.allocatedAmountLamports).toBe(
      solToLamports("0.9"),
    );
    const sum = result.lines.reduce((s, l) => s + l.allocatedAmountLamports, 0n);
    expect(sum).toBe(solToLamports("1"));
  });

  it("builds immutable ledger drafts", () => {
    const result = allocateForTransactionType(solToLamports("0.05"), "CRAFTING_FEE");
    const entries = buildLedgerEntries({
      result,
      assetMint: "SOL",
      network: "devnet",
    });
    expect(entries).toHaveLength(result.lines.length);
    expect(entries.every((e) => e.status === "RECORDED")).toBe(true);
  });
});

describe("holder eligibility", () => {
  it("requires token + selection + care", () => {
    const base = {
      ownsEligibleLivingPet: true,
      petSelectedForRewards: true,
      careScore: 55,
      isSick: false,
      isDormant: false,
      isDeceased: false,
      isListedForSale: false,
      ownershipHours: 48,
      tokenHoldHours: 0,
      walletBlocked: false,
      rewardPetSlotsUsed: 1,
    };
    expect(
      evaluatePetRewardEligibility({ ...base, meetsMinTokenBalance: false }).eligible,
    ).toBe(false);
    const ok = evaluatePetRewardEligibility({ ...base, meetsMinTokenBalance: true });
    expect(ok.eligible).toBe(true);
    expect(ok.weight).toBe(1);
  });

  it("splits epoch pool by weight in lamports", () => {
    const pool = solToLamports("1");
    const share = computeWalletEpochShare({
      availableEpochRewardLamports: pool,
      walletEligibleWeight: 1,
      totalEligibleWeight: 4,
    });
    expect(share).toBe(solToLamports("0.25"));
  });
});

describe("flags", () => {
  it("keeps claims and settlements off; egg rewards off", () => {
    expect(featureFlagDefaults.REVENUE_ALLOCATION_ENABLED).toBe(true);
    expect(featureFlagDefaults.REWARD_CLAIMS_ENABLED).toBe(false);
    expect(featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED).toBe(false);
    expect(featureFlagDefaults.EGG_HOLDER_REWARDS_ENABLED).toBe(false);
  });
});
