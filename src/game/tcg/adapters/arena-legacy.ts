/**
 * Soft adapter: Arena pet battler remains available; TCG is the primary battle path.
 * Do not delete `src/game/arena` — reuse affinity, species kits, rewards, compliance.
 */

import { featureFlagDefaults } from "@/lib/config/feature-flags";

export type CombatResolutionMode = "tcg" | "arena_training" | "legacy_instant_demo";

export function resolveWorldCombatMode(): CombatResolutionMode {
  if (featureFlagDefaults.TCG_WORLD_ENCOUNTERS_ENABLED) {
    return "tcg";
  }
  if (featureFlagDefaults.LIVE_WORLD_LEGACY_INSTANT_COMBAT_ENABLED) {
    return "legacy_instant_demo";
  }
  // Fallback: still prefer TCG framework if enabled for practice routes
  if (featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
    return "tcg";
  }
  return "legacy_instant_demo";
}

export function isArenaTrainingStillAvailable(): boolean {
  return featureFlagDefaults.ARENA_ENABLED;
}

export const ARENA_REUSE_NOTES = [
  "Affinity chart → TCG matchups",
  "Species kits → card power/cost seeds",
  "Anti-cheat + reward caps → future ranked TCG",
  "Training REST pattern → TCG match APIs",
] as const;
