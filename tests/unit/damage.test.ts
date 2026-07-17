import { describe, expect, it } from "vitest";
import { calculateDamage, rollCritical } from "@/game/combat/damage";
import { getAffinityModifier, getMatchup } from "@/game/creatures/affinity";
import { applyCareDecay, applyCareAction, deriveLifecycle } from "@/game/creatures/care";
import { evaluateTokenTier } from "@/lib/solana/token-balance";

describe("damage formula", () => {
  it("applies affinity and caps minimum damage", () => {
    const result = calculateDamage({
      abilityPower: 40,
      attackerStat: 50,
      defenderStat: 40,
      affinityModifier: getAffinityModifier("EMBER", "GROVE"),
      attackerLevel: 5,
      randomFactor: 1,
      isCritical: false,
    });
    expect(result.finalDamage).toBeGreaterThanOrEqual(1);
    expect(getMatchup("EMBER", "GROVE")).toBe("STRONG");
  });

  it("rolls criticals from bps", () => {
    expect(rollCritical(1000, 999)).toBe(true);
    expect(rollCritical(1000, 1000)).toBe(false);
  });
});

describe("care decay", () => {
  it("decays over elapsed hours", () => {
    const next = applyCareDecay(
      { hunger: 80, happiness: 80, hygiene: 80, energy: 80, bond: 40, health: 100 },
      12,
    );
    expect(next.hunger).toBeLessThan(80);
    expect(applyCareAction(next, "FEED").hunger).toBeGreaterThan(next.hunger);
  });

  it("derives dormant before memorial when death disabled", () => {
    expect(
      deriveLifecycle(
        { hunger: 20, happiness: 20, hygiene: 20, energy: 20, bond: 5, health: 50 },
        false,
      ),
    ).toBe("DORMANT");
  });
});

describe("token tiers", () => {
  it("evaluates thresholds", () => {
    expect(evaluateTokenTier(0n)).toBe("VISITOR");
    expect(evaluateTokenTier(1_000_000n)).toBe("KEEPER");
    expect(evaluateTokenTier(1_000_000_000n)).toBe("FOUNDER");
  });
});
