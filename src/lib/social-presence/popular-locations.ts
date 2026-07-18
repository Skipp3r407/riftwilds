/**
 * Popular location tracking + display stubs.
 */

import { REST_HUB_CATALOG } from "@/lib/social-presence/config";
import type { PopularLocation } from "@/lib/social-presence/types";

type LocStore = {
  ticks: Map<string, number>;
};

const globalForLoc = globalThis as unknown as { __riftwildsPopularLoc?: LocStore };

function store(): LocStore {
  if (!globalForLoc.__riftwildsPopularLoc) {
    globalForLoc.__riftwildsPopularLoc = { ticks: new Map() };
  }
  return globalForLoc.__riftwildsPopularLoc;
}

export function resetPopularLocationsForTests(): void {
  globalForLoc.__riftwildsPopularLoc = { ticks: new Map() };
}

export function bumpLocationActivity(locationId: string, amount = 1): void {
  const s = store();
  s.ticks.set(locationId, (s.ticks.get(locationId) ?? 0) + amount);
}

export function listPopularLocations(limit = 8): PopularLocation[] {
  const s = store();
  return REST_HUB_CATALOG.map((hub) => {
    const live = s.ticks.get(hub.id) ?? 0;
    const activityScore = hub.popularSeed + live;
    return {
      locationId: hub.id,
      label: hub.label,
      regionSlug: hub.regionSlug,
      activityScore,
      playersEstimate: null,
      kind: hub.kind,
    } satisfies PopularLocation;
  })
    .sort((a, b) => b.activityScore - a.activityScore)
    .slice(0, limit);
}

export function populationByRegion(): {
  regionSlug: string;
  label: string;
  estimate: number | null;
}[] {
  const labels: Record<string, string> = {
    "riftwild-commons": "Riftwild Commons",
    "elderwood-forest": "Elderwood Forest",
    "ember-crater": "Ember Crater",
  };
  const regions = [...new Set(REST_HUB_CATALOG.map((h) => h.regionSlug))];
  return regions.map((slug) => ({
    regionSlug: slug,
    label: labels[slug] ?? slug,
    estimate: null,
  }));
}
