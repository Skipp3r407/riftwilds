/**
 * Keep NPCs, enemies, Riftlings, and projectiles inside nav / world bounds.
 * Soft leash around spawn homes — does not replace full navmesh.
 */

import type { CollisionRect } from "@/game/world-maps/types";
import {
  blocksNavigation,
  pointInCollider,
} from "@/game/world-maps/boundaries/collider-semantics";
import {
  clampToPlayableBounds,
  type PlayableBounds,
} from "@/game/world-maps/boundaries/playable-bounds";

export type Point = { x: number; y: number };

/** Soft leash: clamp to circle around home, then playable bounds. */
export function clampEntityToNav(
  x: number,
  y: number,
  opts: {
    homeX: number;
    homeY: number;
    leashRadius: number;
    bounds: PlayableBounds;
    solids?: CollisionRect[];
  },
): Point {
  let dx = x - opts.homeX;
  let dy = y - opts.homeY;
  const dist = Math.hypot(dx, dy);
  if (dist > opts.leashRadius && dist > 0) {
    const s = opts.leashRadius / dist;
    dx *= s;
    dy *= s;
  }
  let nx = opts.homeX + dx;
  let ny = opts.homeY + dy;
  const clamped = clampToPlayableBounds(nx, ny, opts.bounds);
  nx = clamped.x;
  ny = clamped.y;

  if (opts.solids?.length) {
    for (const c of opts.solids) {
      if (!blocksNavigation(c)) continue;
      if (!pointInCollider(nx, ny, c, 2)) continue;
      // Nudge back toward home
      const hx = opts.homeX - nx;
      const hy = opts.homeY - ny;
      const hlen = Math.hypot(hx, hy) || 1;
      nx += (hx / hlen) * 16;
      ny += (hy / hlen) * 16;
      const again = clampToPlayableBounds(nx, ny, opts.bounds);
      nx = again.x;
      ny = again.y;
      break;
    }
  }
  return { x: nx, y: ny };
}

/** Enemy leash — stay near encounter zone center. */
export function clampEnemyLeash(
  x: number,
  y: number,
  zone: { x: number; y: number; w: number; h: number },
  pad = 8,
): Point {
  return {
    x: Math.min(zone.x + zone.w - pad, Math.max(zone.x + pad, x)),
    y: Math.min(zone.y + zone.h - pad, Math.max(zone.y + pad, y)),
  };
}

/**
 * Projectile world clamp stub — destroy/expire callers when outside bounds.
 * Returns null when the projectile should despawn.
 */
export function clampProjectileToWorld(
  x: number,
  y: number,
  bounds: PlayableBounds,
  margin = 4,
): Point | null {
  if (
    x < bounds.minX - margin ||
    x > bounds.maxX + margin ||
    y < bounds.minY - margin ||
    y > bounds.maxY + margin
  ) {
    return null;
  }
  return { x, y };
}

/** Default NPC/Riftling leash radii by role. */
export function defaultLeashRadius(behavior: string): number {
  if (behavior.includes("patrol") || behavior.includes("wander")) return 48;
  if (behavior.includes("guard")) return 28;
  return 36;
}
