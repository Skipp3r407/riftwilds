/**
 * Player loyalty / streak / airdrop types.
 * Fair distribution — weighted by streak tier, pity-protected, anti-AFK.
 * Loyalty Shop = cosmetics/titles/housing only (never gameplay advantages).
 * Credits primary; SOL never required (admin-flagged optional only).
 */

export const LOYALTY_TIERS = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "MYTHIC",
  "LEGEND",
] as const;

export type LoyaltyTier = (typeof LOYALTY_TIERS)[number];

export const REWARD_RARITIES = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
] as const;

export type RewardRarity = (typeof REWARD_RARITIES)[number];

/** Meaningful activity kinds — AFK check-ins without these are denied. */
export type ActivityKind =
  | "MOVEMENT"
  | "QUEST"
  | "COMBAT"
  | "CRAFT"
  | "CARE"
  | "GATHER"
  | "SOCIAL"
  | "EXPLORATION"
  | "FISH"
  | "BOSS"
  | "PARTY_HELP"
  | "HEAL"
  | "TRADE"
  | "PUZZLE"
  | "TREASURE"
  | "PUBLIC_EVENT";

export type StreakKind =
  | "DAILY_LOGIN"
  | "WEEKLY"
  | "MONTHLY"
  | "HOURS_PLAYED"
  | "SEASONAL"
  | "EVENT";

export type AirdropRewardKind =
  | "CREDITS"
  | "LOYALTY_TOKENS"
  | "COSMETIC"
  | "TITLE"
  | "BADGE"
  | "HOUSING"
  | "ITEM";

export type AirdropRewardDef = {
  id: string;
  kind: AirdropRewardKind;
  label: string;
  rarity: RewardRarity;
  /** Credits amount when kind=CREDITS (integer). */
  creditsAmount?: number;
  /** Loyalty tokens when kind=LOYALTY_TOKENS. */
  loyaltyTokens?: number;
  /** Cosmetic / title / badge / housing / catalog item id. */
  assetId?: string;
  /** Quantity for ITEM grants. */
  quantity?: number;
  /** Base weight before tier multipliers (higher = more common). */
  weight: number;
  /** Minimum tier required to roll this entry. */
  minTier?: LoyaltyTier;
  /** Exclusive to this tier and above when set with exclusiveOnly. */
  exclusiveOnly?: boolean;
};

export type LoyaltyShopItem = {
  id: string;
  label: string;
  description: string;
  /** Cosmetics / titles / housing only — validated at purchase. */
  category: "cosmetic" | "title" | "badge" | "housing";
  costLoyaltyTokens: number;
  assetId: string;
  /** Public path to shop card thumbnail art. */
  imagePath: string;
  minTier?: LoyaltyTier;
  /** Hard reject anything that smells like gameplay power. */
  gameplayAdvantage: false;
};

export type MilestoneDef = {
  days: number;
  title: string;
  badgeId: string;
  cosmeticId: string;
  loyaltyTokens: number;
  /** Bounded Credits faucet — never unlimited. */
  creditsAmount: number;
  description: string;
};

export type PlayerActivityEvent = {
  id: string;
  kind: ActivityKind;
  at: string;
  detail?: string;
};

export type ClaimedRewardRecord = {
  id: string;
  claimKey: string;
  source: "DAILY_AIRDROP" | "MILESTONE" | "RIFT_STORM" | "SHOP" | "SEASONAL";
  rewardId: string;
  label: string;
  rarity: RewardRarity;
  kind: AirdropRewardKind;
  creditsAmount?: number;
  loyaltyTokens?: number;
  assetId?: string;
  claimedAt: string;
  shared?: boolean;
};

export type PlayerStreakState = {
  userId: string;
  /** Consecutive UTC days with eligible check-in. Miss resets daily only. */
  dailyStreak: number;
  longestDailyStreak: number;
  lastCheckInDayKey: string | null;
  /** Rolling weekly participation count (UTC weeks). */
  weeklyStreak: number;
  lastWeekKey: string | null;
  /** Rolling monthly participation count. */
  monthlyStreak: number;
  lastMonthKey: string | null;
  /** Accumulated meaningful play minutes (capped increments). */
  hoursPlayed: number;
  seasonalParticipation: number;
  eventParticipation: number;
  claimedMilestones: number[];
  titles: string[];
  badges: string[];
  cosmetics: string[];
  housingUnlocks: string[];
  /** Pity counters keyed by table id. */
  pityCounters: Record<string, number>;
  socialAnnounceOptOut: boolean;
  collection: ClaimedRewardRecord[];
  createdAt: string;
  updatedAt: string;
};

export type LoyaltyTokenAccount = {
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  version: number;
};

export type LoyaltyTokenLedgerEntry = {
  id: string;
  userId: string;
  delta: number;
  balanceAfter: number;
  reason: string;
  requestId: string;
  at: string;
  metadata?: Record<string, unknown>;
};

export type WeightedRollResult = {
  reward: AirdropRewardDef;
  roll: number;
  totalWeight: number;
  pityApplied: boolean;
  tier: LoyaltyTier;
};

export type EligibilityResult =
  | { ok: true; tier: LoyaltyTier; dayKey: string; activityCount: number }
  | {
      ok: false;
      error:
        | "feature_disabled"
        | "already_claimed"
        | "afk_denied"
        | "no_activity"
        | "storm_inactive"
        | "insufficient_tokens"
        | "min_tier"
        | "duplicate"
        | "invalid";
      message: string;
    };

export type AdminLoyaltyConfigSnapshot = {
  configVersion: number;
  tiers: typeof LOYALTY_TIERS;
  milestoneDays: number[];
  airdropTableIds: string[];
  pityThreshold: number;
  activityWindowMs: number;
  minActivitiesForClaim: number;
  stormDurationMs: number;
  solAirdropsEnabled: false;
  framing: string;
};
