/**
 * Public map directory — Quiet→Full labels; friends/guild/events/housing.
 * Never exposes seeds, jobs, infra, or admin secrets.
 */

import { isPlayerVisible } from "@/lib/world-expansion/lifecycle";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { PublicMapDirectoryEntry } from "@/lib/world-expansion/types";

export type DirectoryQuery = {
  userId?: string;
  friendMapIds?: string[];
  guildMapId?: string | null;
};

export function listPublicDirectory(query: DirectoryQuery = {}): PublicMapDirectoryEntry[] {
  const s = getExpansionStore();
  const friendSet = new Set(query.friendMapIds ?? []);
  return [...s.maps.values()]
    .filter((m) => isPlayerVisible(m.lifecycle))
    .map((m) => ({
      mapId: m.mapId,
      name: m.publicName,
      biome: m.biome,
      crowdLabel: m.crowdLabel,
      friendsPresent: friendSet.has(m.mapId) ? 1 : 0,
      guildPresent: query.guildMapId === m.mapId,
      hasActiveEvent: Boolean(m.overflowEventKey) || m.mapKind === "overflow",
      housingAvailable:
        m.allowsPermanentHousing &&
        m.mapKind !== "overflow" &&
        m.plotsTotal - m.plotsOccupied > 0,
      isOverflow: m.mapKind === "overflow",
      regionSlug: m.regionSlug,
    }))
    // Strip any accidental secrets — return only public DTO
    .map((e) => ({ ...e }));
}

/** Sanitize admin/map objects before client JSON — defense in depth. */
export function sanitizeMapForClient(mapId: string): Record<string, unknown> | null {
  const map = getExpansionStore().maps.get(mapId);
  if (!map || !isPlayerVisible(map.lifecycle)) return null;
  return {
    mapId: map.mapId,
    name: map.publicName,
    biome: map.biome,
    crowdLabel: map.crowdLabel,
    regionSlug: map.regionSlug,
    housingAvailable: map.allowsPermanentHousing && map.mapKind !== "overflow",
    isOverflow: map.mapKind === "overflow",
    connections: map.connections.map((c) => ({
      kind: c.kind,
      label: c.label,
      toMapId: c.toMapId,
    })),
    // Explicitly omit: seed, generatorVersion internals, jobs, validation raw, admin notes
  };
}
