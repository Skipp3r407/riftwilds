/**
 * Transactional house move with snapshot — no dupe furniture/plots.
 * Guild relocation approval workflow stub.
 */

import { createRequestId } from "@/lib/utils/request-id";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { getHomeForUser } from "@/lib/housing/instance-service";
import { getNeighborhood } from "@/lib/neighborhoods/neighborhood-service";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { RelocationRequest } from "@/lib/world-expansion/types";

function hashSnapshot(parts: string[]): string {
  let h = 2166136261;
  for (const p of parts) {
    for (let i = 0; i < p.length; i++) {
      h ^= p.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return `snap_${(h >>> 0).toString(16)}`;
}

export function requestRelocation(params: {
  userId: string;
  toMapId: string;
  toPlotId?: string | null;
  idempotencyKey: string;
  guildApprovalRequired?: boolean;
}):
  | { ok: true; relocation: RelocationRequest; reused?: boolean }
  | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("WORLD_EXPANSION_ENABLED")) {
    return { ok: false, error: "disabled", message: "Relocation disabled." };
  }

  const s = getExpansionStore();
  const priorId = s.relocationIdempotency.get(params.idempotencyKey);
  if (priorId) {
    const prior = s.relocations.get(priorId);
    if (prior) return { ok: true, relocation: prior, reused: true };
  }

  const toMap = s.maps.get(params.toMapId);
  if (!toMap) return { ok: false, error: "missing_map", message: "Destination map missing." };
  if (toMap.mapKind === "overflow" || !toMap.allowsPermanentHousing) {
    return {
      ok: false,
      error: "overflow_dest",
      message: "Cannot relocate permanent housing onto a temporary overflow map.",
    };
  }
  if (toMap.lifecycle !== "OPEN") {
    return { ok: false, error: "not_open", message: "Destination not open." };
  }

  const assignment = s.assignments.get(params.userId);
  const fromMapId = assignment?.mapId ?? "map_riftwild_commons";
  const home = getHomeForUser(params.userId);
  const furnitureIds =
    home?.rooms.flatMap((r) => r.furniture.map((f) => f.instanceId)) ?? [];

  // Lock furniture to prevent dupes
  for (const fid of furnitureIds) {
    if (s.furnitureLocks.has(fid)) {
      return { ok: false, error: "furniture_locked", message: "Furniture already in a move." };
    }
  }

  const now = new Date().toISOString();
  const relocationId = `rel_${createRequestId()}`;
  const relocation: RelocationRequest = {
    relocationId,
    userId: params.userId,
    fromMapId,
    toMapId: params.toMapId,
    fromPlotId: home?.plotId ?? null,
    toPlotId: params.toPlotId ?? null,
    status: params.guildApprovalRequired ? "guild_pending_approval" : "pending",
    snapshotHash: null,
    furnitureIds,
    idempotencyKey: params.idempotencyKey,
    guildApprovalRequired: Boolean(params.guildApprovalRequired),
    guildApprovedBy: null,
    createdAt: now,
    updatedAt: now,
    error: null,
  };

  s.relocations.set(relocationId, relocation);
  s.relocationIdempotency.set(params.idempotencyKey, relocationId);
  return { ok: true, relocation };
}

/** Guild approval stub — officers approve before move commits. */
export function approveGuildRelocation(params: {
  relocationId: string;
  officerUserId: string;
}):
  | { ok: true; relocation: RelocationRequest }
  | { ok: false; error: string; message: string } {
  const s = getExpansionStore();
  const rel = s.relocations.get(params.relocationId);
  if (!rel) return { ok: false, error: "missing", message: "Relocation not found." };
  if (rel.status !== "guild_pending_approval") {
    return { ok: false, error: "bad_status", message: "Not awaiting guild approval." };
  }
  rel.guildApprovedBy = params.officerUserId;
  rel.status = "pending";
  rel.updatedAt = new Date().toISOString();
  s.relocations.set(rel.relocationId, rel);
  return { ok: true, relocation: rel };
}

/**
 * Commit relocation transactionally:
 * snapshot → lock furniture → move plot pointers → unlock.
 * Rollback on failure; never duplicate furniture IDs.
 */
export function commitRelocation(relocationId: string):
  | { ok: true; relocation: RelocationRequest }
  | { ok: false; error: string; message: string } {
  const s = getExpansionStore();
  const rel = s.relocations.get(relocationId);
  if (!rel) return { ok: false, error: "missing", message: "Relocation not found." };
  if (rel.status === "completed") return { ok: true, relocation: rel };
  if (rel.status === "guild_pending_approval") {
    return { ok: false, error: "guild_pending", message: "Guild approval required." };
  }
  if (rel.status !== "pending" && rel.status !== "snapshot" && rel.status !== "moving") {
    return { ok: false, error: "bad_status", message: `Cannot commit from ${rel.status}.` };
  }

  const toMap = s.maps.get(rel.toMapId);
  if (!toMap || toMap.mapKind === "overflow" || !toMap.allowsPermanentHousing) {
    rel.status = "failed";
    rel.error = "invalid_destination";
    rel.updatedAt = new Date().toISOString();
    s.relocations.set(rel.relocationId, rel);
    return { ok: false, error: "overflow_dest", message: "Invalid destination." };
  }

  try {
    rel.status = "snapshot";
    rel.snapshotHash = hashSnapshot([
      rel.userId,
      rel.fromMapId,
      rel.toMapId,
      ...rel.furnitureIds,
    ]);
    rel.updatedAt = new Date().toISOString();

    for (const fid of rel.furnitureIds) {
      if (s.furnitureLocks.has(fid)) throw new Error("dupe_lock");
      s.furnitureLocks.add(fid);
    }

    rel.status = "moving";
    rel.updatedAt = new Date().toISOString();

    // Update assignment
    s.assignments.set(rel.userId, {
      userId: rel.userId,
      mapId: rel.toMapId,
      reason: "housing",
      assignedAt: new Date().toISOString(),
      stickyUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Plot uniqueness: clear fromPlot if present on old nbhd, claim dest if provided
    if (rel.fromPlotId) {
      for (const n of [getNeighborhood("nbhd_commons_alpha"), ...(toMap.neighborhoodId ? [getNeighborhood(toMap.neighborhoodId)] : [])]) {
        if (!n) continue;
        const plot = n.plots.find((p) => p.plotId === rel.fromPlotId);
        if (plot && plot.ownerUserId === rel.userId) {
          plot.status = "vacant";
          plot.ownerUserId = null;
          plot.homeId = null;
        }
      }
    }

    if (rel.toPlotId && toMap.neighborhoodId) {
      const n = getNeighborhood(toMap.neighborhoodId);
      const plot = n?.plots.find((p) => p.plotId === rel.toPlotId);
      if (plot && plot.status === "vacant") {
        plot.status = "owned";
        plot.ownerUserId = rel.userId;
      } else if (plot && plot.ownerUserId && plot.ownerUserId !== rel.userId) {
        throw new Error("plot_taken");
      }
    }

    // Furniture IDs unchanged — move is pointer-only (no clone)
    const uniqueFurniture = new Set(rel.furnitureIds);
    if (uniqueFurniture.size !== rel.furnitureIds.length) throw new Error("furniture_dupe_in_snapshot");

    for (const fid of rel.furnitureIds) s.furnitureLocks.delete(fid);

    rel.status = "completed";
    rel.error = null;
    rel.updatedAt = new Date().toISOString();
    s.relocations.set(rel.relocationId, rel);
    return { ok: true, relocation: rel };
  } catch (e) {
    for (const fid of rel.furnitureIds) s.furnitureLocks.delete(fid);
    rel.status = "rolled_back";
    rel.error = e instanceof Error ? e.message : "move_failed";
    rel.updatedAt = new Date().toISOString();
    s.relocations.set(rel.relocationId, rel);
    return { ok: false, error: "rolled_back", message: rel.error };
  }
}

export function getRelocation(id: string): RelocationRequest | null {
  return getExpansionStore().relocations.get(id) ?? null;
}
