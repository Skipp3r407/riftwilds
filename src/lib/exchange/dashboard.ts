/**
 * Rift Exchange dashboard aggregator — reuses treasury, rewards, marketplace signals.
 */

import { listEarningMethods } from "@/lib/exchange/earning-methods";
import { EXCHANGE_DISCLAIMERS, EXCHANGE_FRAMING } from "@/lib/exchange/disclaimers";
import { exchangeAntiAbuseSummary } from "@/lib/exchange/anti-abuse";
import { getDemoReputation } from "@/lib/exchange/reputation";
import { getExchangeTreasuryAllocation } from "@/lib/exchange/treasury-allocation";
import type {
  ExchangeClaimStub,
  ExchangeLeaderboardStub,
  RiftExchangeDashboard,
} from "@/lib/exchange/types";

const DEMO_CLAIMS: ExchangeClaimStub[] = [
  {
    id: "claim_demo_1",
    methodId: "weekly_challenges",
    label: "Weekly challenge — Credits band",
    amountLabel: "240 Credits (demo)",
    status: "demo",
    at: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: "claim_demo_2",
    methodId: "marketplace_sales",
    label: "Marketplace fee → vault (verified path stub)",
    amountLabel: "Pending indexer",
    status: "pending",
    at: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
  {
    id: "claim_demo_3",
    methodId: "reward_vault",
    label: "Epoch claim window",
    amountLabel: "Claims flagged off",
    status: "pending",
    at: new Date(Date.now() - 72 * 3600_000).toISOString(),
  },
];

const DEMO_LEADERBOARD: ExchangeLeaderboardStub[] = [
  {
    rank: 1,
    handle: "LanternArchivist",
    scoreLabel: "Contribution 1,240",
    note: "Demo score — not SOL earnings",
  },
  {
    rank: 2,
    handle: "TidequillKeeper",
    scoreLabel: "Contribution 980",
    note: "Demo score — not SOL earnings",
  },
  {
    rank: 3,
    handle: "EmberAtelier",
    scoreLabel: "Contribution 870",
    note: "Demo score — not SOL earnings",
  },
];

export function getRiftExchangeDashboard(opts?: {
  keeperSeed?: string;
}): RiftExchangeDashboard {
  const methods = listEarningMethods().sort((a, b) => {
    const order = { live: 0, partial: 1, scaffold: 2, coming: 3 } as const;
    return order[a.status] - order[b.status] || b.popularity - a.popularity;
  });

  return {
    title: "Rift Exchange",
    lede: "Optional entertainment rewards from skill, creation, cosmetics trade, and community contribution — never from grinding matches for guaranteed SOL.",
    framing: EXCHANGE_FRAMING,
    methods,
    recentClaims: DEMO_CLAIMS,
    leaderboard: DEMO_LEADERBOARD,
    reputation: getDemoReputation(opts?.keeperSeed),
    treasuryAllocation: getExchangeTreasuryAllocation(),
    antiAbuseSummary: exchangeAntiAbuseSummary(),
    disclaimers: [...EXCHANGE_DISCLAIMERS],
    refreshedAt: new Date().toISOString(),
  };
}
