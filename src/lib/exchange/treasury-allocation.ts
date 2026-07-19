/**
 * Configurable treasury allocation display for Rift Exchange.
 * Mirrors community treasury budgets — not a promise of player payouts.
 */

import { getCommunityTreasuryDashboard } from "@/lib/ecosystem/treasury";

export type ExchangeTreasuryLine = {
  key: string;
  label: string;
  percent: number;
  note: string;
};

/** Default entertainment allocation — configurable via override later. */
export const DEFAULT_EXCHANGE_TREASURY_ALLOCATION: ExchangeTreasuryLine[] = [
  {
    key: "rewards",
    label: "Community reward vault",
    percent: 40,
    note: "Verified fee / deposit shares — never from token purchases alone.",
  },
  {
    key: "growth",
    label: "World & content growth",
    percent: 25,
    note: "Live World capacity, art, systems.",
  },
  {
    key: "events",
    label: "Events, creators, festivals",
    percent: 15,
    note: "Seasonals, creator hub, grant stubs.",
  },
  {
    key: "ops",
    label: "Operations & moderation",
    percent: 15,
    note: "Infra, support, marketplace integrity.",
  },
  {
    key: "reserves",
    label: "Emergency reserves",
    percent: 5,
    note: "Fail-closed buffer — not player rewards.",
  },
];

export function getExchangeTreasuryAllocation(): ExchangeTreasuryLine[] {
  const dash = getCommunityTreasuryDashboard();
  if (dash.budgets.length > 0) {
    return dash.budgets.map((b) => ({
      key: b.key,
      label: b.label,
      percent: b.allocationPercent,
      note: b.note,
    }));
  }
  return DEFAULT_EXCHANGE_TREASURY_ALLOCATION;
}
