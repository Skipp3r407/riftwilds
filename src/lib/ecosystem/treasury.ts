/**
 * Community Treasury — transparent balances, growth, in/out, distributions.
 * Placeholders are honest; never invent SOL from token purchases.
 */

export type TreasuryBucket = {
  key: string;
  label: string;
  description: string;
  balanceLabel: string;
  asset: string;
  verified: boolean;
  isDemo: boolean;
};

export type TreasuryFlow = {
  id: string;
  at: string;
  direction: "in" | "out";
  label: string;
  amountLabel: string;
  bucketKey: string;
  txRef: string | null;
};

export type TreasuryBudgetLine = {
  key: string;
  label: string;
  allocationPercent: number;
  note: string;
};

export type TreasuryGrantStub = {
  id: string;
  title: string;
  status: "open" | "funded" | "closed" | "stub";
  askLabel: string;
};

export type TreasuryVoteStub = {
  id: string;
  title: string;
  status: "upcoming" | "open" | "closed" | "stub";
  endsAt: string | null;
};

export type CommunityTreasuryDashboard = {
  title: string;
  lede: string;
  availability: "demo" | "partial" | "live";
  buckets: TreasuryBucket[];
  growthNote: string;
  recentFlows: TreasuryFlow[];
  budgets: TreasuryBudgetLine[];
  grants: TreasuryGrantStub[];
  votes: TreasuryVoteStub[];
  distributionsNote: string;
  disclaimers: string[];
  refreshedAt: string;
};

const DEMO_FLOWS: TreasuryFlow[] = [
  {
    id: "flow_in_1",
    at: new Date(Date.now() - 3_600_000).toISOString(),
    direction: "in",
    label: "Verified marketplace fee settlement",
    amountLabel: "Pending indexer",
    bucketKey: "reward_vault",
    txRef: null,
  },
  {
    id: "flow_out_1",
    at: new Date(Date.now() - 86_400_000).toISOString(),
    direction: "out",
    label: "Community event budget (stub)",
    amountLabel: "Demo only",
    bucketKey: "events",
    txRef: null,
  },
];

export function getCommunityTreasuryDashboard(): CommunityTreasuryDashboard {
  return {
    title: "Community Treasury",
    lede: "Transparent buckets for growth, rewards, events, and operations. Balances stay blank or demo until verified ledgers are wired.",
    availability: "demo",
    buckets: [
      {
        key: "growth",
        label: "Growth treasury",
        description: "World content, art, and infrastructure.",
        balanceLabel: "N/A",
        asset: "SOL",
        verified: false,
        isDemo: true,
      },
      {
        key: "reward_vault",
        label: "Reward vault",
        description: "Pet / keeper distributions from verified deposits only.",
        balanceLabel: "N/A",
        asset: "SOL",
        verified: false,
        isDemo: true,
      },
      {
        key: "events",
        label: "Community events",
        description: "Festivals, seasonal prizes, creator showcases.",
        balanceLabel: "N/A",
        asset: "SOL",
        verified: false,
        isDemo: true,
      },
      {
        key: "ops",
        label: "Operations",
        description: "Hosting, moderation, support.",
        balanceLabel: "N/A",
        asset: "SOL",
        verified: false,
        isDemo: true,
      },
      {
        key: "reserves",
        label: "Emergency reserves",
        description: "Fail-closed buffer — not player rewards.",
        balanceLabel: "N/A",
        asset: "SOL",
        verified: false,
        isDemo: true,
      },
    ],
    growthNote:
      "Growth charts unlock when treasury metrics API returns verified series. Until then, see /transparency for policy.",
    recentFlows: DEMO_FLOWS,
    budgets: [
      {
        key: "rewards",
        label: "Holder / pet reward vault",
        allocationPercent: 40,
        note: "From verified game + marketplace revenue — not token buys.",
      },
      {
        key: "growth",
        label: "World growth",
        allocationPercent: 25,
        note: "Content and Live World capacity.",
      },
      {
        key: "events",
        label: "Events & creators",
        allocationPercent: 15,
        note: "Festivals, grants, creator hub.",
      },
      {
        key: "ops",
        label: "Operations",
        allocationPercent: 15,
        note: "Infra and support.",
      },
      {
        key: "reserves",
        label: "Reserves",
        allocationPercent: 5,
        note: "Emergency only.",
      },
    ],
    grants: [
      {
        id: "grant_lore",
        title: "Community lore pack grant",
        status: "stub",
        askLabel: "Proposal stub",
      },
      {
        id: "grant_mod",
        title: "Region event moderation toolkit",
        status: "stub",
        askLabel: "Proposal stub",
      },
    ],
    votes: [
      {
        id: "vote_festival",
        title: "Next festival region focus",
        status: "stub",
        endsAt: null,
      },
    ],
    distributionsNote:
      "Distributions are claimable only after epochs finalize with verified deposits. Buying the launch coin does not create pet SOL income.",
    disclaimers: [
      "Blank / N/A means unknown — not zero rewards.",
      "Demo rows are scaffolding until on-chain or ledger sync is live.",
      "See Reward Center (/rewards) for pending and lifetime claims framing.",
    ],
    refreshedAt: new Date().toISOString(),
  };
}
