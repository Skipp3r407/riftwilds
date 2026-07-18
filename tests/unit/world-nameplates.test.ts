import { describe, expect, it } from "vitest";
import {
  classifyWorldLabel,
  createNameplateSolveState,
  distanceFadeAlpha,
  solveNameplateLayout,
} from "@/game/live-world/systems/world-nameplates";

describe("world nameplates", () => {
  it("fades npc labels with distance", () => {
    expect(distanceFadeAlpha("npc", 40)).toBeGreaterThan(0.9);
    expect(distanceFadeAlpha("npc", 100)).toBeLessThan(0.7);
    expect(distanceFadeAlpha("npc", 250)).toBe(0);
  });

  it("keeps hub labels readable farther than npc labels", () => {
    expect(distanceFadeAlpha("hub", 250)).toBeGreaterThan(
      distanceFadeAlpha("npc", 250),
    );
  });

  it("classifies interactive buildings and plaza names as hubs", () => {
    expect(
      classifyWorldLabel({ type: "building", label: "Hatchery", interactive: true }),
    ).toBe("hub");
    expect(
      classifyWorldLabel({ type: "building", label: "Plaza Market Square" }),
    ).toBe("hub");
    expect(classifyWorldLabel({ type: "portal", label: "Stoneheart Canyon" })).toBe(
      "portal",
    );
    expect(classifyWorldLabel({ type: "npc", label: "Guard Hex" })).toBe("npc");
  });

  it("offsets overlapping anchors instead of stacking on top", () => {
    const { layouts } = solveNameplateLayout({
      playerX: 0,
      playerY: 0,
      labels: [
        {
          id: "a",
          kind: "hub",
          anchorX: 10,
          anchorY: 10,
          width: 80,
          height: 14,
        },
        {
          id: "b",
          kind: "hub",
          anchorX: 12,
          anchorY: 12,
          width: 80,
          height: 14,
        },
        {
          id: "c",
          kind: "npc",
          anchorX: 11,
          anchorY: 11,
          width: 60,
          height: 12,
        },
      ],
    });

    const visible = layouts.filter((l) => l.visible);
    expect(visible.length).toBe(3);
    const ys = visible.map((l) => Math.round(l.y));
    expect(new Set(ys).size).toBeGreaterThan(1);
  });

  it("smooths offset changes across solves", () => {
    const state = createNameplateSolveState();
    const labels = [
      {
        id: "a",
        kind: "portal" as const,
        anchorX: 0,
        anchorY: 0,
        width: 90,
        height: 14,
      },
      {
        id: "b",
        kind: "portal" as const,
        anchorX: 2,
        anchorY: 2,
        width: 90,
        height: 14,
      },
    ];
    const first = solveNameplateLayout({
      playerX: 0,
      playerY: 0,
      labels,
      state,
    });
    const second = solveNameplateLayout({
      playerX: 0,
      playerY: 0,
      labels,
      state: first.state,
    });
    const b1 = first.layouts.find((l) => l.id === "b")!;
    const b2 = second.layouts.find((l) => l.id === "b")!;
    // Second solve should move toward the target, not jump randomly.
    expect(Math.abs(b2.offsetY)).toBeGreaterThanOrEqual(Math.abs(b1.offsetY) - 0.01);
  });

  it("caps far / low-priority labels when crowded", () => {
    const labels = Array.from({ length: 20 }, (_, i) => ({
      id: `n${i}`,
      kind: "npc" as const,
      anchorX: i * 2,
      anchorY: i * 2,
      width: 50,
      height: 12,
    }));
    const { layouts } = solveNameplateLayout({
      playerX: 0,
      playerY: 0,
      labels,
      maxVisible: 8,
    });
    expect(layouts.filter((l) => l.visible).length).toBeLessThanOrEqual(8);
  });
});
