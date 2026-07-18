import { beforeEach, describe, expect, it } from "vitest";
import { QUEST_CATALOG } from "@/game/quests/quest-catalog";
import { createDefaultDemoState } from "@/game/quests/quest-demo-store";
import {
  addCustomWaypoint,
  buildQuestMapMarkers,
  discoverById,
  getDiscoverableCatalog,
  getRegionCompletion,
  isDiscovered,
  queryMapMarkers,
  queryNearbyMinimapMarkers,
  resetDiscoverableCatalogCache,
  resetExplorationProgressForTests,
  resolveLiveRegionSlug,
  tryDiscoverNearby,
} from "@/game/world-exploration";

describe("Region aliases", () => {
  it("maps lore region keys onto Live World slugs", () => {
    expect(resolveLiveRegionSlug("sproutfall-grove")).toBe("elderwood-forest");
    expect(resolveLiveRegionSlug("cindercrag-basin")).toBe("ember-crater");
    expect(resolveLiveRegionSlug("riftwild-commons")).toBe("riftwild-commons");
    expect(resolveLiveRegionSlug("nope")).toBeNull();
  });
});

describe("Quest → map bridge", () => {
  it("places available/active quests without duplicating catalog defs", () => {
    const demo = createDefaultDemoState();
    const markers = buildQuestMapMarkers({ demoState: demo });
    expect(markers.length).toBeGreaterThan(0);
    for (const m of markers) {
      expect(m.kind).toBe("quest");
      expect(m.questKey).toBeTruthy();
      expect(QUEST_CATALOG.some((q) => q.key === m.questKey)).toBe(true);
      expect(m.visibility).toBe("visible");
      // Locked quests never appear
      expect(m.questStatus).not.toBe("locked");
    }
  });

  it("does not spoil locked secret community boss quest", () => {
    const demo = createDefaultDemoState();
    demo["community-boss-hit"] = {
      status: "locked",
      progress: { "boss-damage": 0 },
      tracked: false,
    };
    const markers = buildQuestMapMarkers({ demoState: demo });
    expect(markers.some((m) => m.questKey === "community-boss-hit")).toBe(false);
  });

  it("syncs active quest progress into subtitle", () => {
    const demo = createDefaultDemoState();
    const markers = buildQuestMapMarkers({
      demoState: demo,
      regionSlug: "ember-crater",
    });
    const ember = markers.find((m) => m.questKey === "story-ember-call");
    expect(ember).toBeTruthy();
    expect(ember!.state === "active" || ember!.state === "tracked").toBe(true);
    expect(ember!.subtitle).toMatch(/\d+\/\d+/);
  });
});

describe("Treasure / discovery spoiler safety", () => {
  beforeEach(() => {
    resetExplorationProgressForTests();
    resetDiscoverableCatalogCache();
  });

  it("catalog includes blueprint chests and hand-authored secrets", () => {
    const catalog = getDiscoverableCatalog();
    expect(catalog.some((d) => d.kind === "treasure")).toBe(true);
    expect(catalog.some((d) => d.kind === "world_boss")).toBe(true);
    expect(catalog.some((d) => d.kind === "enemy_territory")).toBe(true);
  });

  it("undiscovered treasures never expose coords on the map", () => {
    const result = queryMapMarkers({
      regionSlug: "riftwild-commons",
      includeHints: true,
      legend: { treasures: true },
    });
    const treasurePins = result.markers.filter((m) => m.kind === "treasure");
    // Without discovery, only hints (no x/y) or none
    for (const m of treasurePins) {
      expect(m.x).toBeNull();
      expect(m.y).toBeNull();
    }
    for (const h of result.hints.filter((m) => m.kind === "treasure")) {
      expect(h.visibility).toBe("region_hint");
      expect(h.x).toBeNull();
      expect(h.label).not.toMatch(/Cascade Cache|Ash Vault/i);
    }
  });

  it("reveals treasure name and coords only after discovery", () => {
    const id = "treasure-commons-waterfall";
    const before = isDiscovered(id);
    expect(before).toBe(false);
    const res = discoverById(id);
    expect(res.firstTime).toBe(true);
    expect(isDiscovered(id)).toBe(true);

    const result = queryMapMarkers({
      regionSlug: "riftwild-commons",
      includeHints: false,
    });
    const pin = result.markers.find((m) => m.metadata?.discoverableId === id);
    expect(pin).toBeTruthy();
    expect(pin!.label).toBe("Cascade Cache");
    expect(pin!.x).not.toBeNull();
    expect(pin!.y).not.toBeNull();
  });

  it("proximity discovery finds nearby secrets", () => {
    const catalog = getDiscoverableCatalog().filter(
      (d) => d.regionSlug === "riftwild-commons" && d.kind !== "perk",
    );
    const target = catalog[0]!;
    const found = tryDiscoverNearby(target.regionSlug, target.x, target.y);
    expect(found).toContain(target.id);
  });
});

describe("Custom waypoints + search + region completion", () => {
  beforeEach(() => {
    resetExplorationProgressForTests();
  });

  it("adds custom pins and finds them via search", () => {
    addCustomWaypoint({
      regionSlug: "riftwild-commons",
      x: 200,
      y: 300,
      label: "Picnic Rock",
    });
    const result = queryMapMarkers({
      regionSlug: "riftwild-commons",
      search: "picnic",
    });
    expect(result.markers.some((m) => m.label === "Picnic Rock")).toBe(true);
  });

  it("tracks region completion percentage", () => {
    const snap = getRegionCompletion("riftwild-commons");
    expect(snap.percentComplete).toBeGreaterThanOrEqual(0);
    expect(snap.percentComplete).toBeLessThanOrEqual(100);
    expect(snap.regionSlug).toBe("riftwild-commons");
  });
});

describe("Minimap nearby sync", () => {
  beforeEach(() => {
    resetExplorationProgressForTests();
  });

  it("returns nearby markers in the player region only", () => {
    discoverById("treasure-commons-waterfall");
    const nearby = queryNearbyMinimapMarkers({
      regionSlug: "riftwild-commons",
      x: 1024,
      y: 768,
    });
    expect(nearby.every((m) => m.regionSlug === "riftwild-commons")).toBe(true);
    expect(nearby.every((m) => m.x != null && m.y != null)).toBe(true);
  });
});
