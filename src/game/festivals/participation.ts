/**
 * Seasonal festival join / board — extends festival calendar.
 * Soft Credits + cosmetic stubs. Never SOL.
 */

import type { FestivalOccurrence } from "@/game/festivals/types";
import { resolveFestivalOccurrences } from "@/game/festivals/calendar";
import { resolveLivingWorldClock } from "@/game/living-world/clock";
import { trackAnalytics } from "@/lib/analytics/events";
import { creditCredits } from "@/lib/credits/ledger";

export type FestivalJoinRecord = {
  userId: string;
  festivalKey: string;
  activity: string;
  joinedAt: string;
  creditsGranted: number;
};

type Store = { joins: Map<string, FestivalJoinRecord> };

function store(): Store {
  const g = globalThis as unknown as { __rwFestivalJoins?: Store };
  if (!g.__rwFestivalJoins) g.__rwFestivalJoins = { joins: new Map() };
  return g.__rwFestivalJoins;
}

export function resetFestivalJoinsForTests(): void {
  store().joins.clear();
}

export function listActiveFestivals(now = Date.now()): FestivalOccurrence[] {
  const clock = resolveLivingWorldClock(now);
  return resolveFestivalOccurrences(clock).filter((f) => f.active);
}

export function joinFestivalActivity(params: {
  userId: string;
  festivalKey: string;
  activity: string;
  engaged: boolean;
  requestId: string;
}):
  | { ok: true; record: FestivalJoinRecord; occurrence: FestivalOccurrence }
  | { ok: false; error: string; message: string } {
  if (!params.engaged) {
    return {
      ok: false,
      error: "afk",
      message: "Join the festival in person — standing still earns nothing.",
    };
  }

  const active = listActiveFestivals();
  const occurrence = active.find((f) => f.festival.key === params.festivalKey);
  if (!occurrence) {
    return { ok: false, error: "inactive", message: "Festival is not active on the world clock." };
  }
  if (!occurrence.festival.activities.includes(params.activity)) {
    return { ok: false, error: "bad_activity", message: "Unknown festival activity." };
  }

  const joinKey = `${params.userId}::${params.festivalKey}::${params.activity}`;
  const existing = store().joins.get(joinKey);
  if (existing) {
    return { ok: true, record: existing, occurrence };
  }

  let creditsGranted = 0;
  const grant = creditCredits({
    userId: params.userId,
    amount: 15,
    reason: "EVENT_REWARD",
    requestId: params.requestId,
    metadata: { festivalKey: params.festivalKey, activity: params.activity },
  });
  if (grant.ok) creditsGranted = 15;

  const record: FestivalJoinRecord = {
    userId: params.userId,
    festivalKey: params.festivalKey,
    activity: params.activity,
    joinedAt: new Date().toISOString(),
    creditsGranted,
  };
  store().joins.set(joinKey, record);
  trackAnalytics("festival_join", {
    festival: params.festivalKey,
    activity: params.activity,
  });
  return { ok: true, record, occurrence };
}

export function festivalBoardSnapshot(userId: string) {
  const active = listActiveFestivals();
  const joins = [...store().joins.values()].filter((j) => j.userId === userId);
  return {
    active,
    joins,
    note: "Seasonal festivals are entertainment + soft Credits. Extend calendar — do not fork clocks.",
  };
}
