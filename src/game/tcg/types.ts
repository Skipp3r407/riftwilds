import type { AffinityName } from "@prisma/client";
import type { TcgStatusInstance } from "@/game/tcg/combat/status";
import type { FieldLane, SpellSpeed } from "@/game/tcg/rules/battle-rules-config";
import { STANDARD_BATTLE_RULES } from "@/game/tcg/rules/battle-rules-config";

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
  /** Spell timing — units ignore this (always Slow summons). */
  spellSpeed?: SpellSpeed;
  /** Preferred battlefield lane when summoned. */
  preferredLane?: FieldLane | "any";
};

/** Binder API row: owned count + catalog def (`/api/tcg/collection`). */
export type TcgCollectionCardRow = {
  defId: string;
  count: number;
  def: TcgCardDef | null;
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
  /** Frontline protects Keeper; backline is support. */
  lane: FieldLane;
  /** Attached equipment def ids (order = attach order). */
  equipmentIds?: string[];
  /** Turn index when summoned — used by Awaken. */
  summonedOnTurn?: number;
  /** Rush: may act but cannot strike Keeper this turn. */
  cannotStrikeKeeper?: boolean;
};

export type TcgCommanderState = {
  heroId: string;
  name: string;
  title?: string;
  factionId?: string;
  /** Once-per-turn active used flag. */
  powerUsedThisTurn?: boolean;
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
  /** Temporary energy granted this turn (expires at end). */
  tempEnergy: number;
  /** Energy spent this turn (Empower). */
  energySpentThisTurn: number;
  /**
   * Commander passive: first Companion each game costs 1 less.
   * True after that discount has been consumed.
   */
  firstCompanionDiscountUsed: boolean;
  /**
   * Temporary flat play-cost delta for this side (negative = cheaper).
   * Cleared / adjusted by effects; applied in resolvePlayCost.
   */
  temporaryPlayCostModifier?: number;
  /** Flat relic/buff play-cost reduction (non-negative). */
  playCostReduction?: number;
  deck: TcgCardInstance[];
  hand: TcgCardInstance[];
  board: TcgBoardUnit[];
  /** Defeated creatures / spent cards. */
  defeated: TcgCardInstance[];
  /** Exiled cards (Rift Spark, hard-remove effects). */
  exile: TcgCardInstance[];
  /** Hand-full burn / overflow. */
  riftBurn: TcgCardInstance[];
  /**
   * @deprecated Prefer defeated — kept as alias for older snapshots.
   */
  discard: TcgCardInstance[];
  /** Active terrain (max 1). */
  terrain: TcgCardInstance | null;
  /** Permanent board relics (persist for the match). */
  relics: TcgCardInstance[];
  /** Face-down traps awaiting trigger (scaffold). */
  traps: Array<TcgCardInstance & { faceDown: boolean; armed: boolean }>;
  isAi: boolean;
  /** Content hero used as commander (passives Phase 2). */
  commander?: TcgCommanderState | null;
  /** Echo: next spell costing ≤2 may resolve twice at +1 energy. */
  echoReady?: boolean;
  /** Prevent echoing an echo resolution. */
  echoResolving?: boolean;
  /** Empty-deck draw attempts (Rift Collapse escalation). */
  riftCollapseCount: number;
  /** Mulligan already used. */
  mulliganUsed: boolean;
  /** Seat order: 0 = first player. */
  seatIndex: number;
  /** Strategic card advantage flags (Rules v2.2). */
  cardAdvantage?: {
    inspireUsedThisTurn: boolean;
    companionsSummonedThisTurn: number;
    cardsPlayedThisTurn: number;
    pendingTempEnergyNextTurn: number;
    conversionsUsedThisTurn: Array<
      "ENERGY_TO_DRAW" | "DISCARD_FOR_ENERGY" | "RECYCLE"
    >;
    commanderDrawsThisTurn: number;
    relicDrawUsedThisTurn: boolean;
  };
};

export type TcgMatchStatus = "ACTIVE" | "COMPLETED";

export type TcgMatchPhase =
  | "MULLIGAN"
  | "START"
  | "MAIN"
  | "COMBAT"
  | "SECOND_MAIN"
  | "END"
  | "REACTION"
  | "OPPONENT"
  | "FINISHED";

export type TcgMatchEvent = {
  type: string;
  actorId: string;
  /**
   * Structured payload — always includes `seq`, `turn`, `phase` from the engine.
   * Card/unit display names are resolved when def ids are present.
   */
  payload: Record<string, unknown>;
};

export type TcgMatchMode =
  | "practice"
  | "casual"
  | "ranked"
  | "private"
  | "quick"
  | "pve"
  | "tutorial"
  | "draft"
  | "sealed"
  | "commander"
  | "expanded"
  | "legacy"
  | "arena";

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
  /** Rules version baked at match create. */
  rulesVersion: string;
  /** Reaction nest depth (scaffold). */
  reactionDepth: number;
  /** World encounter metadata (optional). */
  encounter?: {
    enemyId: string;
    regionSlug: string;
    returnTo: string;
  };
};

export type TcgPlayAction =
  | {
      kind: "PLAY_CARD";
      handInstanceId: string;
      targetInstanceId?: string;
      lane?: FieldLane;
    }
  | { kind: "MULLIGAN"; replaceInstanceIds: string[] }
  | { kind: "KEEP_HAND" }
  | { kind: "DECLARE_COMBAT" }
  | { kind: "END_TURN" }
  | { kind: "SURRENDER" }
  /** Spend unused Energy to draw 1 (once / turn). */
  | { kind: "ENERGY_TO_DRAW" }
  /** Discard a hand card; bank temp Energy for next turn. */
  | { kind: "DISCARD_FOR_ENERGY"; handInstanceId: string }
  /** Shuffle a hand card into deck, then draw 1. */
  | { kind: "RECYCLE"; handInstanceId: string }
  /** Limited Commander Focus draw (once / turn). */
  | { kind: "COMMANDER_DRAW" };

const R = STANDARD_BATTLE_RULES;

/** Legacy defaults — values mirror STANDARD_BATTLE_RULES. Prefer getBattleRules(). */
export const TCG_DEFAULTS = {
  /** Exact constructed main-deck size (commander is separate). */
  starterDeckSize: R.deck.mainDeckSize,
  constructedTargetMax: R.deck.mainDeckSize,
  maxDeckSize: R.deck.mainDeckSize,
  minDeckSize: R.deck.mainDeckSize,
  totalPieces: R.deck.totalPieces,
  requireCommander: true,
  maxHandSize: R.hand.maxSize,
  maxBoardUnits: R.field.maxCreatures,
  frontlineSlots: R.field.frontlineSlots,
  backlineSlots: R.field.backlineSlots,
  keeperHp: R.keeper.startingHp,
  openingHand: R.hand.openingSize,
  riftEnergyStartMax: R.energy.turn1Max,
  riftEnergyCap: R.energy.cap,
  maxTurns: R.turn.maxTurns,
  turnTimerSeconds: R.turn.timerSeconds,
  f2pCompetitive: true,
  rankedPowerMode: "competitive" as TcgPowerMode,
  rulesVersion: R.rulesVersion,
} as const;
