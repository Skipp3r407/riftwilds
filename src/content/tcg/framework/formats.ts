/**
 * Competitive formats + rotation — expandable for 10+ years.
 * Mode-specific numeric overrides live in `battle-rules-config.ts`.
 */

import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";

export type TcgFormatId =
  | "standard"
  | "expanded"
  | "legacy"
  | "wild"
  | "eternal"
  | "draft"
  | "sealed"
  | "commander"
  | "quick"
  | "duo"
  | "practice"
  | "casual"
  | "pve"
  | "arena";

export type TcgFormatDef = {
  id: TcgFormatId | string;
  name: string;
  description: string;
  /** Main-deck size (Commander separate). */
  deckSize: number;
  totalPieces: number;
  requireCommander: boolean;
  /** Expansion ids legal in this format. Empty = all live. */
  legalExpansionIds: string[];
  /** Rotated-out expansion ids. */
  rotatedOutExpansionIds: string[];
  ranked: boolean;
  /** Soft-currency / F2P competitive guaranteed. */
  f2pCompetitive: boolean;
  status: "live" | "planned" | "retired";
};

const MAIN = CONSTRUCTED_RULES.deckSize;
const TOTAL = CONSTRUCTED_RULES.totalPieces;

export const DEFAULT_FORMATS: TcgFormatDef[] = [
  {
    id: "standard",
    name: "Rift Standard",
    description:
      "Current + previous two major expansions. Primary ranked ladder. 29 + Commander.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: ["rise-of-the-rift"],
    rotatedOutExpansionIds: [],
    ranked: true,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "expanded",
    name: "Rift Expanded",
    description: "All non-retired expansions. Broader archetypes.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: true,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "legacy",
    name: "Rift Legacy",
    description: "Older rotation sets remain legal for exhibition play.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "wild",
    name: "Rift Wild",
    description: "Alias of Expanded for older clients.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: true,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "eternal",
    name: "Eternal Codex",
    description: "Every released gameplay card — museum + exhibition ladder.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "draft",
    name: "Rift Draft",
    description: "Pick-and-play from sealed packs. Temporary deck lists.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: ["rise-of-the-rift"],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "planned",
  },
  {
    id: "sealed",
    name: "Rift Sealed",
    description: "Build from a fixed sealed pool. Temporary deck lists.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: ["rise-of-the-rift"],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "planned",
  },
  {
    id: "commander",
    name: "Commander Showcase",
    description: "Commander-identity focused constructed with slight power-card flex.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "quick",
    name: "Quick Battle",
    description: "Shorter timers, 20 Keeper HP, auto Second Main — mobile-friendly.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "practice",
    name: "Practice Board",
    description:
      "Local / AI. Teaching pools sliced to 29 on load. Opening-hand shape + Keep/Partial/Full mulligan.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "casual",
    name: "Casual Duel",
    description: "Unranked PvP with Standard rules and auto Second Main.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "pve",
    name: "PvE Encounters",
    description: "World / NPC matches. Teaching-friendly timers.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "arena",
    name: "Arena Bridge",
    description: "Soft bridge format for Arena training adapters.",
    deckSize: MAIN,
    totalPieces: TOTAL,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "planned",
  },
];

export function isExpansionLegal(
  format: TcgFormatDef,
  expansionId: string,
): boolean {
  if (format.rotatedOutExpansionIds.includes(expansionId)) return false;
  if (format.legalExpansionIds.length === 0) return true;
  return format.legalExpansionIds.includes(expansionId);
}

export function getFormatById(id: string): TcgFormatDef | undefined {
  return DEFAULT_FORMATS.find((f) => f.id === id);
}
