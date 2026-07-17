/**
 * In-memory civilization progress for foundation APIs.
 * Swap for Prisma CivilizationProgress when persistence lands.
 */

import type { CivilizationProgress, WorldEffectOp } from "@/game/civilization/types";
import { CIVILIZATION_MILESTONES } from "@/game/civilization/milestones";

const DEMO_SEED: CivilizationProgress = {
  contributions: {
    commons_lanterns: 520,
    ember_forge_reignited: 340,
    tide_piers_rebuilt: 210,
    grove_shrine_restored: 890,
  },
  unlockedMilestoneKeys: ["commons_lanterns"],
  era: 1,
  totalContributed: 1960,
  updatedAt: new Date().toISOString(),
};

let state: CivilizationProgress = structuredClone(DEMO_SEED);

export function getCivilizationProgress(): CivilizationProgress {
  return structuredClone(state);
}

export function resetCivilizationProgressForTests(): void {
  state = structuredClone(DEMO_SEED);
}

export function contributeToMilestone(
  milestoneKey: string,
  amount: number,
): {
  progress: CivilizationProgress;
  newlyUnlocked: string[];
  effects: WorldEffectOp[];
} {
  if (amount <= 0) {
    return { progress: getCivilizationProgress(), newlyUnlocked: [], effects: [] };
  }
  const def = CIVILIZATION_MILESTONES.find((m) => m.key === milestoneKey);
  if (!def) {
    return { progress: getCivilizationProgress(), newlyUnlocked: [], effects: [] };
  }

  const prev = state.contributions[milestoneKey] ?? 0;
  const next = prev + amount;
  state.contributions[milestoneKey] = next;
  state.totalContributed += amount;
  state.updatedAt = new Date().toISOString();

  const newlyUnlocked: string[] = [];
  const effects: WorldEffectOp[] = [];

  if (
    next >= def.threshold &&
    !state.unlockedMilestoneKeys.includes(milestoneKey)
  ) {
    state.unlockedMilestoneKeys.push(milestoneKey);
    newlyUnlocked.push(milestoneKey);
    effects.push(...def.worldEffects);
    state.era = Math.max(state.era, def.era);
  }

  // Check global thresholds that use totalContributed
  for (const m of CIVILIZATION_MILESTONES.filter((x) => x.category === "global")) {
    if (
      state.totalContributed >= m.threshold &&
      !state.unlockedMilestoneKeys.includes(m.key)
    ) {
      state.unlockedMilestoneKeys.push(m.key);
      newlyUnlocked.push(m.key);
      effects.push(...m.worldEffects);
      state.era = Math.max(state.era, m.era);
    }
  }

  return { progress: getCivilizationProgress(), newlyUnlocked, effects };
}

export function activeWorldEffects(): WorldEffectOp[] {
  return CIVILIZATION_MILESTONES.filter((m) =>
    state.unlockedMilestoneKeys.includes(m.key),
  ).flatMap((m) => m.worldEffects);
}

export function civilizationProgressPercent(): number {
  const maxThreshold = Math.max(...CIVILIZATION_MILESTONES.map((m) => m.threshold));
  return Math.min(100, Math.round((state.totalContributed / maxThreshold) * 100));
}
