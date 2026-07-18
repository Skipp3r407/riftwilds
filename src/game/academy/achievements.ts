import type { AcademyAchievementDef, AcademyProgressState } from "@/game/academy/types";
import { getLessonProgress } from "@/game/academy/progress";
import { BEGINNER_LESSON_IDS, lessonsByCategory, lessonsByPath } from "@/game/academy/catalog";

export const ACADEMY_ACHIEVEMENTS: AcademyAchievementDef[] = [
  {
    id: "tutorial-graduate",
    label: "Tutorial Graduate",
    description: "Complete the Beginner Path (lessons 1–30).",
    requirePathComplete: "beginner",
  },
  {
    id: "combat-scholar",
    label: "Combat Scholar",
    description: "Complete Combat Academy curriculum and Combat Mastery.",
    requireLessonIds: ["cur-combat", "adv-combat"],
  },
  {
    id: "economy-aware",
    label: "Economy Aware",
    description: "Pass the Credits vs SOL lesson quiz.",
    requireLessonIds: ["b05-credits-sol"],
  },
  {
    id: "care-student",
    label: "Care Student",
    description: "Finish Pet Care Academy.",
    requireLessonIds: ["cur-pet-care"],
  },
  {
    id: "cartographer",
    label: "Cartographer",
    description: "Complete World Map Academy and Exploration Mastery.",
    requireLessonIds: ["cur-world-map", "adv-exploration"],
  },
  {
    id: "social-ready",
    label: "Social Ready",
    description: "Complete Guilds Intro and Chat & Emotes.",
    requireLessonIds: ["b20-chat", "b21-guilds"],
  },
  {
    id: "quiz-whiz",
    label: "Quiz Whiz",
    description: "Pass at least 5 Academy quizzes.",
    requireQuizCount: 5,
  },
  {
    id: "category-combat",
    label: "Yard Veteran",
    description: "Complete all beginner combat category lessons.",
    requireCategoryComplete: "combat",
  },
];

function isLessonDone(state: AcademyProgressState, id: string): boolean {
  const s = getLessonProgress(state, id).status;
  return s === "completed" || s === "quiz_passed";
}

export function evaluateAchievements(state: AcademyProgressState): string[] {
  const unlocked = new Set(state.achievements);

  for (const def of ACADEMY_ACHIEVEMENTS) {
    if (unlocked.has(def.id)) continue;

    let ok = true;
    if (def.requireLessonIds) {
      ok = def.requireLessonIds.every((id) => isLessonDone(state, id));
    }
    if (ok && def.requirePathComplete) {
      const ids =
        def.requirePathComplete === "beginner"
          ? BEGINNER_LESSON_IDS
          : lessonsByPath(def.requirePathComplete).map((l) => l.id);
      ok = ids.every((id) => isLessonDone(state, id));
    }
    if (ok && def.requireCategoryComplete) {
      const ids = lessonsByCategory(def.requireCategoryComplete)
        .filter((l) => l.difficulty === "beginner")
        .map((l) => l.id);
      ok = ids.length > 0 && ids.every((id) => isLessonDone(state, id));
    }
    if (ok && def.requireQuizCount) {
      const passed = Object.values(state.lessons).filter((p) => p.quizPassed).length;
      ok = passed >= def.requireQuizCount;
    }
    if (ok) unlocked.add(def.id);
  }

  return [...unlocked];
}
