/**
 * Blueprint-sourced service / portal / waypoint / gateway markers (always safe).
 */

import { getBlueprint } from "@/game/world-maps/blueprints";
import { iconKeyForMarker } from "@/game/world-exploration/map-icons";
import type { MapMarker } from "@/game/world-exploration/types";
import {
  getVisitedCells,
  loadFogState,
} from "@/game/live-world/systems/exploration-fog";
import { FOG_CELL_SIZE } from "@/game/live-world/systems/exploration-fog";
import { isRegionGatewayActivated } from "@/game/world-travel/gateways";

function cellNear(regionSlug: string, x: number, y: number): boolean {
  const key = `${Math.floor(x / FOG_CELL_SIZE)},${Math.floor(y / FOG_CELL_SIZE)}`;
  return getVisitedCells(regionSlug).has(key);
}

export function buildBlueprintMarkers(regionSlug: string): MapMarker[] {
  let bp;
  try {
    bp = getBlueprint(regionSlug);
  } catch {
    return [];
  }

  const fog = loadFogState().regions[regionSlug];
  const discoveredWaypoints = new Set(fog?.discoveredWaypoints ?? []);
  const markers: MapMarker[] = [];

  for (const o of bp.objects) {
    const isGateway = o.type === "gateway" || o.metadata?.gatewayStone === true;
    if (
      o.type !== "portal" &&
      o.type !== "waypoint" &&
      o.type !== "building" &&
      o.type !== "shop" &&
      o.type !== "npc" &&
      !isGateway
    ) {
      continue;
    }

    // Don't spoil undiscovered waypoints until fog/visit
    if (o.type === "waypoint" && !discoveredWaypoints.has(o.id) && !cellNear(regionSlug, o.x, o.y)) {
      continue;
    }

    let kind: MapMarker["kind"] = "service";
    let category: MapMarker["category"] = "services";
    if (isGateway) {
      kind = "gateway";
      category = "gateways";
    } else if (o.type === "portal") {
      kind = "portal";
      category = "portals";
    } else if (o.type === "waypoint") {
      kind = "waypoint";
      category = "waypoints";
    } else if (o.type === "npc") {
      // NPCs only as light service pins when labelled shop/quest board
      const label = (o.label ?? "").toLowerCase();
      if (!label.includes("shop") && !label.includes("board") && !label.includes("keeper")) {
        continue;
      }
      kind = "service";
      category = "services";
    }

    const activated = isGateway ? isRegionGatewayActivated(regionSlug) : false;

    markers.push({
      id: `bp-${regionSlug}-${o.id}`,
      kind,
      category,
      regionSlug,
      x: o.x,
      y: o.y,
      label: o.label ?? o.id,
      subtitle: isGateway ? (activated ? "Activated" : "Dormant") : undefined,
      state: isGateway ? (activated ? "discovered" : "idle") : "idle",
      visibility: "visible",
      iconKey: iconKeyForMarker(kind),
      searchText: `${o.label ?? o.id} ${kind} ${regionSlug}`.toLowerCase(),
      sourceObjectId: o.id,
      codexHref: isGateway || o.type === "building" ? `/world#region-${regionSlug}` : null,
      clusterKey: `${regionSlug}:${category}`,
      priority: isGateway ? 85 : o.type === "portal" ? 75 : o.type === "waypoint" ? 65 : 35,
      metadata: { objectType: o.type },
    });
  }

  return markers;
}
