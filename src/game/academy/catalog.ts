import { BEGINNER_LESSONS } from "@/game/academy/lessons/beginner";
import { ADVANCED_LESSONS } from "@/game/academy/lessons/advanced";
import { CURRICULUM_LESSONS } from "@/game/academy/lessons/curricula";
import { LORE_PATH_LESSONS } from "@/game/academy/lessons/lore-path";
import type {
  AcademyCategory,
  AcademyLesson,
  AcademyPath,
} from "@/game/academy/types";

export const ALL_LESSONS: AcademyLesson[] = [
  ...BEGINNER_LESSONS,
  ...ADVANCED_LESSONS,
  ...CURRICULUM_LESSONS,
  ...LORE_PATH_LESSONS,
];

export const LESSON_BY_ID: Record<string, AcademyLesson> = Object.fromEntries(
  ALL_LESSONS.map((l) => [l.id, l]),
);

export const LESSON_BY_SLUG: Record<string, AcademyLesson> = Object.fromEntries(
  ALL_LESSONS.map((l) => [l.slug, l]),
);

export const BEGINNER_LESSON_IDS = BEGINNER_LESSONS.map((l) => l.id);

export const CATEGORY_LABELS: Record<AcademyCategory, string> = {
  "getting-started": "Getting Started",
  movement: "Movement",
  riftlings: "Riftlings",
  "pet-care": "Pet Care",
  combat: "Combat",
  economy: "Economy",
  world: "World",
  npcs: "NPCs",
  ui: "UI",
  controls: "Controls",
  social: "Social",
  crafting: "Crafting",
  exploration: "Exploration",
  "advanced-combat": "Advanced Combat",
  faq: "FAQ",
};

export const PATH_LABELS: Record<AcademyPath, string> = {
  beginner: "Beginner Path",
  advanced: "Advanced Path",
  curriculum: "Curricula",
};

export function getLesson(idOrSlug: string): AcademyLesson | undefined {
  return LESSON_BY_ID[idOrSlug] ?? LESSON_BY_SLUG[idOrSlug];
}

export function lessonsByPath(path: AcademyPath): AcademyLesson[] {
  return ALL_LESSONS.filter((l) => l.path === path).sort((a, b) => a.order - b.order);
}

export function lessonsByCategory(category: AcademyCategory): AcademyLesson[] {
  return ALL_LESSONS.filter((l) => l.category === category).sort(
    (a, b) => a.order - b.order,
  );
}

export function relatedLessons(lesson: AcademyLesson): AcademyLesson[] {
  return (lesson.relatedIds ?? [])
    .map((id) => LESSON_BY_ID[id])
    .filter((l): l is AcademyLesson => Boolean(l));
}

export function academyHref(lessonId?: string, opts?: { practice?: boolean }): string {
  const params = new URLSearchParams();
  if (lessonId) params.set("lesson", lessonId);
  if (opts?.practice) params.set("practice", "1");
  const q = params.toString();
  return q ? `/academy?${q}` : "/academy";
}
