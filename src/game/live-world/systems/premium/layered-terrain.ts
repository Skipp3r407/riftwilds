/**
 * Premium layered terrain drawing (Phaser). Pure logic lives in premium-logic.ts.
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

export { buildElevationGrid, resolveTerrainTexture, type ElevationGrid };

export type PremiumTerrainResult = {
  grid: TerrainGrid;
  elevation: ElevationGrid;
  tileLayer: Phaser.GameObjects.Group;
};

export function drawPremiumTerrain(
  scene: Phaser.Scene,
  blueprint: MapBlueprint,
  fallbackKey: (kind: TerrainCellKind) => string,
): PremiumTerrainResult {
  const grid = paintTerrainGrid(blueprint);
  const elevation = buildElevationGrid(blueprint);
  const T = grid.tileSize;
  const group = scene.add.group();
  const ELEV_PX = 5;

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const kind = grid.cells[row]![col]!;
      const elev = elevation.heights[row]![col]!;
      const texKey = terrainTex(resolveTerrainTexture(kind, col, row, blueprint));
      const key = scene.textures.exists(texKey) ? texKey : fallbackKey(kind);
      const x = col * T + T / 2;
      const y = row * T + T / 2 - elev * ELEV_PX;

      if (elev >= 2) {
        const face = scene.add.rectangle(
          x,
          y + T * 0.42,
          T,
          6 + elev * 2,
          0x4a3a28,
          0.58,
        );
        face.setDepth(0.2);
        group.add(face);
      }

      const img = scene.add.image(x, y, key).setDisplaySize(T + 1, T + 1);
      img.setDepth(0.5 + elev * 0.05);
      // Warm meadow tint bias (gold-green) — Ultima outdoors, not grey tech
      const shade = 0.88 + elev * 0.04 + hash2(col, row, 1) * 0.08;
      const warm = kind === "water" ? 0.92 : 1;
      img.setTint(
        Phaser.Display.Color.GetColor(
          Math.min(255, Math.floor(228 * shade * warm)),
          Math.min(255, Math.floor(238 * shade)),
          Math.min(255, Math.floor(210 * shade * (kind === "water" ? 1.08 : 0.96))),
        ),
      );
      group.add(img);

      if (elev >= 2) {
        const shadow = scene.add.ellipse(
          x + 3,
          y + T * 0.35,
          T * 0.85,
          T * 0.35,
          0x000000,
          0.18,
        );
        shadow.setDepth(0.3);
        group.add(shadow);
      }
    }
  }

  for (const path of blueprint.pathways) {
    const g = scene.add.graphics();
    g.lineStyle(14, 0xc4a574, 0.28);
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
    g.setDepth(1);
    group.add(g);
  }

  return { grid, elevation, tileLayer: group };
}
