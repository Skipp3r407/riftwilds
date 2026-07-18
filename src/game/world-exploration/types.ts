/**
 * Dynamic world map / exploration types.
 * Markers are visibility-gated — hidden content never leaks coordinates or names.
 */

import type { QuestStatus } from "@/game/quests/quest-types";

/** Legend / filter categories shown on the world map. */
export type MapLegendCategory =
  | "quests"
  | "services"
  | "portals"
  | "waypoints"
  | "gateways"
  | "treasures"
  | "enemies"
  | "bosses"
  | "pois"
  | "habitats"
  | "events"
  | "custom"
  | "perks";

export type MapMarkerKind =
  | "quest"
  | "service"
  | "portal"
  | "waypoint"
  | "gateway"
  | "treasure"
  | "enemy_territory"
  | "world_boss"
  | "poi"
  | "habitat"
  | "world_event"
  | "custom"
  | "perk"
  | "landmark";

export type MapMarkerVisibility =
  | "visible"
  | "discovered"
  | "region_hint"
  | "hidden";

export type MapMarkerState =
  | "idle"
  | "available"
  | "active"
  | "tracked"
  | "completed"
  | "locked"
  | "undiscovered"
  | "discovered"
  | "nearby"
  | "claimed"
  | "defeated"
  | "live";

export type MapMarker = {
  id: string;
  kind: MapMarkerKind;
  category: MapLegendCategory;
  regionSlug: string;
  /** World-pixel coords when known; null for region-level-only hints. */
  x: number | null;
  y: number | null;
  /** Safe display label (never spoils secrets). */
  label: string;
  /** Optional subtitle (progress, fee, etc.). */
  subtitle?: string;
  state: MapMarkerState;
  visibility: MapMarkerVisibility;
  /** Icon key resolved via map-icons. */
  iconKey: string;
  /** Search / filter tokens (no secret names until discovered). */
  searchText: string;
  /** Quest key when derived from quest catalog. */
  questKey?: string;
  questStatus?: QuestStatus;
  /** Codex deep-link path when discovery allows. */
  codexHref?: string | null;
  /** Source object id from blueprint when applicable. */
  sourceObjectId?: string;
  /** Cluster grouping key (region + kind bucket). */
  clusterKey: string;
  priority: number;
  metadata?: Record<string, unknown>;
};

export type LegendToggleState = Record<MapLegendCategory, boolean>;

export const DEFAULT_LEGEND_TOGGLES: LegendToggleState = {
  quests: true,
  services: true,
  portals: true,
  waypoints: true,
  gateways: true,
  treasures: true,
  enemies: true,
  bosses: true,
  pois: true,
  habitats: true,
  events: true,
  custom: true,
  perks: true,
};

export type CustomWaypoint = {
  id: string;
  regionSlug: string;
  x: number;
  y: number;
  label: string;
  note?: string;
  createdAt: number;
};

export type DiscoveryKind =
  | "treasure"
  | "poi"
  | "hidden_area"
  | "habitat"
  | "enemy_territory"
  | "world_boss"
  | "perk"
  | "landmark"
  | "secret_quest";

export type DiscoverableDef = {
  id: string;
  kind: DiscoveryKind;
  regionSlug: string;
  /** Internal name — never shown until discovered. */
  secretName: string;
  /** Vague clue shown before discovery (no coords). */
  clue: string;
  x: number;
  y: number;
  /** Radius for proximity discovery (world px). */
  discoverRadius: number;
  /** Optional quest keys that reveal a region-level hint. */
  clueQuestKeys?: string[];
  codexSlug?: string;
  rewards?: { kind: string; amount?: number; label: string }[];
  /** Habitat species slug when kind === habitat. */
  habitatSpeciesSlug?: string;
  bossId?: string;
  enemyId?: string;
  /** Perk granted on discovery when kind === perk. */
  perkId?: string;
};

export type ExplorationLogEntry = {
  id: string;
  at: number;
  regionSlug: string;
  kind: DiscoveryKind | "quest" | "gateway" | "fog" | "custom";
  /** Non-spoiling summary. */
  summary: string;
  discoverableId?: string;
  questKey?: string;
};

export type ExplorationPerkDef = {
  id: string;
  name: string;
  description: string;
  regionSlug?: string;
  /** Hidden until earned — UI shows placeholder before. */
  hiddenUntilEarned: true;
  /** Discoverable or milestone that grants this perk. */
  grantFrom: string;
};

export type RegionCompletionSnapshot = {
  regionSlug: string;
  fogPercent: number;
  landmarksDiscovered: number;
  landmarksTotal: number;
  treasuresFound: number;
  treasuresTotal: number;
  poisFound: number;
  poisTotal: number;
  habitatsFound: number;
  habitatsTotal: number;
  bossesDefeated: number;
  bossesTotal: number;
  questsComplete: number;
  questsTotal: number;
  /** 0–100 weighted completion. */
  percentComplete: number;
};

export type ExplorationProgressState = {
  version: 1;
  discoveredIds: string[];
  claimedTreasureIds: string[];
  earnedPerkIds: string[];
  defeatedBossIds: string[];
  log: ExplorationLogEntry[];
  customWaypoints: CustomWaypoint[];
  legendToggles: LegendToggleState;
  updatedAt: number;
};

export type MarkerQuery = {
  regionSlug?: string | null;
  search?: string;
  legend?: Partial<LegendToggleState>;
  /** Player position for nearby / proximity filters. */
  player?: { regionSlug: string; x: number; y: number } | null;
  /** Max distance for "nearby" minimap pins (world px). */
  nearbyRadius?: number;
  /** Include region-hint markers (vague, no coords). */
  includeHints?: boolean;
  /** Cap for performance. */
  limit?: number;
  /** Cluster when marker count exceeds threshold. */
  clusterThreshold?: number;
};

export type MarkerCluster = {
  id: string;
  regionSlug: string;
  x: number;
  y: number;
  count: number;
  kinds: MapMarkerKind[];
  label: string;
  markers: MapMarker[];
};

export type MapMarkerResult = {
  markers: MapMarker[];
  clusters: MarkerCluster[];
  hints: MapMarker[];
  truncated: boolean;
};
