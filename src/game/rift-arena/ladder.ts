/**
 * Ranked ladder scaffolding — local demo ratings only.
 * No SOL. No guaranteed rewards.
 */

import type { RiftArenaChampion, RiftArenaLadderEntry, RiftArenaSeason } from "@/game/rift-arena/types";
import { riftArenaConfig } from "@/game/rift-arena/config";

type LadderMaps = {
  ratings: Map<string, { rating: number; wins: number; losses: number; streak: number; name: string }>;
};

const globalForLadder = globalThis as unknown as {
  __riftwildsRiftArenaLadder?: LadderMaps;
};

function maps(): LadderMaps {
  if (!globalForLadder.__riftwildsRiftArenaLadder) {
    const ratings = new Map<
      string,
      { rating: number; wins: number; losses: number; streak: number; name: string }
    >();
    // Seed a hall-of-champions flavored demo board.
    const seeds = [
      ["Kael Forge", 1420],
      ["Elara Venn", 1385],
      ["Tideward Mira", 1310],
      ["Grove Keeper", 1260],
      ["Stormspire Lin", 1215],
    ] as const;
    for (const [name, rating] of seeds) {
      const key = `seed_${name.toLowerCase().replace(/\s+/g, "_")}`;
      ratings.set(key, {
        name,
        rating,
        wins: Math.floor(rating / 40),
        losses: Math.floor(rating / 90),
        streak: 2,
      });
    }
    globalForLadder.__riftwildsRiftArenaLadder = { ratings };
  }
  return globalForLadder.__riftwildsRiftArenaLadder;
}

export function currentSeason(): RiftArenaSeason {
  return {
    id: "season-rift-01",
    name: "Season of Open Rifts",
    startsAt: "2026-07-01T00:00:00.000Z",
    endsAt: "2026-09-30T23:59:59.000Z",
    active: true,
  };
}

export function getOrCreateRating(ownerKey: string, displayName?: string) {
  const m = maps().ratings;
  let row = m.get(ownerKey);
  if (!row) {
    row = {
      name: displayName?.trim() || "Keeper",
      rating: riftArenaConfig.RANKED_START_RATING,
      wins: 0,
      losses: 0,
      streak: 0,
    };
    m.set(ownerKey, row);
  }
  return row;
}

/** Simple Elo-ish update for local scaffold — not production Glicko. */
export function recordRankedResult(input: {
  winnerKey: string;
  loserKey: string;
  winnerName?: string;
  loserName?: string;
}): void {
  const w = getOrCreateRating(input.winnerKey, input.winnerName);
  const l = getOrCreateRating(input.loserKey, input.loserName);
  const expected =
    1 / (1 + Math.pow(10, (l.rating - w.rating) / 400));
  const k = 24;
  w.rating = Math.round(w.rating + k * (1 - expected));
  l.rating = Math.max(100, Math.round(l.rating + k * (0 - (1 - expected))));
  w.wins += 1;
  w.streak = w.streak >= 0 ? w.streak + 1 : 1;
  l.losses += 1;
  l.streak = l.streak <= 0 ? l.streak - 1 : -1;
}

export function listLadder(limit = 20): RiftArenaLadderEntry[] {
  return [...maps().ratings.entries()]
    .map(([, row]) => row)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
    .map((row, i) => ({
      rank: i + 1,
      displayName: row.name,
      rating: row.rating,
      wins: row.wins,
      losses: row.losses,
      streak: row.streak,
    }));
}

export function hallOfChampions(): RiftArenaChampion[] {
  const season = currentSeason();
  return listLadder(3).map((e, i) => ({
    seasonId: season.id,
    displayName: e.displayName,
    title: i === 0 ? "Rift Champion" : i === 1 ? "Storm Runner-Up" : "Bronze Gatekeeper",
    rating: e.rating,
  }));
}

export function __clearLadderForTests(): void {
  delete globalForLadder.__riftwildsRiftArenaLadder;
}
