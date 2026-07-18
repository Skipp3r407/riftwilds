import type {
  AdminAuditEntry,
  ExpansionRequest,
  FounderReward,
  GenerationJob,
  PlayerMapAssignment,
  RelocationRequest,
  ValidationReport,
  WorldMapRecord,
} from "@/lib/world-expansion/types";

export type WorldExpansionStore = {
  maps: Map<string, WorldMapRecord>;
  requests: Map<string, ExpansionRequest>;
  jobs: Map<string, GenerationJob>;
  assignments: Map<string, PlayerMapAssignment>;
  relocations: Map<string, RelocationRequest>;
  validations: Map<string, ValidationReport>;
  founders: Map<string, FounderReward>;
  audit: AdminAuditEntry[];
  /** Furniture move locks — prevent dupes during relocation. */
  furnitureLocks: Set<string>;
  /** Idempotency keys for relocation. */
  relocationIdempotency: Map<string, string>;
};

export function getExpansionStore(): WorldExpansionStore {
  const g = globalThis as unknown as { __rwWorldExpansion?: WorldExpansionStore };
  if (!g.__rwWorldExpansion) {
    g.__rwWorldExpansion = {
      maps: new Map(),
      requests: new Map(),
      jobs: new Map(),
      assignments: new Map(),
      relocations: new Map(),
      validations: new Map(),
      founders: new Map(),
      audit: [],
      furnitureLocks: new Set(),
      relocationIdempotency: new Map(),
    };
    seedStarterMaps(g.__rwWorldExpansion);
  }
  return g.__rwWorldExpansion;
}

export function resetWorldExpansionForTests(): void {
  const g = globalThis as unknown as { __rwWorldExpansion?: WorldExpansionStore };
  g.__rwWorldExpansion = undefined;
  getExpansionStore();
}

function seedStarterMaps(s: WorldExpansionStore): void {
  const now = new Date().toISOString();
  const commons: WorldMapRecord = {
    mapId: "map_riftwild_commons",
    publicName: "Riftwild Commons",
    templateKey: "beginner_meadow",
    biome: "meadow",
    mapKind: "permanent",
    lifecycle: "OPEN",
    seed: "seed_commons_canonical",
    regionSlug: "riftwild-commons",
    neighborhoodId: "nbhd_commons_alpha",
    allowsPermanentHousing: true,
    softPlayerLimit: 100,
    hardPlayerLimit: 150,
    plotsTotal: 36,
    plotsOccupied: 0,
    playersOnline: 12,
    visitors: 4,
    entityCount: 80,
    tickLatencyMs: 8,
    crowdLabel: "Quiet",
    founderTitleKey: null,
    generatorVersion: "1.0.0",
    templateVersion: "1.0.0",
    seedVersion: "1.0.0",
    parentMapId: null,
    overflowEventKey: null,
    expiresAt: null,
    districts: [],
    plots: [],
    landmarks: [],
    hubs: [],
    roads: [],
    connections: [],
    validationReportId: null,
    createdAt: now,
    updatedAt: now,
    openedAt: now,
    archivedAt: null,
  };
  s.maps.set(commons.mapId, commons);
}
