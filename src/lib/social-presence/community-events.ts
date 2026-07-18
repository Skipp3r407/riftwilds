/**
 * Mini community event stubs — merchant, musician, fireworks, etc.
 * Merges Dynamic World Events into Happening Now when LIVE_WORLD_EVENTS_ENABLED.
 */

import { isFeatureEnabled } from "@/lib/config/feature-flags";
import type { CommunityEventStub } from "@/lib/social-presence/types";
import { listHappeningNowWorldEvents } from "@/lib/world-events";

const EVENT_DEFS: Omit<CommunityEventStub, "startsAt" | "endsAt">[] = [
  {
    id: "evt-merchant-plaza",
    kind: "traveling_merchant",
    label: "Traveling Merchant Cart",
    regionSlug: "riftwild-commons",
    locationId: "commons-market",
    presenceXpBonus: 3,
  },
  {
    id: "evt-musician-plaza",
    kind: "street_musician",
    label: "Plaza Street Musician",
    regionSlug: "riftwild-commons",
    locationId: "commons-plaza",
    presenceXpBonus: 2,
  },
  {
    id: "evt-fireworks-ember",
    kind: "fireworks",
    label: "Ember Night Fireworks",
    regionSlug: "ember-crater",
    locationId: "ember-festival",
    presenceXpBonus: 4,
  },
  {
    id: "evt-crier-commons",
    kind: "town_crier",
    label: "Town Crier Announcement",
    regionSlug: "riftwild-commons",
    locationId: "commons-plaza",
    presenceXpBonus: 2,
  },
  {
    id: "evt-pet-parade",
    kind: "pet_parade",
    label: "Riftling Pet Parade",
    regionSlug: "riftwild-commons",
    locationId: "commons-plaza",
    presenceXpBonus: 5,
  },
  {
    id: "evt-campfire-circle",
    kind: "campfire_circle",
    label: "Campfire Story Circle",
    regionSlug: "elderwood-forest",
    locationId: "elderwood-campfire",
    presenceXpBonus: 3,
  },
];

/** Deterministic stub schedule: 2–3 events “active” based on hour bucket. */
export function listActiveCommunityEvents(now = Date.now()): CommunityEventStub[] {
  const hour = Math.floor(now / (60 * 60_000));
  const startsAt = new Date(hour * 60 * 60_000).toISOString();
  const endsAt = new Date((hour + 1) * 60 * 60_000).toISOString();
  const pick = [
    EVENT_DEFS[hour % EVENT_DEFS.length]!,
    EVENT_DEFS[(hour + 2) % EVENT_DEFS.length]!,
    EVENT_DEFS[(hour + 4) % EVENT_DEFS.length]!,
  ];
  const seen = new Set<string>();
  const community = pick
    .filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    })
    .map((e) => ({ ...e, startsAt, endsAt }));

  if (!isFeatureEnabled("LIVE_WORLD_EVENTS_ENABLED")) return community;

  const world = listHappeningNowWorldEvents(now).map(
    (w): CommunityEventStub => ({
      id: w.id,
      kind: "world_event",
      label: w.label,
      regionSlug: w.regionSlug,
      locationId: w.locationId,
      startsAt: w.startsAt,
      endsAt: w.endsAt,
      presenceXpBonus: w.presenceXpBonus,
      phase: w.phase,
    }),
  );

  return [...world, ...community];
}

export function eventBonusForLocation(
  locationId: string | null | undefined,
  now = Date.now(),
): number {
  if (!locationId) return 0;
  return listActiveCommunityEvents(now)
    .filter((e) => e.locationId === locationId)
    .reduce((sum, e) => sum + e.presenceXpBonus, 0);
}
