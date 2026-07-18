/** World travel / Gateway network shared types. */

export type TravelBlockReason =
  | "combat"
  | "dialogue"
  | "cutscene"
  | "interaction_menu"
  | "map_panel"
  | "loading"
  | "party_pending"
  | "insufficient_credits"
  | "gateway_locked"
  | "region_locked"
  | "same_region"
  | "feature_disabled";

export type UnlockRequirementKind =
  | "story"
  | "quest"
  | "boss"
  | "reputation"
  | "restoration"
  | "level"
  | "region_visit"
  | "gateway";

export type UnlockRequirement = {
  kind: UnlockRequirementKind;
  key: string;
  label: string;
  met: boolean;
};

export type RegionUnlockView = {
  regionId: string;
  unlocked: boolean;
  teaser: string;
  requirements: UnlockRequirement[];
  note: string;
};

export type GatewayStoneDef = {
  id: string;
  regionId: string;
  label: string;
  /** Map pin blurb when locked / undiscovered. */
  teaser: string;
  /** Credits fee when leaving via fast travel FROM this stone (0 = free). */
  outboundFeeCredits: number;
  /** Early-game free corridor (starter hubs). */
  freeEarly: boolean;
};

export type ContinentEdge = {
  from: string;
  to: string;
  kind: "spine" | "hub" | "peer" | "return";
  label?: string;
};

export type DiscoveryRewardKind =
  | "codex"
  | "xp"
  | "exploration_points"
  | "credits"
  | "achievement";

export type DiscoveryReward = {
  kind: DiscoveryRewardKind;
  amount?: number;
  key?: string;
  label: string;
};

export type DiscoveryResult = {
  firstVisit: boolean;
  rewards: DiscoveryReward[];
  alreadyClaimed: boolean;
};

export type FastTravelPreview = {
  fromRegionId: string;
  toRegionId: string;
  fromGatewayId: string;
  toGatewayId: string;
  feeCredits: number;
  free: boolean;
  blocked: TravelBlockReason | null;
  blockMessage: string | null;
  toName: string;
  teaser: string;
};

export type TravelTransitionPlan = {
  fromRegionId: string;
  toRegionId: string;
  musicKey: string;
  ambientRegionId: string;
  loadingArtSrc: string;
  fadeMs: number;
  streamStub: "load_target" | "unload_distant";
};

export type PartyTravelInvite = {
  id: string;
  leaderName: string;
  toRegionId: string;
  toName: string;
  expiresAt: number;
  status: "pending" | "accepted" | "declined" | "expired";
};

export type CaravanStub = {
  id: string;
  npcName: string;
  fromRegionId: string;
  toRegionId: string;
  feeCredits: number;
  note: string;
};

export type WorldCompletionSnapshot = {
  regionsDiscovered: number;
  regionsTotal: number;
  gatewaysActivated: number;
  gatewaysTotal: number;
  fogAverage: number;
  explorationPoints: number;
  explorationXp: number;
  percentComplete: number;
  milestones: string[];
};

export type WorldTravelProgress = {
  version: 1;
  /** Permanently activated Gateway Stones (region first visit). */
  activatedGateways: string[];
  /** Region ids discovered (physical visit). */
  regionsDiscovered: string[];
  /** One-time discovery reward keys already granted. */
  claimedDiscoveryRewards: string[];
  explorationPoints: number;
  explorationXp: number;
  playerLevel: number;
  storyChapters: string[];
  bossesDefeated: string[];
  /** Restored civilization / gateway keys. */
  gatewaysRestored: string[];
  /** Reputation scores by faction id. */
  reputation: Record<string, number>;
  /** Quest keys completed (travel unlocks). */
  completedQuests: string[];
  /** Achievement keys unlocked via travel. */
  travelAchievements: string[];
  updatedAt: number;
};
