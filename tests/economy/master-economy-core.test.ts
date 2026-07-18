import { describe, expect, it, beforeEach } from "vitest";
import { resetCreditLedgerForTests, ensureStarterCredits, getCreditBalance } from "@/lib/credits/ledger";
import {
  settleCredit,
  settleDebit,
  settleTransfer,
  settleSolIntent,
  settleEnsureStarter,
} from "@/lib/economy/core/settlement";
import { lamportsToCreditsPrice, normalizePlayCurrency, isPlayCurrency } from "@/lib/economy/core";
import { resolveShopPurchase } from "@/lib/shop/purchase";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

describe("Master Economy Core", () => {
  beforeEach(() => {
    resetCreditLedgerForTests();
  });

  it("normalizes DEMO_CREDITS alias to CREDITS", () => {
    expect(normalizePlayCurrency("DEMO_CREDITS")).toBe("CREDITS");
    expect(isPlayCurrency("demo")).toBe(true);
  });

  it("settles starter + shop debit via facade", () => {
    const starter = settleEnsureStarter("core-user-1");
    expect(starter.ok).toBe(true);
    const bal = getCreditBalance("core-user-1");
    expect(bal).toBeGreaterThanOrEqual(200);

    const buy = settleDebit({
      userId: "core-user-1",
      amount: 20,
      reason: "SHOP_BUY",
      requestId: "shop-core-1",
      metadata: { itemId: "wooden-paw-guard" },
    });
    expect(buy.ok).toBe(true);
    if (buy.ok) expect(buy.balance).toBe(bal - 20);
  });

  it("transfers marketplace Credits with fee", () => {
    ensureStarterCredits("buyer-a");
    ensureStarterCredits("seller-b");
    settleCredit({
      userId: "buyer-a",
      amount: 500,
      reason: "ADMIN_ADJUST",
      requestId: "topup-buyer",
    });

    const t = settleTransfer({
      fromUserId: "buyer-a",
      toUserId: "seller-b",
      grossAmount: 100,
      feeAmount: 3,
      buyerRequestId: "mkt-buy-1",
      sellerRequestId: "mkt-sell-1",
      feeRequestId: "mkt-fee-1",
    });
    expect(t.ok).toBe(true);
    if (t.ok) {
      expect(t.feeBurned).toBe(3);
      expect(t.sellerBalance).toBe(getCreditBalance("seller-b"));
    }
    expect(getCreditBalance("seller-b")).toBeGreaterThanOrEqual(200 + 97);
  });

  it("blocks SOL intent when SOL_PURCHASES_ENABLED is false", () => {
    const r = settleSolIntent({
      userId: "u",
      lamports: 1000n,
      requestId: "sol-1",
      purpose: "shop",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.mode).toBe("blocked");
  });

  it("maps lamports to Credits prices", () => {
    // 0.005 SOL = 5 milli-SOL → 50 Credits at 10 Credits/milli
    expect(lamportsToCreditsPrice(5_000_000n)).toBe(50);
    expect(lamportsToCreditsPrice(1n)).toBe(1);
  });

  it("shop Credits resolve path settles when settleCredits=true", () => {
    ensureStarterCredits("shop-user");
    const priceLamports = 2_000_000n; // 0.002 SOL → 20 Credits
    const priceCredits = lamportsToCreditsPrice(priceLamports);
    const r = resolveShopPurchase({
      method: "CREDITS",
      priceLamports,
      earnedLamports: 0n,
      wallet: {
        walletConnected: false,
        walletBalanceLamports: null,
        solItemPurchasesEnabled: false,
        solPurchasesEnabled: false,
      },
      creditsBalance: getCreditBalance("shop-user"),
      priceCredits,
      userId: "shop-user",
      requestId: "shop-resolve-1",
      itemId: "wooden-paw-guard",
      settleCredits: true,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.method).toBe("CREDITS");
      expect(r.chainWrite).toBe(false);
    }
  });

  it("defines SOL_SPIRIT_RECALL_ENABLED default false", () => {
    expect(isFeatureEnabled("SOL_SPIRIT_RECALL_ENABLED")).toBe(false);
    expect(isFeatureEnabled("MASTER_ECONOMY_CORE_ENABLED")).toBe(true);
  });
});
