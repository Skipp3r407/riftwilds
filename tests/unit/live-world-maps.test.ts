import { describe, expect, it } from "vitest";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";
import { getBlueprint, allBlueprints } from "@/game/world-maps/blueprints";
import { paintTerrainGrid } from "@/game/live-world/systems/terrain-paint";
import { findPath, formatGuidance } from "@/game/live-world/systems/pathfinding";
import {
  sanitizeChatBody,
  parseSlashCommand,
  createChatStore,
} from "@/game/live-world/systems/chat";
import { cellKey, markVisited } from "@/game/live-world/systems/exploration-fog";
import { canEnterLiveWorldRegion } from "@/game/world-maps/load-blueprint";

describe("World map blueprints", () => {
  it("covers all 12 regions with valid schema", () => {
    expect(REGION_IDENTITIES).toHaveLength(12);
    const bps = allBlueprints();
    expect(bps.length).toBeGreaterThanOrEqual(12);
    for (const r of REGION_IDENTITIES) {
      const bp = getBlueprint(r.slug);
      expect(bp.schemaVersion).toBe(1);
      expect(bp.cols).toBeGreaterThan(8);
      expect(bp.rows).toBeGreaterThan(8);
      expect(bp.layers).toContain("collision");
      expect(bp.colliders.length).toBeGreaterThan(0);
      expect(bp.pathways.length).toBeGreaterThan(0);
      expect(bp.minimap.landmarkPins.length).toBeGreaterThan(0);
    }
  });

  it("Commons is FULL playable with deep water collider and roads", () => {
    const bp = getBlueprint("riftwild-commons");
    expect(bp.completeness).toBe("FULL");
    expect(
      bp.colliders.some((c) => c.kind === "water" || c.kind === "deep_water"),
    ).toBe(true);
    expect(bp.pathways.length).toBeGreaterThanOrEqual(4);
    expect(bp.objects.some((o) => o.type === "portal")).toBe(true);
    expect(bp.objects.some((o) => o.type === "waypoint")).toBe(true);
    expect(bp.colliders.some((c) => c.kind === "transition")).toBe(true);
  });

  it("every region paints non-flat terrain language", () => {
    for (const r of REGION_IDENTITIES) {
      const bp = getBlueprint(r.slug);
      const grid = paintTerrainGrid(bp);
      const kinds = new Set(grid.cells.flat());
      expect(kinds.size).toBeGreaterThan(1);
      expect(kinds.has("path") || kinds.has("safe") || kinds.has("settlement")).toBe(
        true,
      );
    }
  });

  it("all regions are playable or enterable stubs with scenes", () => {
    for (const r of REGION_IDENTITIES) {
      expect(["playable", "enterable_stub"]).toContain(r.playability);
      expect(r.sceneKey.length).toBeGreaterThan(0);
    }
    expect(canEnterLiveWorldRegion("riftwild-commons")).toBe(true);
    expect(canEnterLiveWorldRegion("ember-crater")).toBe(true);
  });
});

describe("Pathfinding guidance", () => {
  it("returns a path or direction fallback around colliders", () => {
    const bp = getBlueprint("riftwild-commons");
    const from = { x: bp.spawn.x, y: bp.spawn.y };
    const to = { x: bp.spawn.x + 200, y: bp.spawn.y + 120 };
    const result = findPath(from, to, bp.colliders, {
      width: bp.camera.width,
      height: bp.camera.height,
    });
    expect(formatGuidance(result).length).toBeGreaterThan(3);
    if (result.ok) expect(result.path.length).toBeGreaterThan(1);
    else expect(result.distance).toBeGreaterThan(0);
  });
});

describe("Chat sanitize + commands", () => {
  it("strips tags and truncates", () => {
    expect(sanitizeChatBody("<script>x</script>hi")).toBe("hi");
    expect(sanitizeChatBody("a".repeat(300)).length).toBe(240);
  });

  it("parses slash commands", () => {
    expect(parseSlashCommand("/help")?.kind).toBe("system");
    expect(parseSlashCommand("/w Mira hello")?.kind).toBe("message");
    expect(parseSlashCommand("/nope")?.kind).toBe("error");
  });

  it("chat store accepts nearby messages when enabled", () => {
    const chat = createChatStore();
    const res = chat.submit("Hello plaza", { channel: "nearby", from: "Keeper" });
    expect(res.ok).toBe(true);
  });
});

describe("Exploration fog helpers", () => {
  it("cellKey is stable", () => {
    expect(cellKey(10, 10)).toBe(cellKey(20, 30));
    expect(cellKey(0, 0)).not.toBe(cellKey(200, 200));
  });

  it("markVisited is callable in node (no window persistence required)", () => {
    // In vitest/jsdom window may exist — just ensure no throw
    expect(() => markVisited("riftwild-commons", 100, 100)).not.toThrow();
  });
});
