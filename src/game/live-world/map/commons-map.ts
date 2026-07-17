/**
 * Legacy re-exports for Commons — prefer world-maps blueprints.
 * Kept so older imports keep working during the Live World expansion.
 */

import { getBlueprint } from "@/game/world-maps/blueprints";
import { TILE as BP_TILE } from "@/game/world-maps/blueprint-helpers";

export const TILE = BP_TILE;

const bp = () => getBlueprint("riftwild-commons");

export const MAP_COLS = 64;
export const MAP_ROWS = 48;
export const MAP_WIDTH = MAP_COLS * TILE;
export const MAP_HEIGHT = MAP_ROWS * TILE;

export type BuildingMarker = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: number;
};

export type NpcDef = {
  id: string;
  name: string;
  x: number;
  y: number;
  lines: string[];
};

export function getCommonsColliders() {
  return bp().colliders.map((c) => ({
    x: c.x,
    y: c.y,
    w: c.width,
    h: c.height,
  }));
}

export function getCommonsBuildings(): BuildingMarker[] {
  return bp()
    .objects.filter((o) => o.type === "building")
    .map((o) => ({
      id: o.id,
      label: o.label ?? o.id,
      x: o.x,
      y: o.y,
      w: o.width ?? 64,
      h: o.height ?? 64,
      color: o.color ?? 0x6688aa,
    }));
}

export function getCommonsNpcs(): NpcDef[] {
  return bp()
    .objects.filter((o) => o.type === "npc")
    .map((o) => ({
      id: o.id,
      name: o.label ?? o.id,
      x: o.x,
      y: o.y,
      lines: (o.metadata?.lines as string[]) ?? [],
    }));
}

/** @deprecated use getCommonsColliders() */
export const COLLIDERS = getCommonsColliders();
/** @deprecated use getCommonsBuildings() */
export const BUILDINGS = getCommonsBuildings();
/** @deprecated use getCommonsNpcs() */
export const NPCS = getCommonsNpcs();

export const PLAZA_BOUNDS = {
  x: 18 * TILE,
  y: 14 * TILE,
  w: 28 * TILE,
  h: 16 * TILE,
};
