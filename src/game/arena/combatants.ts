import type { AffinityName } from "@prisma/client";
import { abilitiesForAffinity, abilitiesForSpecies } from "@/game/arena/abilities";
import { getWeapon, normalizeEquipAttackBonus } from "@/game/arena/weapons";
import type { ArenaCombatant } from "@/game/arena/types";
import { applyRankedNormalization } from "@/game/arena/ranked-normalization";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";
import {
  affinityPowerBonusBps,
  applyTraitHooks,
  scaleSpeciesStats,
} from "@/game/creatures/rpg-types";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type TrainingPetInput = {
  id: string;
  name: string;
  speciesSlug: string;
  affinity: AffinityName;
  level?: number;
  weaponId?: string;
  /** When true, equip bonuses are capped (training / casual Option A). */
  normalizeEquipment?: boolean;
  /** Full ranked path: level, base stats, equipment, paid ability upgrades. */
  rankedMode?: boolean;
};

function defaultStats(level: number) {
  const L = Math.max(1, Math.min(50, level));
  return {
    maxHp: 80 + L * 12,
    attack: 28 + L * 3,
    defense: 24 + L * 2,
    speed: 20 + L * 2,
    accuracy: 70 + L,
    evasion: 10 + Math.floor(L / 2),
    focus: 15 + L,
    critChanceBps: 800 + L * 20,
    maxEnergy: 100,
  };
}

export function buildCombatant(input: TrainingPetInput): ArenaCombatant {
  const rawLevel = input.level ?? 5;
  const species = getSpeciesBySlug(input.speciesSlug);
  const traits = species?.traits ?? [];
  const baseScaled = species
    ? applyTraitHooks(scaleSpeciesStats(species.baseStats, rawLevel), traits)
    : defaultStats(rawLevel);

  const weapon = input.weaponId ? getWeapon(input.weaponId) : undefined;
  const rankedMode =
    input.rankedMode === true && isFeatureEnabled("RANKED_EQUIPMENT_NORMALIZATION_ENABLED");
  const equipNormalize = input.normalizeEquipment === true || rankedMode;

  let level = rawLevel;
  let attack = baseScaled.attack;
  let defense = baseScaled.defense;
  let speed = baseScaled.speed;
  let maxHp = baseScaled.maxHp;

  if (rankedMode) {
    const ranked = applyRankedNormalization(
      {
        level: rawLevel,
        baseAttack: baseScaled.attack,
        baseDefense: baseScaled.defense,
        baseSpeed: baseScaled.speed,
        baseMaxHp: baseScaled.maxHp,
        equipAttackBonus: weapon?.attackBonus ?? 0,
        equipDefenseBonus: weapon?.defenseBonus ?? 0,
        equipSpeedBonus: weapon?.speedBonus ?? 0,
        equipMaxHpBonus: 0,
        abilityPower: 100,
        abilityBaselinePower: 100,
        paidUpgradeApplied: false,
      },
      true,
    );
    level = ranked.level;
    attack = ranked.attack;
    defense = ranked.defense;
    speed = ranked.speed;
    maxHp = ranked.maxHp;
  } else if (weapon) {
    let atkBonus = weapon.attackBonus;
    if (equipNormalize) {
      atkBonus = normalizeEquipAttackBonus(atkBonus, attack);
    }
    attack += atkBonus;
    defense += weapon.defenseBonus;
    speed += weapon.speedBonus;
  }

  const affBps = affinityPowerBonusBps(traits);
  const rawAbilities =
    abilitiesForSpecies(input.speciesSlug, input.affinity) ??
    abilitiesForAffinity(input.affinity);
  const abilities = rawAbilities.map((ab) => {
    if (!affBps || ab.id === "basic-strike" || ab.power <= 0) return ab;
    if (ab.category !== "AFFINITY" && ab.category !== "ULTIMATE" && ab.category !== "PHYSICAL") {
      return ab;
    }
    let power = Math.round(ab.power * (1 + affBps / 10000));
    if (rankedMode) {
      const norm = applyRankedNormalization(
        {
          level,
          baseAttack: attack,
          baseDefense: defense,
          baseSpeed: speed,
          baseMaxHp: maxHp,
          equipAttackBonus: 0,
          equipDefenseBonus: 0,
          equipSpeedBonus: 0,
          equipMaxHpBonus: 0,
          abilityPower: power,
          abilityBaselinePower: ab.power,
          paidUpgradeApplied: true,
        },
        true,
      );
      power = norm.abilityPower;
    }
    return { ...ab, power };
  });

  return {
    id: input.id,
    name: input.name,
    speciesSlug: input.speciesSlug,
    affinity: input.affinity,
    level,
    maxHp,
    hp: maxHp,
    attack,
    defense,
    speed,
    accuracy: baseScaled.accuracy,
    evasion: baseScaled.evasion,
    focus: baseScaled.focus,
    critChanceBps: baseScaled.critChanceBps,
    energy: baseScaled.maxEnergy,
    maxEnergy: baseScaled.maxEnergy,
    abilities,
    statuses: [],
    defending: false,
    focusing: false,
    weaponId: weapon?.id,
    equipMod: 1,
  };
}

export function buildTrainingAi(affinity: AffinityName = "STONE"): ArenaCombatant {
  const byAffinity: Partial<Record<AffinityName, string>> = {
    EMBER: "cindercub",
    TIDE: "bubbloon",
    GROVE: "mossprig",
    STORM: "voltkit",
    STONE: "pebblit",
    FROST: "frostnip",
    RADIANT: "luminara",
    VOID: "hollowshade",
    ALLOY: "gearling",
    SPIRIT: "wisplet",
  };
  return buildCombatant({
    id: "ai-trainer",
    name: "Training Dummy",
    speciesSlug: byAffinity[affinity] ?? "pebblit",
    affinity,
    level: 5,
    weaponId: "barkguard-shield",
    normalizeEquipment: true,
  });
}

export const DEMO_PLAYER_DEFAULTS: TrainingPetInput = {
  id: "player-demo",
  name: "Cinder Cub",
  speciesSlug: "cindercub",
  affinity: "EMBER",
  level: 5,
  weaponId: "ember-talons",
  normalizeEquipment: true,
};
