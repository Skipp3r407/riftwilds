import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { WALLPAPERS, resolveWallpaperForPath } from "@/components/shared/page-wallpaper";

const ROOT = process.cwd();

describe("economy page wallpapers", () => {
  it("care + economy section backgrounds exist", () => {
    for (const rel of [
      "public/assets/ui/wallpapers/care.png",
      "public/assets/ui/wallpapers/economy.png",
      "public/assets/treasury/hero.png",
      "public/assets/economy/section-treasury-bg.png",
      "public/assets/economy/section-care-bg.png",
      "public/assets/economy/purchase-flow-banner.png",
    ]) {
      const full = path.join(ROOT, rel);
      expect(fs.existsSync(full), rel).toBe(true);
      expect(fs.statSync(full).size).toBeGreaterThan(20_000);
    }
  });

  it("routes resolve stronger cinematic wallpapers", () => {
    expect(resolveWallpaperForPath("/economy")).toMatchObject({ name: "economy" });
    expect(resolveWallpaperForPath("/treasury")).toMatchObject({ name: "treasury" });
    expect(resolveWallpaperForPath("/rewards")).toMatchObject({ name: "rewards" });
    expect(resolveWallpaperForPath("/token")).toMatchObject({ name: "token" });
    expect(resolveWallpaperForPath("/transparency")).toMatchObject({ name: "transparency" });
    expect(resolveWallpaperForPath("/fairness")).toMatchObject({ name: "fairness" });
    expect(WALLPAPERS.care).toBe("/assets/ui/wallpapers/care.png");
    expect(WALLPAPERS.economy).toBe("/assets/ui/wallpapers/economy.png");
    expect(WALLPAPERS.treasury).toBe("/assets/treasury/hero.png");
  });
});
