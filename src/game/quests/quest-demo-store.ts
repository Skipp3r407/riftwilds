/**
 * Local demo quest progress (localStorage). Backend PlayerQuest sync is Phase 3.
 */

import {
  QUEST_CATALOG,
  type QuestDef,
  type QuestStatus,
} from "@/game/quests/quest-catalog";

export const QUEST_DEMO_STORAGE_KEY = "riftwilds-quest-demo-v2-tcg";

export type QuestDemoEntry = {
  status: QuestStatus;
  /** objectiveKey → current count */
  progress: Record<string, number>;
  tracked: boolean;
};

export type QuestDemoState = Record<string, QuestDemoEntry>;

function emptyProgress(quest: QuestDef): Record<string, number> {
  return Object.fromEntries(quest.objectives.map((o) => [o.key, 0]));
}

/** Seed a board that already looks lived-in. */
export function createDefaultDemoState(): QuestDemoState {
  const state: QuestDemoState = {};

  for (const quest of QUEST_CATALOG) {
    state[quest.key] = {
      status: "available",
      progress: emptyProgress(quest),
      tracked: false,
    };
  }

  // Completed intro
  state["story-first-steps"] = {
    status: "completed",
    progress: Object.fromEntries(
      QUEST_CATALOG.find((q) => q.key === "story-first-steps")!.objectives.map((o) => [
        o.key,
        o.target,
      ]),
    ),
    tracked: false,
  };

  // Active story branch
  state["story-ember-call"] = {
    status: "active",
    progress: { "ember-battle": 0, "ember-card": 0 },
    tracked: true,
  };

  // Locked until ember call done
  state["story-rift-compass"] = {
    status: "locked",
    progress: emptyProgress(get("story-rift-compass")),
    tracked: false,
  };

  state["explore-basin-ridge"] = {
    status: "locked",
    progress: emptyProgress(get("explore-basin-ridge")),
    tracked: false,
  };

  state["battle-spar"] = {
    status: "locked",
    progress: emptyProgress(get("battle-spar")),
    tracked: false,
  };

  state["community-boss-hit"] = {
    status: "locked",
    progress: emptyProgress(get("community-boss-hit")),
    tracked: false,
  };

  // Active dailies / exploration
  state["daily-feed-riftling"] = {
    status: "active",
    progress: { "feed-once": 0 },
    tracked: true,
  };

  state["explore-grove-trail"] = {
    status: "active",
    progress: { "discover-grove": 1, "trail-mark": 0 },
    tracked: false,
  };

  state["starter-q1-awakening"] = {
    status: "active",
    progress: { "open-binder": 0, "start-practice": 0 },
    tracked: true,
  };

  state["weekly-bond"] = {
    status: "active",
    progress: { "bond-five": 2 },
    tracked: false,
  };

  state["daily-play-session"] = {
    status: "available",
    progress: { "demo-session": 0 },
    tracked: false,
  };

  state["battle-training"] = {
    status: "available",
    progress: emptyProgress(get("battle-training")),
    tracked: false,
  };

  // Lock any quest whose requirements are not yet completed.
  for (const quest of QUEST_CATALOG) {
    if (!quest.requires?.length) continue;
    const entry = state[quest.key];
    if (!entry) continue;
    if (entry.status === "completed" || entry.status === "active") continue;
    const allMet = quest.requires.every((req) => state[req]?.status === "completed");
    if (!allMet) {
      entry.status = "locked";
    }
  }

  return state;
}

function get(key: string): QuestDef {
  return QUEST_CATALOG.find((q) => q.key === key)!;
}

export function loadQuestDemoState(): QuestDemoState {
  if (typeof window === "undefined") return createDefaultDemoState();
  try {
    const raw = localStorage.getItem(QUEST_DEMO_STORAGE_KEY);
    if (!raw) {
      const fresh = createDefaultDemoState();
      localStorage.setItem(QUEST_DEMO_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(raw) as QuestDemoState;
    return mergeWithCatalog(parsed);
  } catch {
    return createDefaultDemoState();
  }
}

function mergeWithCatalog(stored: QuestDemoState): QuestDemoState {
  const base = createDefaultDemoState();
  for (const quest of QUEST_CATALOG) {
    const entry = stored[quest.key];
    if (!entry) continue;
    base[quest.key] = {
      status: entry.status,
      progress: { ...emptyProgress(quest), ...entry.progress },
      tracked: Boolean(entry.tracked),
    };
  }
  return base;
}

export function saveQuestDemoState(state: QuestDemoState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEST_DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function acceptQuest(state: QuestDemoState, questKey: string): QuestDemoState {
  const quest = QUEST_CATALOG.find((q) => q.key === questKey);
  if (!quest) return state;
  const entry = state[questKey];
  if (!entry || entry.status !== "available") return state;
  return {
    ...state,
    [questKey]: {
      ...entry,
      status: "active",
      tracked: true,
      progress: emptyProgress(quest),
    },
  };
}

export function trackQuest(state: QuestDemoState, questKey: string): QuestDemoState {
  const entry = state[questKey];
  if (!entry || (entry.status !== "active" && entry.status !== "available")) return state;
  return {
    ...state,
    [questKey]: { ...entry, tracked: !entry.tracked },
  };
}

/** Demo-only: advance the first incomplete objective (or complete the quest). */
export function advanceQuestProgress(
  state: QuestDemoState,
  questKey: string,
): QuestDemoState {
  const quest = QUEST_CATALOG.find((q) => q.key === questKey);
  if (!quest) return state;
  const entry = state[questKey];
  if (!entry || entry.status !== "active") return state;

  const progress = { ...entry.progress };
  let advanced = false;
  for (const obj of quest.objectives) {
    const cur = progress[obj.key] ?? 0;
    if (cur < obj.target) {
      progress[obj.key] = cur + 1;
      advanced = true;
      break;
    }
  }
  if (!advanced) return state;

  const done = quest.objectives.every((o) => (progress[o.key] ?? 0) >= o.target);
  let next: QuestDemoState = {
    ...state,
    [questKey]: {
      ...entry,
      progress,
      status: done ? "completed" : "active",
      tracked: done ? false : entry.tracked,
    },
  };

  if (done) {
    next = unlockDependents(next, questKey);
  }
  return next;
}

function unlockDependents(state: QuestDemoState, completedKey: string): QuestDemoState {
  let next = state;
  for (const quest of QUEST_CATALOG) {
    if (!quest.requires?.includes(completedKey)) continue;
    const entry = next[quest.key];
    if (!entry || entry.status !== "locked") continue;
    const allMet = (quest.requires ?? []).every(
      (req) => next[req]?.status === "completed",
    );
    if (!allMet) continue;
    next = {
      ...next,
      [quest.key]: { ...entry, status: "available" },
    };
  }
  return next;
}

export function resetQuestDemoState(): QuestDemoState {
  const fresh = createDefaultDemoState();
  saveQuestDemoState(fresh);
  return fresh;
}

/**
 * Advance all active quests that track a metric (TCG match / binder / hatchery hooks).
 */
export function bumpQuestMetric(
  state: QuestDemoState,
  metric: string,
  amount = 1,
): QuestDemoState {
  if (amount <= 0) return state;
  let next = state;
  for (const quest of QUEST_CATALOG) {
    const entry = next[quest.key];
    if (!entry || entry.status !== "active") continue;
    const progress = { ...entry.progress };
    let changed = false;
    for (const obj of quest.objectives) {
      if (obj.metric !== metric) continue;
      const cur = progress[obj.key] ?? 0;
      if (cur >= obj.target) continue;
      progress[obj.key] = Math.min(obj.target, cur + amount);
      changed = true;
    }
    if (!changed) continue;
    const done = quest.objectives.every((o) => (progress[o.key] ?? 0) >= o.target);
    next = {
      ...next,
      [quest.key]: {
        ...entry,
        progress,
        status: done ? "completed" : "active",
        tracked: done ? false : entry.tracked,
      },
    };
    if (done) {
      next = unlockDependents(next, quest.key);
    }
  }
  return next;
}

/** Client helper: load → bump → save. */
export function recordQuestMetric(metric: string, amount = 1): QuestDemoState {
  const state = loadQuestDemoState();
  const next = bumpQuestMetric(state, metric, amount);
  saveQuestDemoState(next);
  return next;
}
