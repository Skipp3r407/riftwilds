/**
 * Graphics quality presets for Live World Commons.
 * Low is default-friendly; Ultra is never the default.
 */

import type { GraphicsQualityPreset } from "@/game/live-world/systems/immersive/types";

export type GraphicsQualityResolved = {
  preset: GraphicsQualityPreset;
  propBudget: "full" | "medium" | "low";
  terrainBlend: boolean;
  buildingLayers: boolean;
  vegetationLayers: boolean;
  actorShadow: boolean;
  waterDetail: boolean;
  particleScale: number;
};

export function resolveGraphicsQuality(
  preset: GraphicsQualityPreset,
): GraphicsQualityResolved {
  switch (preset) {
    case "ultra":
      return {
        preset,
        propBudget: "full",
        terrainBlend: true,
        buildingLayers: true,
        vegetationLayers: true,
        actorShadow: true,
        waterDetail: true,
        particleScale: 1.15,
      };
    case "high":
      return {
        preset,
        propBudget: "full",
        terrainBlend: true,
        buildingLayers: true,
        vegetationLayers: true,
        actorShadow: true,
        waterDetail: true,
        particleScale: 1,
      };
    case "medium":
      return {
        preset,
        propBudget: "medium",
        terrainBlend: true,
        buildingLayers: true,
        vegetationLayers: true,
        actorShadow: true,
        waterDetail: false,
        particleScale: 0.7,
      };
    case "low":
    default:
      return {
        preset: "low",
        propBudget: "low",
        terrainBlend: true,
        buildingLayers: true,
        vegetationLayers: false,
        actorShadow: true,
        waterDetail: false,
        particleScale: 0.4,
      };
  }
}
