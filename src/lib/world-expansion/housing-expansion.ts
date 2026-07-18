/**
 * Housing expansion — spin permanent neighborhoods with plot variety when scarce.
 * Coordinates with neighborhoods service; never assigns deeds on overflow maps.
 */

import { createRequestId } from "@/lib/utils/request-id";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  getNeighborhood,
  listNeighborhoods,
  resetNeighborhoodsForTests,
} from "@/lib/neighborhoods/neighborhood-service";
import type { PlayerNeighborhood, PlayerPlot, DeedSize, DistrictKind } from "@/lib/neighborhoods/types";
import { getDeed, LAND_DEEDS } from "@/lib/neighborhoods/land-deeds";
import { buildingsForStage } from "@/lib/neighborhoods/evolution";
import { PLOT_SOFT_RATIO } from "@/lib/world-expansion/config";
import { planAndGenerate } from "@/lib/world-expansion/generation-service";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { WorldMapRecord } from "@/lib/world-expansion/types";

/** Soft-extend neighborhoods module store to register generated neighborhoods. */
function neighborhoodWriteStore(): Map<string, PlayerNeighborhood> {
  // Access via list + side-effect registration through global used by neighborhood-service
  const g = globalThis as unknown as {
    __rwNeighborhoods?: { neighborhoods: Map<string, PlayerNeighborhood>; recentClaimKeys: string[] };
  };
  if (!g.__rwNeighborhoods) {
    // Ensure seeded
    listNeighborhoods();
  }
  return g.__rwNeighborhoods!.neighborhoods;
}

export function plotScarcity(neighborhoodId: string): {
  occupied: number;
  total: number;
  ratio: number;
  scarce: boolean;
} {
  const n = getNeighborhood(neighborhoodId);
  if (!n) return { occupied: 0, total: 0, ratio: 0, scarce: false };
  const occupied = n.plots.filter((p) => p.status === "owned" || p.status === "for_sale").length;
  const total = n.plots.length;
  const ratio = total > 0 ? occupied / total : 0;
  return { occupied, total, ratio, scarce: ratio >= PLOT_SOFT_RATIO };
}

/**
 * Create a permanent map + linked neighborhood with varied deed sizes.
 * Overflow maps are rejected.
 */
export function expandHousingNeighborhood(params: {
  sourceMapId: string;
  templateKey?: WorldMapRecord["templateKey"];
  autoOpen?: boolean;
}):
  | { ok: true; map: WorldMapRecord; neighborhood: PlayerNeighborhood }
  | { ok: false; error: string; message: string } {
  if (
    !isFeatureEnabled("WORLD_EXPANSION_ENABLED") ||
    !isFeatureEnabled("PLAYER_NEIGHBORHOODS_ENABLED")
  ) {
    return { ok: false, error: "disabled", message: "Housing expansion disabled." };
  }

  const source = getExpansionStore().maps.get(params.sourceMapId);
  if (!source) return { ok: false, error: "missing_source", message: "Source map missing." };
  if (source.mapKind === "overflow") {
    return {
      ok: false,
      error: "overflow_source",
      message: "Cannot expand permanent housing from an overflow map.",
    };
  }

  const gen = planAndGenerate({
    reason: "housing_scarce",
    sourceMapId: params.sourceMapId,
    templateKey: params.templateKey ?? "forest_hamlet",
    mapKind: "permanent",
    autoOpen: params.autoOpen ?? true,
    adminActorId: "housing_expansion",
  });
  if (!gen.ok) return { ok: false, error: gen.error, message: "Generation failed." };
  if (!gen.map.allowsPermanentHousing || gen.map.mapKind === "overflow") {
    return {
      ok: false,
      error: "no_permanent_housing",
      message: "Generated map cannot host permanent housing.",
    };
  }

  const neighborhood = materializeNeighborhoodFromMap(gen.map);
  gen.map.neighborhoodId = neighborhood.neighborhoodId;
  gen.map.plotsOccupied = 0;
  gen.map.plotsTotal = neighborhood.plots.length;
  gen.map.updatedAt = new Date().toISOString();
  getExpansionStore().maps.set(gen.map.mapId, gen.map);

  return { ok: true, map: gen.map, neighborhood };
}

export function materializeNeighborhoodFromMap(map: WorldMapRecord): PlayerNeighborhood {
  const now = new Date().toISOString();
  const neighborhoodId = `nbhd_${map.mapId}`;
  const districts = map.districts.map((d) => ({
    districtId: d.districtId,
    kind: d.kind as DistrictKind,
    name: d.name,
    flavor: d.flavor,
    plotIds: [...d.plotIds],
  }));

  const plots: PlayerPlot[] = map.plots.map((p, i) => {
    const deed = getDeed((p.deedSize as DeedSize) || LAND_DEEDS[i % LAND_DEEDS.length]!.size);
    return {
      plotId: p.plotId,
      neighborhoodId,
      districtId: p.districtId,
      ownerUserId: null,
      deedSize: deed?.size ?? "small",
      coords: { col: p.col, row: p.row },
      biome: map.biome,
      elevation: deed?.elevation ?? "mid",
      roadAccess: p.roadAccess,
      waterAccess: p.waterAccess,
      buildLimit: deed?.buildLimit ?? 20,
      decorLimit: deed?.decorLimit ?? 40,
      status: "vacant",
      homeId: null,
      exteriorFacadeKey: null,
      mailbox: true,
      abandonedWarnedAt: null,
      lastActivityAt: now,
    };
  });

  const nbhd: PlayerNeighborhood = {
    neighborhoodId,
    name: map.publicName,
    regionSlug: map.regionSlug,
    mapId: map.mapId,
    stage: "hamlet",
    occupiedHomes: 0,
    plotCap: plots.length,
    districts,
    plots,
    projects: [],
    contributions: [],
    publicBuildings: buildingsForStage("hamlet"),
    stores: [],
    government: {
      neighborhoodId,
      mayorUserId: null,
      councilUserIds: [],
      activeMotions: [],
    },
    events: [],
    landmarks: map.landmarks.map((lm) => ({
      landmarkId: lm.landmarkId,
      neighborhoodId,
      name: lm.name,
      kind: lm.kind,
      coords: { col: lm.col, row: lm.row },
      seasonalDecor: null,
    })),
    npcLife: { musicians: 1, animals: 2, visitors: 1, campfiresLit: true },
    reputation: 0,
    seasonalDecorTheme: null,
    sharedRoads: true,
    lightingPreset: "lantern_dusk",
    createdAt: now,
    updatedAt: now,
  };

  neighborhoodWriteStore().set(neighborhoodId, nbhd);
  return nbhd;
}

/** Expand district variety inside an existing city map (additive plots only). */
export function expandDistrictOnMap(params: {
  mapId: string;
  districtKind: DistrictKind;
  additionalPlots?: number;
}):
  | { ok: true; map: WorldMapRecord; neighborhood: PlayerNeighborhood | null }
  | { ok: false; error: string; message: string } {
  const s = getExpansionStore();
  const map = s.maps.get(params.mapId);
  if (!map) return { ok: false, error: "missing_map", message: "Map not found." };
  if (map.mapKind === "overflow" || !map.allowsPermanentHousing) {
    return {
      ok: false,
      error: "overflow",
      message: "District expansion forbidden on temporary overflow maps.",
    };
  }
  if (map.lifecycle === "OPEN" && map.playersOnline > 0) {
    // Additive only — append plots, never rebuild roads under players
  }

  const count = params.additionalPlots ?? 4;
  const districtId = `dist_${map.mapId}_${params.districtKind}_${createRequestId().slice(0, 6)}`;
  const newPlotIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const col = 10 + i;
    const row = 3 + (map.districts.length % 3);
    const plotId = `plot_${map.mapId}_ext_${col}_${row}`;
    map.plots.push({
      plotId,
      districtId,
      col,
      row,
      deedSize: LAND_DEEDS[i % LAND_DEEDS.length]!.size,
      roadAccess: true,
      waterAccess: false,
      uniqueKey: `${map.seed}:ext:${col}:${row}`,
    });
    newPlotIds.push(plotId);
  }
  map.districts.push({
    districtId,
    kind: params.districtKind,
    name: `${params.districtKind} extension`,
    flavor: "Additive district wing — occupied map roads untouched.",
    plotIds: newPlotIds,
    landmarkId: null,
  });
  map.plotsTotal = map.plots.length;
  map.updatedAt = new Date().toISOString();
  s.maps.set(map.mapId, map);

  let neighborhood: PlayerNeighborhood | null = null;
  if (map.neighborhoodId) {
    const n = getNeighborhood(map.neighborhoodId);
    if (n) {
      for (const p of map.plots.filter((x) => newPlotIds.includes(x.plotId))) {
        if (n.plots.some((np) => np.plotId === p.plotId)) continue;
        const deed = getDeed(p.deedSize as DeedSize);
        n.plots.push({
          plotId: p.plotId,
          neighborhoodId: n.neighborhoodId,
          districtId: p.districtId,
          ownerUserId: null,
          deedSize: deed?.size ?? "small",
          coords: { col: p.col, row: p.row },
          biome: map.biome,
          elevation: "mid",
          roadAccess: true,
          waterAccess: false,
          buildLimit: deed?.buildLimit ?? 20,
          decorLimit: deed?.decorLimit ?? 40,
          status: "vacant",
          homeId: null,
          exteriorFacadeKey: null,
          mailbox: true,
          abandonedWarnedAt: null,
          lastActivityAt: new Date().toISOString(),
        });
      }
      n.districts.push({
        districtId,
        kind: params.districtKind,
        name: `${params.districtKind} wing`,
        flavor: "City district expansion",
        plotIds: newPlotIds,
      });
      n.plotCap = n.plots.length;
      n.updatedAt = new Date().toISOString();
      neighborhoodWriteStore().set(n.neighborhoodId, n);
      neighborhood = n;
    }
  }

  return { ok: true, map, neighborhood };
}

/** Test helper re-export — keep neighborhoods reset paired. */
export function resetHousingExpansionForTests(): void {
  resetNeighborhoodsForTests();
}
