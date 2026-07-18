/**
 * Home visit likes / guestbook / rating stubs + popularity.
 */

import type { HomePopularity, HomeVisitRecord } from "@/lib/social-presence/types";

const DEMO_HOMES: { homeId: string; ownerLabel: string }[] = [
  { homeId: "home-mira", ownerLabel: "Keeper Mira" },
  { homeId: "home-reed", ownerLabel: "Yard Captain Reed" },
  { homeId: "home-echo", ownerLabel: "Archivist Echo" },
  { homeId: "home-player-demo", ownerLabel: "Your Homestead" },
];

type HomeStore = {
  visits: HomeVisitRecord[];
  likes: Map<string, Set<string>>;
  ratings: Map<string, number[]>;
};

const globalForHomes = globalThis as unknown as { __riftwildsHomeVisits?: HomeStore };

function store(): HomeStore {
  if (!globalForHomes.__riftwildsHomeVisits) {
    globalForHomes.__riftwildsHomeVisits = {
      visits: [],
      likes: new Map(),
      ratings: new Map(),
    };
  }
  return globalForHomes.__riftwildsHomeVisits;
}

export function resetHomeVisitsForTests(): void {
  globalForHomes.__riftwildsHomeVisits = {
    visits: [],
    likes: new Map(),
    ratings: new Map(),
  };
}

export function listDemoHomes() {
  return DEMO_HOMES;
}

export function recordHomeVisit(params: {
  homeId: string;
  visitorId: string;
  liked?: boolean;
  rating?: number | null;
  guestbookNote?: string | null;
  now?: number;
}): HomeVisitRecord {
  const s = store();
  const at = new Date(params.now ?? Date.now()).toISOString();
  const record: HomeVisitRecord = {
    homeId: params.homeId,
    visitorId: params.visitorId,
    at,
    liked: Boolean(params.liked),
    rating:
      params.rating != null && params.rating >= 1 && params.rating <= 5
        ? Math.floor(params.rating)
        : null,
    guestbookNote: params.guestbookNote?.slice(0, 200) ?? null,
  };
  s.visits.push(record);
  if (s.visits.length > 500) s.visits.splice(0, s.visits.length - 500);

  if (record.liked) {
    const set = s.likes.get(params.homeId) ?? new Set();
    set.add(params.visitorId);
    s.likes.set(params.homeId, set);
  }
  if (record.rating != null) {
    const arr = s.ratings.get(params.homeId) ?? [];
    arr.push(record.rating);
    s.ratings.set(params.homeId, arr);
  }
  return record;
}

export function getHomePopularity(homeId: string): HomePopularity {
  const s = store();
  const demo = DEMO_HOMES.find((h) => h.homeId === homeId);
  const visits = s.visits.filter((v) => v.homeId === homeId).length;
  const likes = s.likes.get(homeId)?.size ?? 0;
  const ratings = s.ratings.get(homeId) ?? [];
  const avgRating =
    ratings.length === 0
      ? null
      : Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  const popularityScore = visits * 2 + likes * 5 + (avgRating ?? 0) * 3;
  return {
    homeId,
    ownerLabel: demo?.ownerLabel ?? homeId,
    likes,
    visits,
    avgRating,
    popularityScore,
  };
}

export function listPopularHomes(limit = 5): HomePopularity[] {
  return DEMO_HOMES.map((h) => getHomePopularity(h.homeId))
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit);
}
