/**
 * Crowd LOD stubs — reduce remote avatar detail by distance / population.
 * Ready for multiplayer authority; local-only for now.
 */

export type CrowdLodTier = "hero" | "near" | "mid" | "far" | "billboard";

export type CrowdLodPlan = {
  tier: CrowdLodTier;
  showNameplate: boolean;
  showEmotes: boolean;
  animateIdle: boolean;
  maxRemoteAvatars: number;
};

export function crowdLodForDistance(distancePx: number, populationEstimate: number | null): CrowdLodPlan {
  const pop = populationEstimate ?? 8;
  const maxRemote = pop > 40 ? 24 : pop > 20 ? 36 : 48;

  if (distancePx < 80) {
    return {
      tier: "hero",
      showNameplate: true,
      showEmotes: true,
      animateIdle: true,
      maxRemoteAvatars: maxRemote,
    };
  }
  if (distancePx < 220) {
    return {
      tier: "near",
      showNameplate: true,
      showEmotes: true,
      animateIdle: true,
      maxRemoteAvatars: maxRemote,
    };
  }
  if (distancePx < 480) {
    return {
      tier: "mid",
      showNameplate: true,
      showEmotes: false,
      animateIdle: pop < 30,
      maxRemoteAvatars: maxRemote,
    };
  }
  if (distancePx < 900) {
    return {
      tier: "far",
      showNameplate: false,
      showEmotes: false,
      animateIdle: false,
      maxRemoteAvatars: maxRemote,
    };
  }
  return {
    tier: "billboard",
    showNameplate: false,
    showEmotes: false,
    animateIdle: false,
    maxRemoteAvatars: maxRemote,
  };
}
