import { describe, expect, it } from "vitest";
import {
  assertUniqueRequestId,
  detectWashTradingRisk,
  resolveSettlementGate,
  verifyListingOwnership,
} from "@/lib/marketplace/integrity";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";

describe("settlement gate + SOL flags", () => {
  it("keeps SOL settlement paths OFF by default", () => {
    expect(featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED).toBe(false);
    expect(featureFlagDefaults.SOL_PURCHASES_ENABLED).toBe(false);
    expect(featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED).toBe(false);
    expect(featureFlagDefaults.AUTOMATIC_SETTLEMENT_ENABLED).toBe(false);
    expect(featureFlagDefaults.ONCHAIN_ATOMIC_SPLIT_ENABLED).toBe(false);
    expect(featureFlagDefaults.REWARD_CLAIMS_ENABLED).toBe(false);
    expect(REAL_VALUE_WAGERING_ENABLED).toBe(false);
  });

  it("blocks marketplace when disabled", () => {
    const gate = resolveSettlementGate({
      marketplaceEnabled: false,
      realSolMarketplaceEnabled: false,
      solPurchasesEnabled: false,
    });
    expect(gate.allowed).toBe(false);
    expect(gate.mode).toBe("blocked");
  });

  it("uses demo_credits when marketplace on but SOL flags off", () => {
    const gate = resolveSettlementGate({
      marketplaceEnabled: true,
      realSolMarketplaceEnabled: false,
      solPurchasesEnabled: false,
    });
    expect(gate.mode).toBe("demo_credits");
    expect(gate.allowed).toBe(true);
  });

  it("selects sol_escrow only when both SOL flags on (still unimplemented in product)", () => {
    const gate = resolveSettlementGate({
      marketplaceEnabled: true,
      realSolMarketplaceEnabled: true,
      solPurchasesEnabled: true,
    });
    expect(gate.mode).toBe("sol_escrow");
  });
});

describe("listing integrity", () => {
  it("verifies ownership and rejects locked assets", () => {
    expect(
      verifyListingOwnership({
        sellerId: "a",
        assetOwnerId: "b",
      }).ok,
    ).toBe(false);
    expect(
      verifyListingOwnership({
        sellerId: "a",
        assetOwnerId: "a",
        assetLocked: true,
      }).ok,
    ).toBe(false);
    expect(
      verifyListingOwnership({
        sellerId: "a",
        assetOwnerId: "a",
      }).ok,
    ).toBe(true);
  });

  it("dedupes purchase request ids", () => {
    const id = `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    expect(assertUniqueRequestId(id).ok).toBe(true);
    expect(assertUniqueRequestId(id).ok).toBe(false);
  });

  it("flags wash trading heuristics", () => {
    const signal = detectWashTradingRisk({
      buyerWallet: "W1",
      sellerWallet: "W1",
      priceLamports: 1000n,
    });
    expect(signal.flagged).toBe(true);
    expect(signal.todo).toMatch(/TODO\(chain\)/);
  });
});
