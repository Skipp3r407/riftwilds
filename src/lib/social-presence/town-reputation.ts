/**
 * Town Reputation & Featured Player — hourly cosmetic titles.
 * Town Hero / Master Merchant / Community Favorite — profile highlights only.
 */

import { FEATURED_HOUR_MS, FEATURED_PRIMARY_TITLES } from "@/lib/social-presence/config";
import type {
  FeaturedPlayerSlot,
  PresenceActionKind,
  TownFeaturedTitle,
  TownReputationScore,
} from "@/lib/social-presence/types";

export function hourKey(now = Date.now()): string {
  return String(Math.floor(now / FEATURED_HOUR_MS));
}

type RepStore = {
  /** hourKey → regionSlug → userId → score bits */
  scores: Map<string, Map<string, Map<string, TownReputationScore>>>;
  /** hourKey → featured slots */
  featured: Map<string, FeaturedPlayerSlot[]>;
};

const globalForRep = globalThis as unknown as { __riftwildsTownRep?: RepStore };

function store(): RepStore {
  if (!globalForRep.__riftwildsTownRep) {
    globalForRep.__riftwildsTownRep = {
      scores: new Map(),
      featured: new Map(),
    };
  }
  return globalForRep.__riftwildsTownRep;
}

export function resetTownReputationForTests(): void {
  globalForRep.__riftwildsTownRep = {
    scores: new Map(),
    featured: new Map(),
  };
}

function titleWeight(kind: PresenceActionKind, title: TownFeaturedTitle): number {
  if (title === "Town Hero") {
    if (kind === "HELP_NEWBIE") return 8;
    if (kind === "PUBLIC_EVENT" || kind === "COMMUNITY_EVENT" || kind === "FESTIVAL")
      return 5;
    if (kind === "NPC_TALK" || kind === "CHAT") return 2;
    return 1;
  }
  if (title === "Master Merchant") {
    if (kind === "TRADE" || kind === "MARKET_BROWSE") return 8;
    if (kind === "HOME_VISIT") return 2;
    return 1;
  }
  // Community Favorite
  if (kind === "EMOTE" || kind === "WAVE" || kind === "DANCE") return 5;
  if (kind === "HOME_LIKE" || kind === "GUESTBOOK") return 6;
  if (kind === "MUSIC_LISTEN" || kind === "CAMPFIRE_REST") return 3;
  return 1;
}

export function recordTownReputation(params: {
  userId: string;
  regionSlug: string;
  kind: PresenceActionKind;
  presenceXp: number;
  now?: number;
}): void {
  const now = params.now ?? Date.now();
  const hk = hourKey(now);
  const s = store();
  if (!s.scores.has(hk)) s.scores.set(hk, new Map());
  const byRegion = s.scores.get(hk)!;
  if (!byRegion.has(params.regionSlug)) byRegion.set(params.regionSlug, new Map());
  const byUser = byRegion.get(params.regionSlug)!;
  const prev = byUser.get(params.userId) ?? {
    userId: params.userId,
    regionSlug: params.regionSlug,
    hourKey: hk,
    socialActions: 0,
    presenceXp: 0,
    helps: 0,
    trades: 0,
    likesReceived: 0,
    score: 0,
  };
  prev.socialActions += 1;
  prev.presenceXp += params.presenceXp;
  if (params.kind === "HELP_NEWBIE") prev.helps += 1;
  if (params.kind === "TRADE" || params.kind === "MARKET_BROWSE") prev.trades += 1;
  if (params.kind === "HOME_LIKE" || params.kind === "GUESTBOOK") prev.likesReceived += 1;

  // Composite score uses best title affinity for ranking later
  const affinity = Math.max(
    ...FEATURED_PRIMARY_TITLES.map((t) => titleWeight(params.kind, t)),
  );
  prev.score += affinity + Math.floor(params.presenceXp / 2);
  byUser.set(params.userId, prev);

  // Invalidate cached featured for this hour so it recomputes
  s.featured.delete(hk);
}

function displayNameFor(userId: string): string {
  if (userId.startsWith("guest_")) return "Guest Keeper";
  if (userId.length <= 12) return userId;
  return `${userId.slice(0, 6)}…${userId.slice(-4)}`;
}

function scoreForTitle(entry: TownReputationScore, title: TownFeaturedTitle): number {
  if (title === "Town Hero") {
    return entry.helps * 10 + entry.presenceXp + entry.socialActions;
  }
  if (title === "Master Merchant") {
    return entry.trades * 10 + entry.presenceXp * 0.8 + entry.socialActions;
  }
  return entry.likesReceived * 10 + entry.socialActions * 2 + entry.presenceXp * 0.6;
}

/**
 * Select up to 3 featured players per hour across hubs.
 * Requires genuine social activity (score threshold).
 */
export function resolveFeaturedPlayers(now = Date.now()): FeaturedPlayerSlot[] {
  const hk = hourKey(now);
  const s = store();
  const cached = s.featured.get(hk);
  if (cached) return cached;

  const byRegion = s.scores.get(hk);
  if (!byRegion) {
    s.featured.set(hk, []);
    return [];
  }

  const all: TownReputationScore[] = [];
  for (const users of byRegion.values()) {
    for (const entry of users.values()) {
      if (entry.socialActions >= 2 && entry.presenceXp >= 8) all.push(entry);
    }
  }

  const usedUsers = new Set<string>();
  const slots: FeaturedPlayerSlot[] = [];
  const awardedAt = new Date(now).toISOString();

  for (const title of FEATURED_PRIMARY_TITLES) {
    let best: TownReputationScore | null = null;
    let bestScore = -1;
    for (const entry of all) {
      if (usedUsers.has(entry.userId)) continue;
      const sc = scoreForTitle(entry, title);
      if (sc > bestScore) {
        bestScore = sc;
        best = entry;
      }
    }
    if (best && bestScore > 0) {
      usedUsers.add(best.userId);
      slots.push({
        title,
        userId: best.userId,
        displayName: displayNameFor(best.userId),
        regionSlug: best.regionSlug,
        hourKey: hk,
        score: bestScore,
        awardedAt,
      });
    }
  }

  s.featured.set(hk, slots);
  return slots;
}

export function featuredTitlesForUser(
  userId: string,
  now = Date.now(),
): TownFeaturedTitle[] {
  return resolveFeaturedPlayers(now)
    .filter((s) => s.userId === userId)
    .map((s) => s.title);
}

export function listFeaturedForRegion(
  regionSlug: string,
  now = Date.now(),
): FeaturedPlayerSlot[] {
  return resolveFeaturedPlayers(now).filter((s) => s.regionSlug === regionSlug);
}
