/**
 * Seamless region transitions — walkable overlap zones near portals.
 * Must never be covered by edge invisible walls.
 */

import type { CollisionRect, MapBlueprint, WorldMapObject } from "@/game/world-maps/types";
import { pointInCollider } from "@/game/world-maps/boundaries/collider-semantics";

const TILE = 32;

export type TransitionHit = {
  collider: CollisionRect;
  toRegionId: string;
  portalId: string;
  entryPortalId?: string;
};

/** Author transition AABBs around each portal (non-solid). */
export function transitionZonesFromPortals(
  portals: WorldMapObject[],
): CollisionRect[] {
  return portals.map((p) => {
    const size = TILE * 2;
    return {
      id: `transition-${p.id}`,
      x: p.x - size / 2,
      y: p.y - size / 2,
      width: size,
      height: size,
      kind: "transition" as const,
      solid: false,
      metadata: {
        toRegionId: String(p.metadata?.toRegionId ?? ""),
        portalId: p.id,
        entryPortalId: p.id,
      },
    };
  });
}

export function collectTransitionZones(
  blueprint: MapBlueprint,
): CollisionRect[] {
  const authored = blueprint.colliders.filter((c) => c.kind === "transition");
  if (authored.length) return authored;
  const portals = blueprint.objects.filter((o) => o.type === "portal");
  return transitionZonesFromPortals(portals);
}

export function transitionAtPoint(
  x: number,
  y: number,
  zones: CollisionRect[],
): TransitionHit | null {
  for (const c of zones) {
    if (c.kind !== "transition") continue;
    if (!pointInCollider(x, y, c)) continue;
    const toRegionId = String(c.metadata?.toRegionId ?? "");
    if (!toRegionId) continue;
    return {
      collider: c,
      toRegionId,
      portalId: String(c.metadata?.portalId ?? c.id),
      entryPortalId:
        typeof c.metadata?.entryPortalId === "string"
          ? c.metadata.entryPortalId
          : undefined,
    };
  }
  return null;
}

/** Ensure edge border walls do not cover transition centers (gap check helper). */
export function transitionOverlapsEdgeWall(
  transition: CollisionRect,
  edgeWalls: CollisionRect[],
): boolean {
  const cx = transition.x + transition.width / 2;
  const cy = transition.y + transition.height / 2;
  return edgeWalls.some((w) => pointInCollider(cx, cy, w));
}
