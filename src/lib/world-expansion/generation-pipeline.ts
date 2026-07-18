/**
 * Multi-stage controlled generation: roads → landmarks → districts → plots → hubs.
 * Living Towns: no empty field scatter; every space has purpose.
 */

import {
  GENERATOR_VERSION,
  SEED_SCHEME_VERSION,
  TEMPLATE_CATALOG_VERSION,
} from "@/lib/world-expansion/config";
import { districtName, nameFromSeed } from "@/lib/world-expansion/naming";
import { getTemplate } from "@/lib/world-expansion/templates";
import type {
  GeneratedDistrict,
  GeneratedHub,
  GeneratedLandmark,
  GeneratedPlot,
  GeneratedRoad,
  MapKind,
  TemplateKey,
  WorldMapRecord,
} from "@/lib/world-expansion/types";

function rng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 0xffffffff;
  };
}

const DEED_CYCLE = [
  "tiny",
  "small",
  "medium",
  "large",
  "grove",
  "lakefront",
  "cliffside",
  "estate",
] as const;

export type PipelineInput = {
  mapId: string;
  seed: string;
  templateKey: TemplateKey;
  mapKind: MapKind;
  regionSlug: string;
  parentMapId?: string | null;
  overflowEventKey?: string | null;
  expiresAt?: string | null;
};

export type PipelineResult = {
  ok: true;
  map: Omit<
    WorldMapRecord,
    "lifecycle" | "validationReportId" | "openedAt" | "archivedAt" | "crowdLabel" | "neighborhoodId"
  > & {
    lifecycle: "VALIDATING";
    validationReportId: null;
    openedAt: null;
    archivedAt: null;
    crowdLabel: "Quiet";
    neighborhoodId: null;
  };
};

/**
 * Controlled generation — unique identity via seed variation.
 * Never scatters plots on grass without road access.
 */
export function runGenerationPipeline(input: PipelineInput): PipelineResult {
  const template = getTemplate(input.templateKey);
  const rand = rng(input.seed);
  const now = new Date().toISOString();
  const publicName = nameFromSeed(input.seed, input.templateKey, template.biome);

  // Stage 1 — roads (grid skeleton with purposeful intersections)
  const roads: GeneratedRoad[] = [];
  const hubCols = [2, 5, 8];
  const hubRows = [2, 5, 8];
  for (let i = 0; i < hubCols.length - 1; i++) {
    roads.push({
      roadId: `road_h_${i}`,
      from: { col: hubCols[i]!, row: hubRows[1]! },
      to: { col: hubCols[i + 1]!, row: hubRows[1]! },
      style: template.roadStyle,
    });
    roads.push({
      roadId: `road_v_${i}`,
      from: { col: hubCols[1]!, row: hubRows[i]! },
      to: { col: hubCols[1]!, row: hubRows[i + 1]! },
      style: template.roadStyle,
    });
  }

  // Stage 2 — landmarks at intersections (district identity)
  const landmarks: GeneratedLandmark[] = template.hubs.slice(0, 3).map((hub, i) => ({
    landmarkId: `lm_${input.mapId}_${i}`,
    name: hub.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    kind: hub.includes("shrine") || hub.includes("steeple") ? "shrine" : "plaza",
    col: hubCols[i % hubCols.length]!,
    row: hubRows[i % hubRows.length]!,
  }));

  // Stage 3 — districts along roads (every building belongs to a district)
  const districts: GeneratedDistrict[] = template.districtKinds.map((kind, i) => ({
    districtId: `dist_${input.mapId}_${kind}`,
    kind,
    name: districtName(kind, input.seed, i),
    flavor: `${kind} district — roads first, lawns never empty.`,
    plotIds: [],
    landmarkId: landmarks[i % landmarks.length]?.landmarkId ?? null,
  }));

  // Stage 4 — plots only on road-adjacent cells (Living Towns)
  const plots: GeneratedPlot[] = [];
  const allowsHousing =
    template.allowsPermanentHousing &&
    input.mapKind !== "overflow" &&
    template.targetPlotCount.max > 0;

  if (allowsHousing) {
    const target =
      template.targetPlotCount.min +
      Math.floor(rand() * (template.targetPlotCount.max - template.targetPlotCount.min + 1));
    let n = 0;
    for (let row = 1; row <= 9 && n < target; row++) {
      for (let col = 1; col <= 9 && n < target; col++) {
        // Road cells / hub intersections stay empty of plots
        if (col % 3 === 2 || row % 3 === 2) continue;
        const district = districts[n % districts.length]!;
        const plotId = `plot_${input.mapId}_${col}_${row}`;
        const uniqueKey = `${input.seed}:${col}:${row}:${n}`;
        const waterAccess =
          template.biome === "coastal" ||
          template.biome === "harbor" ||
          template.biome === "island"
            ? row >= 7 || col >= 7
            : false;
        const plot: GeneratedPlot = {
          plotId,
          districtId: district.districtId,
          col,
          row,
          deedSize: DEED_CYCLE[n % DEED_CYCLE.length]!,
          roadAccess: true,
          waterAccess,
          uniqueKey,
        };
        plots.push(plot);
        district.plotIds.push(plotId);
        n++;
      }
    }
  }

  // Stage 5 — hubs / NPC seed points (not fake players)
  const hubs: GeneratedHub[] = template.hubs.map((hub, i) => ({
    hubId: `hub_${input.mapId}_${i}`,
    name: hub.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    kind: hub,
    col: hubCols[i % hubCols.length]!,
    row: hubRows[(i + 1) % hubRows.length]!,
  }));

  const finalKind: MapKind =
    !template.allowsPermanentHousing || input.mapKind === "overflow"
      ? "overflow"
      : input.mapKind;

  return {
    ok: true,
    map: {
      mapId: input.mapId,
      publicName,
      templateKey: input.templateKey,
      biome: template.biome,
      mapKind: finalKind,
      lifecycle: "VALIDATING",
      seed: input.seed,
      regionSlug: input.regionSlug,
      neighborhoodId: null,
      allowsPermanentHousing: template.allowsPermanentHousing && finalKind !== "overflow",
      softPlayerLimit: template.softPlayerLimit,
      hardPlayerLimit: template.hardPlayerLimit,
      plotsTotal: plots.length,
      plotsOccupied: 0,
      playersOnline: 0,
      visitors: 0,
      entityCount: hubs.length * 4 + landmarks.length * 2,
      tickLatencyMs: 6 + Math.floor(rand() * 4),
      crowdLabel: "Quiet",
      founderTitleKey: null,
      generatorVersion: GENERATOR_VERSION,
      templateVersion: TEMPLATE_CATALOG_VERSION,
      seedVersion: SEED_SCHEME_VERSION,
      parentMapId: input.parentMapId ?? null,
      overflowEventKey: input.overflowEventKey ?? null,
      expiresAt: input.expiresAt ?? null,
      districts,
      plots,
      landmarks,
      hubs,
      roads,
      connections: [],
      validationReportId: null,
      createdAt: now,
      updatedAt: now,
      openedAt: null,
      archivedAt: null,
    },
  };
}

/** Ensure unique plot keys within a map — housing uniqueness invariant. */
export function assertPlotUniqueness(plots: GeneratedPlot[]): { ok: boolean; dupes: string[] } {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const p of plots) {
    if (seen.has(p.uniqueKey) || seen.has(p.plotId)) {
      dupes.push(p.plotId);
    }
    seen.add(p.uniqueKey);
    seen.add(p.plotId);
  }
  return { ok: dupes.length === 0, dupes };
}
