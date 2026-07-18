/**
 * Housing Competitions — seasonal homestead contests.
 * Extends housing economy + social home visits. Cosmetic prizes only.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { creditCredits } from "@/lib/credits/ledger";
import { getHomestead } from "@/lib/economy/housing-service";

export type HousingCompetitionTheme =
  | "cozy_hearth"
  | "festival_lights"
  | "garden_bloom"
  | "riftglass_gallery"
  | "keeper_row_pride";

export type HousingCompetitionSeason = {
  id: string;
  theme: HousingCompetitionTheme;
  title: string;
  startsAt: string;
  endsAt: string;
  judgePrompt: string;
};

export type HousingCompetitionEntry = {
  id: string;
  seasonId: string;
  userId: string;
  homesteadName: string;
  blurb: string;
  decorScore: number;
  visitLikes: number;
  judgeScore: number;
  totalScore: number;
  submittedAt: string;
};

type Store = {
  seasons: Map<string, HousingCompetitionSeason>;
  entries: Map<string, HousingCompetitionEntry>;
};

function store(): Store {
  const g = globalThis as unknown as { __rwHousingComp?: Store };
  if (!g.__rwHousingComp) {
    g.__rwHousingComp = { seasons: new Map(), entries: new Map() };
    seedCurrentSeason(g.__rwHousingComp);
  }
  return g.__rwHousingComp;
}

function seedCurrentSeason(s: Store) {
  const start = Date.now() - 2 * 24 * 60 * 60_000;
  const season: HousingCompetitionSeason = {
    id: `hcomp_${new Date(start).toISOString().slice(0, 10)}`,
    theme: "cozy_hearth",
    title: "Cozy Hearth Showcase",
    startsAt: new Date(start).toISOString(),
    endsAt: new Date(start + 14 * 24 * 60 * 60_000).toISOString(),
    judgePrompt: "Warm light, pet beds, and a story on every shelf.",
  };
  s.seasons.set(season.id, season);
}

export function resetHousingCompetitionsForTests(): void {
  const g = globalThis as unknown as { __rwHousingComp?: Store };
  g.__rwHousingComp = { seasons: new Map(), entries: new Map() };
  seedCurrentSeason(g.__rwHousingComp!);
}

export function getActiveHousingCompetition(now = Date.now()): HousingCompetitionSeason | null {
  for (const season of store().seasons.values()) {
    if (Date.parse(season.startsAt) <= now && now <= Date.parse(season.endsAt)) {
      return season;
    }
  }
  return null;
}

export function enterHousingCompetition(params: {
  userId: string;
  blurb: string;
  decorScore?: number;
  visitLikes?: number;
}):
  | { ok: true; entry: HousingCompetitionEntry }
  | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("HOUSING_ECONOMY_ENABLED") && !isFeatureEnabled("HOMESTEADS_ENABLED")) {
    // Allow demo when housing economy flag is on (default true)
    if (!isFeatureEnabled("HOUSING_ECONOMY_ENABLED")) {
      return { ok: false, error: "disabled", message: "Housing competitions disabled." };
    }
  }

  const season = getActiveHousingCompetition();
  if (!season) {
    return { ok: false, error: "no_season", message: "No active housing competition." };
  }

  const hs = getHomestead(params.userId);
  const entryKey = `${season.id}::${params.userId}`;
  if (store().entries.has(entryKey)) {
    return { ok: false, error: "already", message: "Already entered this season." };
  }

  const decorScore = Math.max(0, Math.min(100, params.decorScore ?? (hs ? 40 : 15)));
  const visitLikes = Math.max(0, params.visitLikes ?? 0);
  const judgeScore = Math.round((decorScore * 0.6 + Math.min(visitLikes, 40) * 0.4));
  const entry: HousingCompetitionEntry = {
    id: entryKey,
    seasonId: season.id,
    userId: params.userId,
    homesteadName: hs?.name ?? "Keeper Homestead",
    blurb: params.blurb.trim().slice(0, 160),
    decorScore,
    visitLikes,
    judgeScore,
    totalScore: judgeScore + Math.min(visitLikes, 20),
    submittedAt: new Date().toISOString(),
  };
  store().entries.set(entryKey, entry);
  trackAnalytics("housing_competition_enter", { seasonId: season.id });
  return { ok: true, entry };
}

export function listHousingCompetitionEntries(seasonId?: string): HousingCompetitionEntry[] {
  const active = seasonId ?? getActiveHousingCompetition()?.id;
  if (!active) return [];
  return [...store().entries.values()]
    .filter((e) => e.seasonId === active)
    .sort((a, b) => b.totalScore - a.totalScore);
}

export function awardHousingCompetitionTop(params: {
  userId: string;
  requestId: string;
}): { ok: boolean; message: string } {
  const entries = listHousingCompetitionEntries();
  const top = entries[0];
  if (!top || top.userId !== params.userId) {
    return { ok: false, message: "Not the current showcase leader." };
  }
  const credited = creditCredits({
    userId: params.userId,
    amount: 40,
    reason: "EVENT_REWARD",
    requestId: params.requestId,
    metadata: { kind: "housing_competition" },
  });
  return {
    ok: credited.ok,
    message: credited.ok
      ? "Showcase leader bonus — soft Credits + cosmetic title stub."
      : credited.message,
  };
}

export function housingCompetitionSnapshot() {
  const season = getActiveHousingCompetition();
  return {
    season,
    leaderboard: listHousingCompetitionEntries().slice(0, 10),
    note: "Prizes are cosmetic / Credits only. Never SOL.",
  };
}
