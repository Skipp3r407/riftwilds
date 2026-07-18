/**
 * Validation helpers — open edges, missing borders, spawn safety, transition gaps.
 */

import type { CollisionRect, MapBlueprint } from "@/game/world-maps/types";
import {
  isEdgeWall,
  isSolidCollider,
  pointInCollider,
} from "@/game/world-maps/boundaries/collider-semantics";
import { spawnOverlapsSolid } from "@/game/world-maps/boundaries/spawn-clamp";
import {
  collectTransitionZones,
  transitionOverlapsEdgeWall,
} from "@/game/world-maps/boundaries/transition-zones";

export type BoundaryAuditIssue = {
  code: string;
  severity: "critical" | "warn";
  detail: string;
};

export type BoundaryAuditResult = {
  ok: boolean;
  issues: BoundaryAuditIssue[];
  stats: {
    edgeWalls: number;
    solidColliders: number;
    transitions: number;
    deepWater: number;
  };
};

function edgeWallSides(colliders: CollisionRect[]): Set<string> {
  const sides = new Set<string>();
  for (const c of colliders) {
    if (!isEdgeWall(c)) continue;
    const m = c.id.match(/-wall-([nsew])$/);
    if (m?.[1]) sides.add(m[1]);
  }
  return sides;
}

/** Sample midpoints along each map edge — expect them inside a wall collider. */
function openEdgeGaps(blueprint: MapBlueprint): string[] {
  const { camera, tileSize: T, colliders } = blueprint;
  const walls = colliders.filter(isEdgeWall);
  const gaps: string[] = [];
  const samples = 5;
  const checks: { side: string; x: number; y: number }[] = [];

  for (let i = 0; i < samples; i++) {
    const t = (i + 0.5) / samples;
    checks.push({
      side: "n",
      x: camera.x + camera.width * t,
      y: camera.y + T / 2,
    });
    checks.push({
      side: "s",
      x: camera.x + camera.width * t,
      y: camera.y + camera.height - T / 2,
    });
    checks.push({
      side: "w",
      x: camera.x + T / 2,
      y: camera.y + camera.height * t,
    });
    checks.push({
      side: "e",
      x: camera.x + camera.width - T / 2,
      y: camera.y + camera.height * t,
    });
  }

  const uncovered = new Set<string>();
  for (const s of checks) {
    const covered = walls.some((w) => pointInCollider(s.x, s.y, w));
    if (!covered) uncovered.add(s.side);
  }
  for (const side of uncovered) {
    gaps.push(`open-edge-${side}`);
  }
  return gaps;
}

export function auditBlueprintBoundaries(
  blueprint: MapBlueprint,
): BoundaryAuditResult {
  const issues: BoundaryAuditIssue[] = [];
  const solids = blueprint.colliders.filter(isSolidCollider);
  const transitions = collectTransitionZones(blueprint);
  const edgeWalls = blueprint.colliders.filter(isEdgeWall);
  const deepWater = blueprint.colliders.filter(
    (c) => c.kind === "water" || c.kind === "deep_water",
  );

  const sides = edgeWallSides(blueprint.colliders);
  for (const side of ["n", "s", "e", "w"] as const) {
    if (!sides.has(side)) {
      issues.push({
        code: "missing-edge-wall",
        severity: "critical",
        detail: `Missing border wall on ${side}`,
      });
    }
  }

  for (const gap of openEdgeGaps(blueprint)) {
    issues.push({
      code: "open-edge",
      severity: "critical",
      detail: `Playable edge gap: ${gap}`,
    });
  }

  if (spawnOverlapsSolid(blueprint.spawn, blueprint.colliders)) {
    issues.push({
      code: "spawn-in-solid",
      severity: "critical",
      detail: `Spawn (${blueprint.spawn.x},${blueprint.spawn.y}) overlaps a solid collider`,
    });
  }

  const portals = blueprint.objects.filter((o) => o.type === "portal");
  if (portals.length && transitions.length === 0) {
    issues.push({
      code: "missing-transitions",
      severity: "warn",
      detail: "Portals present but no transition zones (will auto-derive at runtime)",
    });
  }

  const walls = edgeWalls;
  for (const t of transitions) {
    if (transitionOverlapsEdgeWall(t, walls)) {
      issues.push({
        code: "transition-under-wall",
        severity: "critical",
        detail: `Transition ${t.id} center sits under an edge wall`,
      });
    }
  }

  // Soft: expect at least one natural barrier or water on non-hub stubs
  if (
    blueprint.slug !== "riftwild-commons" &&
    !blueprint.colliders.some(
      (c) =>
        c.kind === "cliff" ||
        c.kind === "water" ||
        c.kind === "deep_water" ||
        c.kind === "lava" ||
        c.kind === "hazard",
    )
  ) {
    issues.push({
      code: "no-natural-barriers",
      severity: "warn",
      detail: "No cliff/water/lava/hazard colliders — relying on edge walls only",
    });
  }

  const critical = issues.some((i) => i.severity === "critical");
  return {
    ok: !critical,
    issues,
    stats: {
      edgeWalls: edgeWalls.length,
      solidColliders: solids.length,
      transitions: transitions.length,
      deepWater: deepWater.length,
    },
  };
}

export function auditAllBlueprints(
  blueprints: MapBlueprint[],
): { slug: string; result: BoundaryAuditResult }[] {
  return blueprints.map((bp) => ({
    slug: bp.slug,
    result: auditBlueprintBoundaries(bp),
  }));
}
