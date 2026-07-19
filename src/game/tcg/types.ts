import type { AffinityName } from "@prisma/client";
import type { TcgStatusInstance } from "@/game/tcg/combat/status";

/** Card / match types for Riftwilds TCG (Rift Energy resource). */

export type TcgCardType = "UNIT" | "SPELL" | "AURA";

export type TcgRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

/** Competitive vs collection presentation — cosmetics never change competitive stats. */
export type TcgPowerMode = "competitive" | "collection";

export type TcgCardDef = {
  id: string;
  name: string;
  type: TcgCardType;
  affinity: AffinityName;
  /** Rift Energy cost to play. */
  riftCost: number;
  /**
   * Legacy combat power alias (= attack for units / spell damage).
   * Prefer attack/health/defense/speed for new code.
   */
  power: number;
  /** Creature strike value. */
  attack: number;
  /** Max HP when summoned. */
  health: number;
  defense: number;
  speed: number;
  rarity: TcgRarity;
  speciesSlug?: string;
  description: string;
  /** Max copies allowed in a constructed deck. */
  maxCopies: number;
  /**
   * Legacy composited face (may include baked text). Prefer cleanArtPath + MasterCardTemplate.
   */
  cardImagePath?: string;
  /** Source creature/item art (thumb/icon) — clean, no baked stats. */
  artPath?: string;
  /** Preferred clean art for dynamic template. */
  cleanArtPath?: string;
  /** AAA surface */
  role?: string;
  element?: string;
  familyId?: string;
  competitiveEligible?: boolean;
  keywords: string[];
  passive?: string | null;
  activeSummary?: string | null;
  ultimateSummary?: string | null;
  contentType?: string;
  templateLayout?: string;
};

export type TcgCardInstance = {
  instanceId: string;
  defId: string;
};

export type TcgBoardUnit = {
  instanceId: string;
  defId: string;
  /** @deprecated use attack */
  power: number;
  attack: number;
  health: number;
  maxHealth: number;
  defense: number;
  speed: number;
  affinity: AffinityName;
  element: string;
  keywords: string[];
  statuses: TcgStatusInstance[];
  exhausted: boolean;
  /** Attached equipment def ids (order = attach order). */
  equipmentIds?: string[];
  /** Turn index when summoned — used by Awaken. */
  summonedOnTurn?: number;
};

export type TcgCommanderState = {
  heroId: string;
  name: string;
  title?: string;
  factionId?: string;
};

export type TcgPlayerSide = {
  id: string;
  name: string;
  keeperHp: number;
  maxKeeperHp: number;
  /** Current spendable Rift Energy (TCG resource — not Arena combat energy). */
  riftEnergy: number;
  /** Max Rift Energy this turn. */
  riftEnergyMax: number;
  /** Energy spent this turn (Empower). */
  energySpentThisTurn: number;
  deck: TcgCardInstance[];
  hand: TcgCardInstance[];
  board: TcgBoardUnit[];
  discard: TcgCardInstance[];
  isAi: boolean;
  /** Content hero used as commander (passives Phase 2). */
  commander?: TcgCommanderState | null;
  /** Echo: next spell costing ≤2 may resolve twice at +1 energy. */
  echoReady?: boolean;
  /** Prevent echoing an echo resolution. */
  echoResolving?: boolean;
};

export type TcgMatchStatus = "ACTIVE" | "COMPLETED";

export type TcgMatchPhase =
  | "DRAW"
  | "MAIN"
  | "COMBAT"
  | "END"
  | "OPPONENT"
  | "FINISHED";

export type TcgMatchEvent = {
  type: string;
  actorId: string;
  payload: Record<string, unknown>;
};

export type TcgMatchMode = "practice" | "casual" | "ranked" | "private";

export type TcgMatchState = {
  publicId: string;
  turn: number;
  status: TcgMatchStatus;
  phase: TcgMatchPhase;
  activeSideId: string;
  winnerId: string | null;
  players: [TcgPlayerSide, TcgPlayerSide];
  events: TcgMatchEvent[];
  /** Phase 1 practice; other modes scaffolded for architecture only. */
  mode: TcgMatchMode;
  /** Soft turn timer seconds (client cue; server enforcement later). */
  turnTimerSeconds: number;
  /** competitive = base stats only; collection may show cosmetic finishes. */
  powerMode: TcgPowerMode;
  /** World encounter metadata (optional). */
  encounter?: {
    enemyId: string;
    regionSlug: string;
    returnTo: string;
  };
};

export type TcgPlayAction =
  | { kind: "PLAY_CARD"; handInstanceId: string; targetInstanceId?: string }
  | { kind: "END_TURN" }
  | { kind: "SURRENDER" };

export const TCG_DEFAULTS = {
  /** Exact constructed deck size (commander is separate). */
  starterDeckSize: 30,
  constructedTargetMax: 30,
  /** AAA Standard: exactly 30 cards. */
  maxDeckSize: 30,
  minDeckSize: 30,
  requireCommander: true,
  maxHandSize: 8,
  maxBoardUnits: 5,
  keeperHp: 20,
  openingHand: 4,
  riftEnergyStartMax: 1,
  riftEnergyCap: 10,
  maxTurns: 30,
  /** Soft client turn timer (seconds). */
  turnTimerSeconds: 90,
  /** Soft-currency competitive path — never crypto. */
  f2pCompetitive: true,
  /** Ranked / practice competitive power ignores cosmetics & companion level. */
  rankedPowerMode: "competitive" as TcgPowerMode,
} as const;
