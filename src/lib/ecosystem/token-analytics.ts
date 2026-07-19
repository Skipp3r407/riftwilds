/**
 * Live token dashboard payload — DEX/on-chain when mint configured.
 * Graceful empty/demo until mint; never fabricates reward SOL from buys.
 */

import {
  getCommunityDashboard,
  getTokenMarketMetrics,
  type CommunityDashboardPayload,
  type TokenMarketMetrics,
} from "@/lib/community/metrics";
import { projectConfig } from "@/lib/config/project";
import {
  buildTokenLiveAnalytics,
  type TokenLiveAnalytics,
} from "@/lib/ecosystem/token-live-analytics";

export type TokenSupplySnapshot = {
  circulating: number | null;
  total: number | null;
  burned: number | null;
  lockedPercent: number | null;
  note: string;
};

export type TokenTreasurySlice = {
  key: string;
  label: string;
  amountLabel: string;
  verified: boolean;
  isPlaceholder: boolean;
};

export type TokenMilestoneRow = {
  id: string;
  title: string;
  reached: boolean;
  progressLabel: string;
  rewardLabel: string;
};

export type TokenAnalyticsDashboard = {
  phase: "awaiting_mint" | "launch" | "graduated_partial" | "unavailable";
  symbol: string;
  name: string;
  mint: string | null;
  pumpFunUrl: string;
  network: string;
  market: TokenMarketMetrics;
  supply: TokenSupplySnapshot;
  treasurySlices: TokenTreasurySlice[];
  rewardVaultNote: string;
  buySellLinks: { label: string; href: string; primary: boolean }[];
  milestones: TokenMilestoneRow[];
  recentActivity: CommunityDashboardPayload["feed"];
  whales: CommunityDashboardPayload["whales"];
  topHolders: CommunityDashboardPayload["topHolders"];
  charts: {
    priceSeriesAvailable: boolean;
    volumeSeriesAvailable: boolean;
    note: string;
  };
  /** Premium /token live analytics shell (charts, burn ledger, calculator). */
  live: TokenLiveAnalytics;
  disclaimers: string[];
  refreshedAt: string;
};

function resolvePhase(market: TokenMarketMetrics): TokenAnalyticsDashboard["phase"] {
  if (market.availability === "awaiting_mint") return "awaiting_mint";
  if (market.availability === "unavailable") return "unavailable";
  if (market.liquidityUsd !== null && market.liquidityUsd > 0) return "graduated_partial";
  return "launch";
}

export async function getTokenAnalyticsDashboard(
  game?: Parameters<typeof getCommunityDashboard>[0],
): Promise<TokenAnalyticsDashboard> {
  const community = await getCommunityDashboard(game);
  const market = community.market;
  const phase = resolvePhase(market);
  const live = await buildTokenLiveAnalytics(market);

  const buySellLinks: TokenAnalyticsDashboard["buySellLinks"] = [];
  if (projectConfig.PUMP_FUN_URL) {
    buySellLinks.push({
      label: "Pump.fun (launch)",
      href: projectConfig.PUMP_FUN_URL,
      primary: phase === "awaiting_mint" || phase === "launch",
    });
  }
  if (market.pairUrl) {
    buySellLinks.push({
      label: "DEX pair",
      href: market.pairUrl,
      primary: phase === "graduated_partial",
    });
  }

  return {
    phase,
    symbol: projectConfig.TOKEN_SYMBOL,
    name: projectConfig.TOKEN_NAME,
    mint: market.mint,
    pumpFunUrl: projectConfig.PUMP_FUN_URL,
    network: projectConfig.SOLANA_NETWORK,
    market,
    supply: {
      circulating: live.metrics.circulating,
      total: live.metrics.totalSupply,
      burned: market.totalTokensBurned,
      lockedPercent: null,
      note: "Supply / locked % require a verified on-chain indexer — shown as N/A until connected.",
    },
    treasurySlices: [
      {
        key: "community_treasury",
        label: "Community treasury",
        amountLabel: "See /treasury",
        verified: false,
        isPlaceholder: true,
      },
      {
        key: "reward_vault",
        label: "Community Reward Treasury",
        amountLabel: "Verified deposits only",
        verified: false,
        isPlaceholder: true,
      },
      {
        key: "ops",
        label: "Operations",
        amountLabel: "See transparency",
        verified: false,
        isPlaceholder: true,
      },
    ],
    rewardVaultNote:
      "Buying or trading the token does not automatically generate SOL for pet owners. Community Reward Treasury funding is verified project deposits only.",
    buySellLinks,
    milestones: community.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      reached: m.reached,
      progressLabel: m.metricAvailable
        ? `${m.progressPercent}% (${m.current ?? 0}/${m.threshold})`
        : "N/A",
      rewardLabel: m.rewardLabel,
    })),
    recentActivity: community.feed,
    whales: community.whales,
    topHolders: community.topHolders,
    charts: {
      priceSeriesAvailable: live.priceChart.available,
      volumeSeriesAvailable: false,
      note: live.priceChart.note,
    },
    live,
    disclaimers: community.disclaimers,
    refreshedAt: community.refreshedAt,
  };
}

export async function getMarketScalars(): Promise<TokenMarketMetrics> {
  return getTokenMarketMetrics();
}
