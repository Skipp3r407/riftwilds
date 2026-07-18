import { describe, expect, it, beforeEach } from "vitest";
import {
  COMIC_ISSUES,
  COMIC_SERIES,
  getComicIssue,
  listPublishedComics,
} from "@/content/comics";
import {
  clampPage,
  continuePage,
  createEmptyComicProgress,
  markHotspotFound,
  nextPage,
  pageFromKeyboard,
  prevPage,
  readingPercent,
  setCurrentPage,
  toggleFavoriteIssue,
} from "@/lib/comics";

describe("Legends of the Rift catalog", () => {
  it("ships ten published issues with unique slugs", () => {
    expect(COMIC_SERIES.issueCount).toBe(10);
    const published = listPublishedComics();
    expect(published).toHaveLength(10);
    const slugs = new Set(published.map((i) => i.slug));
    expect(slugs.size).toBe(10);
    expect(published.map((i) => i.issueNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("gives each issue substantial page content", () => {
    for (const issue of COMIC_ISSUES) {
      expect(issue.pages.length).toBeGreaterThanOrEqual(20);
      expect(issue.pages.length).toBeLessThanOrEqual(40);
      expect(issue.covers.some((c) => c.kind === "standard")).toBe(true);
      expect(issue.pages.every((p, idx) => p.pageNumber === idx + 1)).toBe(true);
    }
  });

  it("resolves issues and wires circus live event on #3", () => {
    expect(getComicIssue("the-first-rift")?.title).toBe("The First Rift");
    const circus = getComicIssue("the-traveling-circus");
    expect(circus?.worldEventKey).toBe("traveling_circus");
    expect(circus?.playChapterHref).toBe("/live-world");
  });
});

describe("Comic reader navigation", () => {
  it("clamps and steps pages", () => {
    expect(clampPage(0, 24)).toBe(1);
    expect(clampPage(99, 24)).toBe(24);
    expect(nextPage(1, 24)).toBe(2);
    expect(prevPage(1, 24)).toBe(1);
    expect(pageFromKeyboard("ArrowRight", 5, 24)).toBe(6);
    expect(pageFromKeyboard("ArrowLeft", 5, 24)).toBe(4);
    expect(pageFromKeyboard("Home", 5, 24)).toBe(1);
    expect(pageFromKeyboard("End", 5, 24)).toBe(24);
  });
});

describe("Comic progress", () => {
  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("riftwilds-comics-progress-v1");
    }
  });

  it("tracks pages, favorites, hotspots, and percent", () => {
    let state = createEmptyComicProgress();
    state = setCurrentPage(state, "the-first-rift", 5, 24);
    expect(state.issues["the-first-rift"]?.currentPage).toBe(5);
    expect(readingPercent(state.issues["the-first-rift"]!, 24)).toBeGreaterThan(0);

    state = toggleFavoriteIssue(state, "the-first-rift");
    expect(state.favorites).toContain("the-first-rift");

    state = markHotspotFound(
      state,
      "the-first-rift",
      "hs-test",
      "wl-fracture",
      "FIRST-LIGHT-01",
    );
    expect(state.unlockedCodex).toContain("wl-fracture");
    expect(state.issues["the-first-rift"]?.unlockedSecrets).toContain("FIRST-LIGHT-01");
    expect(continuePage(state.issues["the-first-rift"]!)).toBe(5);
  });
});
