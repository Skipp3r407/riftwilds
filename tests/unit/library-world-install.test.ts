import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LIBRARY_WORLD_KEYS } from "@/content/assets/library-world-keys";
import { GAME_LIBRARY } from "@/content/assets/game-library";
import { PROP_KEYS } from "@/game/live-world/systems/premium/asset-keys";
import { commonsPropScatter, filterScatterForBudget } from "@/game/live-world/systems/premium/premium-logic";
import { getBlueprint } from "@/game/world-maps/blueprints";

const ROOT = process.cwd();

describe("library world install (visible in Live World)", () => {
  it("installs a substantial world pack (≥100 keys)", () => {
    expect(LIBRARY_WORLD_KEYS.length).toBeGreaterThanOrEqual(100);
    expect(GAME_LIBRARY.count).toBeGreaterThanOrEqual(1000);
    expect(GAME_LIBRARY.count - LIBRARY_WORLD_KEYS.length).toBeGreaterThan(500);
  });

  it("every world-pack key is in PROP_KEYS and has a PNG under props/", () => {
    const propSet = new Set(PROP_KEYS as readonly string[]);
    const missingKeys: string[] = [];
    const missingFiles: string[] = [];
    for (const key of LIBRARY_WORLD_KEYS) {
      if (!propSet.has(key)) missingKeys.push(key);
      const abs = path.join(ROOT, "public/assets/game/props", `${key}.png`);
      if (!fs.existsSync(abs) || fs.statSync(abs).size < 80) missingFiles.push(key);
    }
    expect(missingKeys.slice(0, 5)).toEqual([]);
    expect(missingFiles.slice(0, 5)).toEqual([]);
  });

  it("Commons scatter places many library (lw-*) props", () => {
    const bp = getBlueprint("riftwild-commons");
    const specs = commonsPropScatter(bp);
    const libSpecs = specs.filter((s) => String(s.key).startsWith("lw-"));
    expect(specs.length).toBeGreaterThan(200);
    expect(libSpecs.length).toBeGreaterThanOrEqual(LIBRARY_WORLD_KEYS.length);
    const uniqueLib = new Set(libSpecs.map((s) => s.key));
    expect(uniqueLib.size).toBeGreaterThanOrEqual(80);
  });

  it("budget filter reduces density but keeps landmarks", () => {
    const bp = getBlueprint("riftwild-commons");
    const full = commonsPropScatter(bp);
    const medium = filterScatterForBudget(full, "medium");
    const low = filterScatterForBudget(full, "low");
    expect(medium.length).toBeLessThan(full.length);
    expect(low.length).toBeLessThan(medium.length);
    expect(full.some((s) => s.key === "watchtower")).toBe(true);
    expect(medium.some((s) => s.key === "watchtower")).toBe(true);
  });

  it("WORLD_INSTALL.json documents pack size", () => {
    const indexPath = path.join(ROOT, "public/assets/game/library/WORLD_INSTALL.json");
    expect(fs.existsSync(indexPath)).toBe(true);
    const idx = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    expect(idx.worldPackCount).toBeGreaterThanOrEqual(100);
    expect(idx.catalogCount).toBeGreaterThanOrEqual(1000);
  });
});
