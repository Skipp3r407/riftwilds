import type { AffinityName } from "@prisma/client";

/** Card / match types for Riftwilds TCG (Rift Energy resource). */

export type TcgCardType = "UNIT" | "SPELL" | "AURA";

export type TcgRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type TcgCardDef = {
  id: string;
  name: string;
  type: TcgCardType;
  affinity: AffinityName;
  /** Rift Energy cost to play. */
  riftCost: number;
  /** Combat power for units / spell damage baseline. */
  power: number;
  rarity: TcgRarity;
  speciesSlug?: string;
  description: string;
  /** Max copies allowed in a constructed deck. */
  maxCopies: number;
  /** Composited card face when available (`/assets/tcg/cards/{id}.webp`). */
  cardImagePath?: string;
  /** Source creature/item art (thumb/icon) fallback. */
  artPath?: string;
};

export type TcgCardInstance = {
  instanceId: string;
  defId: string;
};

export type TcgBoardUnit = {
  instanceId: string;
  defId: string;
  power: number;
  affinity: AffinityName;
  exhausted: boolean;
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
  deck: TcgCardInstance[];
  hand: TcgCardInstance[];
  board: TcgBoardUnit[];
  discard: TcgCardInstance[];
  isAi: boolean;
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

export type TcgMatchState = {
  publicId: string;
  turn: number;
  status: TcgMatchStatus;
  phase: TcgMatchPhase;
  activeSideId: string;
  winnerId: string | null;
  players: [TcgPlayerSide, TcgPlayerSide];
  events: TcgMatchEvent[];
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
  /** Foundational starters are ~30; constructed format allows 20–40. */
  starterDeckSize: 30,
  maxDeckSize: 40,
  minDeckSize: 20,
  maxHandSize: 7,
  maxBoardUnits: 5,
  keeperHp: 20,
  openingHand: 3,
  riftEnergyStartMax: 1,
  riftEnergyCap: 10,
  maxTurns: 30,
} as const;
