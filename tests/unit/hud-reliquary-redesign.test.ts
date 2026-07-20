import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { resolveTerrainTexture } from "@/game/live-world/systems/premium/premium-logic";
import { getBlueprint } from "@/game/world-maps/blueprints";
import { paintTerrainGrid } from "@/game/live-world/systems/terrain-paint";
import {
  midLeftHudStackClass,
  rightColumnHudStackClass,
} from "@/components/live-world/hud-slots";

const root = path.resolve(__dirname, "../..");

function readSrc(rel: string) {
  return readFileSync(path.join(root, rel), "utf8");
}

describe("Reliquary HUD redesign", () => {
  it("ships UI_AUDIT.md with before/after and module map", () => {
    const audit = readSrc("UI_AUDIT.md");
    expect(audit).toMatch(/UI Audit/i);
    expect(audit).toMatch(/Reliquary/);
    expect(audit).toMatch(/Before/);
    expect(audit).toMatch(/\/live-world/);
  });

  it("defines Reliquary CSS tokens and motion", () => {
    const css = readSrc("src/app/globals.css");
    expect(css).toMatch(/--lw-gold/);
    expect(css).toMatch(/lw-hud-sheen/);
    expect(css).toMatch(/lw-hud-enter/);
    expect(css).toMatch(/lw-hud-minimap/);
    expect(css).toMatch(/lw-hud-quest/);
    expect(css).toMatch(/prefers-reduced-motion/);
  });

  it("wires top command bar + player status + quest tracker + FX into shell", () => {
    const shell = readSrc("src/components/live-world/live-world-shell.tsx");
    expect(shell).toMatch(/TopCommandBar/);
    expect(shell).toMatch(/PlayerStatusDock/);
    expect(shell).toMatch(/HudFxLayer/);
    expect(shell).not.toMatch(/LiveWorldStatusBar/);
  });

  it("expands chat channels for guild/trade/combat", () => {
    const chat = readSrc("src/game/live-world/systems/chat.ts");
    expect(chat).toMatch(/"guild"/);
    expect(chat).toMatch(/"trade"/);
    expect(chat).toMatch(/"combat"/);
    const panel = readSrc("src/components/live-world/chat-panel.tsx");
    expect(panel).toMatch(/guild/);
    expect(panel).toMatch(/trade/);
    expect(panel).toMatch(/combat/);
  });

  it("tiers action hotbar and radial menu", () => {
    const hotbar = readSrc("src/components/live-world/action-hotbar.tsx");
    expect(hotbar).toMatch(/tier: "primary"/);
    expect(hotbar).toMatch(/tier: "utility"/);
    expect(hotbar).toMatch(/lw-hud-slot--primary/);
    const radial = readSrc("src/components/live-world/world-radial-menu.tsx");
    expect(radial).toMatch(/tier: "primary"/);
    expect(radial).toMatch(/tier: "secondary"/);
  });

  it("clusters grass into soft meadow patches", () => {
    const bp = getBlueprint("riftwild-commons");
    const grid = paintTerrainGrid(bp);
    const keys = new Set<string>();
    let grassCells = 0;
    let sameAsNeighbor = 0;
    for (let r = 1; r < grid.rows - 1; r++) {
      for (let c = 1; c < grid.cols - 1; c++) {
        if (grid.cells[r]![c] !== "ground") continue;
        grassCells++;
        const k = resolveTerrainTexture("ground", c, r, bp, grid);
        keys.add(k);
        const right = resolveTerrainTexture("ground", c + 1, r, bp, grid);
        if (k === right) sameAsNeighbor++;
      }
    }
    expect(grassCells).toBeGreaterThan(50);
    // Patch clustering should keep a healthy share of neighbors matching
    expect(sameAsNeighbor / grassCells).toBeGreaterThan(0.35);
    expect(keys.size).toBeGreaterThan(2);
  });

  it("docks mid-left / right column below the top command bar", () => {
    expect(midLeftHudStackClass(false)).toMatch(/top-\[4\.75rem\]/);
    expect(rightColumnHudStackClass(false)).toMatch(/top-\[4\.75rem\]/);
  });
});
