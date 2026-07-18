/**
 * Exploration discovery progress — localStorage (Phase 1).
 * Hidden content stays hidden until IDs appear here.
 */

import {
  DEFAULT_LEGEND_TOGGLES,
  type CustomWaypoint,
  type DiscoveryKind,
  type ExplorationLogEntry,
  type ExplorationProgressState,
  type LegendToggleState,
} from "@/game/world-exploration/types";
import {
  getDiscoverableById,
  getPerkDef,
  listDiscoverablesForRegion,
} from "@/game/world-exploration/discovery-catalog";
import { REGION_BY_SLUG } from "@/game/world-maps/regions";

export const EXPLORATION_PROGRESS_KEY = "riftwilds-exploration-progress-v1";

let memory: ExplorationProgressState | null = null;

export function createDefaultExplorationProgress(): ExplorationProgressState {
  return {
    version: 1,
    discoveredIds: [],
    claimedTreasureIds: [],
    earnedPerkIds: [],
    defeatedBossIds: [],
    log: [],
    customWaypoints: [],
    legendToggles: { ...DEFAULT_LEGEND_TOGGLES },
    updatedAt: Date.now(),
  };
}

function normalize(parsed: Partial<ExplorationProgressState>): ExplorationProgressState {
  const base = createDefaultExplorationProgress();
  return {
    ...base,
    ...parsed,
    version: 1,
    discoveredIds: [...(parsed.discoveredIds ?? [])],
    claimedTreasureIds: [...(parsed.claimedTreasureIds ?? [])],
    earnedPerkIds: [...(parsed.earnedPerkIds ?? [])],
    defeatedBossIds: [...(parsed.defeatedBossIds ?? [])],
    log: [...(parsed.log ?? [])].slice(-200),
    customWaypoints: [...(parsed.customWaypoints ?? [])],
    legendToggles: { ...DEFAULT_LEGEND_TOGGLES, ...(parsed.legendToggles ?? {}) },
  };
}

export function loadExplorationProgress(): ExplorationProgressState {
  if (memory) return normalize(memory);
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(EXPLORATION_PROGRESS_KEY);
      if (raw) {
        memory = normalize(JSON.parse(raw) as Partial<ExplorationProgressState>);
        return normalize(memory);
      }
    } catch {
      /* fall through */
    }
  }
  memory = createDefaultExplorationProgress();
  return normalize(memory);
}

export function saveExplorationProgress(state: ExplorationProgressState): void {
  const next = normalize({ ...state, updatedAt: Date.now() });
  memory = next;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXPLORATION_PROGRESS_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function resetExplorationProgressForTests(): void {
  memory = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(EXPLORATION_PROGRESS_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function isDiscovered(id: string): boolean {
  return loadExplorationProgress().discoveredIds.includes(id);
}

export function hasEarnedPerk(perkId: string): boolean {
  return loadExplorationProgress().earnedPerkIds.includes(perkId);
}

export function isBossDefeated(bossId: string): boolean {
  return loadExplorationProgress().defeatedBossIds.includes(bossId);
}

function pushLog(
  state: ExplorationProgressState,
  entry: Omit<ExplorationLogEntry, "id" | "at"> & { id?: string; at?: number },
): void {
  state.log.unshift({
    id: entry.id ?? `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: entry.at ?? Date.now(),
    regionSlug: entry.regionSlug,
    kind: entry.kind,
    summary: entry.summary,
    discoverableId: entry.discoverableId,
    questKey: entry.questKey,
  });
  if (state.log.length > 200) state.log = state.log.slice(0, 200);
}

export function discoverById(
  discoverableId: string,
  opts?: { force?: boolean },
): { ok: boolean; firstTime: boolean; summary: string } {
  const def = getDiscoverableById(discoverableId);
  if (!def) return { ok: false, firstTime: false, summary: "Unknown discovery" };

  const state = loadExplorationProgress();
  if (state.discoveredIds.includes(discoverableId) && !opts?.force) {
    return { ok: true, firstTime: false, summary: `Already discovered: ${def.secretName}` };
  }

  if (!state.discoveredIds.includes(discoverableId)) {
    state.discoveredIds.push(discoverableId);
  }

  pushLog(state, {
    regionSlug: def.regionSlug,
    kind: def.kind,
    summary: `Discovered ${def.secretName}`,
    discoverableId,
  });

  if (def.kind === "perk" && def.perkId && !state.earnedPerkIds.includes(def.perkId)) {
    state.earnedPerkIds.push(def.perkId);
    pushLog(state, {
      regionSlug: def.regionSlug,
      kind: "perk",
      summary: `Earned perk: ${getPerkDef(def.perkId)?.name ?? def.perkId}`,
      discoverableId,
    });
  }

  if (def.kind === "world_boss" && def.bossId) {
    // Discovery ≠ defeat; defeat tracked separately
  }

  // Milestone perks
  const treasureCount = state.discoveredIds.filter((id) =>
    getDiscoverableById(id)?.kind === "treasure",
  ).length;
  if (treasureCount >= 3 && !state.earnedPerkIds.includes("perk-treasure-sense")) {
    state.earnedPerkIds.push("perk-treasure-sense");
    pushLog(state, {
      regionSlug: def.regionSlug,
      kind: "perk",
      summary: "Earned perk: Treasure Sense",
    });
  }

  saveExplorationProgress(state);
  return { ok: true, firstTime: true, summary: `Discovered ${def.secretName}` };
}

/** Proximity discovery — call from Live World tick / fog pass. */
export function tryDiscoverNearby(
  regionSlug: string,
  x: number,
  y: number,
): string[] {
  const state = loadExplorationProgress();
  const found: string[] = [];
  for (const def of listDiscoverablesForRegion(regionSlug)) {
    if (state.discoveredIds.includes(def.id)) continue;
    if (def.kind === "perk") continue; // perks via milestones / explicit grants
    const dx = def.x - x;
    const dy = def.y - y;
    if (dx * dx + dy * dy <= def.discoverRadius * def.discoverRadius) {
      const res = discoverById(def.id);
      if (res.firstTime) found.push(def.id);
    }
  }
  return found;
}

export function markBossDefeatedExploration(bossId: string): void {
  const state = loadExplorationProgress();
  if (!state.defeatedBossIds.includes(bossId)) {
    state.defeatedBossIds.push(bossId);
    const region =
      Object.values(REGION_BY_SLUG).find((r) => r.bossName && bossId.includes(r.slug))?.slug ??
      "riftwild-commons";
    pushLog(state, {
      regionSlug: region,
      kind: "world_boss",
      summary: `Defeated world threat (${bossId})`,
    });
    saveExplorationProgress(state);
  }
}

export function claimTreasure(discoverableId: string): boolean {
  const state = loadExplorationProgress();
  if (!state.discoveredIds.includes(discoverableId)) return false;
  if (state.claimedTreasureIds.includes(discoverableId)) return false;
  state.claimedTreasureIds.push(discoverableId);
  pushLog(state, {
    regionSlug: getDiscoverableById(discoverableId)?.regionSlug ?? "riftwild-commons",
    kind: "treasure",
    summary: `Claimed treasure cache`,
    discoverableId,
  });
  saveExplorationProgress(state);
  return true;
}

export function addCustomWaypoint(
  wp: Omit<CustomWaypoint, "id" | "createdAt"> & { id?: string },
): CustomWaypoint {
  const state = loadExplorationProgress();
  const entry: CustomWaypoint = {
    id: wp.id ?? `pin-${Date.now().toString(36)}`,
    regionSlug: wp.regionSlug,
    x: wp.x,
    y: wp.y,
    label: wp.label.slice(0, 48) || "Custom pin",
    note: wp.note?.slice(0, 120),
    createdAt: Date.now(),
  };
  state.customWaypoints.push(entry);
  if (state.customWaypoints.length > 40) {
    state.customWaypoints = state.customWaypoints.slice(-40);
  }
  pushLog(state, {
    regionSlug: entry.regionSlug,
    kind: "custom",
    summary: `Pinned: ${entry.label}`,
  });
  saveExplorationProgress(state);
  return entry;
}

export function removeCustomWaypoint(id: string): boolean {
  const state = loadExplorationProgress();
  const before = state.customWaypoints.length;
  state.customWaypoints = state.customWaypoints.filter((w) => w.id !== id);
  if (state.customWaypoints.length === before) return false;
  saveExplorationProgress(state);
  return true;
}

export function setLegendToggles(partial: Partial<LegendToggleState>): LegendToggleState {
  const state = loadExplorationProgress();
  state.legendToggles = { ...state.legendToggles, ...partial };
  saveExplorationProgress(state);
  return state.legendToggles;
}

export function getExplorationLog(limit = 40): ExplorationLogEntry[] {
  return loadExplorationProgress().log.slice(0, limit);
}

export function logQuestMapEvent(
  regionSlug: string,
  questKey: string,
  summary: string,
): void {
  const state = loadExplorationProgress();
  pushLog(state, {
    regionSlug,
    kind: "quest",
    summary,
    questKey,
  });
  saveExplorationProgress(state);
}

export type { DiscoveryKind };
