/**
 * Full Rift Storm event types — integrated with loyalty/airdrops (not a duplicate system).
 */

import type { AirdropRewardDef, LoyaltyTier, RewardRarity } from "@/lib/loyalty/types";

export const STORM_INTENSITY_TIERS = [
  "MINOR",
  "GREATER",
  "LEGENDARY",
  "SEASONAL",
  "CATACLYSM",
] as const;

export type StormIntensityTier = (typeof STORM_INTENSITY_TIERS)[number];

export const STORM_PHASES = ["IDLE", "WARNING", "ACTIVE", "WAVE_RESOLVE", "ENDED", "CANCELLED"] as const;
export type StormPhase = (typeof STORM_PHASES)[number];

export const STORM_TRIGGER_REASONS = [
  "RANDOM_ACTIVE_HOURS",
  "SEASONAL",
  "WORLD_BOSS",
  "COMMUNITY_MILESTONE",
  "ADMIN",
  "REGION_OBJECTIVE",
  "ANNIVERSARY",
  "EMERGENCY_STIMULATION",
  "SCHEDULED",
  "DEV",
] as const;

export type StormTriggerReason = (typeof STORM_TRIGGER_REASONS)[number];

export const STORM_PARTICIPATION_ACTIONS = [
  "QUEST_OBJECTIVE",
  "QUEST_COMPLETE",
  "COMBAT",
  "BOSS_PARTICIPATE",
  "BOSS_DEFEAT",
  "GATHER",
  "CRAFT",
  "FISH",
  "EXPLORE",
  "PUBLIC_EVENT",
  "PARTY_HELP",
  "HEAL_SUPPORT",
  "APPROVED_TRADE",
  "RIFTLING_CARE",
  "PUZZLE",
  "TREASURE",
  "RARE_DISCOVERY",
  "TEMP_QUEST",
  "REGION_TRAVEL",
] as const;

export type StormParticipationAction = (typeof STORM_PARTICIPATION_ACTIONS)[number];

export type StormWaveId = "WAVE_1" | "WAVE_2" | "WAVE_3" | "FINAL";

export type StormWaveDef = {
  id: StormWaveId;
  label: string;
  /** Offset from ACTIVE start. */
  startsAfterMs: number;
  durationMs: number;
  /** Min participation score to roll this wave. */
  minScore: number;
  tableId: string;
  rarityFloor?: RewardRarity;
  guaranteedParticipation?: boolean;
};

export type CommunityObjectiveDef = {
  id: string;
  label: string;
  description: string;
  targetScore: number;
  personalThreshold: number;
  rewardCredits: number;
  rewardLoyaltyTokens: number;
  cosmeticId?: string;
};

export type RegionalStormEffects = {
  regionIds: string[];
  weather: string;
  empoweredEnemies: boolean;
  rareRiftlings: boolean;
  treasureNodes: boolean;
  npcReactions: boolean;
  tempQuests: boolean;
  mapMarkers: boolean;
  mustTravel: boolean;
  /** Global storms ignore region gate. */
  global: boolean;
};

export type StormWorldPresentation = {
  riftSkies: boolean;
  particles: "full" | "reduced" | "off";
  audioCue: string;
  tempPortals: boolean;
  enemySpawns: boolean;
  treasureSpawns: boolean;
  npcWarnings: boolean;
  /** Accessibility — reduce flash / motion. */
  a11yReducedMotion: boolean;
  a11yNoFlash: boolean;
};

export type TempStormQuest = {
  id: string;
  label: string;
  npcRole: "guard" | "scholar" | "merchant" | "child" | "criminal";
  objective:
    | "seal_rift"
    | "rescue"
    | "protect"
    | "fragments"
    | "escort"
    | "storm_energy"
    | "event_boss"
    | "treasure"
    | "rare_riftling";
  regionId?: string;
  expiresAt: string;
  points: number;
};

export type StormSolGrantAttempt = {
  attempted: boolean;
  granted: boolean;
  lamports?: number;
  signature?: string | null;
  substitutedNonSol: boolean;
  substituteRewardId?: string;
  failReason?:
    | "flag_off"
    | "pool_empty"
    | "cap_exceeded"
    | "no_wallet"
    | "fraud"
    | "duplicate"
    | "verify_failed";
};

export type UnclaimedInboxItem = {
  id: string;
  stormId: string;
  userId: string;
  waveId: StormWaveId;
  reward: AirdropRewardDef;
  createdAt: string;
  expiresAt: string;
  claimedAt: string | null;
  claimKey: string;
};

export type StormAuditEntry = {
  id: string;
  at: string;
  stormId: string;
  action:
    | "activate"
    | "warn"
    | "start_active"
    | "wave"
    | "participate"
    | "select"
    | "claim"
    | "cancel"
    | "sol_attempt"
    | "community_progress"
    | "disconnect_grace";
  userId?: string;
  detail?: Record<string, string | number | boolean | null>;
};

export type StormParticipantState = {
  userId: string;
  stormId: string;
  score: number;
  actionCounts: Partial<Record<StormParticipationAction, number>>;
  lastActionAt: string | null;
  qualified: boolean;
  personalContribution: number;
  wavesRolled: StormWaveId[];
  recentRewardIds: string[];
  accountAgeDays: number;
  fraudRisk: number;
  disconnectGraceUntil: string | null;
  regionId: string | null;
  pityBonusApplied: boolean;
};

export type RiftStormState = {
  id: string;
  phase: StormPhase;
  intensity: StormIntensityTier;
  triggerReason: StormTriggerReason;
  /** Legacy compat — true when WARNING or ACTIVE. */
  active: boolean;
  warningStartedAt: string | null;
  warningEndsAt: string | null;
  startedAt: string | null;
  endsAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  worldMessage: string;
  warningMessage: string;
  participantCount: number;
  winnerCount: number;
  qualifiedCount: number;
  publicHighlights: string[];
  triggeredBy: "admin" | "scheduled" | "dev" | "system";
  eligibleRegions: string[];
  regional: RegionalStormEffects;
  presentation: StormWorldPresentation;
  currentWave: StormWaveId | null;
  wavesCompleted: StormWaveId[];
  community: {
    objective: CommunityObjectiveDef;
    communityScore: number;
    milestonesHit: number[];
  };
  tempQuests: TempStormQuest[];
  solPoolLamports: number;
  solGrantedLamports: number;
  solGrantsCount: number;
  seedCommit: string;
  /** Revealed after event for audit — not usable to predict mid-event. */
  seedReveal: string | null;
};

export type StormPlayerView = {
  storm: RiftStormState | null;
  participant: StormParticipantState | null;
  tierBoostPercent: number;
  loyaltyTier: LoyaltyTier;
  canParticipate: boolean;
  participationRequirements: string[];
  rewardCategories: string[];
  inbox: UnclaimedInboxItem[];
  communityPersonal: number;
  communityTotal: number;
  communityTarget: number;
  communityQualified: boolean;
  nextMilestone: number | null;
  timeRemainingMs: number;
  warningRemainingMs: number;
  privacyNote: string;
};
