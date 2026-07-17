import { describe, expect, it } from "vitest";
import {
  arenaPointsForResult,
  chooseAiAction,
  createTrainingBattle,
  resolveRound,
} from "@/game/arena/engine";
import { buildCombatant, buildTrainingAi } from "@/game/arena/combatants";
import {
  ARENA_MATCHUP_MOD,
  getArenaAffinityModifier,
  getArenaMatchup,
} from "@/game/arena/affinity-matrix";
import { normalizeEquipAttackBonus, STARTER_WEAPONS } from "@/game/arena/weapons";
import { REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

describe("arena affinity", () => {
  it("keeps modest modifiers", () => {
    expect(ARENA_MATCHUP_MOD.STRONG_ADV).toBeLessThanOrEqual(1.25);
    expect(ARENA_MATCHUP_MOD.STRONG_RESIST).toBeGreaterThanOrEqual(0.75);
    expect(getArenaMatchup("EMBER", "FROST")).toBe("STRONG_ADV");
    expect(getArenaAffinityModifier("EMBER", "FROST")).toBe(1.25);
  });
});

describe("equipment normalization", () => {
  it("caps attack bonus near 18%", () => {
    expect(normalizeEquipAttackBonus(40, 100)).toBe(18);
    expect(normalizeEquipAttackBonus(5, 100)).toBe(5);
  });

  it("ships ten starter weapons", () => {
    expect(STARTER_WEAPONS.length).toBeGreaterThanOrEqual(10);
  });
});

describe("training battle engine", () => {
  it("resolves a deterministic round and can complete a fight", () => {
    const player = buildCombatant({
      id: "p1",
      name: "Tester",
      speciesSlug: "cindercub",
      affinity: "EMBER",
      level: 8,
      weaponId: "ember-talons",
      normalizeEquipment: true,
    });
    const ai = buildTrainingAi("GROVE");
    let state = createTrainingBattle({
      publicId: "trn_test",
      seed: "fixed-seed-arena-1",
      player,
      opponent: ai,
    });

    for (let i = 0; i < 40 && state.status === "ACTIVE"; i++) {
      const playerAction = { kind: "BASIC_ATTACK" as const };
      const aiAction = chooseAiAction(state.combatants[1]!);
      state = resolveRound(state, [playerAction, aiAction]);
    }

    expect(state.round).toBeGreaterThan(0);
    expect(state.events.some((e) => e.type === "ROUND_STARTED")).toBe(true);
    if (state.status === "COMPLETED") {
      expect(["FAINT", "SURRENDER", "MAX_ROUNDS"]).toContain(state.completionReason);
    }
  });

  it("awards non-financial training points", () => {
    expect(arenaPointsForResult({ training: true, won: true })).toBeGreaterThan(0);
    expect(arenaPointsForResult({ training: true, won: false })).toBeGreaterThan(0);
  });

  it("keeps real-value wagering hard-disabled", () => {
    expect(REAL_VALUE_WAGERING_ENABLED).toBe(false);
    expect(featureFlagDefaults.ARENA_ENABLED).toBe(true);
    expect(
      "REAL_VALUE_WAGERING_ENABLED" in featureFlagDefaults,
    ).toBe(false);
  });
});
