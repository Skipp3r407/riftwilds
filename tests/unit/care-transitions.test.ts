import { describe, expect, it } from "vitest";
import {
  applyCareAction,
  applyCareDecay,
  deriveLifecycle,
  derivePetCondition,
  DEFAULT_CARE_STATS,
  isPublicDisplayAllowed,
} from "@/game/creatures/care";

describe("care transitions", () => {
  it("decays into hungry/thirsty and recovers with actions", () => {
    // Offline hours after 8h decay at 35% — use a long gap to leave HEALTHY.
    let care = applyCareDecay(DEFAULT_CARE_STATS, 120);
    expect(["HUNGRY", "THIRSTY", "UNHAPPY", "DIRTY", "TIRED", "SICK", "DORMANT", "CRITICAL"]).toContain(
      derivePetCondition(care, false),
    );
    care = applyCareAction(care, "FEED");
    care = applyCareAction(care, "GIVE_WATER");
    care = applyCareAction(care, "PLAY");
    care = applyCareAction(care, "CLEAN");
    care = applyCareAction(care, "REST");
    const condition = derivePetCondition(care, false);
    expect(["HEALTHY", "TIRED", "UNHAPPY"]).toContain(condition);
  });

  it("lifecycle and public display rules", () => {
    const healthy = deriveLifecycle(DEFAULT_CARE_STATS, false);
    expect(["THRIVING", "HAPPY", "STABLE", "TIRED"]).toContain(healthy);
    expect(isPublicDisplayAllowed(derivePetCondition(DEFAULT_CARE_STATS, false))).toBe(true);

    const critical = applyCareDecay(
      { ...DEFAULT_CARE_STATS, health: 5, hunger: 0, thirst: 0 },
      72,
    );
    const condition = derivePetCondition(critical, true);
    expect(["CRITICAL", "DECEASED", "DORMANT", "SICK"]).toContain(condition);
    expect(isPublicDisplayAllowed(condition)).toBe(false);
  });
});
