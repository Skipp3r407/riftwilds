/**
 * Deterministic terrain language for blueprint maps.
 * Roads follow pathways; water/lava/cliffs from colliders; zones tint ground.
 */

import type {
  CollisionRect,
  MapBlueprint,
  MapZone,
  PathwayDef,
} from "@/game/world-maps/types";

export type TerrainCellKind =
  | "ground"
  | "path"
  | "safe"
  | "water"
  | "lava"
  | "cliff"
  | "hazard"
  | "accent"
  | "danger"
  | "settlement";

export type TerrainGrid = {
  cols: number;
  rows: number;
  tileSize: number;
  cells: TerrainCellKind[][];
};

function inRect(
  x: number,
  y: number,
  r: { x: number; y: number; width: number; height: number },
): boolean {
  return x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height;
}

function nearPolyline(
  x: number,
  y: number,
  path: PathwayDef,
  radius: number,
): boolean {
  const pts = path.waypoints;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1;
    let t = ((x - a.x) * dx + (y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    if (Math.hypot(x - px, y - py) <= radius) return true;
  }
  return false;
}

export function paintTerrainGrid(blueprint: MapBlueprint): TerrainGrid {
  const { cols, rows, tileSize: T, pathways, zones, colliders, safeZones } = blueprint;
  const cells: TerrainCellKind[][] = [];

  for (let row = 0; row < rows; row++) {
    const line: TerrainCellKind[] = [];
    for (let col = 0; col < cols; col++) {
      const x = col * T + T / 2;
      const y = row * T + T / 2;
      let kind: TerrainCellKind = "ground";

      const zone = zones.find((z) => inRect(x, y, z));
      if (zone) {
        kind = zoneKindToTerrain(zone);
      }

      const inSafe = safeZones.some((z) => inRect(x, y, z));
      if (inSafe && (kind === "ground" || kind === "danger")) {
        kind = col % 2 === row % 2 ? "accent" : "safe";
      }

      for (const path of pathways) {
        if (nearPolyline(x, y, path, T * 0.85)) {
          kind = "path";
          break;
        }
      }

      for (const c of colliders) {
        if (!inRect(x, y, c)) continue;
        if (c.kind === "water" || c.kind === "deep_water" || c.kind === "shallow_water") {
          kind = "water";
        } else if (c.kind === "lava") kind = "lava";
        else if (c.kind === "cliff" || c.kind === "blocker" || c.kind === "seal") {
          kind = "cliff";
        } else if (c.kind === "hazard") kind = "hazard";
        else if (c.kind === "wall" || c.kind === "building") {
          /* buildings drawn separately */
        }
      }

      line.push(kind);
    }
    cells.push(line);
  }

  return { cols, rows, tileSize: T, cells };
}

function zoneKindToTerrain(zone: MapZone): TerrainCellKind {
  switch (zone.kind) {
    case "safe":
    case "settlement":
      return "settlement";
    case "danger":
    case "boss":
      return "danger";
    case "pathway":
      return "path";
    default:
      return "ground";
  }
}

export function terrainColor(
  kind: TerrainCellKind,
  palette: {
    ground: number;
    path: number;
    accent: number;
    hazard?: number;
    water?: number;
  },
): number {
  switch (kind) {
    case "path":
      return palette.path;
    case "safe":
    case "accent":
    case "settlement":
      return palette.accent;
    case "water":
      return palette.water ?? 0x46aad8;
    case "lava":
      return palette.hazard ?? 0xff5a1f;
    case "cliff":
      return 0x3a3a48;
    case "hazard":
      return palette.hazard ?? 0xaa4422;
    case "danger":
      return mixColor(palette.ground, palette.hazard ?? 0x662222, 0.35);
    default:
      return palette.ground;
  }
}

function mixColor(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

/** Extra landmark scatter for regions that only have sparse factory objects. */
export function landmarkScatterSeed(regionSlug: string, cols: number, rows: number): {
  col: number;
  row: number;
  label: string;
  color: number;
}[] {
  const seeds: Record<string, { col: number; row: number; label: string; color: number }[]> = {
    "riftwild-commons": [
      { col: 32, row: 22, label: "Riftstone", color: 0x3de7ff },
      { col: 26, row: 40, label: "Moon Pond", color: 0x4aa0ff },
      { col: 50, row: 20, label: "Feeding Grove", color: 0x4adf7a },
    ],
    "ember-crater": [
      { col: 24, row: 16, label: "Lava Bridge", color: 0xff5a1f },
      { col: 40, row: 10, label: "Crystal Fields", color: 0xff8844 },
      { col: 26, row: 28, label: "Molten Forge", color: 0xd48a3a },
    ],
    "moonwater-coast": [
      { col: 28, row: 32, label: "Moonlit Beach", color: 0xc4b896 },
      { col: 6, row: 34, label: "Lighthouse", color: 0xe8d080 },
      { col: 42, row: 22, label: "Sea Caves", color: 0x3a8fd4 },
    ],
    "elderwood-forest": [
      { col: 18, row: 22, label: "Ancient Grove", color: 0x4adf7a },
      { col: 38, row: 8, label: "Farm Clearing", color: 0x6a9040 },
      { col: 8, row: 36, label: "Spirit Glade", color: 0xa0e0c0 },
    ],
    "stormspire-peaks": [
      { col: 20, row: 20, label: "Cliff Path", color: 0x7ec8ff },
      { col: 38, row: 12, label: "Lightning Spire", color: 0xaad4ff },
    ],
    "stoneheart-canyon": [
      { col: 22, row: 18, label: "Excavation", color: 0xc4a06a },
      { col: 34, row: 24, label: "Ruin Arch", color: 0x8a7060 },
    ],
    "frostveil-basin": [
      { col: 20, row: 16, label: "Ice Shelf", color: 0xb0d8ff },
      { col: 32, row: 28, label: "Aurora Pool", color: 0x80c0e0 },
    ],
    "radiant-citadel": [
      { col: 24, row: 18, label: "Sun Plaza", color: 0xffd060 },
      { col: 36, row: 22, label: "Mirror Hall", color: 0xffe8a0 },
    ],
    "void-hollow": [
      { col: 22, row: 20, label: "Rift Maw", color: 0x6a40a0 },
      { col: 34, row: 28, label: "Null Obelisk", color: 0x402060 },
    ],
    "alloy-ruins": [
      { col: 20, row: 16, label: "Gear Court", color: 0xa0a8b0 },
      { col: 32, row: 24, label: "Spark Foundry", color: 0xd0a040 },
    ],
    "spirit-marsh": [
      { col: 18, row: 20, label: "Will-o Path", color: 0x60c090 },
      { col: 30, row: 28, label: "Reed Shrine", color: 0x80e0b0 },
    ],
    "celestial-rift": [
      { col: 22, row: 12, label: "Starfall Field", color: 0x9b7bff },
      { col: 10, row: 22, label: "Observatory", color: 0xffd060 },
    ],
  };
  return (seeds[regionSlug] ?? []).filter(
    (s) => s.col < cols && s.row < rows,
  );
}
