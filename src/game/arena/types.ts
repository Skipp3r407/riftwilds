import type { AffinityName } from "@prisma/client";
import type { BattleType, TeamSizeMode } from "@/game/arena/battle-types";
import type { WeatherId, TerrainId } from "@/game/arena/weather-terrain";
import type { ComboState } from "@/game/arena/combo-affinity";
import type { AiDifficulty } from "@/game/arena/ai";

export type ArenaActionKind =
  | "BASIC_ATTACK"
  | "ATTACK"
  | "ABILITY"
  | "ULTIMATE"
  | "DEFEND"
  | "GUARD"
  | "FOCUS"
  | "CHARGE"
  | "MEDITATE"
  | "ANALYZE"
  | "SWITCH"
  | "ITEM"
  | "RETREAT"
  | "SURRENDER";

export type ArenaAbilityCategory =
  | "PHYSICAL"
  | "AFFINITY"
  | "DEFENSIVE"
  | "SUPPORT"
  | "CONTROL"
  | "HEALING"
  | "MOBILITY"
  | "ULTIMATE"
  | "PASSIVE"
  | "SIGNATURE";

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
  | "REGENERATING"
  | "ANALYZED"
  | "GUARDING";

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
  /** Rift Burst meter cost for ultimates. */
  riftBurstCost?: number;
  /** Remaining cooldown turns (runtime). */
  cooldownLeft?: number;
};

export type ArenaCombatant = {
  id: string;
  name: string;
  speciesSlug: string;
  affinity: AffinityName;
  level: number;
  xp: number;
  maxHp: number;
  hp: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  magic: number;
  resistance: number;
  speed: number;
  focus: number;
  luck: number;
  bond: number;
  morale: number;
  accuracy: number;
  evasion: number;
  critChanceBps: number;
  /** Rift Burst ultimate meter 0–100. */
  riftBurst: number;
  abilities: ArenaAbilityDef[];
  statuses: { id: ArenaStatusId; turnsLeft: number }[];
  defending: boolean;
  focusing: boolean;
  guarding: boolean;
  weaponId?: string;
  /** Equip multiplier already normalized for ranked (1 = none). */
  equipMod: number;
  /** Bench slot index for 2v2/3v3 scaffold. */
  teamSlot?: number;
  isActive?: boolean;
};

export type ArenaAction = {
  kind: ArenaActionKind;
  abilityId?: string;
  itemId?: string;
  switchSlot?: number;
};

export type ArenaEvent = {
  type: string;
  actorId: string;
  targetId?: string;
  payload: Record<string, string | number | boolean | null>;
};

export type TurnPhase =
  | "TURN_START"
  | "WEATHER"
  | "TERRAIN"
  | "STATUS"
  | "ENERGY"
  | "CHOOSE"
  | "LOCK"
  | "ORDER"
  | "RESOLVE"
  | "PASSIVES"
  | "EOT";

export type ArenaBattleState = {
  publicId: string;
  battleType: BattleType;
  teamSize: TeamSizeMode;
  round: number;
  maxRounds: number;
  seed: string;
  balanceVersion: number;
  affinityVersion: number;
  weather: WeatherId;
  terrain: TerrainId;
  arenaId: string;
  turnPhase: TurnPhase;
  turnDeadlineMs: number | null;
  turnTimerSeconds: number;
  combatants: [ArenaCombatant, ArenaCombatant];
  /** Scaffold for multi-active teams (2v2/3v3). */
  benches?: [ArenaCombatant[], ArenaCombatant[]];
  combos: [ComboState, ComboState];
  events: ArenaEvent[];
  status: "ACTIVE" | "COMPLETED";
  winnerId: string | null;
  completionReason: string | null;
  aiDifficulty?: AiDifficulty;
  careNormalized: boolean;
};
