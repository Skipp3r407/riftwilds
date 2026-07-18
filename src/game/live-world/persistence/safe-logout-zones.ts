/**
 * Safe logout zone catalog — inns, homes, camps, settlements.
 * Derived from blueprint safe zones + explicit rest anchors.
 */

import type { LogoutZoneKind, SafeZoneHit } from "@/lib/persistence/types";

export type LogoutZoneDef = {
  id: string;
  mapId: string;
  name: string;
  kind: LogoutZoneKind;
  x: number;
  y: number;
  width: number;
  height: number;
};

const T = 32;

/** Explicit rest logout anchors (inn / home / camp). */
const EXPLICIT_REST_ZONES: LogoutZoneDef[] = [
  {
    id: "commons-inn-rest",
    mapId: "riftwild-commons",
    name: "Keeper Rest Hall",
    kind: "INN",
    x: 18 * T,
    y: 14 * T,
    width: 28 * T,
    height: 16 * T,
  },
  {
    id: "commons-home-row",
    mapId: "riftwild-commons",
    name: "Keeper Row",
    kind: "HOME",
    x: 2 * T,
    y: 12 * T,
    width: 8 * T,
    height: 6 * T,
  },
  {
    id: "commons-hatchery-camp",
    mapId: "riftwild-commons",
    name: "Hatchery Camp",
    kind: "CAMP",
    x: 3 * T,
    y: 3 * T,
    width: 12 * T,
    height: 9 * T,
  },
  {
    id: "ember-entrance-camp",
    mapId: "ember-crater",
    name: "Crater Entrance Camp",
    kind: "CAMP",
    x: 2 * T,
    y: 2 * T,
    width: 12 * T,
    height: 10 * T,
  },
  {
    id: "tide-inn",
    mapId: "tidefall-coast",
    name: "Tide Inn",
    kind: "INN",
    x: 4 * T,
    y: 6 * T,
    width: 8 * T,
    height: 5 * T,
  },
  {
    id: "grove-camp",
    mapId: "whispering-grove",
    name: "Grove Camp",
    kind: "CAMP",
    x: 2 * T,
    y: 2 * T,
    width: 12 * T,
    height: 10 * T,
  },
  {
    id: "storm-wind-camp",
    mapId: "stormpeak-ridges",
    name: "Wind Camp",
    kind: "CAMP",
    x: 2 * T,
    y: 28 * T,
    width: 12 * T,
    height: 10 * T,
  },
];

/** Settlement safe zones that count as logout-safe (not combat). */
const SETTLEMENT_FALLBACKS: LogoutZoneDef[] = [
  {
    id: "central-plaza",
    mapId: "riftwild-commons",
    name: "Central Rift Plaza",
    kind: "SETTLEMENT",
    x: 18 * T,
    y: 14 * T,
    width: 28 * T,
    height: 16 * T,
  },
  {
    id: "recovery",
    mapId: "riftwild-commons",
    name: "Recovery Center",
    kind: "SETTLEMENT",
    x: 40 * T,
    y: 38 * T,
    width: 8 * T,
    height: 6 * T,
  },
];

function pointInZone(
  x: number,
  y: number,
  z: Pick<LogoutZoneDef, "x" | "y" | "width" | "height">,
): boolean {
  return x >= z.x && x <= z.x + z.width && y >= z.y && y <= z.y + z.height;
}

export function listLogoutZones(mapId?: string): LogoutZoneDef[] {
  const all = [...EXPLICIT_REST_ZONES, ...SETTLEMENT_FALLBACKS];
  if (!mapId) return all;
  return all.filter((z) => z.mapId === mapId);
}

export function findLogoutZoneAt(
  mapId: string,
  x: number,
  y: number,
): SafeZoneHit | null {
  const zones = listLogoutZones(mapId);
  // Prefer INN > HOME > CAMP > SETTLEMENT > WAYPOINT
  const rank: Record<LogoutZoneKind, number> = {
    INN: 0,
    HOME: 1,
    CAMP: 2,
    SETTLEMENT: 3,
    WAYPOINT: 4,
  };
  const hits = zones
    .filter((z) => pointInZone(x, y, z))
    .sort((a, b) => rank[a.kind] - rank[b.kind]);
  const best = hits[0];
  if (!best) return null;
  return {
    zoneId: best.id,
    zoneKind: best.kind,
    mapId: best.mapId,
    name: best.name,
  };
}

export function isSafeLogoutPosition(mapId: string, x: number, y: number): boolean {
  return findLogoutZoneAt(mapId, x, y) != null;
}

/** True for inn/home/camp — rest bonus eligible stubs. */
export function isRestLogoutZone(kind: LogoutZoneKind): boolean {
  return kind === "INN" || kind === "HOME" || kind === "CAMP";
}
