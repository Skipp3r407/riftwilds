/**
 * Keeper progression types — server-authoritative XP / levels / mastery / prestige.
 */

export type XpSourceCategory =
  | "BATTLE"
  | "QUEST"
  | "EXPLORATION"
  | "RIFTLING"
  | "CRAFTING"
  | "MARKETPLACE"
  | "DAILY"
  | "SYSTEM";

/** Canonical grant keys — clients send these; never raw XP amounts. */
export type XpSourceKey =
  // Battles
  | "BATTLE_LOSS"
  | "BATTLE_WIN"
  | "BATTLE_PERFECT"
  | "BATTLE_NO_CARDS_LOST"
  | "BATTLE_HIGHER_RANK"
  | "BATTLE_TOURNAMENT_WIN"
  // Quests
  | "QUEST_SMALL"
  | "QUEST_MEDIUM"
  | "QUEST_LARGE"
  | "QUEST_EPIC"
  | "QUEST_LEGENDARY"
  // Exploration
  | "EXPLORE_NEW_AREA"
  | "EXPLORE_TOWN"
  | "EXPLORE_SECRET"
  | "EXPLORE_DUNGEON"
  // Riftling care
  | "RIFT_HATCH"
  | "RIFT_FEED"
  | "RIFT_PLAY"
  | "RIFT_EVOLUTION"
  | "RIFT_RARE_EVOLUTION"
  // Crafting
  | "CRAFT_ITEM"
  | "CRAFT_RARE"
  | "CRAFT_LEGENDARY"
  | "CRAFT_UPGRADE"
  // Marketplace
  | "MARKET_SELL"
  | "MARKET_RARE_SALE"
  | "MARKET_AUCTION_WIN"
  | "MARKET_FIRST_SALE"
  // Daily / challenges
  | "DAILY_LOGIN"
  | "WEEKLY_CHALLENGE"
  | "MONTHLY_CHALLENGE";

export type MasteryRank = "Bronze" | "Silver" | "Gold" | "Diamond" | "Mythic";

export type LevelRewardKind =
  | "stat_bundle"
  | "stat_point"
  | "skill_point"
  | "cosmetic"
  | "title"
  | "rift_aura"
  | "prestige_unlock";

export type LevelReward = {
  kind: LevelRewardKind;
  level: number;
  label: string;
  /** Structured payload for UI / unlock application. */
  payload?: Record<string, unknown>;
};

export type ProgressionNotificationKind =
  | "LEVEL_UP"
  | "MASTERY_UP"
  | "SKILL_POINT"
  | "STAT_POINT"
  | "PRESTIGE_READY"
  | "QUEST_XP"
  | "DAILY_BONUS"
  | "COMBO"
  | "XP_GAIN";

export type ProgressionNotification = {
  id: string;
  kind: ProgressionNotificationKind;
  title: string;
  body: string;
  at: number;
  meta?: Record<string, unknown>;
};

export type KeeperCombatStats = {
  maxHp: number;
  atk: number;
  def: number;
  speed: number;
};

export type CardMasteryState = {
  cardId: string;
  level: number;
  xp: number;
  rank: MasteryRank;
  unlocks: string[];
};

export type PetMasteryState = {
  petId: string;
  xp: number;
  level: number;
  evolutionXp: number;
  affinity: number;
  unlocks: string[];
};

export type WeaponMasteryState = {
  weaponId: string;
  xp: number;
  level: number;
  unlocks: string[];
  killCount: number;
};

export type ProgressionState = {
  ownerKey: string;
  userId: string | null;
  level: number;
  currentXp: number;
  lifetimeXp: number;
  prestige: number;
  prestigeUnlocked: boolean;
  statPoints: number;
  skillPoints: number;
  masteryXp: number;
  combatStats: KeeperCombatStats;
  unlockedRewards: string[];
  titles: string[];
  cosmetics: string[];
  auras: string[];
  loginStreak: number;
  lastLoginDayKey: string;
  longestLoginStreak: number;
  restedXpPool: number;
  lastSeenAt: number;
  /** Distinct source categories earning XP in the rolling combo window. */
  comboActivities: XpSourceCategory[];
  comboWindowStartedAt: number;
  highestCombo: number;
  battlesWon: number;
  battlesPlayed: number;
  questsCompleted: number;
  hoursPlayedApprox: number;
  opponentWinCounts: Record<string, number>;
  cardMastery: Record<string, CardMasteryState>;
  petMastery: Record<string, PetMasteryState>;
  weaponMastery: Record<string, WeaponMasteryState>;
  notifications: ProgressionNotification[];
  recentUnlocks: string[];
  /** Idempotency keys already processed. */
  processedRequestIds: string[];
  grantedMatchIds: string[];
  version: number;
  updatedAt: number;
};

export type XpBoostFlags = {
  premium?: boolean;
  weekend?: boolean;
  holiday?: boolean;
  questBonusPercent?: number;
};

export type GrantXpContext = {
  opponentId?: string | null;
  matchId?: string | null;
  surrendered?: boolean;
  afk?: boolean;
  botMatch?: boolean;
  perfectVictory?: boolean;
  noCardsLost?: boolean;
  higherRanked?: boolean;
  questKey?: string | null;
  questDifficulty?: "easy" | "medium" | "hard" | null;
  catalogXp?: number | null;
  itemId?: string | null;
  cardId?: string | null;
  petId?: string | null;
  weaponId?: string | null;
  now?: number;
  boosts?: XpBoostFlags;
};

export type XpGrantBreakdown = {
  base: number;
  comboPercent: number;
  comboBonus: number;
  restedApplied: number;
  boostPercent: number;
  boostBonus: number;
  prestigePercent: number;
  prestigeBonus: number;
  antiFarmMultiplier: number;
  total: number;
  deniedReason: string | null;
};

export type XpGrantResult = {
  ok: true;
  granted: number;
  breakdown: XpGrantBreakdown;
  before: { level: number; currentXp: number; lifetimeXp: number };
  after: { level: number; currentXp: number; lifetimeXp: number; xpToNextLevel: number };
  levelsGained: number;
  rewards: LevelReward[];
  notifications: ProgressionNotification[];
  state: ProgressionState;
  idempotentReplay?: boolean;
  /** Present on daily claim grants */
  streak?: number;
} | {
  ok: false;
  error: string;
  message: string;
  state?: ProgressionState;
};

export type ProgressionSnapshot = {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  xpPercent: number;
  lifetimeXp: number;
  prestige: number;
  prestigeUnlocked: boolean;
  prestigeXpBonusPercent: number;
  statPoints: number;
  skillPoints: number;
  masteryXp: number;
  combatStats: KeeperCombatStats;
  loginStreak: number;
  longestLoginStreak: number;
  restedXpPool: number;
  highestCombo: number;
  battlesWon: number;
  battlesPlayed: number;
  questsCompleted: number;
  hoursPlayedApprox: number;
  titles: string[];
  cosmetics: string[];
  auras: string[];
  recentUnlocks: string[];
  notifications: ProgressionNotification[];
  cardMasteryCount: number;
  petMasteryCount: number;
  weaponMasteryCount: number;
  nextRewards: LevelReward[];
};
