import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("site visuals", () => {
  it("page wallpapers referenced by PageWallpaper exist", () => {
    const wallpapers = [
      "hero",
      "play",
      "hatchery",
      "world",
      "live-world",
      "arena",
      "marketplace",
      "shop",
      "inventory",
      "guilds",
      "homestead",
      "creatures",
      "profile",
      "collection",
      "quests",
      "leaderboards",
      "pets",
      "battle",
    ];
    for (const slug of wallpapers) {
      const full = path.join(ROOT, "public/assets/ui/wallpapers", `${slug}.png`);
      expect(fs.existsSync(full), slug).toBe(true);
      expect(fs.statSync(full).size).toBeGreaterThan(20_000);
    }
  });

  it("Open Graph default image is wired and sized for sharing", () => {
    const full = path.join(ROOT, "public/assets/marketing/og-default.png");
    expect(fs.existsSync(full)).toBe(true);
    expect(fs.statSync(full).size).toBeGreaterThan(20_000);
    expect(fs.statSync(full).size).toBeLessThan(2_000_000);
    const layout = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");
    expect(layout).toContain("/assets/marketing/og-default.png");
    expect(layout).toContain("openGraph");
  });

  it("empty-state illustrations exist for pets/inventory/quests", () => {
    for (const name of ["pets.png", "inventory.png", "quests.png"]) {
      const full = path.join(ROOT, "public/assets/ui/empty-states", name);
      expect(fs.existsSync(full), name).toBe(true);
      expect(fs.statSync(full).size).toBeGreaterThan(10_000);
    }
  });

  it("brand mark exists for favicons", () => {
    const full = path.join(ROOT, "public/assets/brand/riftwilds-mark.png");
    expect(fs.existsSync(full)).toBe(true);
  });
});
