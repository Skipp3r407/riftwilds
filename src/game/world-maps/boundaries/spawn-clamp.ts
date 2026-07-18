/**
 * Safe spawn — push points out of solid colliders and into playable bounds.
 */

import type { CollisionRect, MapBlueprint, WorldMapObject } from "@/game/world-maps/types";
import {
  isSolidCollider,
  pointInCollider,
  solidColliders,
} from "@/game/world-maps/boundaries/collider-semantics";
import {
  clampToPlayableBounds,
  playableBoundsFromBlueprint,
  type PlayableBounds,
} from "@/game/world-maps/boundaries/playable-bounds";

export type SpawnClampResult = {
  x: number;
  y: number;
  adjusted: boolean;
  reason?: string;
};

const PUSH_STEPS = [
  [0, 0],
  [24, 0],
  [-24, 0],
  [0, 24],
  [0, -24],
  [48, 0],
  [-48, 0],
  [0, 48],
  [0, -48],
  [32, 32],
  [-32, 32],
  [32, -32],
  [-32, -32],
  [64, 0],
  [-64, 0],
  [0, 64],
  [0, -64],
] as const;

function insideAnySolid(
  x: number,
  y: number,
  solids: CollisionRect[],
): CollisionRect | null {
  for (const c of solids) {
    if (pointInCollider(x, y, c, 2)) return c;
  }
  return null;
}

/** Push a world point out of solids and clamp to playable inset. */
export function clampSpawnPoint(
  x: number,
  y: number,
  colliders: CollisionRect[],
  bounds: PlayableBounds,
  fallback?: { x: number; y: number },
): SpawnClampResult {
  const solids = solidColliders(colliders);
  let px = x;
  let py = y;
  let adjusted = false;

  const clamped = clampToPlayableBounds(px, py, bounds);
  if (clamped.x !== px || clamped.y !== py) {
    px = clamped.x;
    py = clamped.y;
    adjusted = true;
  }

  if (!insideAnySolid(px, py, solids)) {
    return { x: px, y: py, adjusted, reason: adjusted ? "playable-bounds" : undefined };
  }

  for (const [dx, dy] of PUSH_STEPS) {
    const nx = clampToPlayableBounds(x + dx, y + dy, bounds);
    if (!insideAnySolid(nx.x, nx.y, solids)) {
      return {
        x: nx.x,
        y: nx.y,
        adjusted: true,
        reason: "pushed-from-solid",
      };
    }
  }

  if (fallback) {
    const fb = clampToPlayableBounds(fallback.x, fallback.y, bounds);
    if (!insideAnySolid(fb.x, fb.y, solids)) {
      return { x: fb.x, y: fb.y, adjusted: true, reason: "fallback-spawn" };
    }
  }

  // Last resort: map center of playable bounds
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return { x: cx, y: cy, adjusted: true, reason: "playable-center" };
}

export function resolveSafeSpawn(
  blueprint: MapBlueprint,
  opts?: {
    saved?: { x: number; y: number } | null;
    entryPortalId?: string | null;
    /** Extra runtime solids (locked seals). */
    extraColliders?: CollisionRect[];
  },
): SpawnClampResult {
  const bounds = playableBoundsFromBlueprint(blueprint);
  const colliders = [
    ...blueprint.colliders,
    ...(opts?.extraColliders ?? []),
  ];
  const fallback = blueprint.spawn;

  if (opts?.entryPortalId) {
    const portal = blueprint.objects.find(
      (o) =>
        o.type === "portal" &&
        (o.id === opts.entryPortalId ||
          o.metadata?.portalDefId === opts.entryPortalId),
    );
    if (portal) {
      // Stand slightly south of the arrival portal so the ring stays clear.
      return clampSpawnPoint(
        portal.x,
        portal.y + 40,
        colliders,
        bounds,
        fallback,
      );
    }
  }

  if (opts?.saved) {
    return clampSpawnPoint(
      opts.saved.x,
      opts.saved.y,
      colliders,
      bounds,
      fallback,
    );
  }

  return clampSpawnPoint(fallback.x, fallback.y, colliders, bounds, fallback);
}

/** True when authored spawn sits inside a solid (authoring bug). */
export function spawnOverlapsSolid(
  spawn: { x: number; y: number },
  colliders: CollisionRect[],
): boolean {
  return colliders.some(
    (c) => isSolidCollider(c) && pointInCollider(spawn.x, spawn.y, c, 1),
  );
}

export function portalArrivalPoint(portal: WorldMapObject): { x: number; y: number } {
  return { x: portal.x, y: portal.y + 40 };
}
