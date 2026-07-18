/**
 * Player social activities — sit/wave/dance hooks into emote system where present.
 */

import type { PresenceActionKind } from "@/lib/social-presence/types";

export type PlayerActivityDef = {
  id: string;
  label: string;
  presenceKind: PresenceActionKind;
  /** Emote catalog key when available */
  emoteKey?: string;
  restFriendly: boolean;
};

export const PLAYER_SOCIAL_ACTIVITIES: PlayerActivityDef[] = [
  { id: "sit", label: "Sit", presenceKind: "SIT", emoteKey: "sit", restFriendly: true },
  { id: "wave", label: "Wave", presenceKind: "WAVE", emoteKey: "wave", restFriendly: false },
  { id: "dance", label: "Dance", presenceKind: "DANCE", emoteKey: "dance", restFriendly: false },
  {
    id: "campfire",
    label: "Rest at campfire",
    presenceKind: "CAMPFIRE_REST",
    restFriendly: true,
  },
  {
    id: "listen",
    label: "Listen to music",
    presenceKind: "MUSIC_LISTEN",
    restFriendly: true,
  },
  {
    id: "help",
    label: "Help a newkeeper",
    presenceKind: "HELP_NEWBIE",
    restFriendly: false,
  },
];

/** Map emote keys from Live World emote catalog → presence actions. */
export function presenceKindFromEmoteKey(emoteKey: string): PresenceActionKind | null {
  const key = emoteKey.toLowerCase();
  if (key.includes("wave")) return "WAVE";
  if (key.includes("dance")) return "DANCE";
  if (key.includes("sit") || key.includes("rest")) return "SIT";
  if (key.includes("cheer") || key.includes("clap")) return "EMOTE";
  return "EMOTE";
}

export function listRestFriendlyActivities(): PlayerActivityDef[] {
  return PLAYER_SOCIAL_ACTIVITIES.filter((a) => a.restFriendly);
}
