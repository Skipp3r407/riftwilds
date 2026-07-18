import { describe, expect, it } from "vitest";
import { allBlueprints, getBlueprint } from "@/game/world-maps/blueprints";
import {
  auditBlueprintBoundaries,
  auditAllBlueprints,
  blocksNavigation,
  clampEnemyLeash,
  clampEntityToNav,
  clampProjectileToWorld,
  clampSpawnPoint,
  collectTransitionZones,
  isDeepWater,
  isSolidCollider,
  lockedBlockerMessage,
  lockedPortalSeals,
  playableBoundsFromBlueprint,
  resolveSafeSpawn,
  sealColliderForPortal,
  spawnOverlapsSolid,
  transitionAtPoint,
} from "@/game/world-maps/boundaries";
import type { WorldMapObject } from "@/game/world-maps/types";

describe("Collider semantics", () => {
  it("treats deep water as solid and transitions as walkable", () => {
    expect(
      isSolidCollider({
        id: "a",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        kind: "deep_water",
      }),
    ).toBe(true);
    expect(
      isSolidCollider({
        id: "b",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        kind: "water",
      }),
    ).toBe(true);
    expect(
      isSolidCollider({
        id: "c",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        kind: "transition",
      }),
    ).toBe(false);
    expect(
      isSolidCollider({
        id: "d",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        kind: "shallow_water",
      }),
    ).toBe(false);
    expect(
      blocksNavigation({
        id: "e",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        kind: "transition",
      }),
    ).toBe(false);
    expect(
      isDeepWater({
        id: "f",
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        kind: "deep_water",
      }),
    ).toBe(true);
  });
});

describe("Spawn clamp + playable bounds", () => {
  it("keeps Commons spawn inside playable bounds and clear of solids", () => {
    const bp = getBlueprint("riftwild-commons");
    const bounds = playableBoundsFromBlueprint(bp);
    const spawn = resolveSafeSpawn(bp);
    expect(spawn.x).toBeGreaterThanOrEqual(bounds.minX);
    expect(spawn.x).toBeLessThanOrEqual(bounds.maxX);
    expect(spawn.y).toBeGreaterThanOrEqual(bounds.minY);
    expect(spawn.y).toBeLessThanOrEqual(bounds.maxY);
    expect(spawnOverlapsSolid(spawn, bp.colliders)).toBe(false);
  });

  it("pushes a point out of a solid building collider", () => {
    const solids = [
      {
        id: "b",
        x: 100,
        y: 100,
        width: 64,
        height: 64,
        kind: "building" as const,
      },
    ];
    const bounds = {
      minX: 32,
      minY: 32,
      maxX: 400,
      maxY: 400,
      width: 368,
      height: 368,
    };
    const result = clampSpawnPoint(120, 120, solids, bounds, {
      x: 200,
      y: 200,
    });
    expect(result.adjusted).toBe(true);
    expect(spawnOverlapsSolid(result, solids)).toBe(false);
  });

  it("every region spawn is containable after clamp", () => {
    for (const bp of allBlueprints()) {
      const spawn = resolveSafeSpawn(bp);
      expect(spawnOverlapsSolid(spawn, bp.colliders)).toBe(false);
    }
  });
});

describe("Transitions + locked seals", () => {
  it("auto-derives transition zones for Commons portals", () => {
    const bp = getBlueprint("riftwild-commons");
    const zones = collectTransitionZones(bp);
    expect(zones.length).toBeGreaterThan(0);
    const hit = transitionAtPoint(
      zones[0]!.x + zones[0]!.width / 2,
      zones[0]!.y + zones[0]!.height / 2,
      zones,
    );
    expect(hit?.toRegionId).toBeTruthy();
  });

  it("builds sealed colliders with contextual messages (not generic deny)", () => {
    const portal: WorldMapObject = {
      id: "portal-ember",
      type: "portal",
      regionId: "riftwild-commons",
      sceneId: "commons-scene",
      x: 200,
      y: 100,
      label: "Ember Crater",
      metadata: { toRegionId: "ember-crater", locked: true },
    };
    const seal = sealColliderForPortal(portal);
    expect(seal.kind).toBe("seal");
    expect(seal.solid).toBe(true);
    const msg = lockedBlockerMessage(portal, ["Story: Chapter 2"]);
    expect(msg.lines.join(" ").toLowerCase()).not.toContain("can't go there");
    expect(msg.speaker.length).toBeGreaterThan(2);
    expect(lockedPortalSeals([portal], () => true)).toHaveLength(1);
    expect(lockedPortalSeals([portal], () => false)).toHaveLength(0);
  });
});

describe("Entity / projectile containment", () => {
  it("leashes NPC wander inside playable bounds", () => {
    const bounds = {
      minX: 32,
      minY: 32,
      maxX: 200,
      maxY: 200,
      width: 168,
      height: 168,
    };
    const out = clampEntityToNav(500, 500, {
      homeX: 100,
      homeY: 100,
      leashRadius: 40,
      bounds,
    });
    expect(out.x).toBeLessThanOrEqual(bounds.maxX);
    expect(out.y).toBeLessThanOrEqual(bounds.maxY);
    expect(Math.hypot(out.x - 100, out.y - 100)).toBeLessThanOrEqual(40.01);
  });

  it("clamps enemies to zone leash", () => {
    const p = clampEnemyLeash(0, 0, { x: 40, y: 40, w: 80, h: 80 });
    expect(p.x).toBeGreaterThanOrEqual(48);
    expect(p.y).toBeGreaterThanOrEqual(48);
  });

  it("despawns projectiles outside world bounds", () => {
    const bounds = {
      minX: 32,
      minY: 32,
      maxX: 100,
      maxY: 100,
      width: 68,
      height: 68,
    };
    expect(clampProjectileToWorld(50, 50, bounds)).toEqual({ x: 50, y: 50 });
    expect(clampProjectileToWorld(-10, 50, bounds)).toBeNull();
  });
});

describe("Boundary audit", () => {
  it("Commons passes edge wall + spawn audit", () => {
    const result = auditBlueprintBoundaries(getBlueprint("riftwild-commons"));
    expect(result.ok).toBe(true);
    expect(result.stats.edgeWalls).toBeGreaterThanOrEqual(4);
    expect(result.stats.deepWater).toBeGreaterThanOrEqual(1);
  });

  it("all blueprints have no critical open-edge failures", () => {
    const all = auditAllBlueprints(allBlueprints());
    const critical = all.filter((a) => !a.result.ok);
    expect(critical.map((c) => `${c.slug}:${c.result.issues.map((i) => i.code).join(",")}`)).toEqual(
      [],
    );
  });
});
