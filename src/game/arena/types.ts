import type { AffinityName } from "@prisma/client";

export type ArenaActionKind =
  | "BASIC_ATTACK"
  | "ABILITY"
  | "DEFEND"
  | "FOCUS"
  | "ITEM"
  | "SURRENDER";

export type ArenaAbilityCategory =
  | "PHYSICAL"
  | "AFFINITY"
  | "DEFENSIVE"
  | "SUPPORT"
  | "CONTROL"
  | "HEALING"
  | "MOBILITY"
  | "ULTIMATE";

export type ArenaStatusId =
  | "BURN"
  | "SOAKED"
  | "ROOTED"
  | "CHARGED"
  | "FORTIFIED"
  | "CHILLED"
  | "ILLUMINATED"
  | "SHROUDED"
  | "ARMORED"
  | "INSPIRED"
  | "WEAKENED"
  | "SLOWED"
  | "SILENCED"
  | "REGENERATING";

export type ArenaAbilityDef = {
  id: string;
  name: string;
  description: string;
  affinity: AffinityName | null;
  category: ArenaAbilityCategory;
  power: number;
  accuracy: number;
  energyCost: number;
  priority: number;
  cooldown: number;
  target: "OPPONENT" | "SELF";
  status?: { id: ArenaStatusId; chanceBps: number; duration: number };
};

export type ArenaCombatant = {
  id: string;
  name: string;
  speciesSlug: string;
  affinity: AffinityName;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
  evasion: number;
  focus: number;
  critChanceBps: number;
  energy: number;
  maxEnergy: number;
  abilities: ArenaAbilityDef[];
  statuses: { id: ArenaStatusId; turnsLeft: number }[];
  defending: boolean;
  focusing: boolean;
  weaponId?: string;
  /** Equip multiplier already normalized for ranked (1 = none). */
  equipMod: number;
};

export type ArenaAction = {
  kind: ArenaActionKind;
  abilityId?: string;
  itemId?: string;
};

export type ArenaEvent = {
  type: string;
  actorId: string;
  targetId?: string;
  payload: Record<string, string | number | boolean | null>;
};

export type ArenaBattleState = {
  publicId: string;
  round: number;
  maxRounds: number;
  seed: string;
  balanceVersion: number;
  affinityVersion: number;
  combatants: [ArenaCombatant, ArenaCombatant];
  events: ArenaEvent[];
  status: "ACTIVE" | "COMPLETED";
  winnerId: string | null;
  completionReason: string | null;
};
