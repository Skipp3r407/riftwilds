/**
 * Ranked ladder scaffold — ratings are non-transferable skill scores.
 * No SOL / cash / wagering. Care stats normalized in RANKED battles.
 */

export const RANKED_TIERS = [
  "SPARK",
  "EMBER",
  "FLARE",
  "TEMPEST",
  "RIFTWALKER",
  "ASTRAL",
] as const;

export type RankedTier = (typeof RANKED_TIERS)[number];

export type LadderEntry = {
  playerId: string;
  displayName: string;
  rating: number;
  tier: RankedTier;
  wins: number;
  losses: number;
  streak: number;
};

export function tierForRating(rating: number): RankedTier {
  if (rating >= 2200) return "ASTRAL";
  if (rating >= 1900) return "RIFTWALKER";
  if (rating >= 1600) return "TEMPEST";
  if (rating >= 1300) return "FLARE";
  if (rating >= 1000) return "EMBER";
  return "SPARK";
}

/** Simple Elo-style update stub. */
export function updateRating(params: {
  winnerRating: number;
  loserRating: number;
  k?: number;
}): { winner: number; loser: number } {
  const k = params.k ?? 24;
  const expected =
    1 / (1 + Math.pow(10, (params.loserRating - params.winnerRating) / 400));
  const winner = Math.round(params.winnerRating + k * (1 - expected));
  const loser = Math.round(params.loserRating + k * (0 - (1 - expected)));
  return { winner: Math.max(0, winner), loser: Math.max(0, loser) };
}

const DEMO_LADDER: LadderEntry[] = [
  {
    playerId: "demo_rift",
    displayName: "Rift Scout",
    rating: 1120,
    tier: "EMBER",
    wins: 12,
    losses: 8,
    streak: 2,
  },
  {
    playerId: "demo_ash",
    displayName: "Ashwarden",
    rating: 980,
    tier: "SPARK",
    wins: 6,
    losses: 9,
    streak: -1,
  },
];

export function getLadderStub(limit = 20): LadderEntry[] {
  return DEMO_LADDER.slice(0, limit).map((e) => ({
    ...e,
    tier: tierForRating(e.rating),
  }));
}
