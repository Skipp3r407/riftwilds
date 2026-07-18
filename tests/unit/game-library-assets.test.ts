import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { GAME_LIBRARY, libraryBootCritical } from "@/content/assets/game-library";

const ROOT = process.cwd();

function publicFile(publicPath: string): string {
  return path.join(ROOT, "public", publicPath.replace(/^\//, ""));
}

describe("game asset library (≥1000)", () => {
  it("catalog reports at least 1000 entries", () => {
    expect(GAME_LIBRARY.count).toBeGreaterThanOrEqual(1000);
    expect(GAME_LIBRARY.entries.length).toBe(GAME_LIBRARY.count);
    expect(GAME_LIBRARY.entries.length).toBeGreaterThanOrEqual(1000);
  });

  it("covers required category families", () => {
    const cats = new Set(GAME_LIBRARY.entries.map((e) => e.category));
    for (const need of [
      "trees",
      "bushes",
      "flowers",
      "rocks",
      "roads",
      "water",
      "stalls",
      "animals",
      "riftlings",
      "npcs",
      "items",
      "eggs",
      "equipment",
      "effects-weather",
    ]) {
      expect(cats.has(need), need).toBe(true);
    }
  });

  it("every catalog path exists with real bytes", () => {
    const missing: string[] = [];
    for (const e of GAME_LIBRARY.entries) {
      const abs = publicFile(e.path);
      if (!fs.existsSync(abs) || fs.statSync(abs).size < 80) {
        missing.push(e.id);
      }
    }
    expect(missing.slice(0, 10), `missing sample: ${missing.slice(0, 10).join(", ")}`).toEqual(
      [],
    );
    expect(missing.length).toBe(0);
  });

  it("boot-critical entries exist and install map is non-empty", () => {
    const boot = libraryBootCritical();
    expect(boot.length).toBeGreaterThanOrEqual(5);
    for (const e of boot) {
      expect(fs.existsSync(publicFile(e.path))).toBe(true);
    }
  });

  it("entries have layer + anchors", () => {
    const sample = GAME_LIBRARY.entries[0]!;
    expect(sample.layer).toBeTruthy();
    expect(sample.anchors.x).toBeGreaterThan(0);
    expect(sample.anchors.y).toBeGreaterThan(0);
    expect(sample.tags.length).toBeGreaterThan(0);
  });
});
