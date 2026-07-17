/**
 * Global live activity feed — hatch, restore, guild, discoveries, joins, marketplace.
 * Combines community metrics feed + expansion-style stubs; never fabricates reward SOL.
 */

import type { ActivityFeedItem as CommunityFeedItem } from "@/lib/community/metrics";
import { getCivilizationProgress } from "@/game/civilization/progress-store";
import { CIVILIZATION_MILESTONES } from "@/game/civilization/milestones";

export type EcosystemActivityKind =
  | "hatch"
  | "restore"
  | "guild_boss"
  | "discovery"
  | "join"
  | "marketplace"
  | "quest"
  | "festival"
  | "arena"
  | "token"
  | "community";

export type EcosystemActivityItem = {
  id: string;
  at: string;
  kind: EcosystemActivityKind;
  title: string;
  detail: string;
  href?: string;
  regionSlug?: string;
};

const DEMO_FEED: EcosystemActivityItem[] = [
  {
    id: "act_hatch_1",
    at: new Date(Date.now() - 2 * 60_000).toISOString(),
    kind: "hatch",
    title: "Egg hatched",
    detail: "A Grove affinity hatchling joined a Keeper's roster.",
    href: "/hatchery",
  },
  {
    id: "act_restore_1",
    at: new Date(Date.now() - 8 * 60_000).toISOString(),
    kind: "restore",
    title: "World restoration",
    detail: "Keepers contributed to a civilization milestone.",
    href: "/restoration",
  },
  {
    id: "act_market_1",
    at: new Date(Date.now() - 15 * 60_000).toISOString(),
    kind: "marketplace",
    title: "Marketplace listing",
    detail: "A pet listing settled in demo credits.",
    href: "/marketplace",
  },
  {
    id: "act_join_1",
    at: new Date(Date.now() - 22 * 60_000).toISOString(),
    kind: "join",
    title: "New Riftkeeper",
    detail: "A Keeper created their profile and claimed a starter egg path.",
    href: "/dashboard",
  },
  {
    id: "act_discover_1",
    at: new Date(Date.now() - 40 * 60_000).toISOString(),
    kind: "discovery",
    title: "Region discovery",
    detail: "An expedition stub logged a new waypoint in Ember Crater.",
    href: "/world",
    regionSlug: "ember-crater",
  },
  {
    id: "act_guild_1",
    at: new Date(Date.now() - 55 * 60_000).toISOString(),
    kind: "guild_boss",
    title: "Guild boss stub",
    detail: "A guild marked a world-boss attempt (presence service later).",
    href: "/guilds",
  },
  {
    id: "act_fest_1",
    at: new Date(Date.now() - 70 * 60_000).toISOString(),
    kind: "festival",
    title: "Festival pulse",
    detail: "Festival calendar framework marked an upcoming occurrence.",
    href: "/ecosystem",
  },
  {
    id: "act_arena_1",
    at: new Date(Date.now() - 90 * 60_000).toISOString(),
    kind: "arena",
    title: "Arena training",
    detail: "A training bout completed — no wagering.",
    href: "/arena",
  },
];

function mapCommunityItem(item: CommunityFeedItem): EcosystemActivityItem {
  const kind: EcosystemActivityKind =
    item.channel === "token"
      ? "token"
      : item.channel === "community"
        ? "community"
        : item.title.toLowerCase().includes("hatch")
          ? "hatch"
          : item.title.toLowerCase().includes("market")
            ? "marketplace"
            : "community";
  return {
    id: `community_${item.id}`,
    at: item.at,
    kind,
    title: item.title,
    detail: item.detail,
    href: kind === "token" ? "/token" : "/ecosystem",
  };
}

export function buildCivilizationActivityItems(): EcosystemActivityItem[] {
  const progress = getCivilizationProgress();
  const unlocked = CIVILIZATION_MILESTONES.filter((m) =>
    progress.unlockedMilestoneKeys.includes(m.key),
  ).slice(-3);
  return unlocked.map((m, i) => ({
    id: `civ_${m.key}`,
    at: new Date(Date.now() - (i + 1) * 120_000).toISOString(),
    kind: "restore" as const,
    title: `Restored: ${m.name}`,
    detail: m.description,
    href: "/restoration",
  }));
}

export function buildGlobalActivityFeed(opts?: {
  communityFeed?: CommunityFeedItem[];
  includeDemo?: boolean;
  limit?: number;
}): EcosystemActivityItem[] {
  const includeDemo = opts?.includeDemo !== false;
  const limit = opts?.limit ?? 24;
  const items: EcosystemActivityItem[] = [];

  if (opts?.communityFeed?.length) {
    items.push(...opts.communityFeed.map(mapCommunityItem));
  }
  items.push(...buildCivilizationActivityItems());
  if (includeDemo) {
    items.push(...DEMO_FEED);
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}
