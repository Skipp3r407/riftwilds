import type { ArenaAbilityCategory, ArenaAbilityDef, ArenaStatusId } from "@/game/arena/types";

/** Player-facing ability roles (Pokémon/FF-style presentation). */
export type RpgAbilityCategory = "ATTACK" | "DEFEND" | "HEAL" | "SUPPORT" | "ULTIMATE";

export type SpeciesBaseStats = {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  energy: number;
};

export type SpeciesAbilityDef = {
  id: string;
  name: string;
  description: string;
  category: RpgAbilityCategory;
  power: number;
  energyCost: number;
  cooldown: number;
  accuracy?: number;
  priority?: number;
  target?: "OPPONENT" | "SELF";
  status?: { id: ArenaStatusId; chanceBps: number; duration: number };
};

export type TraitHook =
  | { kind: "STAT_BONUS"; stat: keyof SpeciesBaseStats; amount: number }
  | { kind: "CARE_BONUS"; care: "happiness" | "bond" | "energy" | "health"; amount: number }
  | { kind: "CRIT_BONUS"; bps: number }
  | { kind: "EVASION_BONUS"; amount: number }
  | { kind: "AFFINITY_POWER"; bps: number };

export type SpeciesTraitDef = {
  id: string;
  name: string;
  description: string;
  hook?: TraitHook;
};

export type SpeciesKit = {
  baseStats: SpeciesBaseStats;
  abilities: SpeciesAbilityDef[];
  traits: SpeciesTraitDef[];
};

const RPG_TO_ARENA: Record<RpgAbilityCategory, ArenaAbilityCategory> = {
  ATTACK: "AFFINITY",
  DEFEND: "DEFENSIVE",
  HEAL: "HEALING",
  SUPPORT: "SUPPORT",
  ULTIMATE: "ULTIMATE",
};

export function toArenaAbility(
  ability: SpeciesAbilityDef,
  affinity: string | null,
): ArenaAbilityDef {
  const inferredSelf =
    ability.category === "DEFEND" ||
    ability.category === "HEAL" ||
    (ability.category === "SUPPORT" && ability.power <= 0);
  const target = ability.target ?? (inferredSelf ? "SELF" : "OPPONENT");
  const isSelf = target === "SELF";
  const arenaCategory =
    ability.category === "ATTACK" && ability.power > 0 && ability.status
      ? ("AFFINITY" as ArenaAbilityCategory)
      : ability.category === "ATTACK"
        ? ("PHYSICAL" as ArenaAbilityCategory)
        : RPG_TO_ARENA[ability.category];

  return {
    id: ability.id,
    name: ability.name,
    description: ability.description,
    affinity: (affinity as ArenaAbilityDef["affinity"]) ?? null,
    category: arenaCategory,
    power: ability.power,
    accuracy: ability.accuracy ?? (isSelf ? 100 : 90),
    energyCost: ability.energyCost,
    priority:
      ability.priority ??
      (ability.category === "DEFEND" ? 2 : ability.category === "ULTIMATE" ? -1 : 0),
    cooldown: ability.cooldown,
    target,
    status: ability.status,
  };
}

export function scaleSpeciesStats(base: SpeciesBaseStats, level: number) {
  const L = Math.max(1, Math.min(50, level));
  return {
    maxHp: Math.round(base.hp + (L - 1) * 12),
    attack: Math.round(base.attack + (L - 1) * 3),
    defense: Math.round(base.defense + (L - 1) * 2),
    speed: Math.round(base.speed + (L - 1) * 2),
    accuracy: 70 + L,
    evasion: 10 + Math.floor(L / 2),
    focus: 15 + L,
    critChanceBps: 800 + L * 20,
    maxEnergy: base.energy + Math.floor((L - 1) / 2),
  };
}

export function applyTraitHooks(
  stats: ReturnType<typeof scaleSpeciesStats>,
  traits: SpeciesTraitDef[],
) {
  const next = { ...stats };
  for (const trait of traits) {
    const hook = trait.hook;
    if (!hook) continue;
    if (hook.kind === "STAT_BONUS") {
      if (hook.stat === "hp") next.maxHp += hook.amount;
      else if (hook.stat === "attack") next.attack += hook.amount;
      else if (hook.stat === "defense") next.defense += hook.amount;
      else if (hook.stat === "speed") next.speed += hook.amount;
      else if (hook.stat === "energy") next.maxEnergy += hook.amount;
    } else if (hook.kind === "CRIT_BONUS") {
      next.critChanceBps += hook.bps;
    } else if (hook.kind === "EVASION_BONUS") {
      next.evasion += hook.amount;
    }
  }
  return next;
}

export function affinityPowerBonusBps(traits: SpeciesTraitDef[]): number {
  return traits.reduce((sum, t) => {
    if (t.hook?.kind === "AFFINITY_POWER") return sum + t.hook.bps;
    return sum;
  }, 0);
}

export function careBonusFromTraits(
  traits: SpeciesTraitDef[],
  care: "happiness" | "bond" | "energy" | "health",
): number {
  return traits.reduce((sum, t) => {
    if (t.hook?.kind === "CARE_BONUS" && t.hook.care === care) return sum + t.hook.amount;
    return sum;
  }, 0);
}
