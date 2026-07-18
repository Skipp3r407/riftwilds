/**
 * Daily / weekly goals — TCG / hatchery / care first for launch.
 * Small capped Credits; achievements stay one-time.
 */

export type TimedGoalDef = {
  id: string;
  cadence: "daily" | "weekly";
  title: string;
  description: string;
  metric: string;
  target: number;
  creditReward: number;
  pairedSink: string;
};

export const DAILY_GOALS: TimedGoalDef[] = [
  {
    id: "daily-rift-battle",
    cadence: "daily",
    title: "Practice Duel",
    description: "Complete 1 practice Rift Battle.",
    metric: "tcg_match_play",
    target: 1,
    creditReward: 30,
    pairedSink: "SERVICE_FEE",
  },
  {
    id: "daily-play-cards",
    cadence: "daily",
    title: "Energy Spend",
    description: "Play 5 cards across Rift Battles.",
    metric: "tcg_card_play",
    target: 5,
    creditReward: 25,
    pairedSink: "CRAFT_FEE",
  },
  {
    id: "daily-care",
    cadence: "daily",
    title: "Bond & Care",
    description: "Care for a Riftling once.",
    metric: "care_feed",
    target: 1,
    creditReward: 20,
    pairedSink: "NPC_SHOP_BUY",
  },
  {
    id: "daily-binder",
    cadence: "daily",
    title: "Binder Check",
    description: "Open the Card Binder once.",
    metric: "binder_open",
    target: 1,
    creditReward: 15,
    pairedSink: "TRAVEL_FEE",
  },
  {
    id: "daily-restore",
    cadence: "daily",
    title: "Tiny Restoration",
    description: "Donate any Credits to a restoration fund.",
    metric: "restoration_donate",
    target: 1,
    creditReward: 15,
    pairedSink: "RESTORATION_DONATION",
  },
];

export const WEEKLY_GOALS: TimedGoalDef[] = [
  {
    id: "weekly-rift-wins",
    cadence: "weekly",
    title: "Board Climber",
    description: "Win 5 practice Rift Battles.",
    metric: "tcg_match_win",
    target: 5,
    creditReward: 140,
    pairedSink: "SERVICE_FEE",
  },
  {
    id: "weekly-binder",
    cadence: "weekly",
    title: "Binder Growth",
    description: "Collect 8 unique binder cards.",
    metric: "tcg_card_collect",
    target: 8,
    creditReward: 120,
    pairedSink: "CRAFT_FEE",
  },
  {
    id: "weekly-restore",
    cadence: "weekly",
    title: "Restoration Drive",
    description: "Donate 200 Credits total to restoration.",
    metric: "restoration_donate_sum",
    target: 200,
    creditReward: 100,
    pairedSink: "RESTORATION_DONATION",
  },
];

/** Small one-time achievement Credit rewards (ledger ACHIEVEMENT reason). */
export const ACHIEVEMENT_CREDIT_REWARDS: Record<string, number> = {
  first_claim: 25,
  first_hatch: 40,
  hatch_ten: 80,
  first_quest_complete: 30,
  first_restoration_donate: 50,
  first_rift_win: 35,
  first_binder_page: 20,
};
