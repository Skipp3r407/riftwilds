/**
 * Local Academy progress (localStorage). Backend sync is a future phase.
 */

import type {
  AcademyProgressState,
  LessonProgress,
  LessonProgressStatus,
} from "@/game/academy/types";

export const ACADEMY_PROGRESS_KEY = "riftwilds-academy-progress-v1";
export const ACADEMY_RECENT_MAX = 12;

export function createEmptyProgress(): AcademyProgressState {
  return {
    version: 1,
    lessons: {},
    favorites: [],
    recent: [],
    achievements: [],
    rewardsClaimed: [],
    onboardingBannerDismissed: false,
  };
}

function emptyLesson(): LessonProgress {
  return {
    status: "unseen",
    interactiveComplete: false,
  };
}

export function loadAcademyProgress(): AcademyProgressState {
  if (typeof window === "undefined") return createEmptyProgress();
  try {
    const raw = localStorage.getItem(ACADEMY_PROGRESS_KEY);
    if (!raw) return createEmptyProgress();
    const parsed = JSON.parse(raw) as AcademyProgressState;
    if (parsed?.version !== 1 || typeof parsed.lessons !== "object") {
      return createEmptyProgress();
    }
    return {
      ...createEmptyProgress(),
      ...parsed,
      lessons: parsed.lessons ?? {},
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      rewardsClaimed: Array.isArray(parsed.rewardsClaimed) ? parsed.rewardsClaimed : [],
    };
  } catch {
    return createEmptyProgress();
  }
}

export function saveAcademyProgress(state: AcademyProgressState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota
  }
}

export function getLessonProgress(
  state: AcademyProgressState,
  lessonId: string,
): LessonProgress {
  return state.lessons[lessonId] ?? emptyLesson();
}

function bumpStatus(
  current: LessonProgressStatus,
  next: LessonProgressStatus,
): LessonProgressStatus {
  const rank: Record<LessonProgressStatus, number> = {
    unseen: 0,
    viewed: 1,
    interactive_done: 2,
    quiz_passed: 3,
    completed: 4,
  };
  return rank[next] > rank[current] ? next : current;
}

export function markLessonViewed(
  state: AcademyProgressState,
  lessonId: string,
): AcademyProgressState {
  const now = new Date().toISOString();
  const prev = getLessonProgress(state, lessonId);
  const lessons = {
    ...state.lessons,
    [lessonId]: {
      ...prev,
      status: bumpStatus(prev.status, "viewed"),
      viewedAt: prev.viewedAt ?? now,
      lastViewedAt: now,
    },
  };
  const recent = [lessonId, ...state.recent.filter((id) => id !== lessonId)].slice(
    0,
    ACADEMY_RECENT_MAX,
  );
  const next: AcademyProgressState = {
    ...state,
    lessons,
    recent,
    startedAt: state.startedAt ?? now,
  };
  saveAcademyProgress(next);
  return next;
}

export function markInteractiveDone(
  state: AcademyProgressState,
  lessonId: string,
): AcademyProgressState {
  const prev = getLessonProgress(state, lessonId);
  const lessons = {
    ...state.lessons,
    [lessonId]: {
      ...prev,
      interactiveComplete: true,
      status: bumpStatus(prev.status, "interactive_done"),
      lastViewedAt: new Date().toISOString(),
    },
  };
  const next = { ...state, lessons };
  saveAcademyProgress(next);
  return next;
}

export function markQuizResult(
  state: AcademyProgressState,
  lessonId: string,
  score: number,
  passed: boolean,
): AcademyProgressState {
  const prev = getLessonProgress(state, lessonId);
  const status = passed
    ? bumpStatus(prev.status, "quiz_passed")
    : prev.status;
  const lessons = {
    ...state.lessons,
    [lessonId]: {
      ...prev,
      quizScore: score,
      quizPassed: passed,
      status,
      lastViewedAt: new Date().toISOString(),
    },
  };
  const next = { ...state, lessons };
  saveAcademyProgress(next);
  return next;
}

export function markLessonCompleted(
  state: AcademyProgressState,
  lessonId: string,
): AcademyProgressState {
  const now = new Date().toISOString();
  const prev = getLessonProgress(state, lessonId);
  const entry: LessonProgress = {
    ...prev,
    status: "completed",
    completedAt: prev.completedAt ?? now,
    lastViewedAt: now,
    interactiveComplete: true,
  };
  const next: AcademyProgressState = {
    ...state,
    lessons: { ...state.lessons, [lessonId]: entry },
  };
  saveAcademyProgress(next);
  return next;
}

export function toggleFavorite(
  state: AcademyProgressState,
  lessonId: string,
): AcademyProgressState {
  const favorites = state.favorites.includes(lessonId)
    ? state.favorites.filter((id) => id !== lessonId)
    : [...state.favorites, lessonId];
  const next = { ...state, favorites };
  saveAcademyProgress(next);
  return next;
}

export function dismissOnboardingBanner(
  state: AcademyProgressState,
): AcademyProgressState {
  const next = { ...state, onboardingBannerDismissed: true };
  saveAcademyProgress(next);
  return next;
}

export function unlockAchievement(
  state: AcademyProgressState,
  achievementId: string,
): AcademyProgressState {
  if (state.achievements.includes(achievementId)) return state;
  const next = {
    ...state,
    achievements: [...state.achievements, achievementId],
  };
  saveAcademyProgress(next);
  return next;
}

export function claimReward(
  state: AcademyProgressState,
  rewardId: string,
): AcademyProgressState {
  if (state.rewardsClaimed.includes(rewardId)) return state;
  const next = {
    ...state,
    rewardsClaimed: [...state.rewardsClaimed, rewardId],
  };
  saveAcademyProgress(next);
  return next;
}

export function computePathPercent(
  state: AcademyProgressState,
  lessonIds: string[],
): number {
  if (lessonIds.length === 0) return 0;
  const done = lessonIds.filter((id) => {
    const s = getLessonProgress(state, id).status;
    return s === "completed" || s === "quiz_passed";
  }).length;
  return Math.round((done / lessonIds.length) * 100);
}

export function hasStartedAcademy(state: AcademyProgressState): boolean {
  return Boolean(state.startedAt) || Object.keys(state.lessons).length > 0;
}
