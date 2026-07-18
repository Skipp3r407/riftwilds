import { describe, expect, it } from "vitest";
import { getBlueprint } from "@/game/world-maps/blueprints";
import { REGION_BY_SLUG } from "@/game/world-maps/regions";
import {
  buildElevationGrid,
  commonsPropScatter,
  isPremiumRegion,
  resolveTerrainTexture,
} from "@/game/live-world/systems/premium/premium-logic";
import { paintTerrainGrid } from "@/game/live-world/systems/terrain-paint";
import {
  TERRAIN_KEYS,
  PROP_KEYS,
  TREE_PROP_KEYS,
  BUILDING_KEYS,
} from "@/game/live-world/systems/premium/asset-keys";
import fs from "node:fs";
import path from "node:path";

describe("Live World premium Commons", () => {
  it("marks Commons as premium showcase", () => {
    expect(isPremiumRegion("riftwild-commons")).toBe(true);
    expect(isPremiumRegion("ember-crater")).toBe(false);
  });

  it("uses a cozy outdoor tile palette (not dark navy grass)", () => {
    const pal = REGION_BY_SLUG["riftwild-commons"]!.tilePalette;
    expect(pal.ground).toBeGreaterThan(0x300000);
    // Green channel should dominate for meadow grass
    const g = (pal.ground >> 8) & 0xff;
    const r = (pal.ground >> 16) & 0xff;
    const b = pal.ground & 0xff;
    expect(g).toBeGreaterThan(r);
    expect(g).toBeGreaterThan(b);
    // Path should read warm (R > B), not cool navy
    const pr = (pal.path >> 16) & 0xff;
    const pb = pal.path & 0xff;
    expect(pr).toBeGreaterThan(pb);
  });

  it("paints varied terrain textures across Commons", () => {
    const bp = getBlueprint("riftwild-commons");
    const grid = paintTerrainGrid(bp);
    const keys = new Set<string>();
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        keys.add(resolveTerrainTexture(grid.cells[r]![c]!, c, r, bp));
      }
    }
    expect(keys.size).toBeGreaterThan(6);
    expect([...keys].some((k) => k.startsWith("grass"))).toBe(true);
    expect([...keys].some((k) => k.startsWith("path") || k.startsWith("plaza"))).toBe(
      true,
    );
  });

  it("builds elevation with valleys and rises", () => {
    const bp = getBlueprint("riftwild-commons");
    const elev = buildElevationGrid(bp);
    const flat = elev.heights.flat();
    expect(new Set(flat).size).toBeGreaterThan(1);
    expect(flat.some((h) => h === 0)).toBe(true);
    expect(flat.some((h) => h >= 2)).toBe(true);
  });

  it("scatters living props across districts", () => {
    const bp = getBlueprint("riftwild-commons");
    const props = commonsPropScatter(bp);
    expect(props.length).toBeGreaterThan(120);
    const kinds = new Set(props.map((p) => p.key));
    expect(kinds.has("lantern-post")).toBe(true);
    expect(kinds.has("tree-small")).toBe(true);
    expect(kinds.has("market-stall")).toBe(true);
    expect(kinds.has("bench")).toBe(true);
    expect(kinds.has("barrel")).toBe(true);
    const treeKinds = TREE_PROP_KEYS.filter((k) => kinds.has(k));
    expect(treeKinds.length).toBeGreaterThanOrEqual(4);
  });

  it("ships premium art files under public/assets/game", () => {
    const root = process.cwd();
    for (const key of [
      "grass-lush",
      "plaza-stone",
      "path-worn",
      "water-stream",
      "water-edge",
      "water-lily",
    ]) {
      expect(
        fs.existsSync(path.join(root, "public/assets/game/terrain", `${key}.png`)),
      ).toBe(true);
    }
    for (const key of [
      "barrel",
      "tree-small",
      "lantern-post",
      "campfire",
      "stump",
      "ambient-riftling-sparklet",
      ...TREE_PROP_KEYS,
    ]) {
      expect(
        fs.existsSync(path.join(root, "public/assets/game/props", `${key}.png`)),
      ).toBe(true);
    }
    for (const key of ["hatchery", "market", "workshop", "library"]) {
      expect(
        fs.existsSync(path.join(root, "public/assets/game/buildings", `${key}.png`)),
      ).toBe(true);
    }
    for (const key of ["player-keeper", "pet-riftling", "riftling-mossbun"]) {
      expect(
        fs.existsSync(path.join(root, "public/assets/game/actors", `${key}.png`)),
      ).toBe(true);
    }
    expect(TERRAIN_KEYS.length).toBeGreaterThan(10);
    expect(PROP_KEYS.length).toBeGreaterThan(8);
    expect(BUILDING_KEYS.length).toBeGreaterThan(5);
  });

  it("Commons blueprint includes showcase districts", () => {
    const bp = getBlueprint("riftwild-commons");
    const zoneIds = new Set(bp.zones.map((z) => z.id));
    for (const id of [
      "central-plaza",
      "market-zone",
      "craft-zone",
      "guild-zone",
      "training-yard",
      "residential",
      "hatchery-zone",
      "library-zone",
      "recovery",
      "portal-circle",
      "forest-entrance",
    ]) {
      expect(zoneIds.has(id)).toBe(true);
    }
    expect(bp.objects.some((o) => o.id === "library")).toBe(true);
    expect(bp.pathways.length).toBeGreaterThanOrEqual(8);
  });
});
