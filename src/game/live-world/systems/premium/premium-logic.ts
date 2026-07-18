/**
 * Pure premium world helpers (no Phaser) — safe for unit tests.
 */

import type { MapBlueprint } from "@/game/world-maps/types";
import type { TerrainCellKind } from "@/game/live-world/systems/terrain-paint";
import type { PropKey, TerrainKey } from "@/game/live-world/systems/premium/asset-keys";

export function isPremiumRegion(slug: string): boolean {
  return slug === "riftwild-commons";
}

export function hash2(col: number, row: number, salt = 0): number {
  let n = col * 374761393 + row * 668265263 + salt * 1274126177;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function pickGrass(col: number, row: number): TerrainKey {
  const h = hash2(col, row, 3);
  // Bias toward lush / flowered meadow (RuneScape readability + Ultima greens)
  if (h < 0.14) return "grass-flowers-blue";
  if (h < 0.28) return "grass-flowers-white";
  if (h < 0.4) return "grass-fern";
  if (h < 0.58) return "grass-dense";
  if (h < 0.82) return "grass-lush";
  return "grass-master";
}

function pickPath(col: number, row: number): TerrainKey {
  const h = hash2(col, row, 5);
  if (h < 0.2) return "path-worn";
  if (h < 0.4) return "path-rocky";
  if (h < 0.55) return "path-curve";
  if (h < 0.7) return "path-to-stone";
  if (h < 0.85) return "path-bloom";
  return "path-master";
}

function pickPlaza(col: number, row: number, centerCol: number, centerRow: number): TerrainKey {
  const dist = Math.hypot(col - centerCol, row - centerRow);
  if (dist < 1.6) return "plaza-medallion";
  const h = hash2(col, row, 9);
  if (h < 0.25) return "plaza-diamond";
  if (h < 0.5) return "plaza-street";
  if (h < 0.7) return "plaza-moss";
  return "plaza-stone";
}

function pickSettlement(
  kind: TerrainCellKind,
  col: number,
  row: number,
  zoneId: string | undefined,
): TerrainKey {
  if (zoneId?.includes("farm") || zoneId?.includes("public-farm")) return "farm-soil";
  if (zoneId?.includes("training")) return "training-dirt";
  if (kind === "safe" || kind === "accent") {
    return hash2(col, row, 11) < 0.5 ? "plaza-street" : "settlement-soil";
  }
  return "settlement-soil";
}

function zoneAt(blueprint: MapBlueprint, x: number, y: number): string | undefined {
  return blueprint.zones.find(
    (z) => x >= z.x && x < z.x + z.width && y >= z.y && y < z.y + z.height,
  )?.id;
}

export function resolveTerrainTexture(
  kind: TerrainCellKind,
  col: number,
  row: number,
  blueprint: MapBlueprint,
): TerrainKey {
  const T = blueprint.tileSize;
  const zoneId = zoneAt(blueprint, col * T + T / 2, row * T + T / 2);
  switch (kind) {
    case "path":
      return pickPath(col, row);
    case "water":
      return hash2(col, row, 2) < 0.5 ? "water-stream" : "water-master";
    case "cliff":
      return "cliff-edge";
    case "lava":
    case "hazard":
      return "path-ruined";
    case "safe":
    case "accent":
    case "settlement":
      if (zoneId === "central-plaza" || zoneId === "portal-circle") {
        return pickPlaza(col, row, 32, 22);
      }
      return pickSettlement(kind, col, row, zoneId);
    case "danger":
      return hash2(col, row, 4) < 0.4 ? "grass-dry" : "path-roots";
    default:
      return pickGrass(col, row);
  }
}

export type ElevationGrid = {
  cols: number;
  rows: number;
  heights: number[][];
};

export function buildElevationGrid(blueprint: MapBlueprint): ElevationGrid {
  const { cols, rows, tileSize: T } = blueprint;
  const heights: number[][] = [];
  for (let row = 0; row < rows; row++) {
    const line: number[] = [];
    for (let col = 0; col < cols; col++) {
      let h = 1;
      const x = col * T + T / 2;
      const y = row * T + T / 2;
      if (col < 8 || row < 6) h = 2;
      if (col > cols - 8 && row > 20 && row < 34) h = 2;
      if (col >= 22 && col <= 34 && row >= 36 && row <= 44) h = 0;
      if (col >= 38 && col <= 48 && row >= 10 && row <= 18) h = 2;
      if (col >= 24 && col <= 40 && row >= 3 && row <= 10) h = 2;
      if (hash2(col, row, 21) > 0.92) h = Math.min(3, h + 1);
      if (hash2(col, row, 22) < 0.06) h = Math.max(0, h - 1);
      const z = blueprint.zones.find(
        (zz) =>
          x >= zz.x &&
          x < zz.x + zz.width &&
          y >= zz.y &&
          y < zz.y + zz.height,
      );
      if (z?.id === "fishing-pond") h = 0;
      line.push(h);
    }
    heights.push(line);
  }
  return { cols, rows, heights };
}

export type ScatterSpec = {
  key: PropKey;
  x: number;
  y: number;
  scale?: number;
  depth?: number;
};

export function commonsPropScatter(blueprint: MapBlueprint): ScatterSpec[] {
  const T = blueprint.tileSize;
  const out: ScatterSpec[] = [];

  const addRing = (
    cx: number,
    cy: number,
    keys: PropKey[],
    count: number,
    radius: number,
    salt: number,
  ) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + hash2(cx, cy, salt + i) * 0.4;
      const r = radius * (0.55 + hash2(i, salt, cx) * 0.5);
      out.push({
        key: keys[i % keys.length]!,
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        scale: 0.85 + hash2(i, salt, 2) * 0.35,
      });
    }
  };

  addRing(32 * T, 22 * T, ["bench", "lantern-post", "flowers", "banner-pole"], 8, 90, 1);
  out.push({ key: "rift-crystal", x: 32 * T + 16, y: 22 * T + 16, scale: 1.15 });
  addRing(10 * T, 38 * T, ["market-stall", "barrel", "crate", "banner-pole"], 9, 72, 2);
  addRing(11 * T, 40 * T, ["barrel", "crate", "flowers"], 5, 48, 22);
  addRing(8 * T, 22 * T, ["anvil-forge", "barrel", "crate", "lantern-post"], 6, 55, 3);
  out.push({ key: "campfire", x: 9 * T, y: 24 * T, scale: 0.95 });
  addRing(9 * T, 8 * T, ["tree-small", "flowers", "bush-berry", "lantern-post"], 8, 64, 4);
  addRing(52 * T, 38 * T, ["banner-pole", "bench", "lantern-post", "crate"], 6, 55, 5);
  addRing(42 * T, 15 * T, ["signpost", "barrel", "rock-moss", "bush-berry"], 5, 48, 6);
  // Forest edge / wilderness — denser vegetation (Ultima lived-in greens)
  addRing(54 * T, 20 * T, ["tree-small", "bush-berry", "rock-moss", "flowers"], 14, 88, 7);
  addRing(56 * T, 28 * T, ["tree-small", "bush-berry", "flowers"], 8, 70, 23);
  addRing(50 * T, 8 * T, ["tree-small", "rock-moss", "bush-berry"], 7, 60, 24);
  out.push({ key: "bridge", x: 26 * T, y: 39 * T, scale: 1.2 });
  out.push({ key: "bench", x: 30 * T, y: 37 * T, scale: 0.9 });
  out.push({ key: "flowers", x: 28 * T, y: 38 * T, scale: 0.75 });
  out.push({ key: "bush-berry", x: 24 * T, y: 40 * T, scale: 0.85 });
  out.push({ key: "watchtower", x: 48 * T, y: 12 * T, scale: 1.05 });
  out.push({ key: "watchtower", x: 14 * T, y: 10 * T, scale: 0.95 });
  addRing(5 * T, 5 * T, ["tree-small", "rock-moss", "ruin-arch", "bush-berry"], 12, 78, 8);
  addRing(8 * T, 12 * T, ["tree-small", "bush-berry", "flowers"], 6, 50, 25);
  addRing(4 * T, 16 * T, ["barrel", "bench", "lantern-post", "flowers"], 5, 42, 9);
  addRing(44 * T, 41 * T, ["bench", "flowers", "lantern-post", "bush-berry"], 5, 40, 10);
  addRing(38 * T, 20 * T, ["lantern-post", "bench", "banner-pole", "flowers"], 4, 42, 11);
  addRing(32 * T, 7 * T, ["lantern-post", "rift-crystal", "flowers"], 6, 70, 12);
  // Residential / training clutter
  addRing(20 * T, 30 * T, ["barrel", "crate", "flowers", "lantern-post"], 5, 45, 26);
  addRing(36 * T, 32 * T, ["bench", "flowers", "bush-berry"], 4, 38, 27);

  for (const path of blueprint.pathways) {
    for (let i = 0; i < path.waypoints.length - 1; i++) {
      const a = path.waypoints[i]!;
      const b = path.waypoints[i + 1]!;
      if (hash2(a.x, a.y, i) < 0.55) {
        out.push({
          key: hash2(b.x, b.y, i) < 0.4 ? "flowers" : hash2(i, a.y, 3) < 0.5 ? "rock-moss" : "bush-berry",
          x: (a.x + b.x) / 2 + (hash2(i, a.x) - 0.5) * 28,
          y: (a.y + b.y) / 2 + (hash2(i, a.y) - 0.5) * 28,
          scale: 0.7,
        });
      }
      if (hash2(a.x, b.y, 99) < 0.22) {
        out.push({
          key: "signpost",
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2 - 18,
          scale: 0.85,
        });
      }
      if (hash2(b.x, a.y, 17) < 0.18) {
        out.push({
          key: "tree-small",
          x: (a.x + b.x) / 2 + (hash2(i, 5) - 0.5) * 40,
          y: (a.y + b.y) / 2 + (hash2(i, 6) - 0.5) * 40,
          scale: 0.8 + hash2(i, 7) * 0.25,
        });
      }
    }
  }

  return out;
}
