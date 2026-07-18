/**
 * Server-authoritative presence state machine.
 * Client may suggest context; server derives state from validated activity.
 */

import {
  AFK_THRESHOLD_MS,
  IDLE_THRESHOLD_MS,
} from "@/lib/social-presence/config";
import type {
  EngagementTier,
  PresencePlayerState,
  ServerPresenceState,
} from "@/lib/social-presence/types";

export const SERVER_PRESENCE_STATES: ServerPresenceState[] = [
  "ACTIVE",
  "CASUAL_ACTIVE",
  "SOCIAL_ACTIVE",
  "RESTING",
  "IDLE",
  "AFK",
  "DISCONNECTED",
  "RECONNECTING",
  "SAFE_LOGOUT_PENDING",
  "IN_COMBAT",
  "IN_EVENT",
  "IN_MINIGAME",
  "IN_PRIVATE_INSTANCE",
];

export function derivePresenceState(params: {
  state: Pick<
    PresencePlayerState,
    | "lastMeaningfulAt"
    | "inRestZone"
    | "inputs"
    | "actions"
    | "status"
  >;
  now?: number;
  inCombat?: boolean;
  inEvent?: boolean;
  inMinigame?: boolean;
  inPrivateInstance?: boolean;
  reconnecting?: boolean;
  disconnected?: boolean;
  safeLogoutPending?: boolean;
}): ServerPresenceState {
  const now = params.now ?? Date.now();
  if (params.disconnected) return "DISCONNECTED";
  if (params.reconnecting) return "RECONNECTING";
  if (params.safeLogoutPending) return "SAFE_LOGOUT_PENDING";
  if (params.inCombat) return "IN_COMBAT";
  if (params.inPrivateInstance) return "IN_PRIVATE_INSTANCE";
  if (params.inMinigame) return "IN_MINIGAME";
  if (params.inEvent) return "IN_EVENT";

  const lastMeaningful = params.state.lastMeaningfulAt;
  const lastInput =
    params.state.inputs.length > 0
      ? params.state.inputs[params.state.inputs.length - 1]!.at
      : null;
  const last = lastMeaningful ?? lastInput;
  const age = last == null ? Number.POSITIVE_INFINITY : now - last;

  if (age >= AFK_THRESHOLD_MS) return "AFK";
  if (age >= IDLE_THRESHOLD_MS) return "IDLE";

  if (params.state.inRestZone || params.state.status === "Resting") {
    // Recent light activity keeps RESTING rather than IDLE
    if (age < IDLE_THRESHOLD_MS) return "RESTING";
  }

  const recentKinds = params.state.actions
    .filter((a) => now - a.at < IDLE_THRESHOLD_MS)
    .map((a) => a.kind);

  const socialKinds = new Set([
    "CHAT",
    "EMOTE",
    "WAVE",
    "DANCE",
    "HELP_NEWBIE",
    "HOME_VISIT",
    "HOME_LIKE",
    "GUESTBOOK",
    "COMMUNITY_EVENT",
    "PUBLIC_EVENT",
    "FESTIVAL",
    "TRADE",
    "NPC_TALK",
  ]);
  const casualKinds = new Set([
    "FISH",
    "CAMPFIRE_REST",
    "SIT",
    "MUSIC_LISTEN",
    "PET_CARE",
    "MARKET_BROWSE",
    "READ_LORE",
    "GARDEN",
    "COOK",
    "CRAFT_SOCIAL",
    "PHOTO",
    "DECORATE",
  ]);

  const socialCount = recentKinds.filter((k) => socialKinds.has(k)).length;
  const casualCount = recentKinds.filter((k) => casualKinds.has(k)).length;

  if (socialCount >= 2) return "SOCIAL_ACTIVE";
  if (casualCount >= 1 && socialCount === 0) return "CASUAL_ACTIVE";
  if (recentKinds.length > 0) return "ACTIVE";
  if (params.state.inRestZone) return "RESTING";
  return "IDLE";
}

export function engagementTierFromState(
  presenceState: ServerPresenceState,
  activityScore: number,
): EngagementTier {
  if (presenceState === "AFK" || presenceState === "DISCONNECTED") return 0;
  if (presenceState === "IDLE") return 0;
  if (presenceState === "RESTING") return 1;
  if (presenceState === "CASUAL_ACTIVE") return activityScore >= 12 ? 2 : 1;
  if (presenceState === "SOCIAL_ACTIVE") {
    if (activityScore >= 40) return 4;
    return 3;
  }
  if (
    presenceState === "IN_EVENT" ||
    presenceState === "IN_MINIGAME" ||
    presenceState === "ACTIVE"
  ) {
    return activityScore >= 25 ? 3 : 2;
  }
  return 1;
}

export function rewardsAllowedForTier(tier: EngagementTier): {
  presenceXp: boolean;
  communityRewards: boolean;
  recognition: boolean;
  helperRewards: boolean;
} {
  return {
    presenceXp: tier >= 2,
    communityRewards: tier >= 2,
    recognition: tier >= 3,
    helperRewards: tier >= 4,
  };
}

export function describePresenceState(state: ServerPresenceState): string {
  switch (state) {
    case "ACTIVE":
      return "Actively exploring or completing activities";
    case "CASUAL_ACTIVE":
      return "Low-intensity play — fishing, care, crafts";
    case "SOCIAL_ACTIVE":
      return "Socializing in hubs or with other keepers";
    case "RESTING":
      return "Resting in an approved social hub";
    case "IDLE":
      return "Becoming inactive — social rewards pausing soon";
    case "AFK":
      return "Away — no Presence XP or community rewards";
    case "DISCONNECTED":
      return "Disconnected";
    case "RECONNECTING":
      return "Reconnecting";
    case "SAFE_LOGOUT_PENDING":
      return "Safe logout pending";
    case "IN_COMBAT":
      return "In combat";
    case "IN_EVENT":
      return "In a live event";
    case "IN_MINIGAME":
      return "In a social minigame";
    case "IN_PRIVATE_INSTANCE":
      return "In a private instance";
  }
}
