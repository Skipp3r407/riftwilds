import type { AttachmentPoint } from "@/lib/items/types";

/**
 * Default attachment anchors for Live World pet overlays.
 * Coordinates are normalized offsets from pet sprite origin (0.5, 1) —
 * positive Y is upward in display space before Phaser depth sort.
 *
 * Backlog: per-species animation-frame anchors + admin aligner DB rows.
 */
export type AnchorOffset = {
  x: number;
  y: number;
  scale: number;
  rotationDeg: number;
  depthBias: number;
};

const DEFAULT_ANCHORS: Record<AttachmentPoint, AnchorOffset> = {
  head: { x: 0, y: -28, scale: 0.38, rotationDeg: 0, depthBias: 2 },
  horn: { x: 2, y: -30, scale: 0.36, rotationDeg: -8, depthBias: 3 },
  neck: { x: 0, y: -20, scale: 0.32, rotationDeg: 0, depthBias: 1 },
  chest: { x: 0, y: -14, scale: 0.42, rotationDeg: 0, depthBias: 1 },
  back: { x: -4, y: -18, scale: 0.4, rotationDeg: 12, depthBias: -1 },
  frontPawLeft: { x: -10, y: -4, scale: 0.34, rotationDeg: -15, depthBias: 2 },
  frontPawRight: { x: 10, y: -4, scale: 0.34, rotationDeg: 15, depthBias: 2 },
  rearPawLeft: { x: -8, y: -2, scale: 0.3, rotationDeg: -10, depthBias: 0 },
  rearPawRight: { x: 8, y: -2, scale: 0.3, rotationDeg: 10, depthBias: 0 },
  tailBase: { x: -12, y: -10, scale: 0.36, rotationDeg: 25, depthBias: -2 },
  tailMiddle: { x: -16, y: -12, scale: 0.34, rotationDeg: 35, depthBias: -2 },
  tailTip: { x: -20, y: -14, scale: 0.32, rotationDeg: 45, depthBias: -3 },
  wingLeft: { x: -14, y: -18, scale: 0.4, rotationDeg: -20, depthBias: -1 },
  wingRight: { x: 14, y: -18, scale: 0.4, rotationDeg: 20, depthBias: -1 },
  floatingFocus: { x: 16, y: -26, scale: 0.36, rotationDeg: 0, depthBias: 4 },
};

/** localStorage key used by admin equipment-aligner. */
export const ALIGNER_STORAGE_PREFIX = "equipment-align:";

export function getDefaultAnchor(point: AttachmentPoint): AnchorOffset {
  return { ...DEFAULT_ANCHORS[point] };
}

/**
 * Merge catalog default with optional per-item aligner overrides (client-only today).
 * Server appearance uses defaults until DB attachment rows exist.
 */
export function resolveAnchor(
  point: AttachmentPoint,
  override?: Partial<AnchorOffset> | null,
): AnchorOffset {
  return { ...getDefaultAnchor(point), ...override };
}

/** World-layer asset path convention. */
export function worldLayerPathForItem(itemId: string, family: "WEAPON" | "ARMOR" | "COSMETIC"): string {
  const folder =
    family === "WEAPON" ? "weapons" : family === "ARMOR" ? "armor" : "cosmetics";
  return `/assets/items/${folder}/world/${itemId}.png`;
}
