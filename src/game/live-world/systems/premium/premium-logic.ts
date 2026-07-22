/**
 * Pure premium world helpers (no Phaser) — safe for unit tests.
 */

import type { MapBlueprint } from "@/game/world-maps/types";
import type {
  TerrainCellKind,
  TerrainGrid,
} from "@/game/live-world/systems/terrain-paint";
import { LIBRARY_WORLD_KEYS } from "@/content/assets/library-world-keys";
import {
  type PropKey,
  type TerrainKey,
} from "@/game/live-world/systems/premium/asset-keys";

/** Library world keys matching any of the given id prefixes (after `lw-`). */
function libKeys(...prefixes: string[]): PropKey[] {
  return LIBRARY_WORLD_KEYS.filter((k) =>
    prefixes.some((p) => k.startsWith(`lw-${p}`)),
  ) as PropKey[];
}

function pickLib(keys: PropKey[], i: number, salt: number): PropKey {
  if (!keys.length) return "barrel";
  return keys[Math.floor(hash2(i, salt, 1) * keys.length) % keys.length]!;
}

export function isPremiumRegion(slug: string): boolean {
  return slug === "riftwild-commons";
}

export function hash2(col: number, row: number, salt = 0): number {
  let n = col * 374761393 + row * 668265263 + salt * 1274126177;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function pickGrass(col: number, row: number): TerrainKey {
  // Soft meadow patches (4×4) so grass reads hand-painted, not speckled tiles.
  const pc = Math.floor(col / 4);
  const pr = Math.floor(row / 4);
  const h = hash2(pc, pr, 3);
  // Sparse flower accents only at patch edges / rare cells
  const detail = hash2(col, row, 37);
  if (detail > 0.94) {
    return detail > 0.97 ? "grass-flowers-blue" : "grass-flowers-white";
  }
  if (h < 0.12) return "grass-fern";
  if (h < 0.28) return "grass-dense";
  if (h < 0.78) return "grass-lush";
  return "grass-master";
}

function pickPath(col: number, row: number): TerrainKey {
  // Longer road runs share material for readable variation
  const pc = Math.floor(col / 3);
  const pr = Math.floor(row / 3);
  const h = hash2(pc, pr, 5);
  if (h < 0.18) return "path-worn";
  if (h < 0.36) return "path-rocky";
  if (h < 0.52) return "path-curve";
  if (h < 0.7) return "path-to-stone";
  if (h < 0.86) return "path-bloom";
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
  if (zoneId?.includes("training") || zoneId?.includes("arena")) return "training-dirt";
  if (zoneId?.includes("market")) {
    return hash2(col, row, 13) < 0.55 ? "plaza-street" : "settlement-soil";
  }
  if (zoneId?.includes("entertainment") || zoneId?.includes("noble")) {
    return hash2(col, row, 14) < 0.4 ? "plaza-moss" : "plaza-street";
  }
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

function cellAt(
  grid: TerrainGrid | undefined,
  col: number,
  row: number,
): TerrainCellKind | undefined {
  if (!grid) return undefined;
  if (row < 0 || col < 0 || row >= grid.rows || col >= grid.cols) return undefined;
  return grid.cells[row]![col];
}

function isWaterish(k: TerrainCellKind | undefined): boolean {
  return k === "water";
}

function isPathish(k: TerrainCellKind | undefined): boolean {
  return k === "path" || k === "safe" || k === "settlement" || k === "accent";
}

function isLand(k: TerrainCellKind | undefined): boolean {
  return k !== undefined && !isWaterish(k);
}

/** Neighbor-aware path / pond seams (cute RPG autotile feel). */
function pickPathAutotile(
  col: number,
  row: number,
  grid: TerrainGrid | undefined,
): TerrainKey | null {
  if (!grid) return null;
  const n = !isPathish(cellAt(grid, col, row - 1));
  const s = !isPathish(cellAt(grid, col, row + 1));
  const e = !isPathish(cellAt(grid, col + 1, row));
  const w = !isPathish(cellAt(grid, col - 1, row));
  const edges = (n ? 1 : 0) + (s ? 1 : 0) + (e ? 1 : 0) + (w ? 1 : 0);
  if (edges === 0) return null;
  if (n && e && !s && !w) return "path-corner-ne";
  if (n && w && !s && !e) return "path-corner-nw";
  if (s && e && !n && !w) return "path-corner-se";
  if (s && w && !n && !e) return "path-corner-sw";
  // Multi-edge junctions — prefer bloom over a harsh single-axis strip
  if (edges >= 3) return "path-bloom";
  if (n && s) return "path-bloom";
  if (e && w) return "path-bloom";
  if (n && !s) return "path-edge-n";
  if (s && !n) return "path-edge-s";
  if (e && !w) return "path-edge-e";
  if (w && !e) return "path-edge-w";
  return "path-bloom";
}

function pickWaterAutotile(
  col: number,
  row: number,
  grid: TerrainGrid | undefined,
): TerrainKey | null {
  if (!grid) return null;
  const n = isLand(cellAt(grid, col, row - 1));
  const s = isLand(cellAt(grid, col, row + 1));
  const e = isLand(cellAt(grid, col + 1, row));
  const w = isLand(cellAt(grid, col - 1, row));
  const shores = (n ? 1 : 0) + (s ? 1 : 0) + (e ? 1 : 0) + (w ? 1 : 0);
  if (shores === 0) return null;
  if (n && e && !s && !w) return "water-corner-ne";
  if (n && w && !s && !e) return "water-corner-nw";
  if (s && e && !n && !w) return "water-corner-se";
  if (s && w && !n && !e) return "water-corner-sw";
  if (n && !s) return "water-edge-n";
  if (s && !n) return "water-edge-s";
  if (e && !w) return "water-edge-e";
  if (w && !e) return "water-edge-w";
  return "water-edge";
}

export function resolveTerrainTexture(
  kind: TerrainCellKind,
  col: number,
  row: number,
  blueprint: MapBlueprint,
  grid?: TerrainGrid,
): TerrainKey {
  const T = blueprint.tileSize;
  const zoneId = zoneAt(blueprint, col * T + T / 2, row * T + T / 2);
  switch (kind) {
    case "path": {
      const auto = pickPathAutotile(col, row, grid);
      if (auto) return auto;
      return pickPath(col, row);
    }
    case "water": {
      const auto = pickWaterAutotile(col, row, grid);
      if (auto) return auto;
      const hw = hash2(col, row, 2);
      if (hw < 0.35) return "water-lily";
      if (hw < 0.65) return "water-stream";
      return "water-master";
    }
    case "cliff":
      return "cliff-edge";
    case "lava":
    case "hazard":
      return "path-ruined";
    case "safe":
    case "accent":
    case "settlement": {
      if (zoneId === "central-plaza" || zoneId === "portal-circle") {
        return pickPlaza(col, row, 31, 22);
      }
      // Soft dirt↔grass seams for yards / streets (same autotile kit as paths)
      const settleAuto = pickPathAutotile(col, row, grid);
      if (settleAuto) return settleAuto;
      return pickSettlement(kind, col, row, zoneId);
    }
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
      // Outer rim / walls feel raised
      if (col < 4 || col > cols - 5 || row < 3 || row > rows - 4) h = 2;
      // Archive terrace + training ridge (verticality)
      if (col >= 38 && col <= 52 && row >= 10 && row <= 26) h = 2;
      if (col >= 40 && col <= 50 && row >= 16 && row <= 22) h = 3;
      // Portal sanctum rise
      if (col >= 24 && col <= 40 && row >= 2 && row <= 11) h = 2;
      // Dock basin
      if (col >= 22 && col <= 34 && row >= 36 && row <= 44) h = 0;
      if (hash2(col, row, 21) > 0.93) h = Math.min(3, h + 1);
      if (hash2(col, row, 22) < 0.05) h = Math.max(0, h - 1);
      const z = blueprint.zones.find(
        (zz) =>
          x >= zz.x &&
          x < zz.x + zz.width &&
          y >= zz.y &&
          y < zz.y + zz.height,
      );
      if (z?.id === "fishing-pond") h = 0;
      if (z?.id === "noble-zone" || z?.id === "library-zone") h = Math.max(h, 2);
      if (z?.id === "academy-zone") h = Math.max(h, 2);
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

type DistrictScatter = {
  cx: number;
  cy: number;
  keys: PropKey[];
  count: number;
  radius: number;
  salt: number;
};

/** District-anchored clutter — classic props + dense library world pack. */
function districtAnchors(T: number): DistrictScatter[] {
  const trees = libKeys("tree-");
  const bushes = libKeys("bush-");
  const flowers = libKeys("flower-", "mushroom-", "grass-");
  const market = libKeys("crate-", "barrel-", "stall-", "goods-", "sign-");
  const lights = libKeys("lantern-");
  const hardscape = libKeys("fence-", "gate-", "rock-", "furniture-");
  const fauna = libKeys("animal-", "riftling-", "npc-", "keeper-");
  const dockKit = libKeys("dock-", "bridge-", "barrel-", "crate-");

  return [
    // Central plaza
    {
      cx: 31 * T,
      cy: 22 * T,
      keys: [
        "bench",
        "lantern-post",
        "flowers",
        "banner-pole",
        "clay-pot",
        "pot-cluster",
        "signpost",
        ...lights.slice(0, 6),
        ...flowers.slice(0, 8),
        ...fauna.slice(0, 6),
        ...hardscape.slice(0, 4),
      ],
      count: 30,
      radius: 95,
      salt: 1,
    },
    // Market
    {
      cx: 9 * T,
      cy: 36 * T,
      keys: [
        "market-stall",
        "barrel",
        "crate",
        "banner-pole",
        "clay-pot",
        "pot-cluster",
        "signpost",
        ...market,
        ...lights.slice(0, 4),
      ],
      count: 32,
      radius: 78,
      salt: 2,
    },
    {
      cx: 12 * T,
      cy: 39 * T,
      keys: [
        "barrel",
        "crate",
        "flowers",
        "signpost",
        "clay-pot",
        ...market.slice(0, 10),
        ...hardscape.slice(0, 6),
      ],
      count: 20,
      radius: 42,
      salt: 22,
    },
    // Residential
    {
      cx: 7 * T,
      cy: 16 * T,
      keys: [
        "bench",
        "lantern-post",
        "flowers",
        "bush-berry",
        "clay-pot",
        "pot-cluster",
        "boulder",
        "tree-flowering",
        "tree-birch",
        ...trees.slice(0, 8),
        ...bushes.slice(0, 6),
        ...hardscape.slice(0, 8),
        ...libKeys("fence-", "furniture-").slice(0, 10),
      ],
      count: 28,
      radius: 52,
      salt: 9,
    },
    // Crafting
    {
      cx: 8 * T,
      cy: 25 * T,
      keys: ["anvil-forge", "barrel", "crate", "lantern-post", ...libKeys("tool-", "barrel-", "crate-"), ...lights.slice(0, 3)],
      count: 16,
      radius: 55,
      salt: 3,
    },
    // Tavern patio
    {
      cx: 17 * T,
      cy: 24 * T,
      keys: ["bench", "barrel", "lantern-post", "banner-pole", "flowers", ...libKeys("furniture-", "barrel-", "lantern-"), ...fauna.slice(0, 4)],
      count: 18,
      radius: 48,
      salt: 30,
    },
    // Hatchery greens
    {
      cx: 9 * T,
      cy: 7 * T,
      keys: [
        "tree-flowering",
        "tree-birch",
        "tree-small",
        "flowers",
        "bush-berry",
        "clay-pot",
        "lantern-post",
        ...trees.filter((k) => k.includes("flowering") || k.includes("birch") || k.includes("orchard")),
        ...flowers.slice(0, 8),
        ...libKeys("riftling-").slice(0, 4),
      ],
      count: 26,
      radius: 64,
      salt: 4,
    },
    // Guild
    {
      cx: 52 * T,
      cy: 37 * T,
      keys: ["banner-pole", "bench", "lantern-post", "crate", ...lights.slice(0, 4), ...hardscape.slice(0, 4), ...libKeys("sign-").slice(0, 4)],
      count: 16,
      radius: 58,
      salt: 5,
    },
    // Training
    {
      cx: 43 * T,
      cy: 13 * T,
      keys: ["signpost", "barrel", "rock-moss", "banner-pole", ...libKeys("rock-", "sign-", "barrel-"), ...hardscape.slice(0, 3)],
      count: 14,
      radius: 48,
      salt: 6,
    },
    // Noble / archive
    {
      cx: 42 * T,
      cy: 20 * T,
      keys: [
        "lantern-post",
        "bench",
        "banner-pole",
        "flowers",
        "tree-birch",
        "tree-flowering",
        ...trees.filter((k) => k.includes("birch") || k.includes("maple") || k.includes("willow")),
        ...flowers.slice(0, 6),
      ],
      count: 18,
      radius: 44,
      salt: 11,
    },
    // Dock
    {
      cx: 27 * T,
      cy: 39 * T,
      keys: ["barrel", "crate", "signpost", "flowers", ...dockKit, ...libKeys("animal-").slice(0, 4)],
      count: 16,
      radius: 40,
      salt: 31,
    },
    // Farm
    {
      cx: 17 * T,
      cy: 41 * T,
      keys: [
        "tree-orchard",
        "bush-berry",
        "flowers",
        "rock-moss",
        "signpost",
        ...trees.filter((k) => k.includes("orchard") || k.includes("oak")),
        ...bushes,
        ...hardscape.filter((k) => k.includes("fence")),
        ...libKeys("fence-", "goods-").slice(0, 8),
      ],
      count: 22,
      radius: 42,
      salt: 32,
    },
    // Recovery gardens
    {
      cx: 42 * T,
      cy: 41 * T,
      keys: ["bench", "flowers", "lantern-post", "bush-berry", "tree-birch", "tree-flowering", ...flowers, ...bushes.slice(0, 6)],
      count: 18,
      radius: 40,
      salt: 10,
    },
    // Lantern grove park — dense canopy showcase
    {
      cx: 54 * T,
      cy: 19 * T,
      keys: [
        "tree-oak",
        "tree-pine",
        "tree-birch",
        "tree-flowering",
        "bush-berry",
        "rock-moss",
        "boulder",
        "flowers",
        "lantern-post",
        ...trees,
        ...bushes,
        ...flowers.slice(0, 10),
        ...lights,
      ],
      count: 38,
      radius: 72,
      salt: 7,
    },
    // Forest gate
    {
      cx: 56 * T,
      cy: 12 * T,
      keys: [
        "tree-pine",
        "tree-oak",
        "tree-rift",
        "rock-moss",
        "boulder",
        "bush-berry",
        ...trees,
        ...libKeys("rock-", "mushroom-"),
      ],
      count: 28,
      radius: 55,
      salt: 24,
    },
    // Outer woods
    {
      cx: 4 * T,
      cy: 4 * T,
      keys: [
        "tree-pine",
        "tree-oak",
        "tree-rift",
        "tree-birch",
        "rock-moss",
        "boulder",
        "ruin-arch",
        "bush-berry",
        ...trees,
        ...bushes,
      ],
      count: 34,
      radius: 70,
      salt: 8,
    },
    // Portal sanctum
    {
      cx: 32 * T,
      cy: 7 * T,
      keys: [
        "lantern-post",
        "rift-crystal",
        "flowers",
        "tree-rift",
        "tree-birch",
        ...trees.filter((k) => k.includes("rift") || k.includes("spirit") || k.includes("elder")),
        ...lights.filter((k) => k.includes("rift")),
        ...libKeys("mushroom-").slice(0, 4),
      ],
      count: 18,
      radius: 68,
      salt: 12,
    },
    // Secret garden
    {
      cx: 57 * T,
      cy: 28 * T,
      keys: ["tree-flowering", "tree-orchard", "tree-birch", "bush-berry", "flowers", ...trees.slice(0, 10), ...flowers, ...fauna.slice(0, 5)],
      count: 18,
      radius: 40,
      salt: 23,
    },
  ];
}

function pickPathTree(i: number, ax: number, ay: number): PropKey {
  const classic: PropKey[] = [
    "tree-oak",
    "tree-pine",
    "tree-birch",
    "tree-flowering",
    "tree-orchard",
    "tree-small",
  ];
  const libTrees = libKeys("tree-");
  const pool = hash2(i, ax, ay) < 0.55 && libTrees.length ? libTrees : classic;
  const idx = Math.floor(hash2(i, ax, ay + 3) * pool.length) % pool.length;
  return pool[idx]!;
}

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

  for (const d of districtAnchors(T)) {
    addRing(d.cx, d.cy, d.keys, d.count, d.radius, d.salt);
  }

  // Landmark singles
  out.push({ key: "rift-crystal", x: 31 * T + 16, y: 21 * T + 16, scale: 1.15 });
  out.push({ key: "campfire", x: 9 * T, y: 26 * T, scale: 0.95 });
  out.push({ key: "bridge", x: 26 * T, y: 39 * T, scale: 1.2 });
  out.push({ key: "watchtower", x: 48 * T, y: 11 * T, scale: 1.05 });
  out.push({ key: "watchtower", x: 14 * T, y: 9 * T, scale: 0.95 });
  out.push({ key: "watchtower", x: 55 * T, y: 34 * T, scale: 0.9 });
  out.push({ key: "bench", x: 30 * T, y: 37 * T, scale: 0.9 });
  out.push({ key: "flowers", x: 28 * T, y: 38 * T, scale: 0.75 });
  out.push({ key: "bush-berry", x: 24 * T, y: 40 * T, scale: 0.85 });
  out.push({ key: "lib-lantern-rift", x: 29 * T, y: 23 * T, scale: 0.9 });
  out.push({ key: "lib-mushroom-amber", x: 50 * T, y: 18 * T, scale: 0.8 });
  out.push({ key: "lib-fence-post", x: 16 * T, y: 40 * T, scale: 0.85 });

  // Picket yards — residential croft + farm plots (reference-style enclosed yards)
  const yardRects: { x0: number; y0: number; x1: number; y1: number; gate?: boolean }[] = [
    { x0: 5 * T, y0: 15 * T, x1: 12 * T, y1: 20 * T, gate: true },
    { x0: 14 * T, y0: 39 * T, x1: 21 * T, y1: 44 * T, gate: true },
    { x0: 3 * T, y0: 34 * T, x1: 9 * T, y1: 39 * T },
  ];
  for (const yard of yardRects) {
    const step = T * 0.55;
    for (let x = yard.x0; x <= yard.x1; x += step) {
      out.push({ key: "picket-fence", x, y: yard.y0, scale: 0.82 });
      out.push({ key: "picket-fence", x, y: yard.y1, scale: 0.82 });
    }
    for (let y = yard.y0 + step; y < yard.y1; y += step) {
      out.push({ key: "picket-fence", x: yard.x0, y, scale: 0.82 });
      out.push({ key: "picket-fence", x: yard.x1, y, scale: 0.82 });
    }
    out.push({ key: "yard-fence-corner", x: yard.x0, y: yard.y0, scale: 0.85 });
    out.push({ key: "yard-fence-corner", x: yard.x1, y: yard.y0, scale: 0.85 });
    out.push({ key: "yard-fence-corner", x: yard.x0, y: yard.y1, scale: 0.85 });
    out.push({ key: "yard-fence-corner", x: yard.x1, y: yard.y1, scale: 0.85 });
    if (yard.gate) {
      out.push({
        key: "picket-fence-gate",
        x: (yard.x0 + yard.x1) / 2,
        y: yard.y1,
        scale: 0.9,
      });
    }
  }

  // Yard critters (original IP — sparkmoths / mossbun kits, not farm animals)
  const critters: PropKey[] = ["critter-sparkmoth", "critter-mossbun-kit"];
  for (let i = 0; i < 10; i++) {
    out.push({
      key: critters[i % critters.length]!,
      x: 15 * T + hash2(i, 1, 80) * 6 * T,
      y: 40 * T + hash2(i, 2, 81) * 4 * T,
      scale: 0.7 + hash2(i, 3, 82) * 0.25,
    });
  }
  for (let i = 0; i < 6; i++) {
    out.push({
      key: critters[i % critters.length]!,
      x: 6 * T + hash2(i, 4, 83) * 5 * T,
      y: 16 * T + hash2(i, 5, 84) * 3 * T,
      scale: 0.72,
    });
  }

  // Cozy village clutter — fences, pots, barrels, benches, flower patches, ambient Riftlings
  const cozyKeys: PropKey[] = [
    "bench",
    "barrel",
    "crate",
    "flowers",
    "bush-berry",
    "clay-pot",
    "pot-cluster",
    "boulder",
    "rock-moss",
    "lantern-post",
    "signpost",
    "lib-fence-post",
    "picket-fence",
    "stump",
    "ambient-riftling-sparklet",
    "ambient-riftling-mossbun",
    "ambient-riftling-emberpup",
    "ambient-riftling-frostnip",
    "ambient-riftling-tideling",
    "ambient-riftling-stoneling",
    "ambient-riftling-stormkit",
    "ambient-riftling-spiritwisp",
    "ambient-riftling-voidling",
    "ambient-riftling-alloybit",
    "ambient-riftling-radiantpup",
    "critter-sparkmoth",
    "critter-mossbun-kit",
    ...libKeys("fence-", "barrel-", "crate-", "flower-", "furniture-", "goods-", "rock-", "bush-").slice(
      0,
      32,
    ),
  ];
  const cozyHubs = [
    { x: 8 * T, y: 18 * T, r: 36, n: 18 },
    { x: 14 * T, y: 38 * T, r: 34, n: 18 },
    { x: 18 * T, y: 42 * T, r: 30, n: 16 },
    { x: 28 * T, y: 26 * T, r: 40, n: 18 },
    { x: 48 * T, y: 36 * T, r: 32, n: 16 },
    { x: 10 * T, y: 10 * T, r: 28, n: 16 },
    { x: 22 * T, y: 20 * T, r: 26, n: 14 },
    { x: 36 * T, y: 30 * T, r: 28, n: 14 },
    { x: 8 * T, y: 36 * T, r: 28, n: 16 },
    { x: 30 * T, y: 40 * T, r: 32, n: 14 },
    { x: 44 * T, y: 22 * T, r: 30, n: 14 },
  ];
  for (const hub of cozyHubs) {
    for (let i = 0; i < hub.n; i++) {
      const a = (i / hub.n) * Math.PI * 2 + hash2(hub.x, hub.y, 70 + i) * 0.5;
      const rad = hub.r * (0.4 + hash2(i, hub.x, 71) * 0.6);
      out.push({
        key: cozyKeys[(i + Math.floor(hub.x)) % cozyKeys.length]!,
        x: hub.x + Math.cos(a) * rad,
        y: hub.y + Math.sin(a) * rad,
        scale: 0.72 + hash2(i, hub.y, 72) * 0.28,
      });
    }
  }

  // Market stall cluster — striped awning feel near exchange
  for (let i = 0; i < 6; i++) {
    out.push({
      key: "market-stall",
      x: 6 * T + (i % 3) * 2.2 * T,
      y: 36 * T + Math.floor(i / 3) * 2.4 * T,
      scale: 0.95,
    });
  }

  // Spread unique library variety across Commons so many pack keys appear in-world
  const variety = LIBRARY_WORLD_KEYS as unknown as PropKey[];
  const hubs = [
    { x: 31 * T, y: 22 * T, r: 110 },
    { x: 9 * T, y: 36 * T, r: 70 },
    { x: 54 * T, y: 19 * T, r: 80 },
    { x: 17 * T, y: 41 * T, r: 50 },
    { x: 7 * T, y: 16 * T, r: 48 },
    { x: 27 * T, y: 39 * T, r: 45 },
  ];
  for (let i = 0; i < variety.length; i++) {
    const hub = hubs[i % hubs.length]!;
    const a = hash2(i, hub.x, 40) * Math.PI * 2;
    const rad = hub.r * (0.35 + hash2(i, hub.y, 41) * 0.65);
    out.push({
      key: variety[i]!,
      x: hub.x + Math.cos(a) * rad,
      y: hub.y + Math.sin(a) * rad,
      scale: 0.75 + hash2(i, 42) * 0.4,
    });
  }

  const pathFlowers = libKeys("flower-", "mushroom-", "bush-");
  const pathGoods = libKeys("barrel-", "crate-", "goods-", "lantern-");

  const pathFences = libKeys("fence-");

  // Alley clutter along pathways — denser lived-in street details
  const pathClutter: PropKey[] = [
    "clay-pot",
    "pot-cluster",
    "boulder",
    "bush-berry",
    "rock-moss",
    "signpost",
  ];
  for (const path of blueprint.pathways) {
    for (let i = 0; i < path.waypoints.length - 1; i++) {
      const a = path.waypoints[i]!;
      const b = path.waypoints[i + 1]!;
      if (hash2(a.x, a.y, i) < 0.92) {
        const roll = hash2(b.x, b.y, i);
        out.push({
          key:
            roll < 0.28
              ? pickLib(pathFlowers, i, 3)
              : roll < 0.42
                ? pickLib(libKeys("rock-"), i, 5)
                : roll < 0.58
                  ? pickLib(pathGoods, i, 6)
                  : roll < 0.7
                    ? pickLib(pathFences, i, 7) || "lib-fence-post"
                    : pathClutter[Math.floor(hash2(i, a.x, 8) * pathClutter.length) % pathClutter.length]!,
          x: (a.x + b.x) / 2 + (hash2(i, a.x) - 0.5) * 28,
          y: (a.y + b.y) / 2 + (hash2(i, a.y) - 0.5) * 28,
          scale: 0.7,
        });
      }
      if (hash2(a.x, b.y, 99) < 0.38) {
        out.push({
          key: pickLib(libKeys("sign-"), i, 8) || "signpost",
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2 - 18,
          scale: 0.85,
        });
      }
      if (hash2(b.x, a.y, 17) < 0.32) {
        out.push({
          key: pickLib(libKeys("lantern-"), i, 9) || "lantern-post",
          x: (a.x + b.x) / 2 + (hash2(i, 8) - 0.5) * 24,
          y: (a.y + b.y) / 2 + (hash2(i, 9) - 0.5) * 24,
          scale: 0.8,
        });
      }
      if (hash2(b.x, a.y, 18) < 0.2) {
        out.push({
          key: "bench",
          x: (a.x + b.x) / 2 + (hash2(i, 11) - 0.5) * 20,
          y: (a.y + b.y) / 2 + (hash2(i, 12) - 0.5) * 20,
          scale: 0.78,
        });
      }
      if (hash2(b.x, a.y, 17) < 0.28) {
        out.push({
          key: pickPathTree(i, a.x, a.y),
          x: (a.x + b.x) / 2 + (hash2(i, 5) - 0.5) * 40,
          y: (a.y + b.y) / 2 + (hash2(i, 6) - 0.5) * 40,
          scale: 0.8 + hash2(i, 7) * 0.25,
        });
      }
    }
  }

  return out;
}

function isLandmarkKey(key: string): boolean {
  return (
    key === "watchtower" ||
    key === "bridge" ||
    key === "rift-crystal" ||
    key === "campfire" ||
    key === "lantern-post" ||
    key.startsWith("lw-lantern-") ||
    key.startsWith("lw-gate-") ||
    key.startsWith("lw-bridge-")
  );
}

/** Soft LOD: drop scatter when performance mode requests fewer props. */
export function filterScatterForBudget(
  specs: ScatterSpec[],
  budget: "full" | "medium" | "low",
): ScatterSpec[] {
  if (budget === "full") return specs;
  if (budget === "medium") {
    return specs.filter((s, i) => i % 2 === 0 || isLandmarkKey(s.key));
  }
  return specs.filter((s, i) => i % 4 === 0 || isLandmarkKey(s.key));
}
