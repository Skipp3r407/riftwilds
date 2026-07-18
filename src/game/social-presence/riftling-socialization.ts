/**
 * Riftling socialization in hubs — privacy-gated, cosmetic bond only.
 */

export type RiftlingSocialTrait =
  | "Shy"
  | "Playful"
  | "Curious"
  | "Calm"
  | "Energetic"
  | "Protective"
  | "Musical"
  | "Food-loving"
  | "Mischievous";

export type RiftlingSocialBehavior =
  | "sit_beside_owner"
  | "sleep_near_fire"
  | "play_with_toy"
  | "chase_butterflies"
  | "meet_nearby"
  | "sniff_greeting"
  | "friendly_emote"
  | "nap_together"
  | "play_chase"
  | "share_food"
  | "react_music"
  | "watch_performer"
  | "splash_water"
  | "dig_approved"
  | "pose_photo";

const TRAIT_BEHAVIORS: Record<RiftlingSocialTrait, RiftlingSocialBehavior[]> = {
  Shy: ["sit_beside_owner", "sleep_near_fire", "watch_performer"],
  Playful: ["play_with_toy", "chase_butterflies", "play_chase", "meet_nearby"],
  Curious: ["sniff_greeting", "meet_nearby", "dig_approved", "watch_performer"],
  Calm: ["sit_beside_owner", "nap_together", "sleep_near_fire"],
  Energetic: ["play_chase", "chase_butterflies", "splash_water"],
  Protective: ["sit_beside_owner", "friendly_emote", "watch_performer"],
  Musical: ["react_music", "watch_performer", "friendly_emote"],
  "Food-loving": ["share_food", "sit_beside_owner"],
  Mischievous: ["dig_approved", "play_with_toy", "chase_butterflies"],
};

export function pickRiftlingSocialBehavior(params: {
  trait?: RiftlingSocialTrait | null;
  allowSocial: boolean;
  nearbyRiftlings: number;
  hubKind?: string | null;
  seed?: number;
}): RiftlingSocialBehavior | null {
  if (!params.allowSocial) return "sit_beside_owner";
  const trait = params.trait ?? "Calm";
  let pool = TRAIT_BEHAVIORS[trait] ?? TRAIT_BEHAVIORS.Calm;
  if ((params.nearbyRiftlings ?? 0) < 1) {
    pool = pool.filter((b) => b !== "meet_nearby" && b !== "nap_together" && b !== "play_chase");
  }
  if (params.hubKind === "music_stage") {
    pool = [...pool, "react_music", "watch_performer"];
  }
  if (params.hubKind === "campfire") {
    pool = [...pool, "sleep_near_fire"];
  }
  const seed = params.seed ?? Date.now();
  return pool[seed % pool.length]!;
}

/** Soft bond from social hub activities — capped externally per day. */
export function socialBondDelta(behavior: RiftlingSocialBehavior): number {
  switch (behavior) {
    case "meet_nearby":
    case "nap_together":
    case "play_chase":
    case "share_food":
      return 2;
    case "react_music":
    case "watch_performer":
    case "pose_photo":
      return 1;
    default:
      return 1;
  }
}

export const RIFTLING_SOCIAL_RULES = [
  "Requires owner privacy permission (allowRiftlingSocial).",
  "Never changes ownership or equipment control.",
  "Lightweight sync — ends when an owner leaves.",
  "Bond gains are soft and daily-capped — never combat power.",
] as const;
