import { describe, expect, it, beforeEach } from "vitest";
import {
  buildPayoutPlan,
  createDefaultRules,
  createDefaultSettings,
  createDefaultWallets,
  validateSplitsBps,
  resetTreasuryOpsStateForTests,
  ingestRevenue,
  executeDistribution,
  TOTAL_BPS,
} from "@/lib/treasury-ops";
import { DEFAULT_SPLIT_BPS } from "@/lib/treasury-ops/config";

describe("treasury-ops distribution", () => {
  beforeEach(() => {
    resetTreasuryOpsStateForTests();
  });

  it("default split bps sum to 100%", () => {
    const sum = Object.values(DEFAULT_SPLIT_BPS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(TOTAL_BPS);
  });

  it("builds payout plan that preserves gross lamports", () => {
    const settings = createDefaultSettings();
    const wallets = createDefaultWallets(settings.projectTreasuryAddress);
    const rules = createDefaultRules(wallets);
    const check = validateSplitsBps(rules.splits);
    expect(check.ok).toBe(true);

    const gross = 1_000_000_000n; // 1 SOL
    const plan = buildPayoutPlan({
      grossLamports: gross,
      rules,
      wallets,
      idempotencyKey: "test:1",
    });

    const total = plan.lines.reduce((s, l) => s + BigInt(l.amountLamports), 0n);
    expect(total).toBe(gross);
    expect(plan.lines.find((l) => l.walletRole === "DEVELOPMENT")?.percentBps).toBe(3500);
  });

  it("ingest is idempotent and never duplicates by key", async () => {
    const a = await ingestRevenue({
      sourceKey: "pumpfun_creator_fees",
      amountLamports: "25000000",
      idempotencyKey: "idem-1",
      confirmations: 2,
      triggerDistribute: false,
    });
    const b = await ingestRevenue({
      sourceKey: "pumpfun_creator_fees",
      amountLamports: "25000000",
      idempotencyKey: "idem-1",
      confirmations: 2,
      triggerDistribute: false,
    });
    expect(a.duplicate).toBe(false);
    expect(b.duplicate).toBe(true);
    expect(b.incoming.id).toBe(a.incoming.id);
  });

  it("auto-distributes under approval threshold in demo mode", async () => {
    const { incoming, distribution } = await ingestRevenue({
      sourceKey: "pumpfun_creator_fees",
      amountLamports: "100000000", // 0.1 SOL — below 1 SOL approval threshold
      idempotencyKey: "idem-dist-1",
      confirmations: 2,
      triggerDistribute: true,
    });
    expect(incoming.status === "DISTRIBUTED" || incoming.status === "QUEUED").toBe(true);
    expect(distribution).toBeTruthy();
    expect(["SIMULATED", "COMPLETED", "QUEUED"]).toContain(distribution!.status);

    const dist =
      distribution!.status === "QUEUED"
        ? await executeDistribution({ distributionId: distribution!.id })
        : distribution!;
    expect(["SIMULATED", "COMPLETED"]).toContain(dist.status);
    expect(dist.simulated).toBe(true);
    const lineSum = dist.lines.reduce((s, l) => s + BigInt(l.amountLamports), 0n);
    expect(lineSum).toBe(BigInt(dist.grossLamports));
  });

  it("does not encode holder dividend or player wagering paths", () => {
    const settings = createDefaultSettings();
    expect(settings.treasuryDescription.toLowerCase()).toContain("never auto-paid");
    expect(settings.realTransfersEnabled).toBe(false);
  });
});
