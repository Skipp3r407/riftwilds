/**
 * Daily community tasks + weekly goals — soft rewards only.
 */

import type { PresenceActionKind } from "@/lib/social-presence/types";

export type CommunityTaskDef = {
  id: string;
  title: string;
  description: string;
  requirement: number;
  actionKinds: PresenceActionKind[];
  rewardCredits: number;
  rewardTokens: number;
  rewardPresenceXp: number;
};

export const DAILY_COMMUNITY_TASKS: CommunityTaskDef[] = [
  {
    id: "daily-wave",
    title: "Friendly Waves",
    description: "Wave or emote near other keepers.",
    requirement: 3,
    actionKinds: ["WAVE", "EMOTE", "DANCE", "GROUP_EMOTE"],
    rewardCredits: 8,
    rewardTokens: 2,
    rewardPresenceXp: 10,
  },
  {
    id: "daily-hub",
    title: "Hub Hopper",
    description: "Visit social hubs or rest spots.",
    requirement: 2,
    actionKinds: ["TOWN_VISIT", "CAMPFIRE_REST", "SIT", "MARKET_BROWSE"],
    rewardCredits: 6,
    rewardTokens: 1,
    rewardPresenceXp: 8,
  },
  {
    id: "daily-care",
    title: "Companion Care",
    description: "Care for your Riftling in a social space.",
    requirement: 2,
    actionKinds: ["PET_CARE"],
    rewardCredits: 8,
    rewardTokens: 2,
    rewardPresenceXp: 10,
  },
  {
    id: "daily-help",
    title: "Lend a Hand",
    description: "Help or welcome a newkeeper.",
    requirement: 1,
    actionKinds: ["HELP_NEWBIE", "WELCOME_NEWBIE"],
    rewardCredits: 12,
    rewardTokens: 3,
    rewardPresenceXp: 15,
  },
];

export const WEEKLY_COMMUNITY_GOALS: CommunityTaskDef[] = [
  {
    id: "weekly-social",
    title: "Community Week",
    description: "Complete varied social actions across the week.",
    requirement: 25,
    actionKinds: [
      "WAVE",
      "CHAT",
      "HOME_VISIT",
      "COMMUNITY_EVENT",
      "PERFORMANCE",
      "HELP_NEWBIE",
      "FESTIVAL",
    ],
    rewardCredits: 40,
    rewardTokens: 12,
    rewardPresenceXp: 60,
  },
  {
    id: "weekly-host",
    title: "Campfire Host",
    description: "Rest socially at campfires and stages.",
    requirement: 10,
    actionKinds: ["CAMPFIRE_REST", "MUSIC_LISTEN", "INSTRUMENT", "PERFORMANCE"],
    rewardCredits: 30,
    rewardTokens: 8,
    rewardPresenceXp: 40,
  },
];

export function tasksForDay(now = Date.now()): CommunityTaskDef[] {
  // Rotate a subset of 3 dailies by day bucket
  const day = Math.floor(now / 86_400_000);
  const picks = [
    DAILY_COMMUNITY_TASKS[day % DAILY_COMMUNITY_TASKS.length]!,
    DAILY_COMMUNITY_TASKS[(day + 1) % DAILY_COMMUNITY_TASKS.length]!,
    DAILY_COMMUNITY_TASKS[(day + 2) % DAILY_COMMUNITY_TASKS.length]!,
  ];
  const seen = new Set<string>();
  return picks.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

export function progressTask(
  progress: Record<string, number>,
  kind: PresenceActionKind,
  tasks: CommunityTaskDef[],
): Record<string, number> {
  const next = { ...progress };
  for (const task of tasks) {
    if (task.actionKinds.includes(kind)) {
      next[task.id] = (next[task.id] ?? 0) + 1;
    }
  }
  return next;
}
