/**
 * Collision kind semantics for world containment.
 * Prefer natural barriers (cliff/water/building); invisible walls only at map edges.
 */

import type { CollisionKind, CollisionRect } from "@/game/world-maps/types";

/** Kinds that always block walking without a special ability. */
const ALWAYS_SOLID: ReadonlySet<CollisionKind> = new Set([
  "wall",
  "building",
  "cliff",
  "lava",
  "hazard",
  "water",
  "deep_water",
  "blocker",
  "seal",
]);

/** Overlap-only zones (never solid). */
const NEVER_SOLID: ReadonlySet<CollisionKind> = new Set([
  "transition",
  "shallow_water",
]);

export function isSolidCollider(c: CollisionRect): boolean {
  if (typeof c.solid === "boolean") return c.solid;
  const kind = c.kind ?? "wall";
  if (NEVER_SOLID.has(kind)) return false;
  if (ALWAYS_SOLID.has(kind)) return true;
  return true;
}

export function isDeepWater(c: CollisionRect): boolean {
  return c.kind === "water" || c.kind === "deep_water";
}

export function isShallowWater(c: CollisionRect): boolean {
  return c.kind === "shallow_water";
}

export function isTransitionZone(c: CollisionRect): boolean {
  return c.kind === "transition";
}

export function isNaturalBarrier(c: CollisionRect): boolean {
  return (
    c.kind === "cliff" ||
    c.kind === "water" ||
    c.kind === "deep_water" ||
    c.kind === "lava" ||
    c.kind === "blocker" ||
    c.kind === "seal"
  );
}

export function isEdgeWall(c: CollisionRect): boolean {
  return c.kind === "wall" && /-wall-[nsew]$/.test(c.id);
}

/** Pathfinding / nav: blocked if solid (transitions stay walkable). */
export function blocksNavigation(c: CollisionRect): boolean {
  return isSolidCollider(c);
}

export function pointInCollider(
  x: number,
  y: number,
  c: CollisionRect,
  inset = 0,
): boolean {
  return (
    x >= c.x + inset &&
    x <= c.x + c.width - inset &&
    y >= c.y + inset &&
    y <= c.y + c.height - inset
  );
}

export function solidColliders(colliders: CollisionRect[]): CollisionRect[] {
  return colliders.filter(isSolidCollider);
}

export function transitionColliders(colliders: CollisionRect[]): CollisionRect[] {
  return colliders.filter(isTransitionZone);
}
