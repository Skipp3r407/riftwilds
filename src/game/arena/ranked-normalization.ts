/**
 * Ranked / Arena combat normalization.
 * Marketplace value should come from cosmetics, tactics, and flexibility —
 * not unbeatable DPS from rare/paid upgrades.
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { normalizeEquipAttackBonus } from "@/game/arena/weapons";

export const RANKED_NORMALIZATION = {
  /** Cap equipment attack bonus vs base attack (Option A). */
  equipAttackBonusCapOfBase: 0.18,
  /** Soft-cap paid ability power uplift vs kit baseline. */
  paidAbilityPowerCapBps: 800,
  /** Ranked battles normalize combatant level to this band midpoint. */
  normalizedLevel: 20,
  levelBand: { min: 1, max: 50 },
  /** Base stats are recomputed at normalized level — ignore raw overleveling. */
  normalizeLevel: true,
  normalizeBaseStats: true,
  normalizeEquipmentPower: true,
  normalizePaidAbilityUpgrades: true,
  disclosures: {
    ranked:
      "Ranked Arena normalizes level, base stats, equipment power, and paid ability upgrades. Cosmetics and loadout choice remain visible.",
    marketplace:
      "Rare or paid abilities do not create unbeatable ranked pets. Collection value is not the same as ranked combat power.",
  },
} as const;

export type RankedNormalizeInput = {
  level: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseMaxHp: number;
  equipAttackBonus: number;
  equipDefenseBonus: number;
  equipSpeedBonus: number;
  equipMaxHpBonus: number;
  /** Ability power after any paid upgrades (pre-cap). */
  abilityPower: number;
  /** Baseline kit power before paid upgrades. */
  abilityBaselinePower: number;
  paidUpgradeApplied?: boolean;
};

export type RankedNormalizeResult = {
  level: number;
  attack: number;
  defense: number;
  speed: number;
  maxHp: number;
  abilityPower: number;
  equipAttackBonusApplied: number;
  flags: {
    equipmentNormalized: boolean;
    abilityNormalized: boolean;
    levelNormalized: boolean;
  };
};

function scaleStatToLevel(statAtLevel: number, fromLevel: number, toLevel: number): number {
  const from = Math.max(1, fromLevel);
  const to = Math.max(1, toLevel);
  // Approximate linear RPG curve used by training combatants.
  const base = statAtLevel - from * 2;
  return Math.max(1, Math.round(base + to * 2));
}

export function applyRankedNormalization(
  input: RankedNormalizeInput,
  enabled = isFeatureEnabled("RANKED_EQUIPMENT_NORMALIZATION_ENABLED"),
): RankedNormalizeResult {
  if (!enabled) {
    return {
      level: input.level,
      attack: input.baseAttack + input.equipAttackBonus,
      defense: input.baseDefense + input.equipDefenseBonus,
      speed: input.baseSpeed + input.equipSpeedBonus,
      maxHp: input.baseMaxHp + input.equipMaxHpBonus,
      abilityPower: input.abilityPower,
      equipAttackBonusApplied: input.equipAttackBonus,
      flags: {
        equipmentNormalized: false,
        abilityNormalized: false,
        levelNormalized: false,
      },
    };
  }

  const level = RANKED_NORMALIZATION.normalizeLevel
    ? RANKED_NORMALIZATION.normalizedLevel
    : input.level;

  let attack = input.baseAttack;
  let defense = input.baseDefense;
  let speed = input.baseSpeed;
  let maxHp = input.baseMaxHp;

  if (RANKED_NORMALIZATION.normalizeBaseStats && input.level !== level) {
    attack = scaleStatToLevel(input.baseAttack, input.level, level);
    defense = scaleStatToLevel(input.baseDefense, input.level, level);
    speed = scaleStatToLevel(input.baseSpeed, input.level, level);
    maxHp = scaleStatToLevel(input.baseMaxHp, input.level, level);
  }

  let equipAtk = input.equipAttackBonus;
  let equipDef = input.equipDefenseBonus;
  let equipSpd = input.equipSpeedBonus;
  let equipHp = input.equipMaxHpBonus;

  if (RANKED_NORMALIZATION.normalizeEquipmentPower) {
    equipAtk = normalizeEquipAttackBonus(equipAtk, attack);
    const defCap = Math.floor(defense * RANKED_NORMALIZATION.equipAttackBonusCapOfBase);
    const spdCap = Math.floor(speed * RANKED_NORMALIZATION.equipAttackBonusCapOfBase);
    const hpCap = Math.floor(maxHp * RANKED_NORMALIZATION.equipAttackBonusCapOfBase);
    equipDef = Math.min(Math.max(0, equipDef), defCap);
    equipSpd = Math.min(Math.max(0, equipSpd), spdCap);
    equipHp = Math.min(Math.max(0, equipHp), hpCap);
  }

  let abilityPower = input.abilityPower;
  if (RANKED_NORMALIZATION.normalizePaidAbilityUpgrades && input.paidUpgradeApplied) {
    const baseline = Math.max(0, input.abilityBaselinePower);
    const maxPower =
      baseline + Math.floor((baseline * RANKED_NORMALIZATION.paidAbilityPowerCapBps) / 10_000);
    abilityPower = Math.min(abilityPower, maxPower);
  }

  return {
    level,
    attack: attack + equipAtk,
    defense: defense + equipDef,
    speed: speed + equipSpd,
    maxHp: maxHp + equipHp,
    abilityPower,
    equipAttackBonusApplied: equipAtk,
    flags: {
      equipmentNormalized: RANKED_NORMALIZATION.normalizeEquipmentPower,
      abilityNormalized: RANKED_NORMALIZATION.normalizePaidAbilityUpgrades,
      levelNormalized: RANKED_NORMALIZATION.normalizeLevel,
    },
  };
}

export function serializeRankedNormalization() {
  return {
    ...RANKED_NORMALIZATION,
    flag: "RANKED_EQUIPMENT_NORMALIZATION_ENABLED",
    flagDefault: isFeatureEnabled("RANKED_EQUIPMENT_NORMALIZATION_ENABLED"),
  };
}
