import { describe, expect, it } from "vitest";
import { getComicIssue } from "@/content/comics";
import {
  collectPageNarrationLines,
  comicPageNarrationUrl,
  joinNarrationScript,
  pageHasNarration,
  pageNarrationScript,
} from "@/lib/comics/narration";
import { createEmptyComicProgress } from "@/lib/comics/progress";
import type { ComicPage } from "@/content/comics/types";

describe("comic narration helpers", () => {
  it("builds speakable script from narration and dialogue (skips sfx)", () => {
    const page: ComicPage = {
      id: "t",
      pageNumber: 1,
      layout: "wide",
      title: "Dawn",
      panels: [
        {
          id: "p1",
          caption: "On the road",
          bubbles: [
            { kind: "narration", text: "The Fracture layered." },
            { kind: "speech", speaker: "Elara", text: "We keep what we can." },
            { kind: "sfx", text: "CRACK!" },
          ],
        },
      ],
    };
    const lines = collectPageNarrationLines(page);
    expect(lines.some((l) => l.kind === "sfx")).toBe(false);
    expect(lines.some((l) => l.text.includes("CRACK"))).toBe(false);
    const script = joinNarrationScript(lines);
    expect(script).toContain("Dawn");
    expect(script).toContain("Elara says");
    expect(script).toContain("The Fracture layered");
    expect(pageHasNarration(page)).toBe(true);
  });

  it("resolves public URLs for issue pages", () => {
    expect(comicPageNarrationUrl("the-first-rift", 3)).toBe(
      "/assets/audio/comics/the-first-rift/page-03.mp3",
    );
  });

  it("extracts real Issue #1 page scripts from catalog", () => {
    const issue = getComicIssue("the-first-rift");
    expect(issue).toBeTruthy();
    const withText = issue!.pages.filter((p) => pageHasNarration(p));
    expect(withText.length).toBeGreaterThan(5);
    const first = pageNarrationScript(withText[0]!);
    expect(first.length).toBeGreaterThan(10);
    expect(first.toLowerCase()).not.toMatch(/pokemon|pikachu|marvel/);
  });

  it("defaults narrationEnabled off for graceful silent fallback", () => {
    const state = createEmptyComicProgress();
    expect(state.settings.narrationEnabled).toBe(false);
    expect(state.settings.sfxEnabled).toBe(true);
  });
});
