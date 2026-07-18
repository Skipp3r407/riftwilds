/**
 * 2.5D depth bands + occlusion helpers for Living Towns Commons.
 * City-builder mindset: layers create overlap (roofs, canopies, docks, walls),
 * not flat sprites on an empty field.
 */

import * as Phaser from "phaser";

/**
 * Ordered depth bands for Living Towns.
 * Trees/canopies share the actor band and Y-sort by footY — a permanently higher
 * canopy band hid the Keeper under every tree (opaque props read as "invisible player").
 */
export const DEPTH = {
  water: 0.1,
  ground: 0.5,
  /** Soft edge decals / grass bloom over tile seams. */
  groundDecal: 0.62,
  elevFace: 0.55,
  pathPaint: 0.7,
  groundShadow: 1.0,
  /** Building foundation / plinth under facade. */
  buildingFoundation: 1.35,
  wallBase: 1.5,
  /** Side wall faces for 2.5D massing. */
  buildingWall: 4.2,
  lowProp: 3.0,
  building: 5.0,
  /** Roof / canopy silhouette — fades when occluding the player. */
  buildingRoof: 5.4,
  /** Street props that sit in front of building plinths but behind actors. */
  streetProp: 6.0,
  actor: 10.0,
  /**
   * Trees / banners / tall props — same band as actors so southern sprites win.
   * Occluder fade still softens silhouettes when the player walks "behind" them.
   */
  canopy: 10.0,
  nameplate: 14.0,
  overheadFx: 16.0,
  uiWorld: 40.0,
  debug: 45.0,
} as const;

/** Y-sort within a band so southern sprites paint above northern ones. */
export function depthAt(band: number, worldY: number, bias = 0): number {
  return band + worldY * 0.001 + bias;
}

export type OccluderKind =
  | "building"
  | "roof"
  | "tree"
  | "canopy"
  | "dock"
  | "wall";

export type Occluder = {
  id: string;
  kind: OccluderKind;
  sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  footX: number;
  footY: number;
  halfW: number;
  /** How far north of the footprint the silhouette covers. */
  heightPx: number;
  baseAlpha: number;
  /** When true, fade when player is behind (north of foot, inside width). */
  fadeWhenBehind: boolean;
};

export function isBehindOccluder(
  playerX: number,
  playerY: number,
  o: Occluder,
): boolean {
  const inWidth = Math.abs(playerX - o.footX) < o.halfW + 16;
  const behind =
    playerY < o.footY - 6 && playerY > o.footY - o.heightPx;
  return inWidth && behind;
}

/**
 * Soft roof/canopy fade — player stays readable when walking "under" a layer.
 * Buildings fade more; trees fade less (partial hide is the point).
 * Depth uses footY Y-sort in the kind's band so the player in front of a tree is never buried.
 */
export function updateOccluderFades(
  occluders: Occluder[],
  playerX: number,
  playerY: number,
): void {
  for (const o of occluders) {
    const band = bandFor(o.kind);
    if (!o.fadeWhenBehind) {
      o.sprite.setDepth(depthAt(band, o.footY));
      continue;
    }
    const behind = isBehindOccluder(playerX, playerY, o);
    const minAlpha =
      o.kind === "roof"
        ? 0.28
        : o.kind === "building"
          ? 0.38
          : o.kind === "dock"
            ? 0.55
            : 0.62;
    const target = behind ? Math.min(minAlpha, o.baseAlpha) : o.baseAlpha;
    const cur = "alpha" in o.sprite ? o.sprite.alpha : 1;
    if ("setAlpha" in o.sprite) {
      o.sprite.setAlpha(cur + (target - cur) * 0.2);
    }
    // Behind tall props: tiny +bias so the silhouette wins near-equal footY ties.
    // Never use a large negative bias — that pulled trees under the Keeper.
    const bias =
      behind &&
      (o.kind === "tree" ||
        o.kind === "canopy" ||
        o.kind === "dock" ||
        o.kind === "roof")
        ? 0.12
        : 0;
    o.sprite.setDepth(depthAt(band, o.footY, bias));
  }
}

function bandFor(kind: OccluderKind): number {
  switch (kind) {
    case "building":
      return DEPTH.building;
    case "roof":
      return DEPTH.buildingRoof;
    case "tree":
    case "canopy":
      return DEPTH.canopy;
    case "dock":
      return DEPTH.streetProp;
    case "wall":
      return DEPTH.wallBase;
    default:
      return DEPTH.streetProp;
  }
}

/** Soft elliptical contact shadow under a footprint (2D→3D read). */
export function addContactShadow(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha = 0.22,
): Phaser.GameObjects.Ellipse {
  const shadow = scene.add.ellipse(x, y, width, height, 0x000000, alpha);
  shadow.setDepth(depthAt(DEPTH.groundShadow, y));
  return shadow;
}
