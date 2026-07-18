/**
 * Automatic World Expansion — permanent neighborhoods for ownership,
 * temporary overflow maps for event crowds. Never house permanently on overflow.
 */

export type MapKind = "permanent" | "overflow" | "district_extension" | "beginner_seed";

export type ExpansionLifecycle =
  | "PLANNED"
  | "QUEUED"
  | "GENERATING"
  | "VALIDATING"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "SEEDING"
  | "OPEN"
  | "PAUSED"
  | "ARCHIVING"
  | "ARCHIVED"
  | "RETIRED"
  | "FAILED"
  | "ROLLED_BACK";

/** Player-facing density — never expose infra secrets. */
export type CrowdLabel = "Quiet" | "Settling" | "Lively" | "Busy" | "Full";

export type TemplateKey =
  | "forest_hamlet"
  | "coastal_village"
  | "mountain_hold"
  | "farming_croft"
  | "merchant_crossroads"
  | "harbor_port"
  | "beginner_meadow"
  | "guild_banner_court"
  | "island_archipelago"
  | "rift_edge_outpost";

export type BiomeKey =
  | "forest"
  | "coastal"
  | "mountain"
  | "farmland"
  | "merchant"
  | "harbor"
  | "meadow"
  | "guild"
  | "island"
  | "rift_edge";

export type CapacitySnapshot = {
  mapId: string;
  at: string;
  playersOnline: number;
  plotsOccupied: number;
  plotsTotal: number;
  visitors: number;
  entityCount: number;
  /** Stub latency ms — real telemetry later. */
  tickLatencyMs: number;
  softPlayerLimit: number;
  hardPlayerLimit: number;
  softPlotRatio: number;
  hardPlotRatio: number;
  /** Rolling avg of player load (0–1) over windows — festival spikes ignored for permanent cities. */
  rollingLoadAvg: number;
  spikeDetected: boolean;
  forecastNeedsExpansion: boolean;
  forecastNeedsOverflow: boolean;
};

export type PerformanceBudget = {
  maxProps: number;
  maxNpcs: number;
  maxPlots: number;
  maxDistricts: number;
  targetTickMs: number;
};

export type MapTemplate = {
  key: TemplateKey;
  name: string;
  biome: BiomeKey;
  mapKind: MapKind;
  blurb: string;
  housingStyles: string[];
  districtKinds: string[];
  hubs: string[];
  roadStyle: "curved_cobble" | "worn_dirt" | "boardwalk" | "stone_switchback";
  performanceBudget: PerformanceBudget;
  softPlayerLimit: number;
  hardPlayerLimit: number;
  targetPlotCount: { min: number; max: number };
  allowsPermanentHousing: boolean;
  generatorVersion: string;
};

export type GeneratedDistrict = {
  districtId: string;
  kind: string;
  name: string;
  flavor: string;
  plotIds: string[];
  landmarkId: string | null;
};

export type GeneratedPlot = {
  plotId: string;
  districtId: string;
  col: number;
  row: number;
  deedSize: string;
  roadAccess: boolean;
  waterAccess: boolean;
  uniqueKey: string;
};

export type GeneratedLandmark = {
  landmarkId: string;
  name: string;
  kind: string;
  col: number;
  row: number;
};

export type GeneratedHub = {
  hubId: string;
  name: string;
  kind: string;
  col: number;
  row: number;
};

export type GeneratedRoad = {
  roadId: string;
  from: { col: number; row: number };
  to: { col: number; row: number };
  style: string;
};

export type WorldMapRecord = {
  mapId: string;
  publicName: string;
  templateKey: TemplateKey;
  biome: BiomeKey;
  mapKind: MapKind;
  lifecycle: ExpansionLifecycle;
  seed: string;
  regionSlug: string;
  /** Linked neighborhood when permanent housing is allowed. */
  neighborhoodId: string | null;
  allowsPermanentHousing: boolean;
  softPlayerLimit: number;
  hardPlayerLimit: number;
  plotsTotal: number;
  plotsOccupied: number;
  playersOnline: number;
  visitors: number;
  entityCount: number;
  tickLatencyMs: number;
  crowdLabel: CrowdLabel;
  founderTitleKey: string | null;
  generatorVersion: string;
  templateVersion: string;
  seedVersion: string;
  parentMapId: string | null;
  overflowEventKey: string | null;
  expiresAt: string | null;
  districts: GeneratedDistrict[];
  plots: GeneratedPlot[];
  landmarks: GeneratedLandmark[];
  hubs: GeneratedHub[];
  roads: GeneratedRoad[];
  connections: WorldConnection[];
  validationReportId: string | null;
  createdAt: string;
  updatedAt: string;
  openedAt: string | null;
  archivedAt: string | null;
};

export type WorldConnection = {
  connectionId: string;
  fromMapId: string;
  toMapId: string;
  kind: "road" | "gate" | "boat" | "fast_travel_stub";
  label: string;
  bidirectional: boolean;
};

export type ExpansionRequest = {
  requestId: string;
  reason: "capacity" | "housing_scarce" | "district" | "festival_overflow" | "admin" | "forecast";
  sourceMapId: string | null;
  templateKey: TemplateKey;
  mapKind: MapKind;
  lifecycle: ExpansionLifecycle;
  priority: number;
  createdAt: string;
  updatedAt: string;
  jobId: string | null;
  resultingMapId: string | null;
  note: string | null;
  adminActorId: string | null;
};

export type GenerationJob = {
  jobId: string;
  expansionRequestId: string;
  status: "queued" | "running" | "retrying" | "succeeded" | "failed" | "cleaned_up";
  attempts: number;
  maxAttempts: number;
  seed: string;
  templateKey: TemplateKey;
  mapId: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlayerMapAssignment = {
  userId: string;
  mapId: string;
  reason:
    | "owned_property"
    | "party"
    | "friends"
    | "guild"
    | "region"
    | "latency"
    | "population"
    | "housing"
    | "new_player"
    | "overflow_event"
    | "admin";
  assignedAt: string;
  stickyUntil: string | null;
};

export type RelocationRequest = {
  relocationId: string;
  userId: string;
  fromMapId: string;
  toMapId: string;
  fromPlotId: string | null;
  toPlotId: string | null;
  status:
    | "pending"
    | "snapshot"
    | "moving"
    | "completed"
    | "failed"
    | "rolled_back"
    | "guild_pending_approval"
    | "cancelled";
  snapshotHash: string | null;
  furnitureIds: string[];
  idempotencyKey: string;
  guildApprovalRequired: boolean;
  guildApprovedBy: string | null;
  createdAt: string;
  updatedAt: string;
  error: string | null;
};

export type ValidationReport = {
  reportId: string;
  mapId: string;
  passed: boolean;
  checks: {
    key: string;
    ok: boolean;
    detail: string;
  }[];
  visualQaStub: {
    navWalkable: boolean;
    plotsReachable: boolean;
    safeLogoutPresent: boolean;
    performanceWithinBudget: boolean;
  };
  createdAt: string;
};

export type AdminAuditEntry = {
  id: string;
  at: string;
  actorId: string;
  action: string;
  mapId: string | null;
  detail: string;
};

export type FounderReward = {
  userId: string;
  mapId: string;
  titleKey: string;
  cosmeticKeys: string[];
  furnitureKeys: string[];
  /** Explicitly never SOL / combat / rare Riftlings / land speculation. */
  grantsSol: false;
  grantsCombatPower: false;
  grantsRareRiftlings: false;
  grantsLandSpeculation: false;
  claimedAt: string;
};

export type PublicMapDirectoryEntry = {
  mapId: string;
  name: string;
  biome: BiomeKey;
  crowdLabel: CrowdLabel;
  friendsPresent: number;
  guildPresent: boolean;
  hasActiveEvent: boolean;
  housingAvailable: boolean;
  isOverflow: boolean;
  regionSlug: string;
};
