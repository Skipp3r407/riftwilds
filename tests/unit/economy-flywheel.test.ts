import { describe, expect, it } from "vitest";
import { ECONOMY_FLYWHEEL } from "@/game/economy/flywheel";
import { settleMarketplaceSale, applyTreasuryCredit } from "@/game/economy/treasury";
import { isPetEpochEligible, planEpochPayouts } from "@/game/economy/epoch-rewards";

describe("economy flywheel", () => {
  it("contains the full loop in order", () => {
    expect(ECONOMY_FLYWHEEL.map((s) => s.id)).toEqual([
      "BUY_COIN",
      "GET_EGG",
      "HATCH",
      "FEED",
      "BUY_ITEMS",
      "MARKETPLACE_FEES",
      "TREASURY_GROWS",
      "COMMUNITY_EVENTS",
      "MORE_PLAYERS",
      "CREATOR_FEES",
      "EPOCH_REWARDS",
    ]);
  });
});

describe("treasury settlement", () => {
  it("splits marketplace fee into treasury and seller proceeds", () => {
    const s = settleMarketplaceSale(10_000, 250, 10000);
    expect(s.feeCredits).toBe(250);
    expect(s.treasuryCredits).toBe(250);
    expect(s.sellerProceedsCredits).toBe(9750);
  });

  it("credits treasury with integer balances", () => {
    const entry = applyTreasuryCredit(1000, 250, "req-1");
    expect(entry.balanceAfter).toBe(1250);
    expect(entry.delta).toBe(250);
  });
});

describe("epoch rewards", () => {
  const living = {
    petId: "p1",
    ownerId: "u1",
    lifecycle: "HAPPY",
    careActionsInEpoch: 2,
    isListed: false,
  };

  it("rejects dormant and listed pets", () => {
    expect(isPetEpochEligible({ ...living, lifecycle: "DORMANT" }).ok).toBe(false);
    expect(isPetEpochEligible({ ...living, isListed: true }).ok).toBe(false);
    expect(isPetEpochEligible(living).ok).toBe(true);
  });

  it("pays nothing when epoch flag is off", () => {
    const plan = planEpochPayouts("epoch-1", [living], {
      EPOCH_REWARDS_ENABLED: false,
      REAL_MONEY_REWARDS_ENABLED: false,
    });
    expect(plan.lines).toHaveLength(0);
    expect(plan.skipped[0]?.reason).toBe("epoch_rewards_disabled");
  });

  it("caps pets per user when soft rewards enabled", () => {
    const pets = [1, 2, 3, 4].map((n) => ({
      ...living,
      petId: `p${n}`,
    }));
    const plan = planEpochPayouts("epoch-1", pets, {
      EPOCH_REWARDS_ENABLED: true,
      REAL_MONEY_REWARDS_ENABLED: false,
    });
    expect(plan.lines).toHaveLength(3);
    expect(plan.skipped.some((s) => s.reason === "per_user_cap")).toBe(true);
  });
});
