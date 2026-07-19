/**
 * Competitive formats + rotation — expandable for 10+ years.
 */

export type TcgFormatId =
  | "standard"
  | "wild"
  | "eternal"
  | "draft"
  | "duo"
  | "practice";

export type TcgFormatDef = {
  id: TcgFormatId | string;
  name: string;
  description: string;
  deckSize: number;
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

export const DEFAULT_FORMATS: TcgFormatDef[] = [
  {
    id: "standard",
    name: "Rift Standard",
    description:
      "Current + previous two major expansions. Primary ranked ladder.",
    deckSize: 30,
    requireCommander: true,
    legalExpansionIds: ["rise-of-the-rift"],
    rotatedOutExpansionIds: [],
    ranked: true,
    f2pCompetitive: true,
    status: "live",
  },
  {
    id: "wild",
    name: "Rift Wild",
    description: "All non-retired expansions. Broader archetypes.",
    deckSize: 30,
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
    deckSize: 30,
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
    deckSize: 30,
    requireCommander: true,
    legalExpansionIds: ["rise-of-the-rift"],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "planned",
  },
  {
    id: "practice",
    name: "Practice Board",
    description: "Local / AI. Teaching pools may be sliced to 30 on load.",
    deckSize: 30,
    requireCommander: true,
    legalExpansionIds: [],
    rotatedOutExpansionIds: [],
    ranked: false,
    f2pCompetitive: true,
    status: "live",
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
