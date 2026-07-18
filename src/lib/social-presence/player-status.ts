/**
 * Optional player social status — Exploring, Trading, Resting, etc.
 */

import type { PlayerSocialStatus, PresenceActionKind } from "@/lib/social-presence/types";

const VALID: PlayerSocialStatus[] = [
  "Exploring",
  "Trading",
  "Resting",
  "Socializing",
  "Fishing",
  "Helping",
  "At Home",
  "At Festival",
  "Listening",
  "Performing",
  "Away",
];

export function isValidPlayerSocialStatus(value: unknown): value is PlayerSocialStatus {
  return typeof value === "string" && (VALID as string[]).includes(value);
}

export function statusFromAction(kind: PresenceActionKind): PlayerSocialStatus | null {
  switch (kind) {
    case "TRADE":
    case "MARKET_BROWSE":
      return "Trading";
    case "CAMPFIRE_REST":
    case "SIT":
      return "Resting";
    case "CHAT":
    case "EMOTE":
    case "WAVE":
    case "DANCE":
    case "NPC_TALK":
      return "Socializing";
    case "FISH":
      return "Fishing";
    case "HELP_NEWBIE":
      return "Helping";
    case "HOME_VISIT":
    case "HOME_LIKE":
    case "GUESTBOOK":
      return "At Home";
    case "FESTIVAL":
    case "PUBLIC_EVENT":
    case "COMMUNITY_EVENT":
      return "At Festival";
    case "MUSIC_LISTEN":
      return "Listening";
    case "PERFORMANCE":
    case "INSTRUMENT":
      return "Performing";
    case "WELCOME_NEWBIE":
      return "Helping";
    case "TOWN_VISIT":
    case "PET_CARE":
    case "READ_LORE":
    case "PHOTO":
    case "MINIGAME":
    case "DAILY_TASK":
    case "GARDEN":
    case "COOK":
    case "CRAFT_SOCIAL":
    case "DECORATE":
    case "GROUP_EMOTE":
      return "Exploring";
    default:
      return null;
  }
}

export function listPlayerSocialStatuses(): PlayerSocialStatus[] {
  return [...VALID];
}
