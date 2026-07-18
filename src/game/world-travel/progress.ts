/**
 * World travel progress — Gateway activations, discovery rewards, unlock inputs.
 * Phase 1 localStorage authority (never SOL) with in-memory mirror for SSR/tests.
 */

import type { WorldTravelProgress } from "@/game/world-travel/types";

export const WORLD_TRAVEL_PROGRESS_KEY = "riftwilds-world-travel-v1";

let memory: WorldTravelProgress | null = null;

export function createDefaultTravelProgress(): WorldTravelProgress {
  return {
    version: 1,
    activatedGateways: [],
    regionsDiscovered: ["riftwild-commons"],
    claimedDiscoveryRewards: [],
    explorationPoints: 0,
    explorationXp: 0,
    playerLevel: 1,
    storyChapters: [],
    bossesDefeated: [],
    gatewaysRestored: [],
    reputation: {},
    completedQuests: [],
    travelAchievements: [],
    updatedAt: Date.now(),
  };
}

function normalize(parsed: Partial<WorldTravelProgress>): WorldTravelProgress {
  const base = createDefaultTravelProgress();
  return {
    ...base,
    ...parsed,
    version: 1,
    activatedGateways: [...(parsed.activatedGateways ?? [])],
    regionsDiscovered: parsed.regionsDiscovered?.length
      ? [...parsed.regionsDiscovered]
      : ["riftwild-commons"],
    claimedDiscoveryRewards: [...(parsed.claimedDiscoveryRewards ?? [])],
    reputation: { ...(parsed.reputation ?? {}) },
    completedQuests: [...(parsed.completedQuests ?? [])],
    travelAchievements: [...(parsed.travelAchievements ?? [])],
    storyChapters: [...(parsed.storyChapters ?? [])],
    bossesDefeated: [...(parsed.bossesDefeated ?? [])],
    gatewaysRestored: [...(parsed.gatewaysRestored ?? [])],
  };
}

export function loadTravelProgress(): WorldTravelProgress {
  if (memory) return normalize(memory);

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(WORLD_TRAVEL_PROGRESS_KEY);
      if (raw) {
        memory = normalize(JSON.parse(raw) as Partial<WorldTravelProgress>);
        return normalize(memory);
      }
    } catch {
      /* fall through */
    }
  }

  memory = createDefaultTravelProgress();
  return normalize(memory);
}

export function saveTravelProgress(state: WorldTravelProgress): void {
  const next = normalize({ ...state, updatedAt: Date.now() });
  memory = next;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORLD_TRAVEL_PROGRESS_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

/** Test helper — clears memory + localStorage. */
export function resetTravelProgressForTests(): void {
  memory = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(WORLD_TRAVEL_PROGRESS_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function markStoryChapter(chapter: string): WorldTravelProgress {
  const state = loadTravelProgress();
  if (!state.storyChapters.includes(chapter)) {
    state.storyChapters.push(chapter);
    saveTravelProgress(state);
  }
  return state;
}

export function markBossDefeated(bossId: string): WorldTravelProgress {
  const state = loadTravelProgress();
  if (!state.bossesDefeated.includes(bossId)) {
    state.bossesDefeated.push(bossId);
    saveTravelProgress(state);
  }
  return state;
}

export function markGatewayRestored(key: string): WorldTravelProgress {
  const state = loadTravelProgress();
  if (!state.gatewaysRestored.includes(key)) {
    state.gatewaysRestored.push(key);
    saveTravelProgress(state);
  }
  return state;
}

export function setPlayerLevel(level: number): WorldTravelProgress {
  const state = loadTravelProgress();
  state.playerLevel = Math.max(1, Math.floor(level));
  saveTravelProgress(state);
  return state;
}

export function setReputation(
  factionId: string,
  value: number,
): WorldTravelProgress {
  const state = loadTravelProgress();
  state.reputation[factionId] = Math.floor(value);
  saveTravelProgress(state);
  return state;
}

export function markQuestComplete(questKey: string): WorldTravelProgress {
  const state = loadTravelProgress();
  if (!state.completedQuests.includes(questKey)) {
    state.completedQuests.push(questKey);
    saveTravelProgress(state);
  }
  return state;
}

/** Sync regionsVisited from LivePlayState into travel progress (idempotent). */
export function syncRegionsFromPlayState(regionsVisited: string[]): WorldTravelProgress {
  const state = loadTravelProgress();
  let dirty = false;
  for (const id of regionsVisited) {
    if (!state.regionsDiscovered.includes(id)) {
      state.regionsDiscovered.push(id);
      dirty = true;
    }
  }
  if (dirty) saveTravelProgress(state);
  return state;
}
