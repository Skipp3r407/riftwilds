/**
 * Natural sealed exits for locked portals / pathways.
 * Prefer collapsed bridges, seals, checkpoints — never "You can't go there."
 */

import type {
  CollisionRect,
  MapBlueprint,
  PathwayDef,
  WorldMapObject,
} from "@/game/world-maps/types";
import { isSolidCollider } from "@/game/world-maps/boundaries/collider-semantics";

const TILE = 32;

export type LockedBlockerMessage = {
  speaker: string;
  lines: string[];
  barrierStyle: NonNullable<CollisionRect["metadata"]>["barrierStyle"];
};

const STYLE_BY_DEST: Record<
  string,
  NonNullable<CollisionRect["metadata"]>["barrierStyle"]
> = {
  "ember-crater": "collapsed_bridge",
  "moonwater-coast": "gate",
  "elderwood-forest": "forest",
  "stormspire-peaks": "collapsed_bridge",
  "stoneheart-canyon": "cliff",
  "frostveil-basin": "seal",
  "radiant-citadel": "checkpoint",
  "void-hollow": "seal",
  "alloy-ruins": "checkpoint",
  "spirit-marsh": "collapsed_bridge",
  "celestial-rift": "seal",
};

const STYLE_LINES: Record<
  NonNullable<CollisionRect["metadata"]>["barrierStyle"] & string,
  (label: string) => string[]
> = {
  collapsed_bridge: (label) => [
    `The bridge toward ${label} has collapsed into the rift.`,
    "Repair crews wait on a later chapter — the path is not gone, only unfinished.",
  ],
  seal: (label) => [
    `A living seal bars the way to ${label}.`,
    "It will lift when the story — and your Keeper — are ready.",
  ],
  checkpoint: (label) => [
    `A checkpoint ward holds the gate to ${label}.`,
    "Show the required progress at the Portal Plaza when you return.",
  ],
  forest: (label) => [
    `Dense roots and ward-vines choke the trail to ${label}.`,
    "Elderwood opens when the forest accepts your bond.",
  ],
  cliff: (label) => [
    `A sheer cliff face seals the pass toward ${label}.`,
    "Find another route — or wait until the stone path is restored.",
  ],
  gate: (label) => [
    `Tide-locked gates bar the road to ${label}.`,
    "They open with the coastal unlock — never a paid pass.",
  ],
};

export function barrierStyleForDestination(
  toRegionId: string,
): NonNullable<CollisionRect["metadata"]>["barrierStyle"] {
  return STYLE_BY_DEST[toRegionId] ?? "seal";
}

export function lockedBlockerMessage(
  portal: WorldMapObject,
  unmetHints?: string[],
): LockedBlockerMessage {
  const label = portal.label ?? "that region";
  const toRegionId = String(portal.metadata?.toRegionId ?? "");
  const style = barrierStyleForDestination(toRegionId);
  const lines = [...STYLE_LINES[style](label)];
  if (unmetHints?.length) {
    lines.push(`Still needed: ${unmetHints.slice(0, 3).join(" · ")}`);
  }
  return {
    speaker:
      style === "checkpoint"
        ? "Checkpoint Ward"
        : style === "collapsed_bridge"
          ? "Broken Crossing"
          : style === "forest"
            ? "Rootward Thickets"
            : style === "gate"
              ? "Tide Gate"
              : style === "cliff"
                ? "Stone Pass"
                : "Rift Seal",
    lines,
    barrierStyle: style,
  };
}

/** Solid seal placed just south of a locked portal (approach side). */
export function sealColliderForPortal(portal: WorldMapObject): CollisionRect {
  const toRegionId = String(portal.metadata?.toRegionId ?? "");
  const style = barrierStyleForDestination(toRegionId);
  const w = Math.round(TILE * 1.5);
  const h = Math.round(TILE * 0.75);
  return {
    id: `seal-${portal.id}`,
    x: portal.x - w / 2,
    y: portal.y + 10,
    width: w,
    height: h,
    kind: "seal",
    solid: true,
    metadata: {
      portalId: portal.id,
      toRegionId,
      barrierStyle: style,
      message: lockedBlockerMessage(portal).lines[0],
    },
  };
}

/** Runtime solids for every portal matching `isLocked`. */
export function lockedPortalSeals(
  portals: WorldMapObject[],
  isLocked: (portal: WorldMapObject) => boolean,
): CollisionRect[] {
  return portals.filter(isLocked).map(sealColliderForPortal);
}

/** Pathway end seals when pathway.locked or unlockFlag unmet. */
export function lockedPathwayBlockers(
  pathways: PathwayDef[],
  isPathwayLocked: (path: PathwayDef) => boolean,
): CollisionRect[] {
  const out: CollisionRect[] = [];
  for (const path of pathways) {
    if (!isPathwayLocked(path)) continue;
    const last = path.waypoints[path.waypoints.length - 1];
    if (!last) continue;
    out.push({
      id: `path-seal-${path.id}`,
      x: last.x - TILE,
      y: last.y - TILE / 2,
      width: TILE * 2,
      height: TILE,
      kind: "blocker",
      solid: true,
      metadata: {
        unlockFlag: path.unlockFlag,
        barrierStyle: "checkpoint",
        message: `The road toward ${path.to} is closed for now.`,
      },
    });
  }
  return out;
}

export function resolveRuntimeSolids(
  blueprint: MapBlueprint,
  opts: {
    isPortalLocked: (portal: WorldMapObject) => boolean;
    isPathwayLocked?: (path: PathwayDef) => boolean;
  },
): CollisionRect[] {
  const portals = blueprint.objects.filter((o) => o.type === "portal");
  const seals = lockedPortalSeals(portals, opts.isPortalLocked);
  const pathLocks = opts.isPathwayLocked
    ? lockedPathwayBlockers(blueprint.pathways, opts.isPathwayLocked)
    : [];
  return [
    ...blueprint.colliders.filter(isSolidCollider),
    ...seals,
    ...pathLocks,
  ];
}
