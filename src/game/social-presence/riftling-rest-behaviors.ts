/**
 * Riftling ambient rest behaviors — stubs for campfire / inn / homestead.
 * Cosmetic presence only; no combat power.
 */

export type RiftlingRestBehavior =
  | "doze_by_fire"
  | "curl_on_rug"
  | "perch_window"
  | "soft_purr_loop"
  | "stretch_wake"
  | "watch_crowd";

export type RiftlingRestContext = {
  restZoneKind: string | null;
  nearbyPlayers: number | null;
  ownerStatus: string | null;
};

const BY_ZONE: Record<string, RiftlingRestBehavior[]> = {
  campfire: ["doze_by_fire", "soft_purr_loop", "watch_crowd"],
  inn: ["curl_on_rug", "doze_by_fire", "stretch_wake"],
  homestead: ["curl_on_rug", "perch_window", "soft_purr_loop"],
  town_plaza: ["watch_crowd", "stretch_wake"],
  fishing_dock: ["perch_window", "watch_crowd"],
  logout_rest: ["doze_by_fire", "curl_on_rug"],
  safe_zone: ["stretch_wake", "watch_crowd"],
  festival_grounds: ["watch_crowd", "stretch_wake"],
  market_square: ["watch_crowd"],
};

export function pickRiftlingRestBehavior(
  ctx: RiftlingRestContext,
  seed = Date.now(),
): RiftlingRestBehavior {
  const pool =
    (ctx.restZoneKind && BY_ZONE[ctx.restZoneKind]) ||
    BY_ZONE.safe_zone ||
    ["stretch_wake"];
  return pool[seed % pool.length]!;
}

export function describeRiftlingRestBehavior(behavior: RiftlingRestBehavior): string {
  switch (behavior) {
    case "doze_by_fire":
      return "Your Riftling dozes near the warmth.";
    case "curl_on_rug":
      return "Your Riftling curls up contentedly.";
    case "perch_window":
      return "Your Riftling watches the world from a perch.";
    case "soft_purr_loop":
      return "Soft companion sounds — ambient only.";
    case "stretch_wake":
      return "Your Riftling stretches, then settles.";
    case "watch_crowd":
      return "Your Riftling watches the plaza crowd.";
  }
}
