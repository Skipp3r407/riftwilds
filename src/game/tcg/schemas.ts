/**
 * Runtime / TypeScript schemas for Phase 1 competitive battle-deck.
 * Content richness lives in `@/content/tcg`; this module is the engine contract.
 */

import type { AffinityName } from "@prisma/client";
import type { TcgCardDef, TcgCardType, TcgMatchPhase, TcgRarity } from "@/game/tcg/types";

export type MatchMode = "practice" | "casual" | "ranked" | "private";

export type FactionId =
  | "ember-forge"
  | "tideward-coast"
  | "grove-circle"
  | "stormspire";

export type KeywordId =
  | "ward"
  | "corrupt"
  | "awaken"
  | "overflow"
  | "riftbond"
  | "echo"
  | "bloom"
  | "shatter"
  | "guardian"
  | "soulbind"
  | "harmony"
  | "charge"
  | "empower"
  | "ancient"
  | "insight"
  | "inspire"
  | "scout"
  | "discover";

export type CommanderRef = {
  heroId: string;
  name: string;
  factionId?: FactionId | string;
  /** Passive / ultimate execute in Phase 2. */
  passiveId?: string;
  ultimateId?: string;
};

export type DeckListSchema = {
  id: string;
  name: string;
  commanderHeroId: string | null;
  factionId: FactionId | string | null;
  /** Expanded card def ids (exactly 30 for constructed). */
  cardIds: string[];
  kind: "custom" | "starter" | "showcase" | "npc";
};

export type MatchPlayerSchema = {
  id: string;
  name: string;
  commander: CommanderRef | null;
  keeperHp: number;
  maxKeeperHp: number;
  riftEnergy: number;
  riftEnergyMax: number;
  deckCount: number;
  handCount: number;
  boardCount: number;
  isAi: boolean;
};

export type MatchStateSchema = {
  publicId: string;
  mode: MatchMode;
  turn: number;
  phase: TcgMatchPhase;
  status: "ACTIVE" | "COMPLETED";
  activeSideId: string;
  winnerId: string | null;
  turnTimerSeconds: number;
  players: MatchPlayerSchema[];
};

/** Lightweight card catalog row for deck-builder clients. */
export type DeckBuilderCardRow = {
  id: string;
  name: string;
  type: TcgCardType;
  affinity: AffinityName;
  riftCost: number;
  power: number;
  attack?: number;
  health?: number;
  rarity: TcgRarity;
  maxCopies: number;
  description: string;
  cardImagePath?: string;
  artPath?: string;
  cleanArtPath?: string;
  keywords: string[];
  element: string;
  role?: string;
  defense?: number;
  speed?: number;
  familyId?: string;
  competitiveEligible?: boolean;
};

export function cardDefToBuilderRow(
  def: TcgCardDef,
  extra?: { keywords?: string[]; element?: string },
): DeckBuilderCardRow {
  return {
    id: def.id,
    name: def.name,
    type: def.type,
    affinity: def.affinity,
    riftCost: def.riftCost,
    power: def.power,
    attack: def.attack,
    health: def.health,
    rarity: def.rarity,
    maxCopies: def.maxCopies,
    description: def.description,
    cardImagePath: def.cardImagePath,
    artPath: def.artPath,
    cleanArtPath: def.cleanArtPath,
    keywords: extra?.keywords ?? def.keywords ?? [],
    element: extra?.element ?? def.element ?? "",
    role: def.role,
    defense: def.defense,
    speed: def.speed,
    familyId: def.familyId,
    competitiveEligible: def.competitiveEligible,
  };
}
