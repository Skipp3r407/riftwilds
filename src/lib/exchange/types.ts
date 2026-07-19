/**
 * Rift Exchange — player entertainment / reward surfaces.
 * Ranges are illustrative only. Never frame as guaranteed earnings.
 */

export type EarningMethodStatus = "live" | "partial" | "scaffold" | "coming";

export type EarningDifficulty = "easy" | "moderate" | "hard" | "expert";

export type EarningCurrencyHint = "CREDITS" | "SOL_OPTIONAL" | "SOL_POOL" | "MIXED";

export type EarningMethodId =
  | "tournaments"
  | "marketplace_sales"
  | "creator_program"
  | "bounties"
  | "streamer"
  | "guild"
  | "world_events"
  | "community_voting"
  | "museum_tips"
  | "player_shops"
  | "commissions"
  | "rentals"
  | "weekly_challenges"
  | "esports"
  | "sponsorship"
  | "referral"
  | "achievement_promo"
  | "reward_vault";

export type EarningMethod = {
  id: EarningMethodId;
  title: string;
  summary: string;
  /** Illustrative entertainment reward band — never a promise. */
  rewardRangeLabel: string;
  currencyHint: EarningCurrencyHint;
  difficulty: EarningDifficulty;
  popularity: number; // 0–100 demo signal
  status: EarningMethodStatus;
  requirements: string[];
  href: string;
  /** ISO end time when a timed window exists; null = ongoing / stub. */
  endsAt: string | null;
  /** 0–100 demo progress toward a soft goal (not payout progress). */
  progressPercent: number | null;
  category: "competition" | "creation" | "trade" | "community" | "showcase" | "ops";
  walletRequired: boolean;
  competitivePower: false;
};

export type ExchangeClaimStub = {
  id: string;
  methodId: EarningMethodId;
  label: string;
  amountLabel: string;
  status: "pending" | "claimable" | "claimed" | "demo";
  at: string;
};

export type ExchangeLeaderboardStub = {
  rank: number;
  handle: string;
  scoreLabel: string;
  note: string;
};

export type ExchangeReputationStub = {
  score: number;
  tierLabel: string;
  notes: string[];
  /** Honest: local/demo until ledger-backed. */
  authoritative: false;
};

export type RiftExchangeDashboard = {
  title: string;
  lede: string;
  framing: string;
  methods: EarningMethod[];
  recentClaims: ExchangeClaimStub[];
  leaderboard: ExchangeLeaderboardStub[];
  reputation: ExchangeReputationStub;
  treasuryAllocation: {
    key: string;
    label: string;
    percent: number;
    note: string;
  }[];
  antiAbuseSummary: {
    real: string[];
    scaffold: string[];
  };
  disclaimers: string[];
  refreshedAt: string;
};
