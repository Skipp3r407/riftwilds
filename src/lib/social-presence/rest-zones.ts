/**
 * Rest / logout-friendly hubs — reuse safe_zone semantics from world maps.
 * Default remove-from-world on logout still applies; these are while-online rest bonuses.
 */

import {
  REST_HUB_CATALOG,
  REST_ZONE_BONUS_PERCENT,
} from "@/lib/social-presence/config";
import type { RestZoneKind } from "@/lib/social-presence/types";

export type RestHubDef = (typeof REST_HUB_CATALOG)[number];

export function listRestHubs(regionSlug?: string): RestHubDef[] {
  if (!regionSlug) return [...REST_HUB_CATALOG];
  return REST_HUB_CATALOG.filter((h) => h.regionSlug === regionSlug);
}

export function getRestHub(locationId: string): RestHubDef | undefined {
  return REST_HUB_CATALOG.find((h) => h.id === locationId);
}

export function restBonusPercent(kind: RestZoneKind | null | undefined): number {
  if (!kind) return 0;
  return REST_ZONE_BONUS_PERCENT[kind] ?? 0;
}

/** Map world-map object types / zone labels onto RestZoneKind. */
export function restKindFromWorldObjectType(
  type: string | null | undefined,
): RestZoneKind | null {
  if (!type) return null;
  switch (type) {
    case "safe_zone":
      return "safe_zone";
    case "fishing_spot":
      return "fishing_dock";
    case "shop":
      return "market_square";
    case "spawn":
      return "town_plaza";
    default:
      return null;
  }
}

export function isLogoutFriendlyRest(kind: RestZoneKind | null): boolean {
  return (
    kind === "logout_rest" ||
    kind === "inn" ||
    kind === "safe_zone" ||
    kind === "homestead" ||
    kind === "campfire"
  );
}

export function describeRestHub(kind: RestZoneKind): string {
  switch (kind) {
    case "safe_zone":
      return "Safe zone — small rest bonus while socially present.";
    case "town_plaza":
      return "Town plaza — social hub rest bonus.";
    case "inn":
      return "Inn — deeper rest bonus; logout-friendly.";
    case "campfire":
      return "Campfire — ambient rest with companions.";
    case "homestead":
      return "Homestead hearth — home rest bonus.";
    case "fishing_dock":
      return "Fishing dock — quiet presence rest.";
    case "festival_grounds":
      return "Festival grounds — celebration rest bonus.";
    case "market_square":
      return "Market square — trade-hub rest bonus.";
    case "logout_rest":
      return "Logout rest bench — while-online calm; logout still removes you from the world.";
    case "tavern":
      return "Tavern — social rest and stories.";
    case "park":
      return "Park — casual social rest.";
    case "library":
      return "Library — quiet reading rest.";
    case "guild_hall":
      return "Guild hall — org social rest.";
    case "music_stage":
      return "Music stage — performance rest bonus.";
    case "riftling_park":
      return "Riftling park — companion social rest.";
    case "welcome_center":
      return "Welcome center — newkeeper hub bonus.";
    case "crafting_plaza":
      return "Crafting plaza — casual craft rest.";
    case "beach":
      return "Beach — shore rest.";
    case "port":
      return "Port — travel hub rest.";
    case "sanctuary":
      return "Sanctuary — calm rest.";
    case "public_farm":
      return "Public farm — garden rest.";
    case "arena_viewing":
      return "Arena viewing — spectator rest.";
  }
}
