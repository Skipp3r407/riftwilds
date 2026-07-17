/**
 * Community / Pump.fun metrics — best-effort public data + honest empty states.
 * Never fabricates reward SOL or holder counts when sources are unavailable.
 */

import { getPumpfunPublicConfig } from "@/lib/community/pumpfun-config";
import {
  evaluateMilestones,
  type CommunityMetricSnapshot,
  type MilestoneProgress,
} from "@/lib/community/milestones";
export type MetricAvailability = "live" | "partial" | "awaiting_mint" | "unavailable";

export type TokenMarketMetrics = {
  mint: string | null;
  marketCapUsd: number | null;
  priceUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  holderCount: number | null;
  bondingCurveProgressPercent: number | null;
  bondingCurveApplicable: boolean;
  totalTokensBurned: number | null;
  burnsSupported: boolean;
  pairUrl: string | null;
  source: string;
  availability: MetricAvailability;
  note: string;
};

export type WhaleEntry = {
  rank: number;
  walletLabel: string;
  /** Percent of tracked supply if known; null when unavailable. */
  percentOfSupply: number | null;
  /** Relative size bucket for UI when exact % unknown. */
  size: "whale" | "large" | "medium";
};

export type CommunityActivityCounts = {
  newHolders: number | null;
  marketplaceTrades: number;
  eggsHatched: number;
  petsEvolved: number;
};

export type ActivityFeedItem = {
  id: string;
  at: string;
  channel: "game" | "community" | "token";
  title: string;
  detail: string;
};

export type CommunityDashboardPayload = {
  config: ReturnType<typeof getPumpfunPublicConfig>;
  market: TokenMarketMetrics;
  activity: CommunityActivityCounts;
  milestones: MilestoneProgress[];
  whales: WhaleEntry[];
  topHolders: WhaleEntry[];
  feed: ActivityFeedItem[];
  refreshedAt: string;
  disclaimers: string[];
};

type GameMetricInput = {
  eggsHatched?: number;
  marketplaceTrades?: number;
  petsEvolved?: number;
  livingCreatures?: number;
};

async function fetchDexScreener(mint: string): Promise<{
  marketCapUsd: number | null;
  priceUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  pairUrl: string | null;
  source: string;
}> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return emptyDex("dexscreener_http_error");
    }
    const json = (await res.json()) as {
      pairs?: Array<{
        url?: string;
        priceUsd?: string;
        marketCap?: number;
        fdv?: number;
        liquidity?: { usd?: number };
        volume?: { h24?: number };
      }>;
    };
    const pair = json.pairs?.[0];
    if (!pair) return emptyDex("dexscreener_no_pairs");
    return {
      marketCapUsd: pair.marketCap ?? pair.fdv ?? null,
      priceUsd: pair.priceUsd ? Number(pair.priceUsd) : null,
      liquidityUsd: pair.liquidity?.usd ?? null,
      volume24hUsd: pair.volume?.h24 ?? null,
      pairUrl: pair.url ?? null,
      source: "dexscreener",
    };
  } catch {
    return emptyDex("dexscreener_fetch_failed");
  }
}

function emptyDex(source: string) {
  return {
    marketCapUsd: null,
    priceUsd: null,
    liquidityUsd: null,
    volume24hUsd: null,
    pairUrl: null,
    source,
  };
}

/**
 * Build market metrics. Holder count / bonding curve / burns stay null or N/A
 * until a verified indexer is wired — never invent numbers.
 */
export async function getTokenMarketMetrics(): Promise<TokenMarketMetrics> {
  const config = getPumpfunPublicConfig();
  if (!config.mint) {
    return {
      mint: null,
      marketCapUsd: null,
      priceUsd: null,
      liquidityUsd: null,
      volume24hUsd: null,
      holderCount: null,
      bondingCurveProgressPercent: null,
      bondingCurveApplicable: true,
      totalTokensBurned: null,
      burnsSupported: false,
      pairUrl: null,
      source: "none",
      availability: "awaiting_mint",
      note: "Set NEXT_PUBLIC_PUMPFUN_MINT (and optionally NEXT_PUBLIC_PUMPFUN_URL) to enable live token metrics.",
    };
  }

  const dex = await fetchDexScreener(config.mint);
  const hasAny =
    dex.marketCapUsd !== null || dex.priceUsd !== null || dex.liquidityUsd !== null;

  return {
    mint: config.mint,
    marketCapUsd: dex.marketCapUsd,
    priceUsd: dex.priceUsd,
    liquidityUsd: dex.liquidityUsd,
    volume24hUsd: dex.volume24hUsd,
    holderCount: null,
    bondingCurveProgressPercent: null,
    bondingCurveApplicable: true,
    totalTokensBurned: null,
    burnsSupported: false,
    pairUrl: dex.pairUrl ?? config.chartExternalUrl,
    source: dex.source,
    availability: hasAny ? "partial" : "unavailable",
    note: hasAny
      ? "Market cap / price from DexScreener when a pair exists. Holders, bonding curve, and burns require a dedicated indexer after mint launch — shown as N/A until then."
      : "Mint configured but no public pair data yet. Metrics stay blank rather than estimated.",
  };
}

/** Anonymized placeholder leaderboard — empty until a holder indexer is connected. */
export function getWhaleTracker(holderCount: number | null): {
  whales: WhaleEntry[];
  topHolders: WhaleEntry[];
} {
  if (holderCount === null) {
    return { whales: [], topHolders: [] };
  }
  // No fabricated wallets — only return empty until real holder API lands.
  return { whales: [], topHolders: [] };
}

export function buildCommunityActivity(
  game: GameMetricInput,
  holderCount: number | null,
): CommunityActivityCounts {
  return {
    newHolders: holderCount,
    marketplaceTrades: game.marketplaceTrades ?? 0,
    eggsHatched: game.eggsHatched ?? 0,
    petsEvolved: game.petsEvolved ?? 0,
  };
}

export function buildActivityFeed(params: {
  activity: CommunityActivityCounts;
  market: TokenMarketMetrics;
  milestones: MilestoneProgress[];
}): ActivityFeedItem[] {
  const now = new Date().toISOString();
  const items: ActivityFeedItem[] = [];

  items.push({
    id: "game_eggs",
    at: now,
    channel: "game",
    title: "Eggs hatched",
    detail: `${params.activity.eggsHatched} total eggs hatched across The Riftwilds.`,
  });
  items.push({
    id: "game_trades",
    at: now,
    channel: "game",
    title: "Marketplace trades",
    detail: `${params.activity.marketplaceTrades} recorded marketplace settlements.`,
  });
  items.push({
    id: "game_evolved",
    at: now,
    channel: "game",
    title: "Pets evolved",
    detail: `${params.activity.petsEvolved} evolution events recorded.`,
  });

  if (params.activity.newHolders !== null) {
    items.push({
      id: "token_holders",
      at: now,
      channel: "token",
      title: "Token holders",
      detail: `${params.activity.newHolders} holders tracked.`,
    });
  } else {
    items.push({
      id: "token_holders_pending",
      at: now,
      channel: "token",
      title: "Holder count",
      detail:
        params.market.availability === "awaiting_mint"
          ? "Awaiting mint configuration — holder count not fabricated."
          : "Holder indexer not connected — shown as N/A.",
    });
  }

  if (params.market.marketCapUsd !== null) {
    items.push({
      id: "token_mcap",
      at: now,
      channel: "token",
      title: "Market cap update",
      detail: `Reported market cap ≈ $${Math.round(params.market.marketCapUsd).toLocaleString()} (DexScreener).`,
    });
  }

  for (const m of params.milestones.filter((x) => x.reached).slice(0, 3)) {
    items.push({
      id: `milestone_${m.id}`,
      at: now,
      channel: "community",
      title: `Milestone: ${m.title}`,
      detail: m.rewardLabel,
    });
  }

  return items;
}

export async function getCommunityDashboard(
  game: GameMetricInput = {},
): Promise<CommunityDashboardPayload> {
  const config = getPumpfunPublicConfig();
  const market = await getTokenMarketMetrics();
  const activity = buildCommunityActivity(game, market.holderCount);
  const snapshot: CommunityMetricSnapshot = {
    holders: activity.newHolders,
    marketplaceTrades: activity.marketplaceTrades,
    eggsHatched: activity.eggsHatched,
    petsEvolved: activity.petsEvolved,
  };
  const milestones = evaluateMilestones(snapshot);
  const { whales, topHolders } = getWhaleTracker(market.holderCount);
  const feed = buildActivityFeed({ activity, market, milestones });

  return {
    config,
    market,
    activity,
    milestones,
    whales,
    topHolders,
    feed,
    refreshedAt: new Date().toISOString(),
    disclaimers: [
      "Buying the Pump.fun coin does not automatically generate SOL for pet owners.",
      "Community Reward Treasury distributions are funded only by verified, project-controlled deposits (game revenue, marketplace fees, optional creator allocations) — never by inventing per-trade pet income.",
      "Token metrics may be partial or unavailable until mint launch and indexers are connected. Blank / N/A means unknown — not zero rewards.",
      "Top holders are anonymized when shown.",
    ],
  };
}
