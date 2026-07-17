import { describe, expect, it } from "vitest";
import {
  applyCareAction,
  applyCareDecay,
  careScore,
  DEFAULT_CARE_STATS,
  derivePetCondition,
  isPublicDisplayAllowed,
} from "@/game/creatures/care";

describe("pet care", () => {
  it("decays needs over hours without killing quickly", () => {
    const afterDay = applyCareDecay(DEFAULT_CARE_STATS, 24);
    expect(afterDay.hunger).toBeLessThan(DEFAULT_CARE_STATS.hunger);
    expect(afterDay.thirst).toBeLessThan(DEFAULT_CARE_STATS.thirst);
    expect(afterDay.health).toBe(100);
    expect(derivePetCondition(afterDay, false)).not.toBe("DECEASED");
  });

  it("feed and water restore needs", () => {
    const low = { ...DEFAULT_CARE_STATS, hunger: 20, thirst: 15 };
    const fed = applyCareAction(low, "FEED");
    const watered = applyCareAction(fed, "GIVE_WATER");
    expect(watered.hunger).toBeGreaterThan(40);
    expect(watered.thirst).toBeGreaterThan(40);
  });

  it("critical pets are hidden from public display", () => {
    const critical = derivePetCondition(
      { ...DEFAULT_CARE_STATS, health: 10, hunger: 5, thirst: 5, happiness: 5 },
      false,
    );
    expect(critical).toBe("CRITICAL");
    expect(isPublicDisplayAllowed(critical)).toBe(false);
  });

  it("permanent death stays off unless flagged", () => {
    const deadish = { ...DEFAULT_CARE_STATS, health: 0 };
    expect(derivePetCondition(deadish, false)).toBe("CRITICAL");
    expect(derivePetCondition(deadish, true)).toBe("DECEASED");
  });

  it("computes a care score", () => {
    expect(careScore(DEFAULT_CARE_STATS)).toBeGreaterThan(50);
  });
});
