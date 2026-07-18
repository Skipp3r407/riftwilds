/**
 * Social achievements — cosmetic unlocks only.
 */

import { SOCIAL_ACHIEVEMENTS } from "@/lib/social-presence/config";
import type { PresencePlayerState, SocialAchievementDef } from "@/lib/social-presence/types";

export function listSocialAchievements(): SocialAchievementDef[] {
  return SOCIAL_ACHIEVEMENTS;
}

export function metricValue(
  state: PresencePlayerState,
  metric: SocialAchievementDef["metric"],
): number {
  switch (metric) {
    case "presenceXp":
      return state.lifetimePresenceXp;
    case "emotes":
      return state.actions.filter((a) =>
        ["EMOTE", "WAVE", "DANCE"].includes(a.kind),
      ).length;
    case "homeVisits":
      return state.actions.filter((a) => a.kind === "HOME_VISIT").length;
    case "helps":
      return state.actions.filter((a) => a.kind === "HELP_NEWBIE").length;
    case "restMinutes":
      return state.actions
        .filter((a) => a.kind === "CAMPFIRE_REST" || a.kind === "SIT")
        .reduce((n, a) => n + Math.max(1, Math.floor(a.xpAwarded / 2)), 0);
    case "featuredHours":
      return state.featuredTitles.length;
  }
}

export function evaluateNewAchievements(state: PresencePlayerState): string[] {
  const unlocked: string[] = [];
  for (const def of SOCIAL_ACHIEVEMENTS) {
    if (state.achievementsUnlocked.includes(def.id)) continue;
    if (metricValue(state, def.metric) >= def.threshold) {
      unlocked.push(def.id);
    }
  }
  return unlocked;
}

export function achievementView(state: PresencePlayerState) {
  return SOCIAL_ACHIEVEMENTS.map((a) => ({
    id: a.id,
    label: a.label,
    unlocked: state.achievementsUnlocked.includes(a.id),
  }));
}
