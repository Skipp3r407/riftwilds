import { beforeEach, describe, expect, it } from "vitest";
import {
  applyCareAction,
  applyCareDecay,
  careGameplayModifiers,
  displayCarePercent,
  displayCareStats,
  CARE_DISCOVERY_BONUS_CAP,
  DEFAULT_CARE_STATS,
} from "@/game/creatures/care";
import {
  CARE_ACTION_DEFS,
  CARE_FOOD_CATALOG,
  CARE_STREAK_MILESTONES,
  advanceCareStreak,
  newlyReachedMilestones,
  pickNeedMessage,
  DEFAULT_CARE_PROGRESS,
} from "@/game/creatures/care-catalog";
import {
  performCareAction,
  resetCareServiceForTests,
} from "@/game/creatures/care-service";
import { createPet } from "../factories/pet-factory";
import {
  ensureStarterCredits,
  getCreditBalance,
  getEconomyHealth,
  resetCreditLedgerForTests,
} from "@/lib/credits";
import { savePet } from "@/game/eggs/hatchery-store";

describe("pet care economy", () => {
  beforeEach(() => {
    resetCreditLedgerForTests();
    resetCareServiceForTests();
  });

  it("displays rounded percents", () => {
    expect(displayCarePercent(79.957)).toBe(80);
    expect(displayCareStats({ hunger: 33.3 }).hunger).toBe(33);
  });

  it("reduces offline decay after the first 8 hours", () => {
    const fullDay = applyCareDecay(DEFAULT_CARE_STATS, 24);
    const eightHours = applyCareDecay(DEFAULT_CARE_STATS, 8);
    // 24h effective = 8 + 16*0.35 = 13.6h — hungrier than 8h but not 24× rate
    expect(fullDay.hunger).toBeLessThan(eightHours.hunger);
    const naive24 = DEFAULT_CARE_STATS.hunger - 24 * 1.2;
    expect(fullDay.hunger).toBeGreaterThan(naive24);
  });

  it("caps bond discovery bonus", () => {
    const mods = careGameplayModifiers({ ...DEFAULT_CARE_STATS, bond: 100 });
    expect(mods.discoveryBonus).toBeLessThanOrEqual(CARE_DISCOVERY_BONUS_CAP);
  });

  it("defines free Pet / Rest / Sleep and energy-only Adventure", () => {
    expect(CARE_ACTION_DEFS.PET.creditCost).toBe(0);
    expect(CARE_ACTION_DEFS.REST.creditCost).toBe(0);
    expect(CARE_ACTION_DEFS.SLEEP.creditCost).toBe(0);
    expect(CARE_ACTION_DEFS.ADVENTURE.creditCost).toBe(0);
    expect(CARE_ACTION_DEFS.ADVENTURE.energyCost).toBeGreaterThan(0);
    expect(CARE_ACTION_DEFS.FEED.creditCost).toBeGreaterThan(0);
  });

  it("has food catalog with shop and craft hooks", () => {
    expect(CARE_FOOD_CATALOG.length).toBeGreaterThan(2);
    expect(CARE_FOOD_CATALOG.some((i) => i.craftRecipeId)).toBe(true);
    expect(CARE_FOOD_CATALOG.every((i) => Number.isInteger(i.shopPriceCredits))).toBe(true);
  });

  it("streak milestones grant titles not Credits", () => {
    expect(CARE_STREAK_MILESTONES.map((m) => m.days)).toEqual([7, 14, 30, 90, 365]);
    const hit = newlyReachedMilestones(6, 7);
    expect(hit[0]?.badgeId).toBe("care_streak_7");
    expect(hit[0]?.title).toBeTruthy();
  });

  it("rate-limits need messages by severity order", () => {
    const thirsty = pickNeedMessage(
      { ...DEFAULT_CARE_STATS, thirst: 10, hunger: 10 },
      "Bubbles",
    );
    expect(thirsty?.tone).toBe("thirsty");
  });

  it("debits Credits via ledger before applying paid care", () => {
    const pet = createPet({ ownerKey: "keeper_care_1", seed: "care-eco-1" });
    pet.lastDecayAt = new Date().toISOString();
    savePet(pet);
    ensureStarterCredits(pet.ownerKey);
    const before = getCreditBalance(pet.ownerKey);
    const hungerBefore = pet.care.hunger;
    const cost = CARE_ACTION_DEFS.FEED.creditCost;

    const result = performCareAction({
      ownerKey: pet.ownerKey,
      petPublicId: pet.publicId,
      action: "FEED",
      requestId: "care_feed_test_001",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.creditCost).toBe(cost);
    expect(result.creditsBalance).toBe(before - cost);
    expect(result.pet.care.hunger).toBeGreaterThan(hungerBefore);
    expect(result.pet.careProgress.careXp).toBeGreaterThan(0);
    expect(result.journalEntry.action).toBe("FEED");

    const health = getEconomyHealth();
    expect(health.sinkTotals.CARE_ACTION ?? 0).toBeGreaterThanOrEqual(cost);
  });

  it("replays idempotent paid care without double debit", () => {
    const pet = createPet({ ownerKey: "keeper_care_2", seed: "care-eco-2" });
    pet.lastDecayAt = new Date().toISOString();
    savePet(pet);
    ensureStarterCredits(pet.ownerKey);
    const req = {
      ownerKey: pet.ownerKey,
      petPublicId: pet.publicId,
      action: "FEED" as const,
      requestId: "care_feed_idem_001",
    };
    const first = performCareAction(req);
    const mid = getCreditBalance(pet.ownerKey);
    const second = performCareAction(req);
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.idempotentReplay).toBe(true);
    expect(getCreditBalance(pet.ownerKey)).toBe(mid);
  });

  it("allows free Pet without Credits spend", () => {
    const pet = createPet({ ownerKey: "keeper_care_3", seed: "care-eco-3" });
    pet.lastDecayAt = new Date().toISOString();
    savePet(pet);
    ensureStarterCredits(pet.ownerKey);
    const before = getCreditBalance(pet.ownerKey);
    const result = performCareAction({
      ownerKey: pet.ownerKey,
      petPublicId: pet.publicId,
      action: "PET",
      requestId: "care_pet_free_001",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.creditCost).toBe(0);
    expect(result.creditsBalance).toBe(before);
    expect(applyCareAction(DEFAULT_CARE_STATS, "PET").happiness).toBeGreaterThan(
      DEFAULT_CARE_STATS.happiness,
    );
  });

  it("blocks Adventure when energy is too low", () => {
    const pet = createPet({
      ownerKey: "keeper_care_4",
      seed: "care-eco-4",
      care: { energy: 5 },
    });
    pet.lastDecayAt = new Date().toISOString();
    savePet(pet);
    ensureStarterCredits(pet.ownerKey);
    const result = performCareAction({
      ownerKey: pet.ownerKey,
      petPublicId: pet.publicId,
      action: "ADVENTURE",
      requestId: "care_adv_low_001",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("INSUFFICIENT_ENERGY");
  });

  it("advances care streak across days", () => {
    const day1 = advanceCareStreak({ ...DEFAULT_CARE_PROGRESS }, Date.parse("2026-07-01T12:00:00Z"));
    expect(day1.progress.careStreak).toBe(1);
    const day2 = advanceCareStreak(
      day1.progress,
      Date.parse("2026-07-02T12:00:00Z"),
    );
    expect(day2.progress.careStreak).toBe(2);
  });
});
