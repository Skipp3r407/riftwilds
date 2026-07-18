import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "docs/assets/IMAGE_ASSET_MANIFEST.json");

function existsMin(rel: string, minBytes: number): boolean {
  const full = path.join(ROOT, rel.replace(/^\//, "").replace(/^public\//, "public/"));
  const resolved = rel.startsWith("public/")
    ? path.join(ROOT, rel)
    : path.join(ROOT, "public", rel.replace(/^\//, ""));
  if (!fs.existsSync(resolved)) return false;
  return fs.statSync(resolved).size >= minBytes;
}

describe("image assets (site + game)", () => {
  it("IMAGE_ASSET_MANIFEST.json exists with required sections", () => {
    expect(fs.existsSync(MANIFEST)).toBe(true);
    const man = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    expect(man.generatedAt).toBeTruthy();
    expect(man.totals).toBeTruthy();
    expect(Array.isArray(man.assets)).toBe(true);
    expect(man.assets.length).toBeGreaterThan(50);
  });

  it("critical site surfaces exist with real bytes", () => {
    const critical = [
      ["public/assets/marketing/og-default.png", 20_000],
      ["public/assets/brand/riftwilds-mark.png", 2_000],
      ["public/assets/ui/wallpapers/hero.png", 20_000],
      ["public/assets/ui/wallpapers/live-world.png", 20_000],
      ["public/assets/ui/empty-states/pets.png", 10_000],
      ["public/assets/ui/empty-states/inventory.png", 10_000],
      ["public/assets/maps/world-overview.png", 20_000],
      ["public/assets/tilesets/commons-tileset.png", 5_000],
    ] as const;
    for (const [rel, min] of critical) {
      expect(existsMin(rel, min), rel).toBe(true);
    }
  });

  it("BootScene terrain masters exist", () => {
    for (const name of [
      "terrain-grass",
      "terrain-path",
      "terrain-water",
      "terrain-lava",
    ]) {
      const rel = `public/assets/terrain/${name}.png`;
      expect(existsMin(rel, 5_000), rel).toBe(true);
    }
  });

  it("no ambient NPC portrait stubs remain (<5KB)", () => {
    const root = path.join(ROOT, "public/assets/npcs");
    const stubs: string[] = [];
    for (const region of fs.readdirSync(root, { withFileTypes: true })) {
      if (!region.isDirectory()) continue;
      const regionDir = path.join(root, region.name);
      for (const npc of fs.readdirSync(regionDir, { withFileTypes: true })) {
        if (!npc.isDirectory()) continue;
        const portrait = path.join(regionDir, npc.name, "portrait.png");
        if (!fs.existsSync(portrait) || fs.statSync(portrait).size < 5000) {
          stubs.push(`${region.name}/${npc.name}`);
        }
      }
    }
    expect(stubs).toEqual([]);
  });
});
