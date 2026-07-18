/** Primary ladder is Rift Battles; legacy Arena Points stay as a secondary tab. */
export type LeaderboardTab = "rift" | "arena" | "care" | "collection";

export type LeaderboardTimeRange = "season" | "week";

export type AffinityFilter =
  | "ALL"
  | "EMBER"
  | "TIDE"
  | "GROVE"
  | "STORM"
  | "STONE"
  | "FROST"
  | "RADIANT"
  | "VOID"
  | "ALLOY"
  | "SPIRIT";

export type TrendDirection = "up" | "down" | "flat";

export type LeaderboardSeason = {
  id: string;
  label: string;
  shortLabel: string;
  status: "live" | "ended" | "upcoming";
  startsAt: string;
  endsAt: string;
};

export type LeaderboardEntry = {
  rank: number;
  playerName: string;
  wallet: string;
  walletShort: string;
  speciesSlug: string;
  speciesName: string;
  affinity: Exclude<AffinityFilter, "ALL">;
  /** Seasonal Rift Energy / ladder score (primary TCG metric). */
  riftPoints: number;
  /** Legacy Arena Points — soft-secondary. */
  arenaPoints: number;
  wins: number;
  losses: number;
  /** Unique binder cards collected (demo). */
  binderCards: number;
  careScore: number;
  collectionScore: number;
  trend: TrendDirection;
  trendDelta: number;
  isYou?: boolean;
};

export type LeaderboardBoard = {
  seasonId: string;
  timeRange: LeaderboardTimeRange;
  entries: LeaderboardEntry[];
};
