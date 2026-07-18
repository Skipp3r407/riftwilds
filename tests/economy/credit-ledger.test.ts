import { describe, expect, it, beforeEach } from "vitest";
import {
  creditCredits,
  debitCredits,
  ensureStarterCredits,
  getCreditBalance,
  resetCreditLedgerForTests,
} from "@/lib/credits/ledger";
import { sellNpcShopItem, spendNpcShop } from "@/lib/credits/sinks";
import { grantRiftlingBonus } from "@/lib/credits/faucets";
import { RIFTLING_BONUS } from "@/lib/credits/config";

describe("Credits ledger (integer, idempotent, capped)", () => {
  beforeEach(() => {
    resetCreditLedgerForTests();
  });

  it("grants starter Credits once (idempotent)", () => {
    const a = ensureStarterCredits("u1");
    const b = ensureStarterCredits("u1");
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(b.idempotentReplay).toBe(true);
      expect(getCreditBalance("u1")).toBe(a.entry.balanceAfter);
    }
  });

  it("rejects non-integer and insufficient debit", () => {
    ensureStarterCredits("u2");
    const bad = creditCredits({
      userId: "u2",
      amount: 1.5 as unknown as number,
      reason: "QUEST_REWARD",
      requestId: "bad-float",
    });
    expect(bad.ok).toBe(false);

    const over = debitCredits({
      userId: "u2",
      amount: 5_000,
      reason: "NPC_SHOP_BUY",
      requestId: "over",
    });
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.error).toBe("insufficient_credits");
  });

  it("blocks AI NPC metadata grants", () => {
    const r = creditCredits({
      userId: "u3",
      amount: 50,
      reason: "QUEST_REWARD",
      requestId: "ai-1",
      metadata: { source: "ai_npc" },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("ai_cannot_grant");
  });

  it("enforces daily faucet caps", () => {
    ensureStarterCredits("u4");
    for (let i = 0; i < 5; i++) {
      creditCredits({
        userId: "u4",
        amount: 50,
        reason: "DAILY_GOAL",
        requestId: `d-${i}`,
      });
    }
    const over = creditCredits({
      userId: "u4",
      amount: 50,
      reason: "DAILY_GOAL",
      requestId: "d-over",
    });
    expect(over.ok).toBe(false);
  });

  it("NPC sell-back cannot print Credits vs buy price", () => {
    ensureStarterCredits("u5");
    const buy = spendNpcShop({
      userId: "u5",
      shopId: "s",
      itemId: "i",
      price: 100,
      requestId: "buy-1",
    });
    expect(buy.ok).toBe(true);
    const afterBuy = getCreditBalance("u5");
    const sell = sellNpcShopItem({
      userId: "u5",
      shopId: "s",
      itemId: "i",
      buyPrice: 100,
      requestId: "sell-1",
    });
    expect(sell.ok).toBe(true);
    const afterSell = getCreditBalance("u5");
    expect(afterSell - afterBuy).toBe(35); // 35% BPS
    expect(afterSell).toBeLessThan(200); // starter 200 - 100 + 35
  });

  it("caps Riftling bonuses", () => {
    ensureStarterCredits("u6");
    const day = "2099-01-01";
    const ok = grantRiftlingBonus({ userId: "u6", petId: "p0", dayKey: day, slot: 0 });
    expect(ok.ok).toBe(true);
    const badSlot = grantRiftlingBonus({
      userId: "u6",
      petId: "p9",
      dayKey: day,
      slot: RIFTLING_BONUS.maxPetsCounted,
    });
    expect(badSlot.ok).toBe(false);
  });
});
