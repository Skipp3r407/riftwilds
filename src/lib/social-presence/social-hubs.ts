/**
 * Configurable Social Hub zones — population, multipliers, activities.
 */

import { REST_HUB_CATALOG } from "@/lib/social-presence/config";
import type { PresenceActionKind, RestZoneKind } from "@/lib/social-presence/types";

export type SocialHubDef = {
  id: string;
  name: string;
  regionSlug: string;
  hubType: RestZoneKind;
  capacity: number;
  presenceMultiplier: number;
  rewardEligible: boolean;
  featuredEligible: boolean;
  lowPopAmbience: string;
  allowedActivities: PresenceActionKind[];
  crowdThresholdSoft: number;
  crowdThresholdHard: number;
  popularSeed: number;
  welcomeNewPlayers: boolean;
};

const DEFAULT_ACTIVITIES: PresenceActionKind[] = [
  "TOWN_VISIT",
  "SIT",
  "WAVE",
  "EMOTE",
  "CHAT",
  "NPC_TALK",
  "PET_CARE",
];

function activitiesFor(kind: RestZoneKind): PresenceActionKind[] {
  switch (kind) {
    case "market_square":
      return [...DEFAULT_ACTIVITIES, "MARKET_BROWSE", "TRADE"];
    case "fishing_dock":
    case "beach":
    case "port":
      return [...DEFAULT_ACTIVITIES, "FISH"];
    case "campfire":
    case "tavern":
    case "inn":
      return [...DEFAULT_ACTIVITIES, "CAMPFIRE_REST", "MUSIC_LISTEN", "READ_LORE"];
    case "music_stage":
      return [...DEFAULT_ACTIVITIES, "PERFORMANCE", "INSTRUMENT", "DANCE", "MUSIC_LISTEN"];
    case "riftling_park":
      return [...DEFAULT_ACTIVITIES, "PET_CARE", "MINIGAME"];
    case "welcome_center":
      return [...DEFAULT_ACTIVITIES, "HELP_NEWBIE", "WELCOME_NEWBIE"];
    case "festival_grounds":
      return [...DEFAULT_ACTIVITIES, "FESTIVAL", "COMMUNITY_EVENT", "DANCE"];
    case "homestead":
      return [...DEFAULT_ACTIVITIES, "HOME_VISIT", "HOME_LIKE", "GUESTBOOK", "DECORATE"];
    case "library":
      return [...DEFAULT_ACTIVITIES, "READ_LORE"];
    case "crafting_plaza":
    case "public_farm":
      return [...DEFAULT_ACTIVITIES, "CRAFT_SOCIAL", "COOK", "GARDEN"];
    case "guild_hall":
      return [...DEFAULT_ACTIVITIES, "GROUP_EMOTE"];
    default:
      return DEFAULT_ACTIVITIES;
  }
}

export function listSocialHubs(regionSlug?: string): SocialHubDef[] {
  return REST_HUB_CATALOG.filter((h) => !regionSlug || h.regionSlug === regionSlug).map(
    (h) => ({
      id: h.id,
      name: h.label,
      regionSlug: h.regionSlug,
      hubType: h.kind,
      capacity: h.kind === "town_plaza" || h.kind === "welcome_center" ? 80 : 40,
      presenceMultiplier:
        h.kind === "welcome_center" || h.kind === "festival_grounds" ? 1.2 : 1.0,
      rewardEligible: true,
      featuredEligible: ["town_plaza", "market_square", "festival_grounds", "welcome_center"].includes(
        h.kind,
      ),
      lowPopAmbience:
        h.kind === "library" || h.kind === "sanctuary"
          ? "quiet_npc_presence"
          : "ambient_crowd_stub",
      allowedActivities: activitiesFor(h.kind),
      crowdThresholdSoft: 20,
      crowdThresholdHard: 48,
      popularSeed: h.popularSeed,
      welcomeNewPlayers: h.kind === "welcome_center" || h.kind === "town_plaza",
    }),
  );
}

export function getSocialHub(hubId: string): SocialHubDef | undefined {
  return listSocialHubs().find((h) => h.id === hubId);
}

export function recommendHubForNewPlayer(): SocialHubDef {
  return (
    listSocialHubs().find((h) => h.welcomeNewPlayers && h.id === "commons-welcome") ??
    listSocialHubs()[0]!
  );
}
