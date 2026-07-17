/**
 * Community milestone tracker — content config only.
 * Progress is filled by server metrics; unlocks are never fabricated as rewards SOL.
 */

export type CommunityMilestone = {
  id: string;
  metric: "holders" | "marketplace_trades" | "eggs_hatched" | "pets_evolved";
  threshold: number;
  title: string;
  rewardLabel: string;
  description: string;
};

export const COMMUNITY_MILESTONES: CommunityMilestone[] = [
  {
    id: "holders_500",
    metric: "holders",
    threshold: 500,
    title: "500 holders",
    rewardLabel: "New Riftling species unlock",
    description: "Community reaches 500 unique token holders — unlock a new starter Riftling line.",
  },
  {
    id: "holders_1000",
    metric: "holders",
    threshold: 1000,
    title: "1,000 holders",
    rewardLabel: "New region unlock",
    description: "Community reaches 1,000 holders — open a new explorable region in The Riftwilds.",
  },
  {
    id: "holders_2500",
    metric: "holders",
    threshold: 2500,
    title: "2,500 holders",
    rewardLabel: "Community festival",
    description: "A limited-time festival with shared quests and cosmetics (not SOL payouts).",
  },
  {
    id: "eggs_1000",
    metric: "eggs_hatched",
    threshold: 1000,
    title: "1,000 eggs hatched",
    rewardLabel: "Hatchery cosmetics pack",
    description: "Global hatch count milestone — cosmetic rewards for active Keepers.",
  },
  {
    id: "trades_500",
    metric: "marketplace_trades",
    threshold: 500,
    title: "500 marketplace trades",
    rewardLabel: "Fee-week celebration event",
    description: "Celebrate marketplace activity with a timed community event.",
  },
  {
    id: "evolved_250",
    metric: "pets_evolved",
    threshold: 250,
    title: "250 pets evolved",
    rewardLabel: "Evolution aura set",
    description: "Shared evolution milestone — unlock a cosmetic aura set for eligible pets.",
  },
];
