/**
 * Temporary overflow instances for festivals / bosses.
 * NEVER assign permanent housing or deeds here.
 */

import { planAndGenerate } from "@/lib/world-expansion/generation-service";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { WorldMapRecord } from "@/lib/world-expansion/types";

export function spawnOverflowInstance(params: {
  sourceMapId: string;
  eventKey: string;
  ttlHours?: number;
  autoOpen?: boolean;
}):
  | { ok: true; map: WorldMapRecord }
  | { ok: false; error: string; message: string } {
  const source = getExpansionStore().maps.get(params.sourceMapId);
  if (!source) return { ok: false, error: "missing_source", message: "Source map missing." };

  const gen = planAndGenerate({
    reason: "festival_overflow",
    sourceMapId: params.sourceMapId,
    templateKey: "rift_edge_outpost",
    mapKind: "overflow",
    autoOpen: params.autoOpen ?? true,
    adminActorId: "overflow_system",
  });
  if (!gen.ok) return { ok: false, error: gen.error, message: "Overflow generation failed." };

  const map = gen.map;
  if (map.allowsPermanentHousing || map.plots.length > 0) {
    map.allowsPermanentHousing = false;
    map.plots = [];
    map.plotsTotal = 0;
    map.mapKind = "overflow";
  }
  map.overflowEventKey = params.eventKey;
  const hours = params.ttlHours ?? 6;
  map.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  map.neighborhoodId = null;
  map.updatedAt = new Date().toISOString();
  getExpansionStore().maps.set(map.mapId, map);

  return { ok: true, map };
}

export function assertNoPermanentHousingOnOverflow(map: WorldMapRecord): boolean {
  if (map.mapKind !== "overflow") return true;
  return !map.allowsPermanentHousing && map.plots.length === 0 && map.neighborhoodId === null;
}

export function expireOverflowMaps(now = Date.now()): string[] {
  const s = getExpansionStore();
  const expired: string[] = [];
  for (const map of s.maps.values()) {
    if (map.mapKind !== "overflow" || !map.expiresAt) continue;
    if (Date.parse(map.expiresAt) > now) continue;
    if (map.lifecycle === "OPEN" || map.lifecycle === "PAUSED") {
      map.lifecycle = "ARCHIVING";
      map.updatedAt = new Date(now).toISOString();
      // Strip any accidental housing
      map.allowsPermanentHousing = false;
      map.plots = [];
      map.neighborhoodId = null;
      map.lifecycle = "ARCHIVED";
      map.archivedAt = map.updatedAt;
      s.maps.set(map.mapId, map);
      expired.push(map.mapId);
    }
  }
  return expired;
}
