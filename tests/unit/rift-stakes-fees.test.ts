import { describe, expect, it, beforeEach } from "vitest";
import {
  allocateTreasuryFee,
  buildConfirmationSummary,
  calculateFee,
  zeroFeeOnRefund,
} from "@/game/rift-stakes/fees";
import {
  DEFAULT_FEE_BPS,
  LAMPORTS_PER_SOL,
  MAX_FEE_BPS,
  clampFeeBps,
} from "@/game/rift-stakes/config";
import { riftStakesContract } from "@/game/rift-stakes/contract-interface";
import { resetRiftStakesStoreForTests } from "@/game/rift-stakes/store";

describe("rift stakes fees", () => {
  beforeEach(() => {
    resetRiftStakesStoreForTests();
  });

  it("2% of 0.20 SOL pot = 0.004 fee, winner 0.196", () => {
    // 0.10 SOL each → pot 0.20
    const stake = 0.1 * LAMPORTS_PER_SOL;
    const fee = calculateFee({
      stakePerPlayerLamports: stake,
      feeBps: DEFAULT_FEE_BPS,
    });
    expect(fee.prizePoolLamports).toBe(0.2 * LAMPORTS_PER_SOL);
    expect(fee.platformFeeLamports).toBe(0.004 * LAMPORTS_PER_SOL);
    expect(fee.winnerReceivesLamports).toBe(0.196 * LAMPORTS_PER_SOL);
    expect(fee.platformFeeLamports + fee.winnerReceivesLamports).toBe(
      fee.prizePoolLamports,
    );
  });

  it("hard max clamps above 5%", () => {
    expect(clampFeeBps(9999)).toBe(MAX_FEE_BPS);
    const fee = calculateFee({
      stakePerPlayerLamports: LAMPORTS_PER_SOL,
      feeBps: 9999,
    });
    expect(fee.feeBps).toBe(MAX_FEE_BPS);
  });

  it("0% promo / VIP yields zero platform fee", () => {
    const fee = calculateFee({
      stakePerPlayerLamports: 200_000_000,
      feeBps: 0,
      feeSource: "promo",
    });
    expect(fee.platformFeeLamports).toBe(0);
    expect(fee.winnerReceivesLamports).toBe(fee.prizePoolLamports);
    expect(fee.feeWaived).toBe(true);
  });

  it("refund path charges no fee", () => {
    const fee = zeroFeeOnRefund(200_000_000);
    expect(fee.platformFeeLamports).toBe(0);
    expect(fee.feeBps).toBe(0);
  });

  it("treasury allocation sums exactly to fee", () => {
    const lines = allocateTreasuryFee(1_000_000);
    expect(lines.reduce((s, l) => s + l.amountLamports, 0)).toBe(1_000_000);
    expect(lines.find((l) => l.bucket === "development")?.bps).toBe(5000);
    expect(lines.find((l) => l.bucket === "tournaments")?.bps).toBe(2000);
    expect(lines.find((l) => l.bucket === "community")?.bps).toBe(1500);
    expect(lines.find((l) => l.bucket === "infrastructure")?.bps).toBe(1500);
  });

  it("confirmation summary exposes all required fields", () => {
    const fee = calculateFee({ stakePerPlayerLamports: 100_000_000 });
    const c = buildConfirmationSummary(fee);
    expect(c.yourEntryLamports).toBe(100_000_000);
    expect(c.opponentEntryLamports).toBe(100_000_000);
    expect(c.prizePoolLamports).toBe(200_000_000);
    expect(c.platformFeePercent).toBeTruthy();
    expect(c.platformFeeLamports).toBeGreaterThan(0);
    expect(c.estimatedNetworkFeeLamports).toBeGreaterThan(0);
    expect(c.winnerReceivesLamports).toBeGreaterThan(0);
    expect(c.label).toContain("Optional");
  });

  it("contract CalculateFee matches server math", () => {
    const a = calculateFee({
      stakePerPlayerLamports: 50_000_000,
      feeBps: 200,
    });
    const b = riftStakesContract.calculateFee({
      stakePerPlayerLamports: 50_000_000,
      feeBps: 200,
    });
    expect(b.platformFeeLamports).toBe(a.platformFeeLamports);
    expect(b.winnerReceivesLamports).toBe(a.winnerReceivesLamports);
  });

  it("odd lamport pots never drop dust", () => {
    // pot 3 lamports, 2% → floor fee 0, winner 3
    const fee = calculateFee({ stakePerPlayerLamports: 1, feeBps: 200 });
    expect(fee.prizePoolLamports).toBe(2);
    expect(fee.platformFeeLamports + fee.winnerReceivesLamports).toBe(2);
  });
});
