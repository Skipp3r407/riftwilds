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
      // Soft oversize + tiny jitter — painterly blend over hard pixel grid.
      // Autotile edge/corner tiles stay aligned so shores read seamless.
      const isSeam =
        key.includes("edge") || key.includes("corner") || key.includes("bloom");
      const jx = isSeam ? 0 : (hash2(col, row, 7) - 0.5) * 0.9;
      const jy = isSeam ? 0 : (hash2(col, row, 11) - 0.5) * 0.9;
      const x = col * T + T / 2 + jx;
      const y = row * T + T / 2 - elev * ELEV_PX + jy;
      const oversize = blendEdges ? (isSeam ? 1.6 : 3.6) : 1;

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
      // Soft regional lighting wash — less per-tile flicker for hand-painted read
      const patchShade = hash2(Math.floor(col / 5), Math.floor(row / 5), 1);
      const shade = 0.97 + elev * 0.025 + patchShade * 0.035;
      const warm = kind === "water" ? 0.95 : 1.03;
      img.setTint(
        Phaser.Display.Color.GetColor(
          Math.min(255, Math.floor(248 * shade * (kind === "water" ? 0.88 : warm))),
          Math.min(255, Math.floor(252 * shade)),
          Math.min(255, Math.floor(222 * shade * (kind === "water" ? 1.14 : 0.92))),
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

      // Soft foam / lily sparkle on water shores + open water glitter
      if (blendEdges && kind === "water") {
        if (isSeam && hash2(col, row, 41) > 0.45) {
          const foam = scene.add.ellipse(
            x + (hash2(col, row, 42) - 0.5) * 8,
            y + (hash2(col, row, 43) - 0.5) * 6,
            4 + hash2(col, row, 44) * 5,
            2 + hash2(col, row, 45) * 3,
            0xe8f8ff,
            0.4,
          );
          foam.setDepth(depthAt(DEPTH.groundDecal, y, 0.03));
          group.add(foam);
        }
        if (hash2(col, row, 46) > 0.72) {
          const spark = scene.add.circle(
            x + (hash2(col, row, 47) - 0.5) * 10,
            y + (hash2(col, row, 48) - 0.5) * 8,
            1.2 + hash2(col, row, 49) * 1.4,
            0xf0fbff,
            0.55,
          );
          spark.setDepth(depthAt(DEPTH.groundDecal, y, 0.04));
          spark.setBlendMode(Phaser.BlendModes.ADD);
          scene.tweens.add({
            targets: spark,
            alpha: { from: 0.2, to: 0.75 },
            duration: 900 + hash2(col, row, 50) * 700,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
          group.add(spark);
        }
      }

      // Grass→trail fringe from the meadow side (softens square dirt edges)
      if (
        blendEdges &&
        kind === "ground" &&
        neighborDiffers(grid, row, col, kind)
      ) {
        const fringe = scene.add.ellipse(
          x + (hash2(col, row, 60) - 0.5) * 6,
          y + (hash2(col, row, 61) - 0.5) * 5,
          T * (0.7 + hash2(col, row, 62) * 0.25),
          T * (0.38 + hash2(col, row, 63) * 0.18),
          0x4a8a42,
          0.22,
        );
        fringe.setDepth(depthAt(DEPTH.groundDecal, y, 0.015));
        group.add(fringe);
        if (hash2(col, row, 64) > 0.55) {
          const dirtNibble = scene.add.ellipse(
            x + (hash2(col, row, 65) - 0.5) * 8,
            y + (hash2(col, row, 66) - 0.5) * 6,
            8 + hash2(col, row, 67) * 6,
            4 + hash2(col, row, 68) * 3,
            0xc4a070,
            0.14,
          );
          dirtNibble.setDepth(depthAt(DEPTH.groundDecal, y, 0.016));
          group.add(dirtNibble);
        }
      }

      // Lived-in meadow clutter — tufts + petals (classic outdoor density)
      if (
        blendEdges &&
        kind === "ground" &&
        hash2(col, row, 13) > 0.7 &&
        !neighborDiffers(grid, row, col, kind)
      ) {
        const speck = scene.add.ellipse(
          x + (hash2(col, row, 17) - 0.5) * 10,
          y + (hash2(col, row, 19) - 0.5) * 8,
          6 + hash2(col, row, 21) * 8,
          3.5 + hash2(col, row, 23) * 4,
          0x3f7a38,
          0.18,
        );
        speck.setDepth(depthAt(DEPTH.groundDecal, y, 0.01));
        group.add(speck);
        if (hash2(col, row, 27) > 0.76) {
          const petal = scene.add.circle(
            x + (hash2(col, row, 29) - 0.5) * 12,
            y + (hash2(col, row, 31) - 0.5) * 10,
            1.8 + hash2(col, row, 33) * 1.5,
            hash2(col, row, 35) > 0.5 ? 0xe8a0c0 : 0xffe566,
            0.8,
          );
          petal.setDepth(depthAt(DEPTH.groundDecal, y, 0.02));
          group.add(petal);
        }
      }

      // Soft directional ground shadow for rises / tree-adjacent ground
      if (elev >= 2 || (kind === "ground" && hash2(col, row, 51) > 0.91)) {
        const shadow = scene.add.ellipse(
          x + 4,
          y + T * 0.38,
          T * (elev >= 2 ? 0.9 : 0.55),
          T * (elev >= 2 ? 0.38 : 0.22),
          0x000000,
          elev >= 2 ? 0.2 : 0.1,
        );
        shadow.setDepth(depthAt(DEPTH.groundShadow, y, -0.05));
        group.add(shadow);
      }
    }
  }

  // Atmospheric fog wash — soft vignette so the map reads deeper, less tiled
  if (blendEdges) {
    const fog = scene.add.rectangle(
      blueprint.camera.width / 2,
      blueprint.camera.height / 2,
      blueprint.camera.width * 1.15,
      blueprint.camera.height * 1.15,
      0x1a2430,
      0.08,
    );
    fog.setDepth(depthAt(DEPTH.groundDecal, blueprint.camera.height, 0.5));
    group.add(fog);
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
