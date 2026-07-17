import type { ArenaAbilityDef } from "@/game/arena/types";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";
import { toArenaAbility } from "@/game/creatures/rpg-types";

/** Starter ability pool for Phase 1 training (affinity fallback). */
export const STARTER_ABILITIES: ArenaAbilityDef[] = [
  {
    id: "basic-strike",
    name: "Rift Strike",
    description: "A reliable physical strike.",
    affinity: null,
    category: "PHYSICAL",
    power: 38,
    accuracy: 95,
    energyCost: 0,
    priority: 0,
    cooldown: 0,
    target: "OPPONENT",
  },
  {
    id: "ember-pounce",
    name: "Ember Pounce",
    description: "Leap with heated claws.",
    affinity: "EMBER",
    category: "AFFINITY",
    power: 48,
    accuracy: 90,
    energyCost: 12,
    priority: 0,
    cooldown: 1,
    target: "OPPONENT",
    status: { id: "BURN", chanceBps: 2500, duration: 2 },
  },
  {
    id: "tide-pulse",
    name: "Tide Pulse",
    description: "A compressed wave of water.",
    affinity: "TIDE",
    category: "AFFINITY",
    power: 46,
    accuracy: 92,
    energyCost: 12,
    priority: 0,
    cooldown: 1,
    target: "OPPONENT",
    status: { id: "SOAKED", chanceBps: 2500, duration: 2 },
  },
  {
    id: "grove-lash",
    name: "Grove Lash",
    description: "Vines snap toward the foe.",
    affinity: "GROVE",
    category: "AFFINITY",
    power: 44,
    accuracy: 90,
    energyCost: 11,
    priority: 0,
    cooldown: 1,
    target: "OPPONENT",
    status: { id: "ROOTED", chanceBps: 2000, duration: 1 },
  },
  {
    id: "storm-arc",
    name: "Storm Arc",
    description: "A quick jolt of static.",
    affinity: "STORM",
    category: "AFFINITY",
    power: 50,
    accuracy: 88,
    energyCost: 14,
    priority: 1,
    cooldown: 2,
    target: "OPPONENT",
    status: { id: "CHARGED", chanceBps: 2000, duration: 2 },
  },
  {
    id: "stone-guard",
    name: "Stone Guard",
    description: "Brace with mineral plating.",
    affinity: "STONE",
    category: "DEFENSIVE",
    power: 0,
    accuracy: 100,
    energyCost: 8,
    priority: 2,
    cooldown: 2,
    target: "SELF",
    status: { id: "ARMORED", chanceBps: 10000, duration: 2 },
  },
  {
    id: "spirit-mend",
    name: "Spirit Mend",
    description: "Restore a portion of vitality.",
    affinity: "SPIRIT",
    category: "HEALING",
    power: 34,
    accuracy: 100,
    energyCost: 16,
    priority: 0,
    cooldown: 2,
    target: "SELF",
    status: { id: "REGENERATING", chanceBps: 10000, duration: 2 },
  },
  {
    id: "void-shroud",
    name: "Void Shroud",
    description: "Slip into soft shadow.",
    affinity: "VOID",
    category: "SUPPORT",
    power: 0,
    accuracy: 100,
    energyCost: 10,
    priority: 1,
    cooldown: 2,
    target: "SELF",
    status: { id: "SHROUDED", chanceBps: 10000, duration: 2 },
  },
];

export function abilitiesForAffinity(affinity: string): ArenaAbilityDef[] {
  const basic = STARTER_ABILITIES.find((a) => a.id === "basic-strike")!;
  const match = STARTER_ABILITIES.filter(
    (a) => a.affinity === affinity || a.id === "stone-guard" || a.id === "spirit-mend",
  );
  const picked = [basic, ...match].slice(0, 4);
  while (picked.length < 4) {
    picked.push(STARTER_ABILITIES[picked.length]!);
  }
  return picked;
}

/** Species signature kit mapped into arena abilities (includes basic strike). */
export function abilitiesForSpecies(
  speciesSlug: string,
  affinity: string,
): ArenaAbilityDef[] | null {
  const species = getSpeciesBySlug(speciesSlug);
  if (!species?.abilities?.length) return null;
  const basic = STARTER_ABILITIES.find((a) => a.id === "basic-strike")!;
  const kit = species.abilities.map((a) => toArenaAbility(a, affinity));
  return [basic, ...kit].slice(0, 5);
}
