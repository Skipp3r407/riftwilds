/**
 * Social Presence Levels — cosmetic long-term track.
 * Never unlocks combat power.
 */

import type { PresenceLevelId } from "@/lib/social-presence/types";

export type PresenceLevelDef = {
  id: PresenceLevelId;
  rank: number;
  label: string;
  xpRequired: number;
  cosmeticUnlock: string;
};

export const PRESENCE_LEVELS: PresenceLevelDef[] = [
  { id: "wanderer", rank: 1, label: "Wanderer", xpRequired: 0, cosmeticUnlock: "title:Wanderer" },
  { id: "visitor", rank: 2, label: "Visitor", xpRequired: 100, cosmeticUnlock: "emote:nod-stub" },
  {
    id: "familiar_face",
    rank: 3,
    label: "Familiar Face",
    xpRequired: 300,
    cosmeticUnlock: "badge:familiar-face",
  },
  {
    id: "town_regular",
    rank: 4,
    label: "Town Regular",
    xpRequired: 700,
    cosmeticUnlock: "frame:town-regular",
  },
  {
    id: "friendly_neighbor",
    rank: 5,
    label: "Friendly Neighbor",
    xpRequired: 1400,
    cosmeticUnlock: "title:Friendly Neighbor",
  },
  {
    id: "community_member",
    rank: 6,
    label: "Community Member",
    xpRequired: 2500,
    cosmeticUnlock: "decor:community-banner",
  },
  {
    id: "social_butterfly",
    rank: 7,
    label: "Social Butterfly",
    xpRequired: 4000,
    cosmeticUnlock: "emote:flourish-stub",
  },
  {
    id: "town_ambassador",
    rank: 8,
    label: "Town Ambassador",
    xpRequired: 6000,
    cosmeticUnlock: "nameplate:ambassador",
  },
  {
    id: "community_guardian",
    rank: 9,
    label: "Community Guardian",
    xpRequired: 9000,
    cosmeticUnlock: "title:Community Guardian",
  },
  {
    id: "riftwilds_luminary",
    rank: 10,
    label: "Riftwilds Luminary",
    xpRequired: 13000,
    cosmeticUnlock: "keepsake:luminary-lantern",
  },
];

export function presenceLevelFromXp(lifetimeXp: number): PresenceLevelDef {
  let current = PRESENCE_LEVELS[0]!;
  for (const level of PRESENCE_LEVELS) {
    if (lifetimeXp >= level.xpRequired) current = level;
  }
  return current;
}

export function nextPresenceLevel(lifetimeXp: number): PresenceLevelDef | null {
  const current = presenceLevelFromXp(lifetimeXp);
  return PRESENCE_LEVELS.find((l) => l.rank === current.rank + 1) ?? null;
}
