/**
 * Codex deep-links for discovered locations / habitats.
 * Only call when discovery allows — never link secret content.
 */

import type { DiscoverableDef } from "@/game/world-exploration/types";
import { getDiscoverableById } from "@/game/world-exploration/discovery-catalog";
import { isDiscovered } from "@/game/world-exploration/progress";
import { REGION_BY_SLUG } from "@/game/world-maps/regions";

export function codexHrefForDiscoverable(def: DiscoverableDef): string | null {
  if (def.kind === "habitat" && def.habitatSpeciesSlug) {
    return `/codex/riftlings/${def.habitatSpeciesSlug}`;
  }
  if (def.codexSlug && REGION_BY_SLUG[def.codexSlug]) {
    return `/world#region-${def.codexSlug}`;
  }
  if (def.codexSlug && def.kind === "habitat") {
    return `/codex/riftlings/${def.codexSlug}`;
  }
  if (REGION_BY_SLUG[def.regionSlug]) {
    return `/world#region-${def.regionSlug}`;
  }
  return null;
}

/** Safe deep-link only if already discovered. */
export function safeCodexHref(discoverableId: string): string | null {
  if (!isDiscovered(discoverableId)) return null;
  const def = getDiscoverableById(discoverableId);
  if (!def) return null;
  return codexHrefForDiscoverable(def);
}

export function regionCodexHref(regionSlug: string): string {
  return `/world#region-${regionSlug}`;
}
