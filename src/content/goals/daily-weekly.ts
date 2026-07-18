/**
 * Daily / weekly goals — small capped Credits; achievements stay one-time.
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
    id: "daily-talk-npc",
    cadence: "daily",
    title: "Keeper Conversations",
    description: "Speak with 3 named NPCs.",
    metric: "npc_talk",
    target: 3,
    creditReward: 25,
    pairedSink: "SERVICE_FEE",
  },
  {
    id: "daily-gather",
    cadence: "daily",
    title: "Light Harvest",
    description: "Complete 5 gather actions.",
    metric: "gather_count",
    target: 5,
    creditReward: 30,
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
    id: "daily-job",
    cadence: "daily",
    title: "Honest Work",
    description: "Complete 1 job-board task.",
    metric: "job_complete",
    target: 1,
    creditReward: 35,
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
    id: "weekly-regions",
    cadence: "weekly",
    title: "Region Hopper",
    description: "Visit 3 different regions.",
    metric: "region_visit_unique",
    target: 3,
    creditReward: 120,
    pairedSink: "TRAVEL_FEE",
  },
  {
    id: "weekly-craft",
    cadence: "weekly",
    title: "Workshop Week",
    description: "Complete 10 crafts.",
    metric: "craft_count",
    target: 10,
    creditReward: 150,
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
};
