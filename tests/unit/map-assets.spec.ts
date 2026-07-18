import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";

const ROOT = process.cwd();

describe("map / world visual assets", () => {
  it("each region has world card + overview masters", () => {
    const missing: string[] = [];
    for (const region of REGION_IDENTITIES) {
      const slug = region.slug;
      for (const file of ["card.png", "overview.png"]) {
        const full = path.join(ROOT, "public/assets/worlds", slug, file);
        if (!fs.existsSync(full) || fs.statSync(full).size < 10_000) {
          missing.push(`${slug}/${file}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("Live World map overview art exists", () => {
    const full = path.join(ROOT, "public/assets/maps/world-overview.png");
    expect(fs.existsSync(full)).toBe(true);
    expect(fs.statSync(full).size).toBeGreaterThan(20_000);
  });

  it("terrain tile masters + commons tileset exist for BootScene", () => {
    for (const name of [
      "terrain-grass.png",
      "terrain-path.png",
      "terrain-water.png",
      "terrain-lava.png",
    ]) {
      const full = path.join(ROOT, "public/assets/terrain", name);
      expect(fs.existsSync(full), name).toBe(true);
      expect(fs.statSync(full).size).toBeGreaterThan(5_000);
    }
    const tileset = path.join(ROOT, "public/assets/tilesets/commons-tileset.png");
    expect(fs.existsSync(tileset)).toBe(true);
  });

  it("premium game terrain pack has core plaza/path tiles", () => {
    const core = ["grass-lush.png", "plaza-stone.png", "path-master.png", "water-master.png"];
    for (const name of core) {
      const full = path.join(ROOT, "public/assets/game/terrain", name);
      expect(fs.existsSync(full), name).toBe(true);
    }
  });
});
