/**
 * Immersive-tied performance knobs (stubs + pure helpers).
 * Atmosphere / particles can read particleBudget without rewriting Phaser emitters yet.
 */

import type { ImmersiveSettings } from "@/game/live-world/systems/immersive/types";

export type ParticleEmitScale = {
  density: number;
  maxEmitters: number;
  cullDistant: boolean;
};

export function resolveParticleEmitScale(
  settings: Pick<ImmersiveSettings, "particleBudget" | "performanceCull" | "hudMode">,
): ParticleEmitScale {
  const immersiveBoost =
    settings.hudMode === "immersive" || settings.hudMode === "cinematic"
      ? settings.performanceCull
      : settings.performanceCull;

  let density = 1;
  let maxEmitters = 24;
  if (settings.particleBudget === "reduced") {
    density = 0.55;
    maxEmitters = 12;
  } else if (settings.particleBudget === "minimal") {
    density = 0.25;
    maxEmitters = 6;
  }

  if (immersiveBoost && settings.particleBudget === "full") {
    density = Math.min(density, 0.7);
    maxEmitters = Math.min(maxEmitters, 16);
  }

  return {
    density,
    maxEmitters,
    cullDistant: settings.performanceCull || settings.particleBudget !== "full",
  };
}

export function shouldCullPropAtDistance(
  distancePx: number,
  settings: Pick<ImmersiveSettings, "performanceCull">,
  cullRadius = 900,
): boolean {
  if (!settings.performanceCull) return false;
  return distancePx > cullRadius;
}
