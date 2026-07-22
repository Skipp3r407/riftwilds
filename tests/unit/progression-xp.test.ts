import { beforeEach, describe, expect, it } from "vitest";
import { evaluateAntiFarm, repeatOpponentMultiplier } from "@/lib/progression/anti-farm";
import { resolveBoostPercent, BOOST_PERCENTS } from "@/lib/progression/boosts";
import { calculateXpGrant } from "@/lib/progression/calc";
import { comboBonusPercent } from "@/lib/progression/combo";
import { applyXpGain, getXPForLevel } from "@/lib/progression/formula";
import {
  grantBattleXp,
  grantXp,
  resetProgressionStoreForTests,
  emptyProgressionState,
  saveProgressionState,
} from "@/lib/progression";
import { applyRestedXp, computeRestedPoolGain, RESTED_OFFLINE_MS } from "@/lib/progression/rested";
import { rewardsForLevel, rewardsForLevelRange } from "@/lib/progression/rewards";
import { XP_SOURCE_AMOUNTS } from "@/lib/progression/sources";

describe("XP formula", () => {
  it("matches floor(100 * level^1.8)", () => {
    expect(getXPForLevel(1)).toBe(Math.floor(100 * Math.pow(1, 1.8)));
    expect(getXPForLevel(5)).toBe(Math.floor(100 * Math.pow(5, 1.8)));
    expect(getXPForLevel(10)).toBe(Math.floor(100 * Math.pow(10, 1.8)));
  });

  it("supports multi-level gains without losing excess XP", () => {
    const result = applyXpGain({ level: 1, currentXp: 0, lifetimeXp: 0 }, 10_000);
    expect(result.levelsGained).toBeGreaterThan(1);
    expect(result.lifetimeXp).toBe(10_000);
    expect(result.currentXp).toBeLessThan(getXPForLevel(result.level));
    // Excess preserved: re-applying 0 keeps same current
    const again = applyXpGain(result, 0);
    expect(again.currentXp).toBe(result.currentXp);
    expect(again.level).toBe(result.level);
  });
});

describe("combo bonus", () => {
  it("tiers 2/4/6/10 → 10/20/30/50%", () => {
    expect(comboBonusPercent(1)).toBe(0);
    expect(comboBonusPercent(2)).toBe(10);
    expect(comboBonusPercent(4)).toBe(20);
    expect(comboBonusPercent(6)).toBe(30);
    expect(comboBonusPercent(10)).toBe(50);
  });
});

describe("anti-farm", () => {
  it("denies AFK, bot, and surrender farm", () => {
    expect(evaluateAntiFarm({ afk: true }).allowed).toBe(false);
    expect(evaluateAntiFarm({ botMatch: true }).allowed).toBe(false);
    expect(
      evaluateAntiFarm({ surrendered: true, isBattleSource: true }).allowed,
    ).toBe(false);
  });

  it("diminishes repeat wins vs same opponent", () => {
    expect(repeatOpponentMultiplier(0)).toBe(1);
    expect(repeatOpponentMultiplier(1)).toBe(0.7);
    expect(repeatOpponentMultiplier(2)).toBe(0.4);
    expect(repeatOpponentMultiplier(5)).toBe(0.15);
  });
});

describe("boosts + rested", () => {
  it("stacks premium + weekend + holiday", () => {
    const pct = resolveBoostPercent({
      premium: true,
      weekend: true,
      holiday: true,
    });
    expect(pct).toBe(
      BOOST_PERCENTS.premium + BOOST_PERCENTS.weekend + BOOST_PERCENTS.holiday,
    );
  });

  it("doubles XP from rested pool until empty", () => {
    const r = applyRestedXp({ baseAfterOtherBonuses: 40, restedPool: 25 });
    expect(r.total).toBe(65);
    expect(r.restedApplied).toBe(25);
    expect(r.poolRemaining).toBe(0);
  });

  it("fills rested pool after 12h offline", () => {
    const now = Date.now();
    const gain = computeRestedPoolGain({
      lastSeenAt: now - RESTED_OFFLINE_MS - 3 * 60 * 60 * 1000,
      now,
      currentPool: 0,
    });
    expect(gain).toBeGreaterThan(0);
  });
});

describe("level rewards", () => {
  it("grants skill point every 5 and prestige unlock at 100", () => {
    const five = rewardsForLevel(5);
    expect(five.some((r) => r.kind === "skill_point")).toBe(true);
    const hundred = rewardsForLevel(100);
    expect(hundred.some((r) => r.kind === "prestige_unlock")).toBe(true);
    const range = rewardsForLevelRange(9, 10);
    expect(range.some((r) => r.kind === "cosmetic")).toBe(true);
  });
});

describe("grantXp service", () => {
  beforeEach(() => {
    resetProgressionStoreForTests();
  });

  it("grants battle win from table amount", () => {
    const result = grantXp({
      ownerKey: "test-keeper",
      source: "BATTLE_WIN",
      requestId: "t1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.granted).toBeGreaterThanOrEqual(XP_SOURCE_AMOUNTS.BATTLE_WIN);
    expect(result.after.lifetimeXp).toBe(result.granted);
  });

  it("rejects client-style zero when anti-farm denies", () => {
    const result = grantXp({
      ownerKey: "test-keeper",
      source: "BATTLE_WIN",
      context: { afk: true },
    });
    expect(result.ok).toBe(false);
  });

  it("applies combo across categories", () => {
    grantXp({ ownerKey: "c1", source: "BATTLE_WIN", requestId: "a" });
    grantXp({ ownerKey: "c1", source: "QUEST_SMALL", requestId: "b" });
    const state = emptyProgressionState("unused");
    saveProgressionState({
      ...state,
      ownerKey: "c1",
      comboActivities: ["BATTLE", "QUEST", "RIFTLING", "CRAFTING"],
      comboWindowStartedAt: Date.now(),
    });
    const calc = calculateXpGrant({
      source: "MARKET_SELL",
      state: {
        ...emptyProgressionState("c1"),
        comboActivities: ["BATTLE", "QUEST", "RIFTLING", "CRAFTING"],
        comboWindowStartedAt: Date.now(),
      },
    });
    expect(calc.breakdown.comboPercent).toBeGreaterThanOrEqual(20);
  });

  it("idempotent match battle grants", () => {
    const a = grantBattleXp({
      ownerKey: "b1",
      won: true,
      matchId: "m-1",
    });
    const b = grantBattleXp({
      ownerKey: "b1",
      won: true,
      matchId: "m-1",
    });
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    if (a.ok && b.ok) {
      expect(b.idempotentReplay).toBe(true);
      expect(b.granted).toBe(0);
    }
  });
});
