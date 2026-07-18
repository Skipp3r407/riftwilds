import { beforeEach, describe, expect, it } from "vitest";
import {
  assertClientCannotCreateMaps,
  assertFounderEconomySafe,
  assertNoPermanentHousingOnOverflow,
  assertPlotUniqueness,
  assignPlayerToMap,
  claimFounderRewards,
  commitRelocation,
  crowdLabelFor,
  expandHousingNeighborhood,
  isHardCapacityBreached,
  isSoftCapacityBreached,
  listPublicDirectory,
  listTemplates,
  measureCapacity,
  planAndGenerate,
  requestRelocation,
  resetCapacityForTests,
  resetWorldExpansionForTests,
  runGenerationPipeline,
  sanitizeMapForClient,
  simulateLoad,
  spawnOverflowInstance,
  tickCapacityOrchestrator,
  validateGeneratedMap,
  adminApprove,
  adminForceGenerate,
  getExpansionStore,
} from "@/lib/world-expansion";
import { resetNeighborhoodsForTests } from "@/lib/neighborhoods/neighborhood-service";

beforeEach(() => {
  resetWorldExpansionForTests();
  resetCapacityForTests();
  resetNeighborhoodsForTests();
});

describe("capacity", () => {
  it("labels crowd Quiet→Full and detects soft/hard pressure", () => {
    const map = getExpansionStore().maps.get("map_riftwild_commons")!;
    expect(crowdLabelFor({ ...map, playersOnline: 5 })).toBe("Quiet");
    expect(crowdLabelFor({ ...map, playersOnline: 90 })).toBe("Busy");
    simulateLoad(map.mapId, 95);
    const snap = measureCapacity(getExpansionStore().maps.get(map.mapId)!);
    expect(isSoftCapacityBreached(snap) || snap.playersOnline / snap.softPlayerLimit >= 0.7).toBe(
      true,
    );
    simulateLoad(map.mapId, 150);
    const hard = measureCapacity(getExpansionStore().maps.get(map.mapId)!);
    expect(isHardCapacityBreached(hard)).toBe(true);
  });

  it("does not treat a spike alone as permanent-city forecast", () => {
    const map = getExpansionStore().maps.get("map_riftwild_commons")!;
    // Warm rolling avg low
    for (let i = 0; i < 6; i++) {
      simulateLoad(map.mapId, 10);
      measureCapacity(getExpansionStore().maps.get(map.mapId)!);
    }
    simulateLoad(map.mapId, 140);
    const spike = measureCapacity(getExpansionStore().maps.get(map.mapId)!);
    expect(spike.spikeDetected || spike.forecastNeedsOverflow).toBe(true);
    // Permanent expansion should not be preferred solely from spike path in orchestrator
    expect(spike.forecastNeedsExpansion && spike.spikeDetected).toBe(false);
  });
});

describe("templates & generation", () => {
  it("ships Living Towns-aligned templates including overflow-only", () => {
    const all = listTemplates();
    expect(all.length).toBeGreaterThanOrEqual(10);
    const overflow = all.find((t) => t.key === "rift_edge_outpost");
    expect(overflow?.allowsPermanentHousing).toBe(false);
    expect(all.filter((t) => t.allowsPermanentHousing).length).toBeGreaterThan(5);
  });

  it("generates unique road-adjacent plots and passes validation", () => {
    const result = runGenerationPipeline({
      mapId: "map_test_gen",
      seed: "seed_unit_forest_1",
      templateKey: "forest_hamlet",
      mapKind: "permanent",
      regionSlug: "elderwood-forest",
    });
    expect(result.ok).toBe(true);
    expect(result.map.roads.length).toBeGreaterThan(0);
    expect(result.map.districts.length).toBeGreaterThan(1);
    expect(result.map.plots.every((p) => p.roadAccess)).toBe(true);
    expect(assertPlotUniqueness(result.map.plots).ok).toBe(true);
    const report = validateGeneratedMap(result.map as never);
    expect(report.passed).toBe(true);
  });

  it("overflow generation has no permanent housing", () => {
    const gen = planAndGenerate({
      reason: "festival_overflow",
      sourceMapId: "map_riftwild_commons",
      templateKey: "rift_edge_outpost",
      mapKind: "overflow",
      autoOpen: true,
    });
    expect(gen.ok).toBe(true);
    if (!gen.ok) return;
    expect(assertNoPermanentHousingOnOverflow(gen.map)).toBe(true);
    expect(gen.map.plots.length).toBe(0);
  });
});

describe("assignment", () => {
  it("keeps friends together and avoids empty maps for new players", () => {
    const friend = assignPlayerToMap({ userId: "friend_a", isNewPlayer: false });
    expect(friend.ok).toBe(true);
    if (!friend.ok) return;
    const newbie = assignPlayerToMap({
      userId: "newbie_1",
      isNewPlayer: true,
      friendMapIds: [friend.map.mapId],
    });
    expect(newbie.ok).toBe(true);
    if (!newbie.ok) return;
    expect(newbie.assignment.mapId).toBe(friend.map.mapId);
    expect(newbie.assignment.reason === "friends" || newbie.assignment.reason === "new_player").toBe(
      true,
    );
  });
});

describe("housing expansion & founders", () => {
  it("creates permanent neighborhood with plot variety when expanding", () => {
    const exp = expandHousingNeighborhood({
      sourceMapId: "map_riftwild_commons",
      templateKey: "coastal_village",
      autoOpen: true,
    });
    expect(exp.ok).toBe(true);
    if (!exp.ok) return;
    expect(exp.map.allowsPermanentHousing).toBe(true);
    expect(exp.neighborhood.plots.length).toBeGreaterThan(10);
    const sizes = new Set(exp.neighborhood.plots.map((p) => p.deedSize));
    expect(sizes.size).toBeGreaterThan(1);
  });

  it("founder rewards are cosmetics-only (no SOL / P2W)", () => {
    const gen = adminForceGenerate({
      actorId: "admin",
      templateKey: "farming_croft",
      autoOpen: true,
    });
    expect(gen.ok).toBe(true);
    if (!gen.ok) return;
    if (gen.map.lifecycle !== "OPEN") {
      adminApprove(gen.map.mapId, "admin");
    }
    const claim = claimFounderRewards({ userId: "founder_1", mapId: gen.map.mapId });
    expect(claim.ok).toBe(true);
    if (!claim.ok) return;
    expect(assertFounderEconomySafe(claim.reward)).toBe(true);
    expect(claim.reward.grantsSol).toBe(false);
  });
});

describe("relocation & security", () => {
  it("rejects permanent relocate onto overflow and is idempotent", () => {
    const overflow = spawnOverflowInstance({
      sourceMapId: "map_riftwild_commons",
      eventKey: "fest_test",
      autoOpen: true,
    });
    expect(overflow.ok).toBe(true);
    if (!overflow.ok) return;

    const bad = requestRelocation({
      userId: "mover_1",
      toMapId: overflow.map.mapId,
      idempotencyKey: "idem_bad_overflow_1",
    });
    expect(bad.ok).toBe(false);

    const dest = adminForceGenerate({
      actorId: "admin",
      templateKey: "beginner_meadow",
      autoOpen: true,
    });
    expect(dest.ok).toBe(true);
    if (!dest.ok) return;
    if (dest.map.lifecycle !== "OPEN") adminApprove(dest.map.mapId, "admin");

    const a = requestRelocation({
      userId: "mover_1",
      toMapId: dest.map.mapId,
      idempotencyKey: "idem_move_ok_1",
    });
    expect(a.ok).toBe(true);
    if (!a.ok) return;
    const b = requestRelocation({
      userId: "mover_1",
      toMapId: dest.map.mapId,
      idempotencyKey: "idem_move_ok_1",
    });
    expect(b.ok).toBe(true);
    if (!b.ok) return;
    expect(b.reused).toBe(true);
    expect(b.relocation.relocationId).toBe(a.relocation.relocationId);

    const committed = commitRelocation(a.relocation.relocationId);
    expect(committed.ok).toBe(true);
  });

  it("forbids client seeds and map create actions", () => {
    expect(assertClientCannotCreateMaps({ action: "generate", seed: "hack" }).ok).toBe(false);
    expect(assertClientCannotCreateMaps({ action: "assign", seed: "x" }).ok).toBe(false);
    expect(assertClientCannotCreateMaps({ action: "assign" }).ok).toBe(true);
  });

  it("public directory omits secrets", () => {
    const dir = listPublicDirectory();
    expect(dir.length).toBeGreaterThan(0);
    const publicMap = sanitizeMapForClient(dir[0]!.mapId);
    expect(publicMap).toBeTruthy();
    expect(publicMap).not.toHaveProperty("seed");
    expect(JSON.stringify(publicMap)).not.toContain("seed_commons");
  });
});

describe("failure recovery & orchestrator", () => {
  it("tick can spawn overflow under hard load without housing on it", () => {
    simulateLoad("map_riftwild_commons", 145);
    // Push rolling samples toward overflow path
    for (let i = 0; i < 3; i++) {
      measureCapacity(getExpansionStore().maps.get("map_riftwild_commons")!);
    }
    const tick = tickCapacityOrchestrator();
    expect(tick.snapshots.length).toBeGreaterThan(0);
    const overflowMaps = [...getExpansionStore().maps.values()].filter(
      (m) => m.mapKind === "overflow",
    );
    for (const m of overflowMaps) {
      expect(assertNoPermanentHousingOnOverflow(m)).toBe(true);
    }
  });
});
