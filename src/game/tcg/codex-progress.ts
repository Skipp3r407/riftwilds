/**
 * Rift Codex discovery / reward tracking — local persistence.
 * Cosmetic & lore only (no P2W). Server/DB tables are proposed separately.
 */

const STORAGE_KEY = "riftwilds.codex.v1";

export type CodexDiscoveryRecord = {
  familyId: string;
  firstSeenAt: number;
  lastOpenedAt: number;
  cinematicShown: boolean;
  rewardClaimed: boolean;
};

export type CodexLocalState = {
  version: 1;
  discoveries: Record<string, CodexDiscoveryRecord>;
  museumVisits: number;
  lastMuseumAt: number | null;
  claimedTitles: string[];
  /** TOC category last opened */
  lastSection: CodexSectionId;
};

export type CodexSectionId =
  | "toc"
  | "families"
  | "stats"
  | "map"
  | "museum"
  | "binder";

const DEFAULT_STATE: CodexLocalState = {
  version: 1,
  discoveries: {},
  museumVisits: 0,
  lastMuseumAt: null,
  claimedTitles: [],
  lastSection: "toc",
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadCodexLocalState(): CodexLocalState {
  if (!canUseStorage()) return { ...DEFAULT_STATE, discoveries: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE, discoveries: {} };
    const parsed = JSON.parse(raw) as Partial<CodexLocalState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      version: 1,
      discoveries: parsed.discoveries ?? {},
      claimedTitles: parsed.claimedTitles ?? [],
      lastSection: parsed.lastSection ?? "toc",
    };
  } catch {
    return { ...DEFAULT_STATE, discoveries: {} };
  }
}

export function saveCodexLocalState(state: CodexLocalState): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function markFamilyOpened(
  familyId: string,
  opts?: { cinematic?: boolean },
): CodexLocalState {
  const state = loadCodexLocalState();
  const now = Date.now();
  const prev = state.discoveries[familyId];
  state.discoveries[familyId] = {
    familyId,
    firstSeenAt: prev?.firstSeenAt ?? now,
    lastOpenedAt: now,
    cinematicShown: prev?.cinematicShown || Boolean(opts?.cinematic),
    rewardClaimed: prev?.rewardClaimed ?? false,
  };
  state.lastSection = "families";
  saveCodexLocalState(state);
  return state;
}

export function claimFamilyReward(
  familyId: string,
  titleId: string,
): CodexLocalState {
  const state = loadCodexLocalState();
  const rec = state.discoveries[familyId] ?? {
    familyId,
    firstSeenAt: Date.now(),
    lastOpenedAt: Date.now(),
    cinematicShown: false,
    rewardClaimed: false,
  };
  rec.rewardClaimed = true;
  state.discoveries[familyId] = rec;
  if (!state.claimedTitles.includes(titleId)) {
    state.claimedTitles.push(titleId);
  }
  saveCodexLocalState(state);
  return state;
}

export function recordMuseumVisit(): CodexLocalState {
  const state = loadCodexLocalState();
  state.museumVisits += 1;
  state.lastMuseumAt = Date.now();
  state.lastSection = "museum";
  saveCodexLocalState(state);
  return state;
}

export function setCodexSection(section: CodexSectionId): CodexLocalState {
  const state = loadCodexLocalState();
  state.lastSection = section;
  saveCodexLocalState(state);
  return state;
}

export function shouldPlayDiscoveryCinematic(familyId: string): boolean {
  const state = loadCodexLocalState();
  const rec = state.discoveries[familyId];
  return !rec?.cinematicShown;
}
