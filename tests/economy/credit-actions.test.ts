import { describe, expect, it, beforeEach } from "vitest";
import {
  resetCreditLedgerForTests,
  getCreditBalance,
  ensureStarterCredits,
} from "@/lib/credits/ledger";
import {
  actionCompleteJob,
  actionCompleteQuest,
  actionNpcShopBuy,
  actionNpcShopSell,
  actionRestoreDonate,
  actionEventReward,
} from "@/lib/credits/actions";

describe("Credits economy actions", () => {
  beforeEach(() => {
    resetCreditLedgerForTests();
  });

  it("grants quest Credits through actionCompleteQuest", () => {
    ensureStarterCredits("a1");
    const r = actionCompleteQuest({
      userId: "a1",
      questKey: "starter-q1-awakening",
      amount: 25,
    });
    expect(r.ok).toBe(true);
    expect(getCreditBalance("a1")).toBe(225);
  });

  it("job complete spends fee then grants reward", () => {
    ensureStarterCredits("a2");
    const r = actionCompleteJob({
      userId: "a2",
      jobId: "job-commons-lanterns",
      requestId: "job-test-1",
    });
    expect(r.ok).toBe(true);
    // starter 200 - fee 5 + reward 40 = 235
    expect(getCreditBalance("a2")).toBe(235);
  });

  it("NPC shop buy then sell-back loses Credits (anti-loop)", () => {
    ensureStarterCredits("a3");
    const buy = actionNpcShopBuy({
      userId: "a3",
      shopId: "shop-mira-care",
      itemId: "mossmeal",
      requestId: "buy-1",
    });
    expect(buy.ok).toBe(true);
    expect(getCreditBalance("a3")).toBe(180);
    const sell = actionNpcShopSell({
      userId: "a3",
      shopId: "shop-mira-care",
      itemId: "mossmeal",
      buyPrice: 20,
      requestId: "sell-1",
    });
    expect(sell.ok).toBe(true);
    // 35% of 20 = 7 → 187; still below starter 200 after buy+sell cycle from 180
    expect(getCreditBalance("a3")).toBe(187);
    expect(getCreditBalance("a3")).toBeLessThan(200);
  });

  it("restoration donation burns Credits", () => {
    ensureStarterCredits("a4");
    const r = actionRestoreDonate({
      userId: "a4",
      milestoneKey: "restore-commons-lanterns",
      amount: 25,
      requestId: "restore-1",
    });
    expect(r.ok).toBe(true);
    expect(getCreditBalance("a4")).toBe(175);
  });

  it("event reward grants capped Credits", () => {
    ensureStarterCredits("a5");
    const r = actionEventReward({
      userId: "a5",
      eventId: "event-commons-spar",
      requestId: "event-1",
    });
    expect(r.ok).toBe(true);
    expect(getCreditBalance("a5")).toBe(235);
  });
});
