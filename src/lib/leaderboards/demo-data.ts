import type {
  AffinityFilter,
  LeaderboardEntry,
  LeaderboardSeason,
  LeaderboardTab,
  LeaderboardTimeRange,
  TrendDirection,
} from "@/lib/leaderboards/types";

/** Demo wallet used for the "your rank" highlight row. */
export const DEMO_YOU_WALLET = "RwDemo7xKXtg2CWyourRankPlaceholder111";

export const LEADERBOARD_SEASONS: LeaderboardSeason[] = [
  {
    id: "s1-rift-dawn",
    label: "Season 1 · Rift Dawn",
    shortLabel: "S1",
    status: "live",
    startsAt: "2026-06-01",
    endsAt: "2026-08-31",
  },
  {
    id: "s0-training",
    label: "Season 0 · Training Grounds",
    shortLabel: "S0",
    status: "ended",
    startsAt: "2026-03-01",
    endsAt: "2026-05-31",
  },
  {
    id: "preseason",
    label: "Preseason · Soft Ladder",
    shortLabel: "PRE",
    status: "ended",
    startsAt: "2026-01-15",
    endsAt: "2026-02-28",
  },
];

export const CURRENT_SEASON_ID = "s1-rift-dawn";

const AFFINITIES: Exclude<AffinityFilter, "ALL">[] = [
  "EMBER",
  "TIDE",
  "GROVE",
  "STORM",
  "STONE",
  "FROST",
  "RADIANT",
  "VOID",
  "ALLOY",
  "SPIRIT",
];

const SPECIES: { slug: string; name: string; affinity: Exclude<AffinityFilter, "ALL"> }[] = [
  { slug: "ashwing", name: "Ashwing", affinity: "EMBER" },
  { slug: "emberfox", name: "Emberfox", affinity: "EMBER" },
  { slug: "coralurge", name: "Coralurge", affinity: "TIDE" },
  { slug: "tideotter", name: "Tideotter", affinity: "TIDE" },
  { slug: "groveowl", name: "Groveowl", affinity: "GROVE" },
  { slug: "rootling", name: "Rootling", affinity: "GROVE" },
  { slug: "staticat", name: "Staticat", affinity: "STORM" },
  { slug: "stormmoth", name: "Stormmoth", affinity: "STORM" },
  { slug: "quartzhorn", name: "Quartzhorn", affinity: "STONE" },
  { slug: "stonegrub", name: "Stonegrub", affinity: "STONE" },
  { slug: "frostfin", name: "Frostfin", affinity: "FROST" },
  { slug: "snowpuff", name: "Snowpuff", affinity: "FROST" },
  { slug: "radiantkit", name: "Radiantkit", affinity: "RADIANT" },
  { slug: "glimmerp", name: "Glimmerp", affinity: "RADIANT" },
  { slug: "voidling", name: "Voidling", affinity: "VOID" },
  { slug: "mistwraith", name: "Mistwraith", affinity: "VOID" },
  { slug: "ironbloom", name: "Ironbloom", affinity: "ALLOY" },
  { slug: "cogpup", name: "Cogpup", affinity: "ALLOY" },
  { slug: "auralynx", name: "Auralynx", affinity: "SPIRIT" },
  { slug: "veilhare", name: "Veilhare", affinity: "SPIRIT" },
];

const NAMES = [
  "RiftKeeper",
  "NovaShard",
  "EmberWake",
  "TideCaller",
  "GroveSentinel",
  "StormHex",
  "StoneBinder",
  "FrostLatch",
  "RadiantOrb",
  "VoidWalker",
  "AlloyFang",
  "SpiritDrift",
  "LanternJay",
  "PeakWatch",
  "MarshBloom",
  "ScrapPilot",
  "Celestora",
  "HollowMoth",
  "FossilHound",
  "CraterHorn",
  "MoonRay",
  "SpireKite",
  "CitadelWing",
  "RiftSlug",
];

function shortWallet(wallet: string): string {
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
}

function trendFor(rank: number): { trend: TrendDirection; trendDelta: number } {
  if (rank <= 3) return { trend: "up", trendDelta: 2 + (rank % 3) };
  if (rank % 5 === 0) return { trend: "down", trendDelta: 1 + (rank % 4) };
  if (rank % 4 === 0) return { trend: "flat", trendDelta: 0 };
  return { trend: "up", trendDelta: 1 + (rank % 5) };
}

function buildEntries(seed: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  for (let i = 0; i < 24; i++) {
    const species = SPECIES[(i + seed) % SPECIES.length]!;
    const name = NAMES[(i + seed * 3) % NAMES.length]!;
    const wallet =
      i === 11
        ? DEMO_YOU_WALLET
        : `Rw${(1000 + i * 37 + seed * 11).toString(16)}${name.slice(0, 4)}${i.toString(16)}Pad`;
    const { trend, trendDelta } = trendFor(i + 1);
    const wins = 48 - i * 2 + (seed % 5);
    const losses = 8 + i + (seed % 3);
    const riftPoints = 4200 - i * 110 - (seed % 40) + (i === 11 ? 55 : 0);
    const arenaPoints = Math.round(riftPoints * 0.55);

    entries.push({
      rank: i + 1,
      playerName: i === 11 ? "You · DemoKeeper" : name,
      wallet,
      walletShort: shortWallet(wallet),
      speciesSlug: species.slug,
      speciesName: species.name,
      affinity: species.affinity,
      riftPoints: Math.max(140, riftPoints),
      arenaPoints: Math.max(80, arenaPoints),
      wins: Math.max(2, wins),
      losses: Math.max(1, losses),
      binderCards: Math.max(8, 96 - i * 3 + (seed % 7)),
      careScore: Math.max(40, 980 - i * 28 - (seed % 20)),
      collectionScore: Math.max(10, 420 - i * 12 + (seed % 15)),
      trend,
      trendDelta,
      isYou: i === 11,
    });
  }

  return entries;
}

const SEASON_ENTRIES: Record<string, Record<LeaderboardTimeRange, LeaderboardEntry[]>> = {
  "s1-rift-dawn": {
    season: buildEntries(1),
    week: buildEntries(7).map((e, i) => ({
      ...e,
      riftPoints: Math.max(50, Math.round(e.riftPoints * 0.22)),
      arenaPoints: Math.max(40, Math.round(e.arenaPoints * 0.22)),
      binderCards: Math.max(2, Math.round(e.binderCards * 0.2)),
      wins: Math.max(1, Math.round(e.wins * 0.18)),
      losses: Math.max(0, Math.round(e.losses * 0.2)),
      rank: i + 1,
    })),
  },
  "s0-training": {
    season: buildEntries(3).map((e) => ({
      ...e,
      riftPoints: Math.max(100, Math.round(e.riftPoints * 0.7)),
      arenaPoints: Math.max(80, Math.round(e.arenaPoints * 0.7)),
    })),
    week: buildEntries(9).map((e, i) => ({
      ...e,
      riftPoints: Math.max(25, Math.round(e.riftPoints * 0.15)),
      arenaPoints: Math.max(20, Math.round(e.arenaPoints * 0.15)),
      rank: i + 1,
    })),
  },
  preseason: {
    season: buildEntries(5).map((e) => ({
      ...e,
      riftPoints: Math.max(60, Math.round(e.riftPoints * 0.45)),
      arenaPoints: Math.max(50, Math.round(e.arenaPoints * 0.45)),
    })),
    week: buildEntries(2).map((e, i) => ({
      ...e,
      riftPoints: Math.max(12, Math.round(e.riftPoints * 0.1)),
      arenaPoints: Math.max(10, Math.round(e.arenaPoints * 0.1)),
      rank: i + 1,
    })),
  },
};

export function getDemoLeaderboard(params: {
  seasonId: string;
  timeRange: LeaderboardTimeRange;
}): LeaderboardEntry[] {
  const season = SEASON_ENTRIES[params.seasonId] ?? SEASON_ENTRIES[CURRENT_SEASON_ID]!;
  return season[params.timeRange].map((e) => ({ ...e }));
}

export function scoreForTab(entry: LeaderboardEntry, tab: LeaderboardTab): number {
  if (tab === "rift") return entry.riftPoints;
  if (tab === "care") return entry.careScore;
  if (tab === "collection") return entry.binderCards || entry.collectionScore;
  if (tab === "arena") return entry.arenaPoints;
  return entry.riftPoints;
}

export function winRatePercent(entry: LeaderboardEntry): number {
  const total = entry.wins + entry.losses;
  if (total <= 0) return 0;
  return Math.round((entry.wins / total) * 100);
}

export function filterLeaderboardEntries(
  entries: LeaderboardEntry[],
  opts: {
    tab: LeaderboardTab;
    affinity: AffinityFilter;
    query: string;
  },
): LeaderboardEntry[] {
  const q = opts.query.trim().toLowerCase();
  const filtered = entries.filter((e) => {
    if (opts.affinity !== "ALL" && e.affinity !== opts.affinity) return false;
    if (!q) return true;
    return (
      e.playerName.toLowerCase().includes(q) ||
      e.wallet.toLowerCase().includes(q) ||
      e.walletShort.toLowerCase().includes(q) ||
      e.speciesName.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort(
    (a, b) => scoreForTab(b, opts.tab) - scoreForTab(a, opts.tab),
  );

  return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
}

export const AFFINITY_OPTIONS: { id: AffinityFilter; label: string }[] = [
  { id: "ALL", label: "All affinities" },
  ...AFFINITIES.map((id) => ({ id, label: id.charAt(0) + id.slice(1).toLowerCase() })),
];
