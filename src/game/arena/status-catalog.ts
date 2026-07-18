import type { ArenaStatusId } from "@/game/arena/types";

export type StatusCategory = "DOT" | "DEBUFF" | "BUFF" | "CONTROL" | "FIELD";

export type StatusDef = {
  id: ArenaStatusId;
  name: string;
  description: string;
  category: StatusCategory;
  /** Applied at start of affected combatant's status phase. */
  tick?: {
    kind: "DAMAGE_PCT" | "HEAL_PCT" | "ENERGY";
    amount: number;
  };
  /** Multipliers while active (attacker/defender context applied in engine). */
  mods?: {
    attackMul?: number;
    defenseMul?: number;
    speedMul?: number;
    accuracyFlat?: number;
    evasionFlat?: number;
    damageTakenMul?: number;
    damageDealtMul?: number;
  };
  blocksAbilities?: boolean;
  blocksSwitch?: boolean;
};

export const STATUS_CATALOG: Record<ArenaStatusId, StatusDef> = {
  BURN: {
    id: "BURN",
    name: "Singed",
    description: "Ember residue chips vitality each status phase.",
    category: "DOT",
    tick: { kind: "DAMAGE_PCT", amount: 0.04 },
    mods: { attackMul: 0.95 },
  },
  SOAKED: {
    id: "SOAKED",
    name: "Soaked",
    description: "Tide weight slows reactions and softens flame.",
    category: "DEBUFF",
    mods: { speedMul: 0.9, damageTakenMul: 1.05 },
  },
  ROOTED: {
    id: "ROOTED",
    name: "Rooted",
    description: "Grove tendrils pin footing — switch blocked.",
    category: "CONTROL",
    blocksSwitch: true,
    mods: { evasionFlat: -8 },
  },
  CHARGED: {
    id: "CHARGED",
    name: "Charged",
    description: "Storm static primes the next strike.",
    category: "BUFF",
    mods: { damageDealtMul: 1.08, accuracyFlat: 4 },
  },
  FORTIFIED: {
    id: "FORTIFIED",
    name: "Fortified",
    description: "Stone bracing hardens the shell.",
    category: "BUFF",
    mods: { defenseMul: 1.2 },
  },
  CHILLED: {
    id: "CHILLED",
    name: "Chilled",
    description: "Frost numbs joints and slows turns.",
    category: "DEBUFF",
    mods: { speedMul: 0.85 },
  },
  ILLUMINATED: {
    id: "ILLUMINATED",
    name: "Illuminated",
    description: "Radiant glare makes dodging harder.",
    category: "DEBUFF",
    mods: { evasionFlat: -12 },
  },
  SHROUDED: {
    id: "SHROUDED",
    name: "Shrouded",
    description: "Void mist cloaks the silhouette.",
    category: "BUFF",
    mods: { evasionFlat: 10 },
  },
  ARMORED: {
    id: "ARMORED",
    name: "Armored",
    description: "Plating absorbs incoming force.",
    category: "BUFF",
    mods: { defenseMul: 1.15, damageTakenMul: 0.9 },
  },
  INSPIRED: {
    id: "INSPIRED",
    name: "Inspired",
    description: "Spirit lift sharpens focus and luck.",
    category: "BUFF",
    mods: { accuracyFlat: 6, damageDealtMul: 1.05 },
  },
  WEAKENED: {
    id: "WEAKENED",
    name: "Weakened",
    description: "Morale dips; defenses soften.",
    category: "DEBUFF",
    mods: { defenseMul: 0.9, damageTakenMul: 1.1 },
  },
  SLOWED: {
    id: "SLOWED",
    name: "Slowed",
    description: "Terrain drag cuts effective Speed.",
    category: "DEBUFF",
    mods: { speedMul: 0.8 },
  },
  SILENCED: {
    id: "SILENCED",
    name: "Silenced",
    description: "Rift static blocks ability casting.",
    category: "CONTROL",
    blocksAbilities: true,
  },
  REGENERATING: {
    id: "REGENERATING",
    name: "Regenerating",
    description: "Gentle mend restores vitality each phase.",
    category: "BUFF",
    tick: { kind: "HEAL_PCT", amount: 0.05 },
  },
  ANALYZED: {
    id: "ANALYZED",
    name: "Analyzed",
    description: "Weak points marked — next hits land cleaner.",
    category: "DEBUFF",
    mods: { damageTakenMul: 1.12, evasionFlat: -6 },
  },
  GUARDING: {
    id: "GUARDING",
    name: "Guarding",
    description: "Active guard stance blunts the next blow.",
    category: "BUFF",
    mods: { defenseMul: 1.4, damageTakenMul: 0.75 },
  },
};

export function getStatusDef(id: ArenaStatusId): StatusDef {
  return STATUS_CATALOG[id];
}

export function aggregateStatusMods(statuses: { id: ArenaStatusId }[]) {
  const out = {
    attackMul: 1,
    defenseMul: 1,
    speedMul: 1,
    accuracyFlat: 0,
    evasionFlat: 0,
    damageTakenMul: 1,
    damageDealtMul: 1,
    blocksAbilities: false,
    blocksSwitch: false,
  };
  for (const s of statuses) {
    const def = STATUS_CATALOG[s.id];
    if (!def) continue;
    if (def.blocksAbilities) out.blocksAbilities = true;
    if (def.blocksSwitch) out.blocksSwitch = true;
    const m = def.mods;
    if (!m) continue;
    if (m.attackMul) out.attackMul *= m.attackMul;
    if (m.defenseMul) out.defenseMul *= m.defenseMul;
    if (m.speedMul) out.speedMul *= m.speedMul;
    if (m.accuracyFlat) out.accuracyFlat += m.accuracyFlat;
    if (m.evasionFlat) out.evasionFlat += m.evasionFlat;
    if (m.damageTakenMul) out.damageTakenMul *= m.damageTakenMul;
    if (m.damageDealtMul) out.damageDealtMul *= m.damageDealtMul;
  }
  return out;
}
