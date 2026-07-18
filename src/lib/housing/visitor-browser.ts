/**
 * Visitor browser — public / featured / friends / guild home discovery.
 * Integrates social home visits + housing competition ratings when present.
 */

import { housingCompetitionSnapshot } from "@/lib/housing-competitions";
import { listHomes } from "@/lib/housing/instance-service";
import { listPopularHomes } from "@/lib/social-presence/home-visits";
import type { HomeVisitPolicy, PlayerHome } from "@/lib/housing/types";

export type VisitorBrowserEntry = {
  homeId: string;
  name: string;
  ownerUserId: string;
  propertyTier: string;
  visitPolicy: HomeVisitPolicy;
  likes: number;
  featured: boolean;
  exteriorFacadeKey: string;
  competitionDecorScore: number | null;
  source: "player_home" | "social_demo";
};

export function browseHomes(params?: {
  mode?: "public" | "featured" | "friends" | "guild" | "all";
  friendIds?: string[];
  guildMateIds?: string[];
  limit?: number;
}): VisitorBrowserEntry[] {
  const mode = params?.mode ?? "all";
  const limit = params?.limit ?? 24;
  const homes = listHomes();
  let filtered: PlayerHome[] = homes;

  if (mode === "public") {
    filtered = homes.filter((h) => h.visitPolicy === "PUBLIC" || h.featured);
  } else if (mode === "featured") {
    filtered = homes.filter((h) => h.featured || h.visitPolicy === "FEATURED");
  } else if (mode === "friends") {
    const set = new Set(params?.friendIds ?? []);
    filtered = homes.filter(
      (h) =>
        (h.visitPolicy === "FRIENDS" || h.visitPolicy === "PUBLIC") &&
        (set.size === 0 || set.has(h.ownerUserId)),
    );
  } else if (mode === "guild") {
    const set = new Set(params?.guildMateIds ?? []);
    filtered = homes.filter(
      (h) =>
        (h.visitPolicy === "GUILD" || h.visitPolicy === "PUBLIC") &&
        (set.size === 0 || set.has(h.ownerUserId)),
    );
  }

  const comp = housingCompetitionSnapshot();
  const scoreByUser = new Map<string, number>();
  for (const e of comp.leaderboard ?? []) {
    scoreByUser.set(e.userId, e.decorScore ?? 0);
  }

  const entries: VisitorBrowserEntry[] = filtered.map((h) => ({
    homeId: h.homeId,
    name: h.name,
    ownerUserId: h.ownerUserId,
    propertyTier: h.propertyTier,
    visitPolicy: h.visitPolicy,
    likes: h.likes,
    featured: h.featured,
    exteriorFacadeKey: h.exteriorFacadeKey,
    competitionDecorScore: scoreByUser.get(h.ownerUserId) ?? null,
    source: "player_home" as const,
  }));

  // Seed social demo homes when catalog is thin
  if (entries.length < 4) {
    for (const pop of listPopularHomes(4)) {
      if (entries.some((e) => e.homeId === pop.homeId)) continue;
      entries.push({
        homeId: pop.homeId,
        name: pop.ownerLabel,
        ownerUserId: "npc-demo",
        propertyTier: "cottage",
        visitPolicy: "PUBLIC",
        likes: pop.likes,
        featured: pop.popularityScore > 20,
        exteriorFacadeKey: "prop-cottage",
        competitionDecorScore: null,
        source: "social_demo",
      });
    }
  }

  return entries
    .sort((a, b) => b.likes - a.likes || (b.competitionDecorScore ?? 0) - (a.competitionDecorScore ?? 0))
    .slice(0, limit);
}
