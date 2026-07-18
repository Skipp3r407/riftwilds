import type {
  CollisionRect,
  MapBlueprint,
  MapZone,
  MinimapMeta,
  PathwayDef,
  WorldMapObject,
} from "@/game/world-maps/types";
import { PORTALS_FROM_REGION } from "@/game/world-maps/defs/portals";
import { NPC_BY_ID as CONTENT_NPC_BY_ID } from "@/content/npcs";
import { NPC_BY_ID } from "@/game/world-maps/defs/npcs";
import type { RegionIdentity } from "@/game/world-maps/types";
import { transitionZonesFromPortals } from "@/game/world-maps/boundaries/transition-zones";

export const TILE = 32;

export function mapSize(cols: number, rows: number) {
  return { cols, rows, width: cols * TILE, height: rows * TILE };
}

export function borderColliders(
  regionId: string,
  cols: number,
  rows: number,
): CollisionRect[] {
  const w = cols * TILE;
  const h = rows * TILE;
  return [
    { id: `${regionId}-wall-n`, x: 0, y: 0, width: w, height: TILE, kind: "wall" },
    {
      id: `${regionId}-wall-s`,
      x: 0,
      y: h - TILE,
      width: w,
      height: TILE,
      kind: "wall",
    },
    { id: `${regionId}-wall-w`, x: 0, y: 0, width: TILE, height: h, kind: "wall" },
    {
      id: `${regionId}-wall-e`,
      x: w - TILE,
      y: 0,
      width: TILE,
      height: h,
      kind: "wall",
    },
  ];
}

export function obj(
  partial: Omit<WorldMapObject, "regionId" | "sceneId"> & {
    regionId?: string;
    sceneId?: string;
  },
  region: RegionIdentity,
): WorldMapObject {
  return {
    regionId: region.id,
    sceneId: region.sceneKey,
    interactive: partial.interactive ?? false,
    collision: partial.collision ?? false,
    ...partial,
  };
}

export function building(
  region: RegionIdentity,
  id: string,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
): { object: WorldMapObject; collider: CollisionRect } {
  return {
    object: obj(
      {
        id,
        type: "building",
        x,
        y,
        width: w,
        height: h,
        collision: true,
        interactive: true,
        interactionRadius: 48,
        label,
        color,
        metadata: { entrance: "south" },
      },
      region,
    ),
    collider: {
      id: `${id}-col`,
      x,
      y,
      width: w,
      height: h,
      kind: "building",
    },
  };
}

export function npcAt(
  region: RegionIdentity,
  npcId: string,
  x: number,
  y: number,
): WorldMapObject {
  const cat = NPC_BY_ID[npcId];
  const content = CONTENT_NPC_BY_ID[npcId];
  return obj(
    {
      id: `npc-${npcId}`,
      type: "npc",
      x,
      y,
      interactive: true,
      interactionRadius: 56,
      label: cat?.name ?? content?.displayName ?? npcId,
      metadata: {
        npcId,
        lines: cat?.defaultLines ?? ["…"],
        behavior: content?.ambientBehavior ?? "idle",
      },
    },
    region,
  );
}

export function resourceAt(
  region: RegionIdentity,
  resourceId: string,
  id: string,
  x: number,
  y: number,
): WorldMapObject {
  return obj(
    {
      id,
      type: "resource",
      x,
      y,
      interactive: true,
      interactionRadius: 40,
      respawnSeconds: 120,
      label: resourceId,
      metadata: { resourceId },
    },
    region,
  );
}

export function enemyZone(
  region: RegionIdentity,
  id: string,
  enemyId: string,
  x: number,
  y: number,
  w: number,
  h: number,
): WorldMapObject {
  return obj(
    {
      id,
      type: "enemy_spawn",
      x,
      y,
      width: w,
      height: h,
      metadata: { enemyId, maxCount: 3 },
    },
    region,
  );
}

/** Major Gateway Stone — first visit activates permanent fast-travel node. */
export function gatewayStoneAt(
  region: RegionIdentity,
  x: number,
  y: number,
): WorldMapObject {
  return obj(
    {
      id: `gateway-${region.id}`,
      type: "gateway",
      x,
      y,
      interactive: true,
      interactionRadius: 52,
      label: `${region.name} Gateway Stone`,
      metadata: {
        gatewayStone: true,
        fastTravel: true,
        regionId: region.id,
      },
    },
    region,
  );
}

export function portalRing(
  region: RegionIdentity,
  cx: number,
  cy: number,
  radius: number,
): WorldMapObject[] {
  const portals = PORTALS_FROM_REGION(region.id);
  if (portals.length === 0) {
    // Return-to-commons style single portal
    return [
      obj(
        {
          id: `${region.id}-return-portal`,
          type: "portal",
          x: cx,
          y: cy,
          interactive: true,
          interactionRadius: 48,
          label: "Riftwild Commons",
          metadata: {
            toRegionId: "riftwild-commons",
            locked: false,
          },
        },
        region,
      ),
    ];
  }
  return portals.map((p, i) => {
    const angle = (i / portals.length) * Math.PI * 2 - Math.PI / 2;
    const x = Math.round(cx + Math.cos(angle) * radius);
    const y = Math.round(cy + Math.sin(angle) * radius);
    return obj(
      {
        id: p.id,
        type: "portal",
        x,
        y,
        interactive: true,
        interactionRadius: 44,
        unlockFlag: p.unlockFlag,
        label: p.label,
        metadata: {
          toRegionId: p.toRegionId,
          locked: p.lockedByDefault,
          portalDefId: p.id,
        },
      },
      region,
    );
  });
}

export function baseMinimap(
  cols: number,
  rows: number,
  pins: MinimapMeta["landmarkPins"],
): MinimapMeta {
  return { width: cols, height: rows, landmarkPins: pins };
}

export function finalizeBlueprint(
  region: RegionIdentity,
  opts: {
    cols: number;
    rows: number;
    zones: MapZone[];
    pathways: PathwayDef[];
    objects: WorldMapObject[];
    colliders: CollisionRect[];
    safeZones: MapBlueprint["safeZones"];
    spawn: { x: number; y: number };
    portalHub?: MapBlueprint["portalHub"];
    notes?: string[];
    completeness: "FULL" | "PARTIAL";
  },
): MapBlueprint {
  const { width, height } = mapSize(opts.cols, opts.rows);
  const pins = opts.objects
    .filter((o) =>
      ["building", "portal", "waypoint", "gateway", "npc", "boss_arena"].includes(
        o.type,
      ),
    )
    .slice(0, 24)
    .map((o) => ({
      id: o.id,
      label: o.label ?? o.id,
      x: Math.round(o.x / TILE),
      y: Math.round(o.y / TILE),
      icon: o.type,
    }));

  const hasAuthoredTransitions = opts.colliders.some((c) => c.kind === "transition");
  const portals = opts.objects.filter((o) => o.type === "portal");
  const autoTransitions = hasAuthoredTransitions
    ? []
    : transitionZonesFromPortals(portals);

  return {
    schemaVersion: 1,
    regionId: region.id,
    slug: region.slug,
    name: region.name,
    tileSize: TILE,
    cols: opts.cols,
    rows: opts.rows,
    layers: [
      "ground",
      "decorative",
      "collision",
      "interactive",
      "overhead",
      "effects",
    ],
    zones: opts.zones,
    pathways: opts.pathways,
    objects: opts.objects,
    colliders: [
      ...borderColliders(region.id, opts.cols, opts.rows),
      ...opts.colliders,
      ...autoTransitions,
    ],
    camera: { x: 0, y: 0, width, height },
    minimap: baseMinimap(opts.cols, opts.rows, pins),
    weatherKeys: region.weatherKeys,
    musicKey: region.musicKey,
    safeZones: opts.safeZones,
    spawn: opts.spawn,
    portalHub: opts.portalHub,
    notes: opts.notes,
    completeness: opts.completeness,
  };
}
