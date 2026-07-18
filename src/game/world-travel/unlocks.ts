/**
 * Region unlock evaluation — story/quest/boss/reputation/restoration/level.
 * Locked regions stay visible with teasers + unmet requirements.
 * Never paid pets / paid region passes.
 */

import {
  REGION_BY_SLUG,
  REGION_UNLOCK_GATES,
  type UnlockGate,
} from "@/game/world-maps/regions";
import { loadTravelProgress } from "@/game/world-travel/progress";
import type {
  RegionUnlockView,
  UnlockRequirement,
  WorldTravelProgress,
} from "@/game/world-travel/types";

export type UnlockProgressInput = {
  playerLevel: number;
  storyChapters: string[];
  bossesDefeated: string[];
  gateways: string[];
  regionsVisited: string[];
  reputation: Record<string, number>;
  completedQuests: string[];
};

export function travelProgressToUnlockInput(
  progress: WorldTravelProgress = loadTravelProgress(),
): UnlockProgressInput {
  return {
    playerLevel: progress.playerLevel,
    storyChapters: progress.storyChapters,
    bossesDefeated: progress.bossesDefeated,
    gateways: progress.gatewaysRestored,
    regionsVisited: progress.regionsDiscovered,
    reputation: progress.reputation,
    completedQuests: progress.completedQuests,
  };
}

function req(
  kind: UnlockRequirement["kind"],
  key: string,
  label: string,
  met: boolean,
): UnlockRequirement {
  return { kind, key, label, met };
}

export function evaluateUnlockRequirements(
  gate: UnlockGate,
  progress: UnlockProgressInput,
): UnlockRequirement[] {
  const r = gate.requires;
  const out: UnlockRequirement[] = [];
  if (r.storyChapter) {
    out.push(
      req(
        "story",
        r.storyChapter,
        `Story: ${r.storyChapter.replace("chapter-", "Chapter ")}`,
        progress.storyChapters.includes(r.storyChapter),
      ),
    );
  }
  if (r.playerLevel) {
    out.push(
      req(
        "level",
        `level-${r.playerLevel}`,
        `Keeper level ${r.playerLevel}+`,
        progress.playerLevel >= r.playerLevel,
      ),
    );
  }
  if (r.regionVisit) {
    const name = REGION_BY_SLUG[r.regionVisit]?.name ?? r.regionVisit;
    out.push(
      req(
        "region_visit",
        r.regionVisit,
        `Visit ${name}`,
        progress.regionsVisited.includes(r.regionVisit),
      ),
    );
  }
  if (r.bossDefeat) {
    out.push(
      req(
        "boss",
        r.bossDefeat,
        `Defeat ${r.bossDefeat.replace(/-/g, " ")}`,
        progress.bossesDefeated.includes(r.bossDefeat),
      ),
    );
  }
  if (r.gatewayRestored) {
    out.push(
      req(
        "restoration",
        r.gatewayRestored,
        `Restore ${r.gatewayRestored.replace(/-/g, " ")}`,
        progress.gateways.includes(r.gatewayRestored),
      ),
    );
  }
  if (r.reputationMin) {
    const [faction, min] = r.reputationMin;
    const score = progress.reputation[faction] ?? 0;
    out.push(
      req(
        "reputation",
        faction,
        `${faction} reputation ${min}+`,
        score >= min,
      ),
    );
  }
  if (r.questComplete) {
    out.push(
      req(
        "quest",
        r.questComplete,
        `Complete quest ${r.questComplete}`,
        progress.completedQuests.includes(r.questComplete),
      ),
    );
  }
  return out;
}

export function isRegionUnlocked(
  regionId: string,
  progress: UnlockProgressInput = travelProgressToUnlockInput(),
): boolean {
  const gate = REGION_UNLOCK_GATES.find((g) => g.regionId === regionId);
  if (!gate) return false;
  const reqs = evaluateUnlockRequirements(gate, progress);
  return reqs.every((x) => x.met);
}

export function getRegionUnlockView(
  regionId: string,
  progress: UnlockProgressInput = travelProgressToUnlockInput(),
): RegionUnlockView {
  const gate = REGION_UNLOCK_GATES.find((g) => g.regionId === regionId);
  const region = REGION_BY_SLUG[regionId];
  if (!gate || !region) {
    return {
      regionId,
      unlocked: false,
      teaser: "Unknown region.",
      requirements: [],
      note: "Missing unlock data.",
    };
  }
  const requirements = evaluateUnlockRequirements(gate, progress);
  return {
    regionId,
    unlocked: requirements.every((x) => x.met),
    teaser: region.blurb,
    requirements,
    note: gate.note,
  };
}

export function listRegionUnlockViews(
  progress: UnlockProgressInput = travelProgressToUnlockInput(),
): RegionUnlockView[] {
  return REGION_UNLOCK_GATES.map((g) => getRegionUnlockView(g.regionId, progress));
}

/** Portal unlockFlag aliases map to region unlock OR story flags. */
export function isPortalUnlockSatisfied(
  unlockFlag: string | undefined,
  lockedByDefault: boolean,
  progress: UnlockProgressInput = travelProgressToUnlockInput(),
  playFlags: string[] = [],
): boolean {
  if (!lockedByDefault && !unlockFlag) return true;
  if (unlockFlag && playFlags.includes(unlockFlag)) return true;
  // unlock-stormspire → stormspire-peaks region gate
  if (unlockFlag?.startsWith("unlock-")) {
    const short = unlockFlag.replace("unlock-", "");
    const regionGuess = REGION_UNLOCK_GATES.find(
      (g) =>
        g.regionId === short ||
        g.regionId.startsWith(short) ||
        g.regionId.includes(short),
    );
    if (regionGuess) return isRegionUnlocked(regionGuess.regionId, progress);
  }
  return !lockedByDefault;
}
