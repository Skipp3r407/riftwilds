import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  claimStarterEgg,
  getFreeStarterPoolStatus,
  getHatcheryOfferStatus,
  listEggsForOwner,
  purchasePremiumEgg,
  setFreeStarterPoolCapForTests,
  setFreeStarterReleasedForTests,
} from "@/game/eggs/hatchery-store";
import { creditCredits, getCreditBalance, resetCreditLedgerForTests } from "@/lib/credits/ledger";
import { PREMIUM_EGG_CREDITS_PRICE } from "@/lib/economy/egg-supply";

function fundOwner(owner: string, amount: number) {
  const r = creditCredits({
    userId: owner,
    amount,
    reason: "ADMIN_ADJUST",
    requestId: `fund:${owner}:${amount}:${Math.random().toString(16).slice(2)}`,
  });
  expect(r.ok).toBe(true);
}

describe("hatchery free pool + premium Credits eggs", () => {
  beforeEach(() => {
    // Do not wipe shared hatchery Maps. Use a tiny test-only pool cap so
    // exhaustion cases cannot block concurrent free claims in other suites.
    resetCreditLedgerForTests();
    setFreeStarterPoolCapForTests(3);
    setFreeStarterReleasedForTests(0);
  });

  afterEach(() => {
    setFreeStarterPoolCapForTests(null);
    setFreeStarterReleasedForTests(0);
  });

  it("tracks free starter pool and depletes on claim", () => {
    const owner = `owner_pool_${Math.random().toString(16).slice(2)}`;
    const before = getFreeStarterPoolStatus();
    expect(before.cap).toBe(3);
    expect(before.remaining).toBe(3);

    claimStarterEgg(owner);
    const after = getFreeStarterPoolStatus();
    expect(after.released).toBe(1);
    expect(after.remaining).toBe(2);
    expect(after.exhausted).toBe(false);
  });

  it("blocks free claim when global pool is exhausted", () => {
    setFreeStarterReleasedForTests(3);
    const owner = `owner_late_${Math.random().toString(16).slice(2)}`;
    expect(getFreeStarterPoolStatus().exhausted).toBe(true);
    expect(() => claimStarterEgg(owner)).toThrow("FREE_POOL_EXHAUSTED");

    const offer = getHatcheryOfferStatus(owner);
    expect(offer.canClaimFree).toBe(false);
    expect(offer.canBuyPremium).toBe(true);
    expect(offer.premiumPriceCredits).toBe(PREMIUM_EGG_CREDITS_PRICE);
  });

  it("blocks double free claim for the same owner", () => {
    const owner = `owner_once_${Math.random().toString(16).slice(2)}`;
    claimStarterEgg(owner);
    expect(() => claimStarterEgg(owner)).toThrow("STARTER_ALREADY_CLAIMED");
    const offer = getHatcheryOfferStatus(owner);
    expect(offer.alreadyClaimedFree).toBe(true);
    expect(offer.canClaimFree).toBe(false);
    expect(offer.canBuyPremium).toBe(true);
  });

  it("purchases a premium egg with Credits when free is unavailable", () => {
    setFreeStarterReleasedForTests(3);
    const owner = `owner_buy_${Math.random().toString(16).slice(2)}`;
    fundOwner(owner, PREMIUM_EGG_CREDITS_PRICE);

    const result = purchasePremiumEgg(owner, { requestId: `buy-${owner}` });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.egg.creationSource).toBe("SHOP");
    expect(result.egg.hatchStatus).toBe("INCUBATING");
    expect(result.priceCredits).toBe(PREMIUM_EGG_CREDITS_PRICE);
    expect(result.balance).toBe(0);
    expect(getCreditBalance(owner)).toBe(0);
    expect(listEggsForOwner(owner).map((e) => e.publicId)).toContain(result.egg.publicId);
    // Premium purchase does not consume free pool counter.
    expect(getFreeStarterPoolStatus().released).toBe(3);
  });

  it("fails premium purchase when Credits are insufficient", () => {
    setFreeStarterReleasedForTests(3);
    const owner = `owner_poor_${Math.random().toString(16).slice(2)}`;
    fundOwner(owner, 100);

    const result = purchasePremiumEgg(owner, { requestId: `poor-${owner}` });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("insufficient_credits");
    expect(listEggsForOwner(owner)).toHaveLength(0);
    expect(getCreditBalance(owner)).toBe(100);
  });

  it("rejects premium purchase while free claim is still available", () => {
    const owner = `owner_early_${Math.random().toString(16).slice(2)}`;
    fundOwner(owner, PREMIUM_EGG_CREDITS_PRICE);
    const result = purchasePremiumEgg(owner, { requestId: `early-${owner}` });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("FREE_CLAIM_STILL_AVAILABLE");
    expect(listEggsForOwner(owner)).toHaveLength(0);
  });

  it("allows premium buy after the owner already claimed free", () => {
    const owner = `owner_extra_${Math.random().toString(16).slice(2)}`;
    claimStarterEgg(owner);
    fundOwner(owner, PREMIUM_EGG_CREDITS_PRICE);

    const result = purchasePremiumEgg(owner, { requestId: `extra-${owner}` });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.egg.creationSource).toBe("SHOP");
    expect(listEggsForOwner(owner)).toHaveLength(2);
  });
});
