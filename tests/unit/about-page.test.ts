import { describe, expect, it } from "vitest";
import {
  ABOUT_META,
  ABOUT_SLOGAN,
  aboutAssetManifest,
  aboutChapters,
  characterProfiles,
  infoBlocks,
  loreTimeline,
  narrationScript,
} from "@/content/about/riftwilds-origin";

describe("about origin content", () => {
  it("includes seven cinematic chapters with required headings", () => {
    expect(aboutChapters).toHaveLength(7);
    const headings = aboutChapters.map((c) => c.heading);
    expect(headings).toEqual([
      "WHEN THE WORLD WAS WHOLE",
      "THE WORLD WAS ALIVE",
      "THE DAY REALITY BROKE",
      "BORN TO REMEMBER",
      "A MEMORY NEEDS A FUTURE",
      "A HOME BETWEEN WORLDS",
      "THE RIFTS ARE OPENING AGAIN",
    ]);
  });

  it("features the official slogan and SEO copy", () => {
    expect(ABOUT_SLOGAN).toContain("Riftlings preserve pieces of the world");
    expect(ABOUT_META.title).toContain("The Story of Riftwilds");
    expect(ABOUT_META.heroTitle).toBe("THE STORY OF THE RIFTWILDS");
  });

  it("includes narration, timeline, characters, and info blocks", () => {
    expect(narrationScript.length).toBeGreaterThan(10);
    expect(loreTimeline.length).toBe(9);
    expect(characterProfiles.map((c) => c.name)).toEqual([
      "Elara Venn",
      "The First Riftling",
    ]);
    expect(infoBlocks.some((b) => b.title === "What Are Riftlings?")).toBe(true);
    expect(infoBlocks.some((b) => b.title === "What Is a Riftkeeper?")).toBe(true);
    expect(infoBlocks.some((b) => b.title === "What Is the Live World?")).toBe(true);
  });

  it("documents generated cinematic assets", () => {
    expect(aboutAssetManifest.generated).toContain("about-hero-rift.png");
    expect(aboutAssetManifest.generated.length).toBeGreaterThanOrEqual(7);
  });
});
