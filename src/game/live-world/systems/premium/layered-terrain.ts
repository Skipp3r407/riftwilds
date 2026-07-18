/**
 * Premium layered terrain drawing (Phaser). Pure logic lives in premium-logic.ts.
 * Soft edge blends + path bloom reduce obvious square-grid tiling.
 */

import * as Phaser from "phaser";
import type { MapBlueprint } from "@/game/world-maps/types";
import {
  paintTerrainGrid,
  type TerrainCellKind,
  type TerrainGrid,
} from "@/game/live-world/systems/terrain-paint";
import { terrainTex } from "@/game/live-world/systems/premium/asset-keys";
import {
  buildElevationGrid,
  hash2,
  resolveTerrainTexture,
  type ElevationGrid,
} from "@/game/live-world/systems/premium/premium-logic";
import { DEPTH, depthAt } from "@/game/live-world/systems/premium/depth-layers";

export { buildElevationGrid, resolveTerrainTexture, type ElevationGrid };

export type PremiumTerrainResult = {
  grid: TerrainGrid;
  elevation: ElevationGrid;
  tileLayer: Phaser.GameObjects.Group;
};

function neighborDiffers(
  grid: TerrainGrid,
  row: number,
  col: number,
  kind: TerrainCellKind,
): boolean {
  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ] as const;
  for (const [dr, dc] of dirs) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || c < 0 || r >= grid.rows || c >= grid.cols) continue;
    if (grid.cells[r]![c] !== kind) return true;
  }
  return false;
}

export function drawPremiumTerrain(
  scene: Phaser.Scene,
  blueprint: MapBlueprint,
  fallbackKey: (kind: TerrainCellKind) => string,
  opts?: { blendEdges?: boolean },
): PremiumTerrainResult {
  const blendEdges = opts?.blendEdges !== false;
  const grid = paintTerrainGrid(blueprint);
  const elevation = buildElevationGrid(blueprint);
  const T = grid.tileSize;
  const group = scene.add.group();
  const ELEV_PX = 5;

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const kind = grid.cells[row]![col]!;
      const elev = elevation.heights[row]![col]!;
      const texKey = terrainTex(resolveTerrainTexture(kind, col, row, blueprint, grid));
      const key = scene.textures.exists(texKey) ? texKey : fallbackKey(kind);
      // Sub-pixel jitter + slight oversize softens hard tile seams.
      // Autotile edge/corner tiles stay aligned (less jitter) so shores read seamless.
      const isSeam =
        key.includes("edge") || key.includes("corner") || key.includes("bloom");
      const jx = isSeam ? 0 : (hash2(col, row, 7) - 0.5) * 1.6;
      const jy = isSeam ? 0 : (hash2(col, row, 11) - 0.5) * 1.6;
      const x = col * T + T / 2 + jx;
      const y = row * T + T / 2 - elev * ELEV_PX + jy;
      const oversize = blendEdges ? (isSeam ? 1.2 : 2.4) : 1;

      if (elev >= 2) {
        const face = scene.add.rectangle(
          x,
          y + T * 0.42,
          T,
          6 + elev * 2,
          0x8a6a48,
          0.4,
        );
        face.setDepth(depthAt(DEPTH.elevFace, y));
        group.add(face);
      }

      const img = scene.add.image(x, y, key).setDisplaySize(T + oversize, T + oversize);
      img.setDepth(depthAt(DEPTH.ground, y, elev * 0.05));
      // Bright cozy meadow tint — lush greens / warm paths / soft water (not grey tech)
      const shade = 0.96 + elev * 0.03 + hash2(col, row, 1) * 0.06;
      const warm = kind === "water" ? 0.95 : 1.04;
      img.setTint(
        Phaser.Display.Color.GetColor(
          Math.min(255, Math.floor(245 * shade * (kind === "water" ? 0.88 : warm))),
          Math.min(255, Math.floor(250 * shade)),
          Math.min(255, Math.floor(220 * shade * (kind === "water" ? 1.14 : 0.9))),
        ),
      );
      group.add(img);

      // Edge bloom only when no dedicated autotile seam texture is in use.
      if (
        blendEdges &&
        !isSeam &&
        (kind === "path" || kind === "safe" || kind === "settlement" || kind === "accent") &&
        neighborDiffers(grid, row, col, kind)
      ) {
        const bloom = scene.add.ellipse(
          x,
          y,
          T * (0.95 + hash2(col, row, 3) * 0.2),
          T * (0.55 + hash2(col, row, 5) * 0.15),
          0xd4b888,
          0.18 + hash2(col, row, 9) * 0.1,
        );
        bloom.setDepth(depthAt(DEPTH.groundDecal, y));
        group.add(bloom);
      }

      // Soft foam / lily sparkle on water shores
      if (blendEdges && kind === "water" && isSeam && hash2(col, row, 41) > 0.55) {
        const foam = scene.add.ellipse(
          x + (hash2(col, row, 42) - 0.5) * 8,
          y + (hash2(col, row, 43) - 0.5) * 6,
          4 + hash2(col, row, 44) * 5,
          2 + hash2(col, row, 45) * 3,
          0xe8f8ff,
          0.35,
        );
        foam.setDepth(depthAt(DEPTH.groundDecal, y, 0.03));
        group.add(foam);
      }

      // Lived-in meadow clutter — grass tufts + tiny flower dots on open ground.
      if (
        blendEdges &&
        kind === "ground" &&
        hash2(col, row, 13) > 0.62 &&
        !neighborDiffers(grid, row, col, kind)
      ) {
        const speck = scene.add.ellipse(
          x + (hash2(col, row, 17) - 0.5) * 10,
          y + (hash2(col, row, 19) - 0.5) * 8,
          5 + hash2(col, row, 21) * 7,
          3 + hash2(col, row, 23) * 4,
          0x3f7a38,
          0.2,
        );
        speck.setDepth(depthAt(DEPTH.groundDecal, y, 0.01));
        group.add(speck);
        if (hash2(col, row, 27) > 0.72) {
          const petal = scene.add.circle(
            x + (hash2(col, row, 29) - 0.5) * 12,
            y + (hash2(col, row, 31) - 0.5) * 10,
            1.6 + hash2(col, row, 33) * 1.4,
            hash2(col, row, 35) > 0.5 ? 0xe8a0c0 : 0xffe566,
            0.85,
          );
          petal.setDepth(depthAt(DEPTH.groundDecal, y, 0.02));
          group.add(petal);
        }
      }

      if (elev >= 2) {
        const shadow = scene.add.ellipse(
          x + 3,
          y + T * 0.35,
          T * 0.85,
          T * 0.35,
          0x000000,
          0.18,
        );
        shadow.setDepth(depthAt(DEPTH.groundShadow, y, -0.05));
        group.add(shadow);
      }
    }
  }

  for (const path of blueprint.pathways) {
    const g = scene.add.graphics();
    // Soft outer shoulder then warmer cobble stroke.
    g.lineStyle(22, 0x6bb05a, 0.16);
    const pts = path.waypoints;
    if (pts.length >= 2) {
      g.beginPath();
      g.moveTo(pts[0]!.x, pts[0]!.y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]!;
        const cur = pts[i]!;
        const mx = (prev.x + cur.x) / 2;
        const my = (prev.y + cur.y) / 2;
        g.lineTo(mx, my);
        g.lineTo(cur.x, cur.y);
      }
      g.strokePath();
    }
    g.lineStyle(14, 0xd4b888, 0.38);
    if (pts.length >= 2) {
      g.beginPath();
      g.moveTo(pts[0]!.x, pts[0]!.y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]!;
        const cur = pts[i]!;
        const mx = (prev.x + cur.x) / 2;
        const my = (prev.y + cur.y) / 2;
        g.lineTo(mx, my);
        g.lineTo(cur.x, cur.y);
      }
      g.strokePath();
    }
    g.setDepth(depthAt(DEPTH.pathPaint, 0));
    group.add(g);
  }

  return { grid, elevation, tileLayer: group };
}
