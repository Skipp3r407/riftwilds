/**
 * Living Server Population System — presence states, hubs, Community Tokens.
 * Cosmetic / soft rewards only. Never SOL. Never combat power.
 */

/** Server-authoritative presence states (never trust client for these). */
export type ServerPresenceState =
  | "ACTIVE"
  | "CASUAL_ACTIVE"
  | "SOCIAL_ACTIVE"
  | "RESTING"
  | "IDLE"
  | "AFK"
  | "DISCONNECTED"
  | "RECONNECTING"
  | "SAFE_LOGOUT_PENDING"
  | "IN_COMBAT"
  | "IN_EVENT"
  | "IN_MINIGAME"
  | "IN_PRIVATE_INSTANCE";

/** Engagement tiers 0–4 derived from verified activity. */
export type EngagementTier = 0 | 1 | 2 | 3 | 4;

export type ActivityCategory =
  | "Social"
  | "RiftlingCare"
  | "Housing"
  | "Marketplace"
  | "Minigame"
  | "Performance"
  | "Exploration"
  | "Fishing"
  | "Crafting"
  | "Events"
  | "Helping"
  | "Resting";

/** Signals that prove a human is engaged (not motionless AFK). */
export type PresenceInputSignal =
  | "MOVE"
  | "CAMERA"
  | "INTERACT"
  | "CHAT"
  | "EMOTE"
  | "UI"
  | "PET"
  | "TRADE"
  | "MUSIC"
  | "HELP";

/** Meaningful social/rest actions that can earn Presence XP. */
export type PresenceActionKind =
  | "TOWN_VISIT"
  | "MARKET_BROWSE"
  | "NPC_TALK"
  | "CHAT"
  | "EMOTE"
  | "PET_CARE"
  | "HOME_VISIT"
  | "HOME_LIKE"
  | "FISH"
  | "CAMPFIRE_REST"
  | "PUBLIC_EVENT"
  | "MUSIC_LISTEN"
  | "TRADE"
  | "HELP_NEWBIE"
  | "FESTIVAL"
  | "SIT"
  | "WAVE"
  | "DANCE"
  | "GUESTBOOK"
  | "COMMUNITY_EVENT"
  | "READ_LORE"
  | "GARDEN"
  | "COOK"
  | "CRAFT_SOCIAL"
  | "PHOTO"
  | "DECORATE"
  | "WELCOME_NEWBIE"
  | "GROUP_EMOTE"
  | "PERFORMANCE"
  | "MINIGAME"
  | "INSTRUMENT"
  | "DAILY_TASK";

export type RestZoneKind =
  | "safe_zone"
  | "town_plaza"
  | "inn"
  | "campfire"
  | "homestead"
  | "fishing_dock"
  | "festival_grounds"
  | "market_square"
  | "logout_rest"
  | "tavern"
  | "park"
  | "library"
  | "guild_hall"
  | "music_stage"
  | "riftling_park"
  | "welcome_center"
  | "crafting_plaza"
  | "beach"
  | "port"
  | "sanctuary"
  | "public_farm"
  | "arena_viewing";

export type PlayerSocialStatus =
  | "Exploring"
  | "Trading"
  | "Resting"
  | "Socializing"
  | "Fishing"
  | "Helping"
  | "At Home"
  | "At Festival"
  | "Listening"
  | "Performing"
  | "Away";

/** Cosmetic titles only — never grant combat power. */
export type TownFeaturedTitle =
  | "Town Hero"
  | "Master Merchant"
  | "Community Favorite"
  | "Friendly Neighbor"
  | "Riftling Caregiver"
  | "Helpful Explorer"
  | "Festival Star"
  | "Home Designer"
  | "Campfire Host"
  | "Musical Performer"
  | "Newcomer Guide"
  | "Social Butterfly";

export type PresenceLevelId =
  | "wanderer"
  | "visitor"
  | "familiar_face"
  | "town_regular"
  | "friendly_neighbor"
  | "community_member"
  | "social_butterfly"
  | "town_ambassador"
  | "community_guardian"
  | "riftwilds_luminary";

export type PrivacySocialSettings = {
  allowHelperContact: boolean;
  allowRiftlingSocial: boolean;
  allowHomeVisits: boolean;
  showOnlineStatus: boolean;
  allowGroupEmotes: boolean;
  allowPerformanceInvites: boolean;
};

export type PresenceXpAward = {
  base: number;
  densityBonus: number;
  restBonus: number;
  total: number;
  capped: boolean;
};

export type AntiAfkVerdict = {
  ok: boolean;
  reason:
    | "ok"
    | "no_recent_signal"
    | "motionless"
    | "scripted_repetition"
    | "multi_account_guard"
    | "feature_disabled";
  message: string;
  lastSignalAgeMs: number | null;
};

export type PresenceInputEvent = {
  signal: PresenceInputSignal;
  at: number;
  detail?: string;
};

export type PresenceActionEvent = {
  id: string;
  kind: PresenceActionKind;
  at: number;
  locationId?: string;
  restZoneKind?: RestZoneKind;
  detail?: string;
  xpAwarded: number;
};

export type IdleParticipationClaim = {
  id: string;
  at: string;
  windowMinutes: number;
  credits: number;
  cosmeticStubId: string | null;
  presenceXp: number;
};

export type HomeVisitRecord = {
  homeId: string;
  visitorId: string;
  at: string;
  liked: boolean;
  rating: number | null;
  guestbookNote: string | null;
};

export type HomePopularity = {
  homeId: string;
  ownerLabel: string;
  likes: number;
  visits: number;
  avgRating: number | null;
  popularityScore: number;
};

export type PopularLocation = {
  locationId: string;
  label: string;
  regionSlug: string;
  activityScore: number;
  playersEstimate: number | null;
  kind: RestZoneKind | "landmark" | "event";
};

export type CommunityEventStub = {
  id: string;
  kind:
    | "traveling_merchant"
    | "street_musician"
    | "fireworks"
    | "town_crier"
    | "pet_parade"
    | "campfire_circle"
    | "world_event";
  label: string;
  regionSlug: string;
  locationId: string;
  startsAt: string;
  endsAt: string;
  presenceXpBonus: number;
  /** Optional phase label when kind is world_event. */
  phase?: string;
};

export type SocialPrompt = {
  id: string;
  text: string;
  suggestedAction: PresenceActionKind;
  regionSlug?: string;
};

export type SocialAchievementDef = {
  id: string;
  label: string;
  description: string;
  threshold: number;
  metric:
    | "presenceXp"
    | "emotes"
    | "homeVisits"
    | "helps"
    | "restMinutes"
    | "featuredHours";
  cosmeticReward: string;
};

export type FeaturedPlayerSlot = {
  title: TownFeaturedTitle;
  userId: string;
  displayName: string;
  regionSlug: string;
  hourKey: string;
  score: number;
  awardedAt: string;
};

export type TownReputationScore = {
  userId: string;
  regionSlug: string;
  hourKey: string;
  socialActions: number;
  presenceXp: number;
  helps: number;
  trades: number;
  likesReceived: number;
  score: number;
};

export type PresencePlayerState = {
  userId: string;
  presenceXp: number;
  lifetimePresenceXp: number;
  presenceLevel: PresenceLevelId;
  communityTokenBalance: number;
  communityTokensEarnedToday: number;
  communityTokenDayKey: string;
  activityScore: number;
  engagementTier: EngagementTier;
  serverPresenceState: ServerPresenceState;
  status: PlayerSocialStatus;
  statusSetAt: number | null;
  currentRegionSlug: string | null;
  currentLocationId: string | null;
  currentHubId: string | null;
  inRestZone: boolean;
  restZoneKind: RestZoneKind | null;
  inputs: PresenceInputEvent[];
  actions: PresenceActionEvent[];
  lastMeaningfulAt: number | null;
  genuineActiveMs: number;
  qualifiedActiveMs: number;
  lastIdleClaimAt: number | null;
  idleClaimsToday: number;
  idleClaimDayKey: string;
  presenceXpEarnedHour: number;
  presenceXpHourKey: string;
  presenceXpEarnedDay: number;
  presenceXpDayKey: string;
  categoryCounts: Partial<Record<ActivityCategory, number>>;
  categoryWindowStartedAt: number;
  achievementsUnlocked: string[];
  featuredTitles: TownFeaturedTitle[];
  activeFeaturedTitle: TownFeaturedTitle | null;
  homeLikesGiven: string[];
  fingerprintHash: string | null;
  helperOptIn: boolean;
  helperEligible: boolean;
  riskScore: number;
  socialRewardRestrictedUntil: number | null;
  privacy: PrivacySocialSettings;
  socialStreakDays: number;
  lastSocialStreakDayKey: string;
  sessionMilestonesClaimed: number[];
  dailyTaskProgress: Record<string, number>;
  dailyTaskDayKey: string;
  dailyTasksClaimed: string[];
  version: number;
};

export type SocialPresenceSnapshot = {
  enabled: boolean;
  presenceXp: number;
  lifetimePresenceXp: number;
  presenceLevel: PresenceLevelId;
  presenceLevelLabel: string;
  communityTokenBalance: number;
  activityScore: number;
  engagementTier: EngagementTier;
  serverPresenceState: ServerPresenceState;
  status: PlayerSocialStatus;
  inRestZone: boolean;
  restZoneKind: RestZoneKind | null;
  currentHubId: string | null;
  restBonusPercent: number;
  densityBonusPercent: number;
  nearbyEstimate: number | null;
  antiAfk: AntiAfkVerdict;
  nextIdleClaimInMs: number | null;
  caps: {
    presenceXpHour: number;
    presenceXpHourCap: number;
    presenceXpDay: number;
    presenceXpDayCap: number;
    communityTokensDay: number;
    communityTokensDayCap: number;
  };
  popularLocations: PopularLocation[];
  activeEvents: CommunityEventStub[];
  socialPrompt: SocialPrompt | null;
  featured: FeaturedPlayerSlot[];
  achievements: { id: string; label: string; unlocked: boolean }[];
  populationByRegion: { regionSlug: string; label: string; estimate: number | null }[];
  helperOptIn: boolean;
  dailyTasks: {
    id: string;
    title: string;
    progress: number;
    requirement: number;
    claimed: boolean;
  }[];
  note: string;
};

export type SocialPresenceAnalyticsEvent =
  | "presence_xp_award"
  | "presence_afk_block"
  | "presence_idle_claim"
  | "presence_rest_enter"
  | "presence_home_like"
  | "presence_featured_award"
  | "presence_community_event"
  | "presence_status_set"
  | "presence_scripted_block";
