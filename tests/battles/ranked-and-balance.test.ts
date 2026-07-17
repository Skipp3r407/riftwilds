import { describe, expect, it } from "vitest";
import { applyRankedNormalization, RANKED_NORMALIZATION } from "@/game/arena/ranked-normalization";
import {
  chooseAiAction,
  createTrainingBattle,
  resolveRound,
} from "@/game/arena/engine";
import { buildCombatant, buildTrainingAi } from "@/game/arena/combatants";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import { createPetPair } from "../factories/pet-factory";
import { REAL_VALUE_WAGERING_ENABLED } from "@/lib/config/arena";

describe("ranked normalization", () => {
  it("caps paid ability uplift and equipment", () => {
    const result = applyRankedNormalization({
      level: 50,
      baseAttack: 100,
      baseDefense: 80,
      baseSpeed: 70,
      baseMaxHp: 200,
      equipAttackBonus: 80,
      equipDefenseBonus: 40,
      equipSpeedBonus: 40,
      equipMaxHpBonus: 100,
      abilityPower: 200,
      abilityBaselinePower: 100,
      paidUpgradeApplied: true,
    });
    expect(result.flags.equipmentNormalized).toBe(true);
    expect(result.flags.abilityNormalized).toBe(true);
    expect(result.level).toBe(RANKED_NORMALIZATION.normalizedLevel);
    expect(result.equipAttackBonusApplied).toBeLessThanOrEqual(
      Math.round(100 * RANKED_NORMALIZATION.equipAttackBonusCapOfBase),
    );
  });
});

describe("battle balance sample", () => {
  it("runs a practical multi-match sample without wagering", () => {
    expect(REAL_VALUE_WAGERING_ENABLED).toBe(false);
    const MATCHES = 200;
    let completed = 0;
    const wins = new Map<string, number>();

    for (let i = 0; i < MATCHES; i++) {
      const sp = LAUNCH_SPECIES[i % LAUNCH_SPECIES.length]!;
      const player = buildCombatant({
        id: `p_${i}`,
        name: sp.name,
        speciesSlug: sp.slug,
        affinity: sp.affinity as never,
        level: 10,
        weaponId: "ember-talons",
        normalizeEquipment: true,
      });
      const ai = buildTrainingAi("STONE");
      let state = createTrainingBattle({
        publicId: `bal_${i}`,
        seed: `unit-balance-${i}`,
        player,
        opponent: ai,
      });
      for (let r = 0; r < 40 && state.status === "ACTIVE"; r++) {
        state = resolveRound(state, [
          { kind: "BASIC_ATTACK" },
          chooseAiAction(state.combatants[1]!),
        ]);
      }
      if (state.status === "COMPLETED") {
        completed++;
        if (state.winnerId === player.id) {
          wins.set(sp.affinity, (wins.get(sp.affinity) ?? 0) + 1);
        }
      }
    }

    expect(completed).toBeGreaterThan(MATCHES * 0.5);
    expect(wins.size).toBeGreaterThan(0);
  });

  it("factory pairs can build combatants", () => {
    const [a, b] = createPetPair("ashwing", "coralurge", "arena");
    const ca = buildCombatant({
      id: a.publicId,
      name: a.name,
      speciesSlug: a.speciesSlug,
      affinity: a.affinity as never,
      level: 12,
      normalizeEquipment: true,
    });
    const cb = buildCombatant({
      id: b.publicId,
      name: b.name,
      speciesSlug: b.speciesSlug,
      affinity: b.affinity as never,
      level: 12,
      normalizeEquipment: true,
    });
    expect(ca.maxHp).toBeGreaterThan(0);
    expect(cb.maxHp).toBeGreaterThan(0);
  });
});
