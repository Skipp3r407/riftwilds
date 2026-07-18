/**
 * World PvE encounter entry — Phase 1+ routes to TCG when enabled.
 * Legacy instant demo combat remains behind LIVE_WORLD_LEGACY_INSTANT_COMBAT_ENABLED.
 */

import {
  buildTcgBattlePath,
  encounterChallengeLines,
} from "@/game/tcg/encounter-bridge";
import { resolveWorldCombatMode } from "@/game/tcg/adapters/arena-legacy";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export type PveEncounterStub = {
  id: string;
  kind: "wild" | "event" | "boss";
  regionId: string;
};

export function listActiveEncounters(): PveEncounterStub[] {
  return [];
}

export type StartEncounterResult =
  | {
      ok: true;
      mode: "tcg";
      battlePath: string;
      lines: string[];
    }
  | {
      ok: true;
      mode: "legacy_instant_demo";
      lines: string[];
    }
  | { ok: false; reason: string };

export function startEncounter(
  id: string,
  opts?: { regionSlug?: string; returnTo?: string },
): StartEncounterResult {
  if (!featureFlagDefaults.LIVE_WORLD_PVE_ENABLED) {
    return { ok: false, reason: "LIVE_WORLD_PVE_DISABLED" };
  }

  const mode = resolveWorldCombatMode();
  const regionSlug = opts?.regionSlug ?? "riftwild-commons";
  const returnTo = opts?.returnTo ?? "/live-world";

  if (mode === "tcg") {
    if (!featureFlagDefaults.TCG_FRAMEWORK_ENABLED) {
      return { ok: false, reason: "TCG_FRAMEWORK_DISABLED" };
    }
    return {
      ok: true,
      mode: "tcg",
      battlePath: buildTcgBattlePath({
        enemyId: id,
        regionSlug,
        returnTo,
      }),
      lines: encounterChallengeLines(id),
    };
  }

  return {
    ok: true,
    mode: "legacy_instant_demo",
    lines: [
      `A ${id.replace(/-/g, " ")} challenges your companion!`,
      "Training clash resolved — loot scrap granted (demo combat).",
      "Return to Captain Orren when ready.",
    ],
  };
}
