/** Player Academy / interactive tutorial system types. */

export type AcademyPath = "beginner" | "advanced" | "curriculum";

export type AcademyCategory =
  | "getting-started"
  | "movement"
  | "riftlings"
  | "pet-care"
  | "combat"
  | "economy"
  | "world"
  | "npcs"
  | "ui"
  | "controls"
  | "social"
  | "crafting"
  | "exploration"
  | "advanced-combat"
  | "faq";

export type InteractiveKind =
  | "wasd-gate"
  | "click-target"
  | "map-waypoint"
  | "npc-click"
  | "menu-navigate"
  | "drag-drop"
  | "quiz"
  | "practice-stub"
  | "checklist";

export type LessonDifficulty = "beginner" | "advanced";

export type AcademyMedia = {
  type: "image" | "video" | "illustration";
  src: string;
  alt: string;
  caption?: string;
  /** Lazy-load by default; set true only for above-the-fold hero art */
  priority?: boolean;
};

export type AcademyQuizQuestion = {
  id: string;
  prompt: string;
  choices: { id: string; label: string; correct: boolean }[];
  explainCorrect: string;
};

export type InteractiveStep = {
  id: string;
  kind: InteractiveKind;
  instruction: string;
  /** Optional target id for click/map/npc stubs */
  targetId?: string;
  /** Keys required for wasd-gate (subset of w/a/s/d) */
  requiredKeys?: ("w" | "a" | "s" | "d")[];
  /** Practice stub route when Live World can't drive the web page */
  practiceHref?: string;
  checklist?: string[];
};

export type AcademyReward = {
  id: string;
  label: string;
  /** Cosmetic / one-time only — never large repeatable currency */
  kind: "badge" | "title" | "cosmetic" | "token-credits";
  amount?: number;
};

export type AcademyLesson = {
  id: string;
  slug: string;
  path: AcademyPath;
  category: AcademyCategory;
  difficulty: LessonDifficulty;
  order: number;
  title: string;
  summary: string;
  /** Estimated minutes */
  etaMinutes: number;
  keywords: string[];
  npcMentions?: string[];
  regionMentions?: string[];
  itemMentions?: string[];
  abilityMentions?: string[];
  controlMentions?: string[];
  body: string[];
  tips?: string[];
  shortcuts?: string[];
  media?: AcademyMedia[];
  interactive?: InteractiveStep[];
  quiz?: AcademyQuizQuestion[];
  relatedIds?: string[];
  rewards?: AcademyReward[];
  /** Optional embed (YouTube/Vimeo/self-hosted) — autoplay off by default */
  videoEmbed?: {
    src: string;
    title: string;
    captionsUrl?: string;
  };
};

export type LessonProgressStatus =
  | "unseen"
  | "viewed"
  | "interactive_done"
  | "quiz_passed"
  | "completed";

export type LessonProgress = {
  status: LessonProgressStatus;
  viewedAt?: string;
  completedAt?: string;
  interactiveComplete: boolean;
  quizScore?: number;
  quizPassed?: boolean;
  lastViewedAt?: string;
};

export type AcademyProgressState = {
  version: 1;
  lessons: Record<string, LessonProgress>;
  favorites: string[];
  recent: string[];
  achievements: string[];
  rewardsClaimed: string[];
  onboardingBannerDismissed: boolean;
  /** First-time academy visit */
  startedAt?: string;
  graduatedAt?: string;
};

export type AcademyAchievementDef = {
  id: string;
  label: string;
  description: string;
  /** Lesson ids or path completion rules */
  requireLessonIds?: string[];
  requirePathComplete?: AcademyPath;
  requireCategoryComplete?: AcademyCategory;
  requireQuizCount?: number;
};

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  relatedLessonIds?: string[];
  category: AcademyCategory | "general";
};

export type AcademySearchHit = {
  kind: "lesson" | "faq" | "npc" | "region" | "item" | "ability" | "control";
  id: string;
  title: string;
  snippet: string;
  href: string;
  score: number;
};
