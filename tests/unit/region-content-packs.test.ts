import { describe, expect, it } from "vitest";
import {
  REGION_CONTENT_PACKS,
  assertRegionPackCoverage,
  contentPackForRegion,
  packHasDistinctContent,
} from "@/content/regions";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";
import { getBlueprint } from "@/game/world-maps/blueprints";
import { RESOURCE_BY_ID } from "@/game/world-maps/defs/resources";
import { ENEMY_BY_ID } from "@/game/world-maps/defs/enemies";

const REGION_IDS = REGION_IDENTITIES.map((r) => r.id);

describe("Region content packs — distinct playable markers", () => {
  it("covers every known region with a full, distinct pack", () => {
    expect(REGION_IDENTITIES).toHaveLength(12);
    const coverage = assertRegionPackCoverage(REGION_IDS);
    expect(coverage.missing).toEqual([]);
    expect(coverage.incomplete).toEqual([]);
    expect(coverage.ok).toBe(true);

    for (const id of REGION_IDS) {
      const pack = contentPackForRegion(id);
      expect(pack, `missing pack ${id}`).toBeDefined();
      expect(pack!.completeness).toBe("full");
      expect(packHasDistinctContent(pack!)).toBe(true);
    }
  });

  it("each pack has unique theme + portal identity (not Commons clones)", () => {
    const themes = new Set<string>();
    const portals = new Set<string>();
    const blurbs = new Set<string>();

    for (const pack of REGION_CONTENT_PACKS.filter((p) =>
      REGION_IDS.includes(p.regionId),
    )) {
      const themeKey = [
        pack.theme.lighting,
        pack.theme.vegetation,
        pack.theme.architecture,
      ].join("|");
      expect(themeKey.length).toBeGreaterThan(20);
      expect(themes.has(themeKey)).toBe(false);
      themes.add(themeKey);

      expect(portals.has(pack.portal.name)).toBe(false);
      portals.add(pack.portal.name);

      expect(blurbs.has(pack.blurb)).toBe(false);
      blurbs.add(pack.blurb);

      expect(pack.musicKey.startsWith("music-")).toBe(true);
      expect(pack.pois.length).toBeGreaterThanOrEqual(2);
      expect(pack.npcSpawnIds.length).toBeGreaterThanOrEqual(3);
      expect(pack.resourceNodeIds.length).toBeGreaterThanOrEqual(2);
      expect(pack.enemyIds.length).toBeGreaterThanOrEqual(1);
      expect(pack.dangerZoneIds.length).toBeGreaterThanOrEqual(1);
      expect(pack.quests.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("blueprint objects carry POIs, NPC spawns, resources, enemies, and portals", () => {
    for (const region of REGION_IDENTITIES) {
      const pack = contentPackForRegion(region.id)!;
      const bp = getBlueprint(region.slug);

      const decorations = bp.objects.filter((o) => o.type === "decoration");
      const npcs = bp.objects.filter((o) => o.type === "npc");
      const resources = bp.objects.filter((o) => o.type === "resource");
      const enemies = bp.objects.filter((o) => o.type === "enemy_spawn");
      const portals = bp.objects.filter((o) => o.type === "portal");

      expect(decorations.length, `${region.id} landmarks`).toBeGreaterThanOrEqual(2);
      expect(npcs.length, `${region.id} npcs`).toBeGreaterThanOrEqual(3);
      expect(resources.length, `${region.id} resources`).toBeGreaterThanOrEqual(2);
      expect(enemies.length, `${region.id} enemies`).toBeGreaterThanOrEqual(1);
      expect(portals.length, `${region.id} portals`).toBeGreaterThanOrEqual(1);

      for (const rid of pack.resourceNodeIds) {
        expect(RESOURCE_BY_ID[rid], `resource ${rid}`).toBeDefined();
      }
      for (const eid of pack.enemyIds) {
        expect(ENEMY_BY_ID[eid], `enemy ${eid}`).toBeDefined();
      }
    }
  });

  it("no two regions share the same primary resource set", () => {
    const signatures = new Set<string>();
    for (const id of REGION_IDS) {
      const pack = contentPackForRegion(id)!;
      const sig = [...pack.resourceNodeIds].sort().join(",");
      expect(signatures.has(sig)).toBe(false);
      signatures.add(sig);
    }
  });
});
