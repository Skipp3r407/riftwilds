/**
 * Demo transparency metrics — labeled Demo Data until verified chain sources exist.
 */
import { solToLamports } from "@/lib/items/lamports";

export type TransparencyMetric = {
  key: string;
  label: string;
  amountSol: string;
  amountLamports: string;
  asset: string;
  network: string;
  lastUpdate: string;
  verificationStatus: "DEMO" | "UNVERIFIED" | "VERIFIED";
  source: string;
  explorerRef: string | null;
};

const NOW = "2026-07-17T00:00:00.000Z";

function m(key: string, label: string, sol: string): TransparencyMetric {
  return {
    key,
    label,
    amountSol: sol,
    amountLamports: solToLamports(sol).toString(),
    asset: "SOL",
    network: "devnet",
    lastUpdate: NOW,
    verificationStatus: "DEMO",
    source: "Demo ledger (not live chain)",
    explorerRef: null,
  };
}

export function getDemoTransparencyMetrics(): TransparencyMetric[] {
  return [
    m("shop_revenue", "Total official-shop revenue", "0"),
    m("marketplace_revenue", "Total marketplace revenue", "0"),
    m("crafting_fee_revenue", "Total crafting-fee revenue", "0"),
    m("upgrade_fee_revenue", "Total upgrade-fee revenue", "0"),
    m("growth_reserve", "Total sent to Growth Reserve", "0"),
    m("pet_holder_rewards", "Total allocated to Community Reward Treasury", "0"),
    m("operations", "Total sent to Operations", "0"),
    m("community_events", "Total allocated to Community Events", "0"),
    m("seller_proceeds", "Total seller proceeds", "0"),
    m("holder_claimed", "Total community rewards claimed", "0"),
    m("holder_pending", "Total community rewards pending", "0"),
    m("holder_unclaimed", "Total unclaimed community rewards", "0"),
  ];
}

export const DEMO_EPOCH = {
  key: "epoch-demo-0",
  status: "SCHEDULED" as const,
  availablePoolLamports: "0",
  availablePoolSol: "0",
  totalEligibleWeight: 0,
  eligibleWallets: 0,
  eligiblePets: 0,
  finalizedEpochs: 0,
  nextSnapshotAt: null as string | null,
  isDemo: true,
};
