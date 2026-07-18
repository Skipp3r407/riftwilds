/**
 * Versioning — seed / template / generator versions.
 * Occupied maps receive additive updates only.
 */

import {
  GENERATOR_VERSION,
  SEED_SCHEME_VERSION,
  TEMPLATE_CATALOG_VERSION,
} from "@/lib/world-expansion/config";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { WorldMapRecord } from "@/lib/world-expansion/types";

export function currentVersions() {
  return {
    generatorVersion: GENERATOR_VERSION,
    templateVersion: TEMPLATE_CATALOG_VERSION,
    seedVersion: SEED_SCHEME_VERSION,
  };
}

export function canMutateOccupiedMap(map: WorldMapRecord, mode: "additive" | "destructive"): boolean {
  const occupied = map.lifecycle === "OPEN" && (map.playersOnline > 0 || map.plotsOccupied > 0);
  if (!occupied) return true;
  return mode === "additive";
}

/** Stamp versions on a map record (additive metadata only when occupied). */
export function stampVersions(mapId: string): WorldMapRecord | null {
  const s = getExpansionStore();
  const map = s.maps.get(mapId);
  if (!map) return null;
  if (!canMutateOccupiedMap(map, "additive")) return map;
  map.generatorVersion = GENERATOR_VERSION;
  map.templateVersion = TEMPLATE_CATALOG_VERSION;
  map.seedVersion = SEED_SCHEME_VERSION;
  map.updatedAt = new Date().toISOString();
  s.maps.set(mapId, map);
  return map;
}
