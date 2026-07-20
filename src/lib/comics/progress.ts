/**
 * Comic reading progress — localStorage, same pattern as Academy.
 * Credits/cosmetic unlocks only; never SOL.
 */

import type {
  ComicProgressIssue,
  ComicProgressState,
  CoverVariantKind,
} from "@/content/comics/types";

export const COMIC_PROGRESS_KEY = "riftwilds-comics-progress-v1";

export function createEmptyComicProgress(): ComicProgressState {
  return {
    version: 1,
    issues: {},
    favorites: [],
    achievements: [],
    unlockedCodex: [],
    unlockedRewards: [],
    unlockedCards: [],
    settings: {
      darkMode: true,
      highContrast: false,
      musicEnabled: false,
      sfxEnabled: true,
      narrationEnabled: false,
      guidedReading: false,
      zoom: 1,
    },
  };
}

export function createEmptyIssueProgress(): ComicProgressIssue {
  return {
    currentPage: 1,
    maxPageReached: 1,
    completed: false,
    bookmarkedPage: null,
    favorite: false,
    foundHotspots: [],
    unlockedSecrets: [],
    unlockedRewards: [],
    collectedCovers: ["standard"],
  };
}

export function loadComicProgress(): ComicProgressState {
  if (typeof window === "undefined") return createEmptyComicProgress();
  try {
    const raw = localStorage.getItem(COMIC_PROGRESS_KEY);
    if (!raw) return createEmptyComicProgress();
    const parsed = JSON.parse(raw) as ComicProgressState;
    if (parsed?.version !== 1 || typeof parsed.issues !== "object") {
      return createEmptyComicProgress();
    }
    const empty = createEmptyComicProgress();
    return {
      ...empty,
      ...parsed,
      issues: parsed.issues ?? {},
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      unlockedCodex: Array.isArray(parsed.unlockedCodex) ? parsed.unlockedCodex : [],
      unlockedRewards: Array.isArray(parsed.unlockedRewards)
        ? parsed.unlockedRewards
        : [],
      unlockedCards: Array.isArray(parsed.unlockedCards) ? parsed.unlockedCards : [],
      settings: {
        ...empty.settings,
        ...parsed.settings,
      },
    };
  } catch {
    return createEmptyComicProgress();
  }
}

export function saveComicProgress(state: ComicProgressState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMIC_PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota
  }
}

export function getIssueProgress(
  state: ComicProgressState,
  slug: string,
): ComicProgressIssue {
  return state.issues[slug] ?? createEmptyIssueProgress();
}

function withIssue(
  state: ComicProgressState,
  slug: string,
  next: ComicProgressIssue,
): ComicProgressState {
  const out: ComicProgressState = {
    ...state,
    issues: { ...state.issues, [slug]: next },
  };
  saveComicProgress(out);
  return out;
}

export function setCurrentPage(
  state: ComicProgressState,
  slug: string,
  page: number,
  totalPages: number,
): ComicProgressState {
  const prev = getIssueProgress(state, slug);
  const clamped = Math.max(1, Math.min(totalPages, page));
  const maxPageReached = Math.max(prev.maxPageReached, clamped);
  const completed = maxPageReached >= totalPages || prev.completed;
  const now = new Date().toISOString();
  return withIssue(state, slug, {
    ...prev,
    currentPage: clamped,
    maxPageReached,
    completed,
    lastReadAt: now,
    completedAt: completed ? (prev.completedAt ?? now) : prev.completedAt,
  });
}

export function setBookmark(
  state: ComicProgressState,
  slug: string,
  page: number | null,
): ComicProgressState {
  const prev = getIssueProgress(state, slug);
  return withIssue(state, slug, { ...prev, bookmarkedPage: page });
}

export function toggleFavoriteIssue(
  state: ComicProgressState,
  slug: string,
): ComicProgressState {
  const prev = getIssueProgress(state, slug);
  const favorite = !prev.favorite;
  const favorites = favorite
    ? [...new Set([...state.favorites, slug])]
    : state.favorites.filter((s) => s !== slug);
  const next: ComicProgressState = {
    ...state,
    favorites,
    issues: {
      ...state.issues,
      [slug]: { ...prev, favorite },
    },
  };
  saveComicProgress(next);
  return next;
}

export function markHotspotFound(
  state: ComicProgressState,
  slug: string,
  hotspotId: string,
  codexEntryId?: string,
  secretCode?: string,
  rewardId?: string,
  cardId?: string,
): ComicProgressState {
  const prev = getIssueProgress(state, slug);
  if (prev.foundHotspots.includes(hotspotId)) return state;
  const foundHotspots = [...prev.foundHotspots, hotspotId];
  const unlockedSecrets = secretCode
    ? [...new Set([...prev.unlockedSecrets, secretCode])]
    : prev.unlockedSecrets;
  const unlockedRewards = rewardId
    ? [...new Set([...prev.unlockedRewards, rewardId])]
    : prev.unlockedRewards;
  const unlockedCodex = codexEntryId
    ? [...new Set([...state.unlockedCodex, codexEntryId])]
    : state.unlockedCodex;
  const unlockedCards = cardId
    ? [...new Set([...(state.unlockedCards ?? []), cardId])]
    : (state.unlockedCards ?? []);
  const globalRewards = rewardId
    ? [...new Set([...state.unlockedRewards, rewardId])]
    : state.unlockedRewards;
  const next: ComicProgressState = {
    ...state,
    unlockedCodex,
    unlockedCards,
    unlockedRewards: globalRewards,
    issues: {
      ...state.issues,
      [slug]: { ...prev, foundHotspots, unlockedSecrets, unlockedRewards },
    },
  };
  saveComicProgress(next);
  return next;
}

export function collectCover(
  state: ComicProgressState,
  slug: string,
  kind: CoverVariantKind,
): ComicProgressState {
  const prev = getIssueProgress(state, slug);
  if (prev.collectedCovers.includes(kind)) return state;
  return withIssue(state, slug, {
    ...prev,
    collectedCovers: [...prev.collectedCovers, kind],
  });
}

export function castCommunityVote(
  state: ComicProgressState,
  slug: string,
  voteChoiceId: string,
): ComicProgressState {
  const prev = getIssueProgress(state, slug);
  return withIssue(state, slug, { ...prev, voteChoiceId });
}

export function unlockComicAchievement(
  state: ComicProgressState,
  achievementId: string,
): ComicProgressState {
  if (state.achievements.includes(achievementId)) return state;
  const next = {
    ...state,
    achievements: [...state.achievements, achievementId],
  };
  saveComicProgress(next);
  return next;
}

export function updateComicSettings(
  state: ComicProgressState,
  patch: Partial<ComicProgressState["settings"]>,
): ComicProgressState {
  const next = {
    ...state,
    settings: { ...state.settings, ...patch },
  };
  saveComicProgress(next);
  return next;
}

export function readingPercent(issue: ComicProgressIssue, totalPages: number): number {
  if (totalPages <= 0) return 0;
  if (issue.completed) return 100;
  return Math.round((issue.maxPageReached / totalPages) * 100);
}

export function continuePage(issue: ComicProgressIssue): number {
  if (issue.bookmarkedPage != null) return issue.bookmarkedPage;
  return issue.currentPage;
}
