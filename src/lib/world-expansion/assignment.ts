/**
 * Player assignment priority:
 * owned property → party → friends → guild → region → latency → population → housing
 * New players → active (not empty) maps. Keep friends together.
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { crowdLabelFor } from "@/lib/world-expansion/capacity";
import { isPlayerVisible } from "@/lib/world-expansion/lifecycle";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { PlayerMapAssignment, WorldMapRecord } from "@/lib/world-expansion/types";

export type AssignmentContext = {
  userId: string;
  ownedMapId?: string | null;
  partyMapId?: string | null;
  friendMapIds?: string[];
  guildMapId?: string | null;
  preferredRegionSlug?: string | null;
  latencyByMapId?: Record<string, number>;
  isNewPlayer?: boolean;
  wantsHousing?: boolean;
  overflowEventKey?: string | null;
};

function openMaps(): WorldMapRecord[] {
  return [...getExpansionStore().maps.values()].filter(
    (m) => isPlayerVisible(m.lifecycle) && m.lifecycle === "OPEN",
  );
}

function scoreMap(map: WorldMapRecord, ctx: AssignmentContext): number {
  let score = 0;
  if (ctx.ownedMapId === map.mapId) score += 10_000;
  if (ctx.partyMapId === map.mapId) score += 5_000;
  if (ctx.friendMapIds?.includes(map.mapId)) score += 2_000 + (ctx.friendMapIds.filter((id) => id === map.mapId).length) * 100;
  if (ctx.guildMapId === map.mapId) score += 1_500;
  if (ctx.preferredRegionSlug && map.regionSlug === ctx.preferredRegionSlug) score += 800;
  const latency = ctx.latencyByMapId?.[map.mapId];
  if (typeof latency === "number") score += Math.max(0, 400 - latency);
  // Prefer populated-but-not-full for new players
  const load = map.playersOnline / Math.max(1, map.softPlayerLimit);
  if (ctx.isNewPlayer) {
    if (map.playersOnline === 0) score -= 600;
    else if (load >= 0.15 && load < 0.7) score += 500;
  } else {
    score += Math.max(0, 200 - map.playersOnline); // slight prefer quieter for veterans relocating
  }
  if (ctx.wantsHousing && map.allowsPermanentHousing) {
    const vacant = map.plotsTotal - map.plotsOccupied;
    score += Math.min(400, vacant * 10);
  }
  if (map.playersOnline >= map.hardPlayerLimit) score -= 50_000;
  if (map.mapKind === "overflow" && !ctx.overflowEventKey) score -= 20_000;
  if (ctx.overflowEventKey && map.overflowEventKey === ctx.overflowEventKey) score += 3_000;
  return score;
}

export function assignPlayerToMap(ctx: AssignmentContext):
  | { ok: true; assignment: PlayerMapAssignment; map: WorldMapRecord }
  | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("WORLD_EXPANSION_ENABLED")) {
    return { ok: false, error: "disabled", message: "World expansion disabled." };
  }

  const s = getExpansionStore();
  const existing = s.assignments.get(ctx.userId);
  if (existing) {
    const map = s.maps.get(existing.mapId);
    if (map && map.lifecycle === "OPEN" && map.playersOnline < map.hardPlayerLimit) {
      if (existing.stickyUntil && Date.parse(existing.stickyUntil) > Date.now()) {
        return { ok: true, assignment: existing, map };
      }
      // Prefer sticky owned property
      if (existing.reason === "owned_property") {
        return { ok: true, assignment: existing, map };
      }
    }
  }

  const candidates = openMaps().filter((m) => {
    if (ctx.overflowEventKey) return m.mapKind === "overflow" || m.lifecycle === "OPEN";
    return m.mapKind !== "overflow" || Boolean(ctx.overflowEventKey);
  });

  if (candidates.length === 0) {
    return { ok: false, error: "no_maps", message: "No open maps available." };
  }

  const ranked = [...candidates].sort((a, b) => scoreMap(b, ctx) - scoreMap(a, ctx));
  const best = ranked[0]!;

  let reason: PlayerMapAssignment["reason"] = "population";
  if (ctx.ownedMapId === best.mapId) reason = "owned_property";
  else if (ctx.partyMapId === best.mapId) reason = "party";
  else if (ctx.friendMapIds?.includes(best.mapId)) reason = "friends";
  else if (ctx.guildMapId === best.mapId) reason = "guild";
  else if (ctx.overflowEventKey && best.mapKind === "overflow") reason = "overflow_event";
  else if (ctx.isNewPlayer) reason = "new_player";
  else if (ctx.wantsHousing) reason = "housing";
  else if (ctx.preferredRegionSlug === best.regionSlug) reason = "region";
  else if (ctx.latencyByMapId?.[best.mapId] != null) reason = "latency";

  // Leave previous map population
  if (existing) {
    const prev = s.maps.get(existing.mapId);
    if (prev && prev.playersOnline > 0) {
      prev.playersOnline -= 1;
      prev.crowdLabel = crowdLabelFor(prev);
      prev.updatedAt = new Date().toISOString();
      s.maps.set(prev.mapId, prev);
    }
  }

  best.playersOnline += 1;
  best.crowdLabel = crowdLabelFor(best);
  best.updatedAt = new Date().toISOString();
  s.maps.set(best.mapId, best);

  const assignment: PlayerMapAssignment = {
    userId: ctx.userId,
    mapId: best.mapId,
    reason,
    assignedAt: new Date().toISOString(),
    stickyUntil:
      reason === "owned_property"
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
  };
  s.assignments.set(ctx.userId, assignment);
  return { ok: true, assignment, map: best };
}

export function getAssignment(userId: string): PlayerMapAssignment | null {
  return getExpansionStore().assignments.get(userId) ?? null;
}
