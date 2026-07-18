/**
 * Terrain-aware footsteps — extends world.footstep with surface variants.
 */

import {
  REGION_FOOTSTEP_BIAS,
  TERRAIN_FOOTSTEP,
} from "@/lib/audio/catalog";
import type { TerrainFootstep } from "@/lib/audio/types";
import { playSfx } from "@/lib/audio/sfx";

export type FootstepOpts = {
  terrainKind?: string;
  regionSlug?: string;
  running?: boolean;
};

export function resolveFootstepSurface(opts: FootstepOpts): TerrainFootstep {
  if (opts.terrainKind) {
    const mapped = TERRAIN_FOOTSTEP[opts.terrainKind];
    if (mapped) return mapped;
  }
  if (opts.regionSlug) {
    const bias = REGION_FOOTSTEP_BIAS[opts.regionSlug];
    if (bias) return bias;
  }
  return "grass";
}

export function playFootstep(opts: FootstepOpts = {}) {
  const surface = resolveFootstepSurface(opts);
  playSfx("world.footstep", {
    surface,
    gainScale: opts.running ? 1.15 : 1,
  });
}
