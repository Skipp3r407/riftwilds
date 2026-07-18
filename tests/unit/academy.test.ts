import { describe, expect, it, beforeEach } from "vitest";
import {
  ALL_LESSONS,
  BEGINNER_LESSON_IDS,
  ACADEMY_FAQ,
  ACADEMY_ACHIEVEMENTS,
  academyHref,
  computePathPercent,
  createEmptyProgress,
  evaluateAchievements,
  getLesson,
  markLessonCompleted,
  markLessonViewed,
  markQuizResult,
  searchAcademy,
  toggleFavorite,
} from "@/game/academy";

describe("Player Academy catalog", () => {
  it("loads beginner lessons 1–30 with unique ids", () => {
    expect(BEGINNER_LESSON_IDS).toHaveLength(30);
    const beginner = ALL_LESSONS.filter((l) => l.path === "beginner");
    expect(beginner).toHaveLength(30);
    const ids = new Set(ALL_LESSONS.map((l) => l.id));
    expect(ids.size).toBe(ALL_LESSONS.length);
  });

  it("includes advanced mastery tracks and curricula", () => {
    const advanced = ALL_LESSONS.filter((l) => l.path === "advanced");
    const curricula = ALL_LESSONS.filter((l) => l.path === "curriculum");
    expect(advanced.length).toBeGreaterThanOrEqual(14);
    expect(curricula.map((l) => l.id)).toEqual(
      expect.arrayContaining([
        "cur-riftling",
        "cur-pet-care",
        "cur-combat",
        "cur-economy",
        "cur-world-map",
        "cur-npc",
        "cur-ui",
        "cur-controls",
      ]),
    );
  });

  it("resolves lessons by id and slug", () => {
    const byId = getLesson("b05-credits-sol");
    const bySlug = getLesson("credits-vs-sol");
    expect(byId?.title).toMatch(/Credits vs SOL/i);
    expect(bySlug?.id).toBe("b05-credits-sol");
  });

  it("builds academy hrefs", () => {
    expect(academyHref()).toBe("/academy");
    expect(academyHref("b01-welcome")).toBe("/academy?lesson=b01-welcome");
    expect(academyHref("cur-combat", { practice: true })).toBe(
      "/academy?lesson=cur-combat&practice=1",
    );
  });

  it("teaches that SOL is never required for basics", () => {
    const lesson = getLesson("b05-credits-sol");
    expect(lesson?.body.join(" ").toLowerCase()).toContain("never required");
    const faq = ACADEMY_FAQ.find((f) => f.id === "faq-sol-required");
    expect(faq?.answer.toLowerCase()).toContain("never required");
  });
});

describe("Academy progress", () => {
  beforeEach(() => {
    // jsdom / node — progress helpers no-op save when window missing except vitest has window
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("riftwilds-academy-progress-v1");
    }
  });

  it("tracks viewed, quiz, completed, and favorites", () => {
    let state = createEmptyProgress();
    state = markLessonViewed(state, "b01-welcome");
    expect(state.lessons["b01-welcome"]?.status).toBe("viewed");
    expect(state.recent[0]).toBe("b01-welcome");

    state = markQuizResult(state, "b05-credits-sol", 100, true);
    expect(state.lessons["b05-credits-sol"]?.quizPassed).toBe(true);

    state = markLessonCompleted(state, "b01-welcome");
    expect(state.lessons["b01-welcome"]?.status).toBe("completed");

    state = toggleFavorite(state, "b02-controls");
    expect(state.favorites).toContain("b02-controls");
    state = toggleFavorite(state, "b02-controls");
    expect(state.favorites).not.toContain("b02-controls");
  });

  it("computes beginner path percent", () => {
    let state = createEmptyProgress();
    expect(computePathPercent(state, BEGINNER_LESSON_IDS)).toBe(0);
    for (const id of BEGINNER_LESSON_IDS.slice(0, 15)) {
      state = markLessonCompleted(state, id);
    }
    expect(computePathPercent(state, BEGINNER_LESSON_IDS)).toBe(50);
  });
});

describe("Academy search", () => {
  it("finds lessons, FAQ, and controls", () => {
    const sol = searchAcademy("SOL required");
    expect(sol.some((h) => h.kind === "faq" || h.id.includes("credits"))).toBe(true);

    const wasd = searchAcademy("WASD");
    expect(wasd.some((h) => h.title.toLowerCase().includes("wasd") || h.kind === "control")).toBe(
      true,
    );

    const solen = searchAcademy("archivist-solen");
    expect(solen.some((h) => h.kind === "npc" || h.snippet.includes("Solen") || h.href.includes("npc"))).toBe(
      true,
    );
  });

  it("returns empty for blank query", () => {
    expect(searchAcademy("   ")).toEqual([]);
  });
});

describe("Academy achievements", () => {
  it("defines Tutorial Graduate and Combat Scholar", () => {
    expect(ACADEMY_ACHIEVEMENTS.map((a) => a.id)).toEqual(
      expect.arrayContaining(["tutorial-graduate", "combat-scholar", "economy-aware"]),
    );
  });

  it("unlocks economy-aware after credits lesson complete", () => {
    let state = createEmptyProgress();
    state = markLessonCompleted(state, "b05-credits-sol");
    const unlocked = evaluateAchievements(state);
    expect(unlocked).toContain("economy-aware");
  });
});
