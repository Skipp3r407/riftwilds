import { describe, expect, it } from "vitest";
import {
  DEPTH,
  depthAt,
  isBehindOccluder,
  type Occluder,
} from "@/game/live-world/systems/premium/depth-layers";

describe("depth layers", () => {
  it("y-sorts within a band so southern sprites sit above northern", () => {
    const north = depthAt(DEPTH.building, 100);
    const south = depthAt(DEPTH.building, 200);
    expect(south).toBeGreaterThan(north);
    expect(DEPTH.actor).toBeGreaterThan(DEPTH.building);
    // Canopy shares the actor band — a higher fixed band buried the player under trees.
    expect(DEPTH.canopy).toBe(DEPTH.actor);
  });

  it("lets a southern keeper paint above a northern tree (same band)", () => {
    const treeFootY = 400;
    const playerSouth = 460;
    const treeDepth = depthAt(DEPTH.canopy, treeFootY);
    const playerDepth = depthAt(DEPTH.actor, playerSouth);
    expect(playerDepth).toBeGreaterThan(treeDepth);
  });

  it("detects player behind a building footprint", () => {
    const o = {
      id: "b",
      kind: "building",
      sprite: {} as Occluder["sprite"],
      footX: 100,
      footY: 200,
      halfW: 40,
      heightPx: 100,
      baseAlpha: 1,
      fadeWhenBehind: true,
    } satisfies Occluder;
    expect(isBehindOccluder(100, 150, o)).toBe(true);
    expect(isBehindOccluder(100, 210, o)).toBe(false);
    expect(isBehindOccluder(180, 150, o)).toBe(false);
  });

  it("places roof band above building facade for layered 2.5D", () => {
    expect(DEPTH.buildingRoof).toBeGreaterThan(DEPTH.building);
    expect(DEPTH.buildingFoundation).toBeLessThan(DEPTH.building);
  });
});
