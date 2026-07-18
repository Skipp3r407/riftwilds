/**
 * Playable inset bounds — keep actors inside the map frame (inside edge walls).
 */

import type { CameraBounds, MapBlueprint } from "@/game/world-maps/types";

/** Default tile inset — keep in sync with blueprint-helpers TILE. */
const DEFAULT_TILE = 32;

export type PlayableBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

/** Inset by one tile so entities rest inside border walls, not on them. */
export function playableBoundsFromCamera(
  camera: CameraBounds,
  inset = DEFAULT_TILE,
): PlayableBounds {
  const minX = camera.x + inset;
  const minY = camera.y + inset;
  const maxX = camera.x + camera.width - inset;
  const maxY = camera.y + camera.height - inset;
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

export function playableBoundsFromBlueprint(
  blueprint: Pick<MapBlueprint, "camera" | "tileSize">,
): PlayableBounds {
  return playableBoundsFromCamera(
    blueprint.camera,
    blueprint.tileSize ?? DEFAULT_TILE,
  );
}

export function clampToPlayableBounds(
  x: number,
  y: number,
  bounds: PlayableBounds,
): { x: number; y: number } {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, y)),
  };
}
