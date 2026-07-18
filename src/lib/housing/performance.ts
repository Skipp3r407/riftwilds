/**
 * Housing performance stubs — nearby load, LOD, interest management.
 * Full streaming lands with Live World multiplayer instances.
 */

import { nearbyFurniture } from "@/lib/housing/build-mode";
import type { PlayerHome, PlacedFurniture } from "@/lib/housing/types";

export type FurnitureLodBand = "near" | "mid" | "far" | "culled";

export function classifyFurnitureLod(
  dx: number,
  dy: number,
): FurnitureLodBand {
  const d2 = dx * dx + dy * dy;
  if (d2 < 128 * 128) return "near";
  if (d2 < 320 * 320) return "mid";
  if (d2 < 640 * 640) return "far";
  return "culled";
}

/** Load only furniture near the avatar — Phase 1 interest management. */
export function loadNearbyFurnitureBucket(params: {
  home: PlayerHome;
  roomKey: string;
  cx: number;
  cy: number;
  radius?: number;
}): {
  visible: PlacedFurniture[];
  lod: { instanceId: string; band: FurnitureLodBand }[];
  culledCount: number;
} {
  const radius = params.radius ?? 384;
  const nearby = nearbyFurniture(params.home, params.roomKey, params.cx, params.cy, radius);
  const room = params.home.rooms.find((r) => r.roomKey === params.roomKey);
  const all = room?.furniture ?? [];
  const lod = nearby.map((f) => ({
    instanceId: f.instanceId,
    band: classifyFurnitureLod(f.x - params.cx, f.y - params.cy),
  }));
  return {
    visible: nearby.filter((_, i) => lod[i]?.band !== "culled"),
    lod,
    culledCount: Math.max(0, all.length - nearby.length),
  };
}

export const HOUSING_PERF_BUDGETS = {
  maxFurniturePerRoomHot: 80,
  maxParticlesInterior: 24,
  nearbyRadiusPx: 384,
  exteriorSharedInterestRadiusPx: 512,
  note: "Private interiors isolate cost; shared neighborhood exteriors use interest management.",
} as const;
