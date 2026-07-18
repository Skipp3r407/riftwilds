import { beforeEach, describe, expect, it } from "vitest";
import { resetAnalyticsForTests } from "@/lib/analytics/events";
import { getCreditBalance, resetCreditLedgerForTests } from "@/lib/credits/ledger";
import {
  hasMeaningfulActivity,
  appendActivity,
} from "@/lib/loyalty/activity";
import { DAILY_AIRDROP_TABLE, PITY_THRESHOLD, STREAK_MILESTONES } from "@/lib/loyalty/config";
import { STORM_TIER_WEIGHT_BOOST } from "@/lib/loyalty/rift-storm-config";
import {
  activateRiftStorm,
  cancelRiftStorm,
  isNewlyQualified,
  recordStormParticipation,
  rollStormWave,
} from "@/lib/loyalty/rift-storm-engine";
import {
  applyParticipationAction,
  emptyParticipant,
  loginAloneQualifies,
  pointsForActionOccurrence,
} from "@/lib/loyalty/rift-storm-participation";
import { attemptStormSolGrant, canAttemptStormSol } from "@/lib/loyalty/rift-storm-sol";
import {
  claimDailyAirdrop,
  claimMilestone,
  checkInDaily,
  purchaseLoyaltyShopItem,
  recordPlayerActivity,
  resetLoyaltyStoreForTests,
} from "@/lib/loyalty";
import { applyDailyCheckIn, emptyStreakState } from "@/lib/loyalty/streaks";
import { tierFromDailyStreak } from "@/lib/loyalty/tiers";
import { getTokenAccount } from "@/lib/loyalty/store";
import { creditLoyaltyTokens } from "@/lib/loyalty/tokens";
import { computeWeights, rareWeightShare, rollAirdrop } from "@/lib/loyalty/weights";
import { nextPityCount, shouldForcePity } from "@/lib/loyalty/pity";

describe("loyalty streaks & tiers", () => {
  beforeEach(() => {
    resetLoyaltyStoreForTests();
    resetCreditLedgerForTests();
    resetAnalyticsForTests();
  });

  it("advances consecutive daily streak and resets daily only on miss", () => {
    const day0 = Date.parse("2026-07-01T12:00:00.000Z");
    let state = emptyStreakState("u1", day0);
    state = applyDailyCheckIn(state, day0).state;
    expect(state.dailyStreak).toBe(1);
    state = applyDailyCheckIn(state, day0 + 86400000).state;
    expect(state.dailyStreak).toBe(2);
    const gap = applyDailyCheckIn(state, day0 + 3 * 86400000);
    expect(gap.resetDaily).toBe(true);
    expect(gap.state.dailyStreak).toBe(1);
    expect(gap.state.weeklyStreak).toBeGreaterThanOrEqual(1);
  });

  it("maps streak days to Bronze→Legend tiers", () => {
    expect(tierFromDailyStreak(0)).toBe("BRONZE");
    expect(tierFromDailyStreak(3)).toBe("SILVER");
    expect(tierFromDailyStreak(7)).toBe("GOLD");
    expect(tierFromDailyStreak(100)).toBe("LEGEND");
  });

  it("check-in API path advances streak", () => {
    const r = checkInDaily({ userId: "keeper-a", now: Date.parse("2026-07-10T10:00:00Z") });
    expect(r.ok).toBe(true);
    expect(r.advanced).toBe(true);
    expect(r.state.dailyStreak).toBe(1);
  });
});

describe("weighted airdrops & pity", () => {
  beforeEach(() => {
    resetLoyaltyStoreForTests();
    resetCreditLedgerForTests();
  });

  it("gives higher rare weight share to Legend than Bronze", () => {
    const bronze = rareWeightShare(DAILY_AIRDROP_TABLE, "BRONZE");
    const legend = rareWeightShare(DAILY_AIRDROP_TABLE, "LEGEND");
    expect(legend).toBeGreaterThan(bronze);
  });

  it("pity forces uncommon+ after threshold", () => {
    expect(shouldForcePity(PITY_THRESHOLD)).toBe(true);
    const weights = computeWeights(DAILY_AIRDROP_TABLE, "BRONZE", { pityForced: true });
    expect(weights.every((w) => w.reward.rarity !== "COMMON")).toBe(true);
  });

  it("resets pity on uncommon+", () => {
    expect(nextPityCount(5, "UNCOMMON")).toBe(0);
    expect(nextPityCount(5, "COMMON")).toBe(6);
  });

  it("anti-AFK denies claim without meaningful activity", () => {
    const denied = claimDailyAirdrop({ userId: "afk-user" });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBe("afk_denied");
  });

  it("allows claim after activity and grants credits/tokens without dupes", () => {
    const user = "active-user";
    recordPlayerActivity({ userId: user, kind: "QUEST" });
    checkInDaily({ userId: user, now: Date.parse("2026-07-11T12:00:00Z") });
    const first = claimDailyAirdrop({
      userId: user,
      now: Date.parse("2026-07-11T12:00:00Z"),
      rng: () => 0.01,
    });
    expect(first.ok).toBe(true);
    const second = claimDailyAirdrop({
      userId: user,
      now: Date.parse("2026-07-11T12:00:00Z"),
      rng: () => 0.01,
    });
    expect(second.ok).toBe(false);
  });
});

describe("milestones & loyalty tokens shop", () => {
  beforeEach(() => {
    resetLoyaltyStoreForTests();
    resetCreditLedgerForTests();
  });

  it("claims milestone once", () => {
    const user = "ms-user";
    let now = Date.parse("2026-01-01T12:00:00Z");
    for (let i = 0; i < 7; i++) {
      checkInDaily({ userId: user, now: now + i * 86400000 });
    }
    const m = STREAK_MILESTONES.find((x) => x.days === 7)!;
    const first = claimMilestone({ userId: user, days: 7 });
    expect(first.ok).toBe(true);
    if (first.ok) {
      expect(getCreditBalance(user)).toBeGreaterThanOrEqual(m.creditsAmount);
      expect(getTokenAccount(user).balance).toBeGreaterThanOrEqual(m.loyaltyTokens);
    }
    const dup = claimMilestone({ userId: user, days: 7 });
    expect(dup.ok).toBe(false);
  });

  it("shop sells cosmetics only and spends tokens", () => {
    const user = "shop-user";
    creditLoyaltyTokens({
      userId: user,
      amount: 100,
      reason: "test",
      requestId: "lt-test-1",
    });
    const buy = purchaseLoyaltyShopItem({ userId: user, itemId: "shop_aura_moss" });
    expect(buy.ok).toBe(true);
    if (buy.ok) {
      expect(buy.item.gameplayAdvantage).toBe(false);
      expect(buy.tokenBalance).toBe(60);
    }
  });
});

describe("rift storm full event", () => {
  beforeEach(() => {
    resetLoyaltyStoreForTests();
    resetCreditLedgerForTests();
    resetAnalyticsForTests();
  });

  it("activates with warning then can skip to active", () => {
    const storm = activateRiftStorm({
      intensity: "GREATER",
      skipWarning: true,
      global: true,
      triggeredBy: "admin",
      now: Date.parse("2026-07-18T16:00:00Z"),
    });
    expect(storm.phase).toBe("ACTIVE");
    expect(storm.active).toBe(true);
    expect(storm.intensity).toBe("GREATER");
  });

  it("denies login-alone participation", () => {
    activateRiftStorm({ skipWarning: true, global: true, now: Date.now() });
    expect(loginAloneQualifies()).toBe(false);
    const r = recordStormParticipation({ userId: "u", action: "LOGIN" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("afk_denied");
  });

  it("scores participation with diminishing returns", () => {
    expect(pointsForActionOccurrence("COMBAT", 1)).toBe(2);
    expect(pointsForActionOccurrence("COMBAT", 5)).toBeLessThan(
      pointsForActionOccurrence("COMBAT", 1),
    );
    const p = emptyParticipant("u", "s1");
    const a1 = applyParticipationAction(p, "QUEST_OBJECTIVE", "MINOR");
    const a2 = applyParticipationAction(a1.participant, "QUEST_OBJECTIVE", "MINOR");
    expect(a2.participant.score).toBeGreaterThan(a1.participant.score);
  });

  it("applies configured streak-tier weight boosts", () => {
    expect(STORM_TIER_WEIGHT_BOOST.BRONZE).toBe(0);
    expect(STORM_TIER_WEIGHT_BOOST.SILVER).toBe(0.05);
    expect(STORM_TIER_WEIGHT_BOOST.GOLD).toBe(0.1);
    expect(STORM_TIER_WEIGHT_BOOST.PLATINUM).toBe(0.18);
    expect(STORM_TIER_WEIGHT_BOOST.DIAMOND).toBe(0.25);
    expect(STORM_TIER_WEIGHT_BOOST.LEGEND).toBe(0.35);
  });

  it("requires score before wave roll; waves and community progress", () => {
    const now = Date.parse("2026-07-18T17:00:00Z");
    activateRiftStorm({ skipWarning: true, global: true, now, intensity: "MINOR" });
    const low = rollStormWave({ userId: "p1", now, rng: () => 0 });
    expect(low.ok).toBe(false);

    for (let i = 0; i < 3; i++) {
      const part = recordStormParticipation({
        userId: "p1",
        action: "PUBLIC_EVENT",
        now: now + i,
      });
      expect(part.ok).toBe(true);
    }

    const roll = rollStormWave({
      userId: "p1",
      now: now + 10,
      waveId: "WAVE_1",
      rng: () => 0,
    });
    expect(roll.ok).toBe(true);

    const dup = rollStormWave({
      userId: "p1",
      now: now + 11,
      waveId: "WAVE_1",
      rng: () => 0,
    });
    expect(dup.ok).toBe(false);
  });

  it("cancels storm in emergency", () => {
    activateRiftStorm({ skipWarning: true, now: Date.now() });
    const ended = cancelRiftStorm("test cancel");
    expect(ended.phase).toBe("CANCELLED");
    expect(ended.active).toBe(false);
  });

  it("SOL grant fails safely when flag off and substitutes non-SOL", () => {
    expect(canAttemptStormSol().ok).toBe(false);
    const attempt = attemptStormSolGrant({
      userId: "sol-user",
      walletAddress: "Wallet111",
      poolLamports: 1_000_000,
      grantedThisStorm: 0,
      grantsThisStorm: 0,
      userGrantsToday: 0,
      fraudRisk: 0,
      alreadyGrantedKey: false,
      dayKey: "2026-07-18",
    });
    expect(attempt.attempt.granted).toBe(false);
    expect(attempt.attempt.substitutedNonSol).toBe(true);
    expect(attempt.substitute?.kind).toBe("CREDITS");
  });

  it("detects newly qualified by intensity threshold", () => {
    expect(isNewlyQualified(0, 20, "MINOR")).toBe(true);
    expect(isNewlyQualified(20, 25, "MINOR")).toBe(false);
  });

  it("anti-AFK meaningful activity helper", () => {
    expect(hasMeaningfulActivity([]).ok).toBe(false);
    const log = appendActivity([], "COMBAT");
    expect(hasMeaningfulActivity(log).ok).toBe(true);
  });

  it("deterministic weighted roll is stable with fixed rng", () => {
    const a = rollAirdrop(DAILY_AIRDROP_TABLE, "GOLD", 0, () => 0.1);
    const b = rollAirdrop(DAILY_AIRDROP_TABLE, "GOLD", 0, () => 0.1);
    expect(a?.reward.id).toBe(b?.reward.id);
  });
});
