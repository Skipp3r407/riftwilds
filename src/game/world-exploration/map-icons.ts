/**
 * Map / minimap icon paths for exploration markers.
 * Assets live under /assets/ui/map/ — GenerateImage originals only.
 */

import type { MapMarkerKind, MapMarkerState } from "@/game/world-exploration/types";

export const MAP_ICON_PATHS = {
  questAvailable: "/assets/ui/map/quest-available.png",
  questActive: "/assets/ui/map/quest-active.png",
  questComplete: "/assets/ui/map/quest-complete.png",
  waypoint: "/assets/ui/map/waypoint.png",
  portal: "/assets/ui/map/portal.png",
  gateway: "/assets/ui/map/gateway-stone.png",
  marker: "/assets/ui/map/marker.png",
  danger: "/assets/ui/map/danger.png",
  treasure: "/assets/ui/map/treasure.png",
  boss: "/assets/ui/map/world-boss.png",
  enemy: "/assets/ui/map/enemy-territory.png",
  poi: "/assets/ui/map/poi.png",
  habitat: "/assets/ui/map/habitat.png",
  event: "/assets/ui/map/world-event.png",
  custom: "/assets/ui/map/custom-pin.png",
  perk: "/assets/ui/map/perk.png",
  service: "/assets/ui/map/service-icons.png",
  minimapQuest: "/assets/ui/map/minimap-quest.png",
  minimapWaypoint: "/assets/ui/map/minimap-waypoint.png",
  minimapPortal: "/assets/ui/map/minimap-portal.png",
  minimapPlayer: "/assets/ui/map/minimap-player.png",
  minimapTreasure: "/assets/ui/map/minimap-treasure.png",
  minimapEnemy: "/assets/ui/map/minimap-enemy.png",
  minimapEvent: "/assets/ui/map/minimap-event.png",
} as const;

export type MapIconKey = keyof typeof MAP_ICON_PATHS;

const KIND_DEFAULT: Record<MapMarkerKind, MapIconKey> = {
  quest: "questAvailable",
  service: "service",
  portal: "portal",
  waypoint: "waypoint",
  gateway: "gateway",
  treasure: "treasure",
  enemy_territory: "enemy",
  world_boss: "boss",
  poi: "poi",
  habitat: "habitat",
  world_event: "event",
  custom: "custom",
  perk: "perk",
  landmark: "marker",
};

export function iconKeyForMarker(kind: MapMarkerKind, state?: MapMarkerState): MapIconKey {
  if (kind === "quest") {
    if (state === "completed") return "questComplete";
    if (state === "active" || state === "tracked") return "questActive";
    return "questAvailable";
  }
  return KIND_DEFAULT[kind];
}

export function resolveMapIconPath(iconKey: string): string {
  if (iconKey in MAP_ICON_PATHS) {
    return MAP_ICON_PATHS[iconKey as MapIconKey];
  }
  if (iconKey.startsWith("/")) return iconKey;
  return MAP_ICON_PATHS.marker;
}

export function minimapIconForKind(kind: MapMarkerKind): string {
  switch (kind) {
    case "quest":
      return MAP_ICON_PATHS.minimapQuest;
    case "portal":
      return MAP_ICON_PATHS.minimapPortal;
    case "treasure":
      return MAP_ICON_PATHS.minimapTreasure;
    case "enemy_territory":
    case "world_boss":
      return MAP_ICON_PATHS.minimapEnemy;
    case "world_event":
      return MAP_ICON_PATHS.minimapEvent;
    case "waypoint":
    case "gateway":
    case "custom":
      return MAP_ICON_PATHS.minimapWaypoint;
    default:
      return MAP_ICON_PATHS.minimapWaypoint;
  }
}

/** CSS fallback color when icon fails to load. */
export function markerFallbackColor(kind: MapMarkerKind): string {
  switch (kind) {
    case "quest":
      return "#9b7bff";
    case "portal":
      return "#3de7ff";
    case "gateway":
      return "#e8c87a";
    case "waypoint":
    case "custom":
      return "#ffb84d";
    case "treasure":
      return "#f0c040";
    case "enemy_territory":
      return "#e06040";
    case "world_boss":
      return "#ff4060";
    case "poi":
    case "landmark":
      return "#8ad0a0";
    case "habitat":
      return "#60c090";
    case "world_event":
      return "#c070ff";
    case "perk":
      return "#70b0ff";
    case "service":
      return "#8ad0a0";
    default:
      return "#8899aa";
  }
}
