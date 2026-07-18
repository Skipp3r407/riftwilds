/**
 * Lightweight grid pathfinding for waypoint guidance.
 * Falls back to direction + distance when no path exists.
 */

import type { CollisionRect, PathwayDef } from "@/game/world-maps/types";
import { blocksNavigation } from "@/game/world-maps/boundaries/collider-semantics";

export type Point = { x: number; y: number };

export type PathResult =
  | { ok: true; path: Point[]; distance: number }
  | { ok: false; direction: Point; distance: number; bearingDeg: number };

const STEP = 48;

function blocked(x: number, y: number, colliders: CollisionRect[]): boolean {
  for (const c of colliders) {
    // Transitions / shallow water stay walkable; solids (incl. deep water) block.
    if (!blocksNavigation(c)) continue;
    if (
      x >= c.x &&
      x <= c.x + c.width &&
      y >= c.y &&
      y <= c.y + c.height
    ) {
      return true;
    }
  }
  return false;
}

function heuristic(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function key(p: Point): string {
  return `${Math.round(p.x / STEP)},${Math.round(p.y / STEP)}`;
}

/** A* on a coarse grid; capped iterations for realtime HUD use. */
export function findPath(
  from: Point,
  to: Point,
  colliders: CollisionRect[],
  bounds: { width: number; height: number },
  maxIters = 800,
): PathResult {
  const start = {
    x: Math.round(from.x / STEP) * STEP,
    y: Math.round(from.y / STEP) * STEP,
  };
  const goal = {
    x: Math.round(to.x / STEP) * STEP,
    y: Math.round(to.y / STEP) * STEP,
  };
  const dist = heuristic(from, to);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const bearingDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  if (blocked(goal.x, goal.y, colliders)) {
    return {
      ok: false,
      direction: { x: dx / (dist || 1), y: dy / (dist || 1) },
      distance: dist,
      bearingDeg,
    };
  }

  type Node = { p: Point; g: number; f: number; parent?: Node };
  const open: Node[] = [{ p: start, g: 0, f: heuristic(start, goal) }];
  const closed = new Set<string>();
  let iters = 0;

  while (open.length && iters++ < maxIters) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    if (key(current.p) === key(goal) || heuristic(current.p, goal) < STEP) {
      const path: Point[] = [];
      let n: Node | undefined = current;
      while (n) {
        path.push(n.p);
        n = n.parent;
      }
      path.reverse();
      path.push(to);
      return { ok: true, path, distance: dist };
    }
    closed.add(key(current.p));
    for (const [ox, oy] of [
      [STEP, 0],
      [-STEP, 0],
      [0, STEP],
      [0, -STEP],
      [STEP, STEP],
      [STEP, -STEP],
      [-STEP, STEP],
      [-STEP, -STEP],
    ] as const) {
      const np = { x: current.p.x + ox, y: current.p.y + oy };
      if (np.x < 0 || np.y < 0 || np.x > bounds.width || np.y > bounds.height) continue;
      if (blocked(np.x, np.y, colliders)) continue;
      const k = key(np);
      if (closed.has(k)) continue;
      const stepCost = ox !== 0 && oy !== 0 ? STEP * 1.414 : STEP;
      const g = current.g + stepCost;
      const existing = open.find((n) => key(n.p) === k);
      if (existing && existing.g <= g) continue;
      if (existing) {
        existing.g = g;
        existing.f = g + heuristic(np, goal);
        existing.parent = current;
      } else {
        open.push({ p: np, g, f: g + heuristic(np, goal), parent: current });
      }
    }
  }

  return {
    ok: false,
    direction: { x: dx / (dist || 1), y: dy / (dist || 1) },
    distance: dist,
    bearingDeg,
  };
}

/** Prefer authored pathway polylines when navigating between known zones. */
export function pathAlongPathways(
  from: Point,
  to: Point,
  pathways: PathwayDef[],
  opts?: { skipLocked?: boolean },
): Point[] | null {
  let best: Point[] | null = null;
  let bestScore = Infinity;
  for (const path of pathways) {
    if (opts?.skipLocked !== false && path.locked) continue;
    if (!path.waypoints.length) continue;
    const poly = path.waypoints;
    const dStart = heuristic(from, poly[0]!);
    const dEnd = heuristic(to, poly[poly.length - 1]!);
    const score = dStart + dEnd;
    if (score < bestScore) {
      bestScore = score;
      best = [from, ...poly, to];
    }
  }
  return bestScore < 400 ? best : null;
}

export function formatGuidance(result: PathResult): string {
  if (result.ok) {
    return `Path ~${Math.round(result.distance)}u · ${result.path.length} steps`;
  }
  const dirs = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
  const idx = Math.round(((result.bearingDeg + 360) % 360) / 45) % 8;
  return `${dirs[idx]} · ${Math.round(result.distance)}u`;
}
