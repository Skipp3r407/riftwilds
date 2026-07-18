/**
 * Hidden Presence Activity Score — qualifies passive/social rewards.
 */

import type { ActivityCategory, PresenceActionKind } from "@/lib/social-presence/types";

export const ACTION_CATEGORY: Record<PresenceActionKind, ActivityCategory> = {
  TOWN_VISIT: "Exploration",
  MARKET_BROWSE: "Marketplace",
  NPC_TALK: "Social",
  CHAT: "Social",
  EMOTE: "Social",
  PET_CARE: "RiftlingCare",
  HOME_VISIT: "Housing",
  HOME_LIKE: "Housing",
  FISH: "Fishing",
  CAMPFIRE_REST: "Resting",
  PUBLIC_EVENT: "Events",
  MUSIC_LISTEN: "Performance",
  TRADE: "Marketplace",
  HELP_NEWBIE: "Helping",
  FESTIVAL: "Events",
  SIT: "Resting",
  WAVE: "Social",
  DANCE: "Social",
  GUESTBOOK: "Housing",
  COMMUNITY_EVENT: "Events",
  READ_LORE: "Resting",
  GARDEN: "Crafting",
  COOK: "Crafting",
  CRAFT_SOCIAL: "Crafting",
  PHOTO: "Social",
  DECORATE: "Housing",
  WELCOME_NEWBIE: "Helping",
  GROUP_EMOTE: "Social",
  PERFORMANCE: "Performance",
  MINIGAME: "Minigame",
  INSTRUMENT: "Performance",
  DAILY_TASK: "Social",
};

export const ACTIVITY_SCORE_POINTS: Record<PresenceActionKind, number> = {
  TOWN_VISIT: 2,
  MARKET_BROWSE: 2,
  NPC_TALK: 3,
  CHAT: 2,
  EMOTE: 3,
  PET_CARE: 3,
  HOME_VISIT: 4,
  HOME_LIKE: 2,
  FISH: 2,
  CAMPFIRE_REST: 2,
  PUBLIC_EVENT: 5,
  MUSIC_LISTEN: 2,
  TRADE: 4,
  HELP_NEWBIE: 6,
  FESTIVAL: 5,
  SIT: 1,
  WAVE: 2,
  DANCE: 3,
  GUESTBOOK: 3,
  COMMUNITY_EVENT: 4,
  READ_LORE: 2,
  GARDEN: 2,
  COOK: 2,
  CRAFT_SOCIAL: 2,
  PHOTO: 2,
  DECORATE: 2,
  WELCOME_NEWBIE: 7,
  GROUP_EMOTE: 3,
  PERFORMANCE: 4,
  MINIGAME: 3,
  INSTRUMENT: 3,
  DAILY_TASK: 5,
};

/** Rolling window for activity score decay (ms). */
export const ACTIVITY_SCORE_WINDOW_MS = 20 * 60_000;

export function scoreForAction(kind: PresenceActionKind): number {
  return ACTIVITY_SCORE_POINTS[kind] ?? 1;
}

export function categoryForAction(kind: PresenceActionKind): ActivityCategory {
  return ACTION_CATEGORY[kind] ?? "Social";
}

export function decayActivityScore(
  score: number,
  lastMeaningfulAt: number | null,
  now = Date.now(),
): number {
  if (lastMeaningfulAt == null) return 0;
  const age = now - lastMeaningfulAt;
  if (age > ACTIVITY_SCORE_WINDOW_MS) return Math.max(0, Math.floor(score * 0.25));
  if (age > ACTIVITY_SCORE_WINDOW_MS / 2) return Math.max(0, Math.floor(score * 0.6));
  return score;
}

export function applyActivityScoreGain(current: number, kind: PresenceActionKind): number {
  return Math.min(120, current + scoreForAction(kind));
}
