/**
 * Versioned treasury & marketplace economy policy.
 * Load from DB AllocationPolicy when available; this is the bootstrap default.
 * Never scatter percentages across components — import from here or API.
 */

export type AllocationBucketId =
  | "GROWTH"
  | "PET_REWARDS"
  | "OPERATIONS"
  | "EVENTS"
  | "EMERGENCY";

export type AllocationBucket = {
  id: AllocationBucketId;
  label: string;
  percent: number;
  color: string;
  purpose: string[];
  description: string;
};

export type MarketplaceFeeSplit = {
  sellerPercent: number;
  growthPercent: number;
  petRewardPercent: number;
  operationsPercent: number;
  eventsPercent: number;
};

export type TreasuryPolicy = {
  version: number;
  label: string;
  status: "live" | "proposed" | "testing" | "demo";
  effectiveAt: string;
  updatedAt: string;
  network: string;
  collectionWallet: string;
  growthWallet: string;
  petRewardWallet: string;
  operationsWallet: string;
  eventsWallet: string;
  emergencyWallet: string;
  allocations: AllocationBucket[];
  marketplaceFee: MarketplaceFeeSplit;
  rewardRules: {
    equalWeight: boolean;
    maxRewardActivePets: number;
    minPetAgeHours: number;
    minCareScore: number;
    minTokenHoldHours: number;
    formulaLabel: string;
    formulaLines: string[];
  };
  disclaimers: {
    rewards: string;
    marketplace: string;
    growth: string;
  };
};

const DISCLAIMERS = {
  rewards:
    "Community Reward Treasury distributions are not guaranteed. Availability depends on verified project-controlled deposits (game revenue, marketplace fees, optional creator allocations), treasury conditions, eligibility, quests/events, system status, and legal or security restrictions. Buying the Pump.fun coin does not automatically generate SOL for pet owners.",
  marketplace:
    "Digital assets and game items may lose value. Purchasing a token, pet, egg, or item does not guarantee future community rewards, resale value, or profit. Marketplace fees may fund the Community Reward Treasury when settled — they are not automatic per-trade income paid to pet owners from token buys.",
  growth:
    "Treasury spending is intended to support the project but does not guarantee token-price growth, exchange listings, liquidity, adoption, or project success.",
} as const;

/** Active bootstrap policy (demo until DB-backed policy is published). */
export const ACTIVE_TREASURY_POLICY: TreasuryPolicy = {
  version: 1,
  label: "Riftwilds Treasury Policy v1 (Demo)",
  status: "demo",
  effectiveAt: "2026-07-17T00:00:00.000Z",
  updatedAt: "2026-07-17T00:00:00.000Z",
  network: "devnet",
  collectionWallet: "COMING_SOON",
  growthWallet: "COMING_SOON",
  petRewardWallet: "COMING_SOON",
  operationsWallet: "COMING_SOON",
  eventsWallet: "COMING_SOON",
  emergencyWallet: "COMING_SOON",
  allocations: [
    {
      id: "GROWTH",
      label: "Growth Treasury",
      percent: 60,
      color: "#3de7ff",
      purpose: [
        "DEX-related expenses",
        "Liquidity initiatives",
        "DexScreener promotions",
        "Advertising",
        "Influencer and creator partnerships",
        "Community outreach",
        "Strategic partnerships",
        "Game development",
        "Security reviews",
        "Contract audits",
        "Artwork and animation",
        "Expansion of the Riftwilds universe",
      ],
      description:
        "The Growth Treasury provides the resources needed to promote the project, expand its reach, support liquidity initiatives, improve the game, and fund important launch or exchange-related expenses.",
    },
    {
      id: "PET_REWARDS",
      label: "Community Reward Treasury",
      percent: 20,
      color: "#9b7bff",
      purpose: [
        "Ecosystem distributions to eligible living pets",
        "Reward epochs funded by verified deposits",
        "Community participation incentives",
        "Quest and event eligibility incentives",
      ],
      description:
        "A portion of verified project-controlled revenue may fund Community Reward Treasury epoch pools. Eligible Riftling owners share in distributions — not passive income from each Pump.fun token purchase. Amounts change with actual deposits, treasury health, participation, and system limits.",
    },
    {
      id: "OPERATIONS",
      label: "Development and Operations",
      percent: 10,
      color: "#ffb84d",
      purpose: [
        "Hosting",
        "Database services",
        "Solana RPC services",
        "Security monitoring",
        "Developers",
        "Artists",
        "Customer support",
        "Game maintenance",
        "Infrastructure",
      ],
      description:
        "This allocation keeps the website, marketplace, game systems, wallet services, and player support operating.",
    },
    {
      id: "EVENTS",
      label: "Community Events",
      percent: 5,
      color: "#3dffb0",
      purpose: [
        "Community bosses",
        "Limited eggs",
        "Contests",
        "Tournaments",
        "Giveaways",
        "Seasonal events",
        "Community challenges",
      ],
      description: "This allocation funds interactive events and non-guaranteed community rewards.",
    },
    {
      id: "EMERGENCY",
      label: "Emergency Reserve",
      percent: 5,
      color: "#ff6b6b",
      purpose: [
        "Security incidents",
        "Exploit response",
        "Critical maintenance",
        "Unexpected infrastructure expenses",
        "Emergency recovery",
      ],
      description:
        "The Emergency Reserve helps protect the project and respond to unforeseen problems.",
    },
  ],
  /** Aligned with RevenueAllocationPolicy MARKETPLACE_SALE v1 (90/5/3/1/1). */
  marketplaceFee: {
    sellerPercent: 90,
    growthPercent: 5,
    petRewardPercent: 3,
    operationsPercent: 1,
    eventsPercent: 1,
  },
  rewardRules: {
    equalWeight: true,
    maxRewardActivePets: 3,
    minPetAgeHours: 24,
    minCareScore: 40,
    minTokenHoldHours: 0,
    formulaLabel: "Equal-weight epoch split",
    formulaLines: [
      "Available Community Reward Treasury Pool ÷ Total Eligible Pet Weight = Reward Rate",
      "Pet Share = Reward Rate × Pet Weight",
      "Initial release: every qualified pet receives equal weight (1).",
      "Pool grows only on verified project-controlled deposits — never from fabricated token-buy ticks.",
    ],
  },
  disclaimers: { ...DISCLAIMERS },
};

export function validateAllocationPercents(allocations: AllocationBucket[]): boolean {
  const total = allocations.reduce((sum, a) => sum + a.percent, 0);
  return total === 100;
}

export function validateMarketplaceFeeSplit(fee: MarketplaceFeeSplit): boolean {
  const total =
    fee.sellerPercent +
    fee.growthPercent +
    fee.petRewardPercent +
    fee.operationsPercent +
    fee.eventsPercent;
  return total === 100;
}

export function getActiveTreasuryPolicy(): TreasuryPolicy {
  if (!validateAllocationPercents(ACTIVE_TREASURY_POLICY.allocations)) {
    throw new Error("Treasury allocation percents must total 100");
  }
  if (!validateMarketplaceFeeSplit(ACTIVE_TREASURY_POLICY.marketplaceFee)) {
    throw new Error("Marketplace fee split must total 100");
  }
  return ACTIVE_TREASURY_POLICY;
}

export const ECONOMY_DISCLAIMERS = DISCLAIMERS;

export const CARE_SURVIVAL_STAGES = [
  {
    id: "HEALTHY",
    label: "Healthy",
    effects: [
      "Pet is active",
      "Can explore",
      "Can battle",
      "May qualify for pet allocations",
      "Normal care requirements",
    ],
  },
  {
    id: "HUNGRY",
    label: "Hungry",
    timing: "Begins after the configured care timer expires",
    effects: ["Hunger warning", "Reduced happiness", "Player notification", "Still recoverable"],
  },
  {
    id: "UNHAPPY",
    label: "Unhappy",
    effects: [
      "Cannot receive maximum care benefits",
      "Reduced exploration performance",
      "Reward eligibility may be suspended",
    ],
  },
  {
    id: "SICK",
    label: "Sick",
    effects: [
      "Cannot battle",
      "Cannot explore",
      "Requires food, medicine, or care items",
      "Does not qualify for reward epochs",
    ],
  },
  {
    id: "DORMANT",
    label: "Dormant",
    effects: [
      "Pet remains in the player’s collection",
      "Cannot earn rewards",
      "Cannot battle",
      "Cannot explore",
      "Requires a revival or recovery process",
    ],
  },
  {
    id: "CRITICAL",
    label: "Critical",
    effects: [
      "Final recovery window",
      "Strong visible warnings",
      "Recovery item or care action required",
    ],
  },
  {
    id: "DECEASED",
    label: "Deceased",
    effects: [
      "Only when PERMANENT_DEATH_ENABLED = true",
      "Moves to memorial",
      "Cannot generate rewards",
    ],
  },
] as const;

export const CARE_SHOP_ITEMS = [
  {
    slug: "basic-meal",
    name: "Basic Meal",
    category: "Food",
    description: "Restores hunger. Low-cost common item.",
    effects: ["Hunger +28"],
    priceCredits: 50,
    rarity: "Common",
  },
  {
    slug: "premium-meal",
    name: "Premium Meal",
    category: "Food",
    description: "Restores more hunger and adds a small happiness increase.",
    effects: ["Hunger +40", "Happiness +8"],
    priceCredits: 120,
    rarity: "Uncommon",
  },
  {
    slug: "fresh-water",
    name: "Fresh Water",
    category: "Water",
    description: "Supports health and energy.",
    effects: ["Health +5", "Energy +10"],
    priceCredits: 35,
    rarity: "Common",
  },
  {
    slug: "cleaning-kit",
    name: "Cleaning Kit",
    category: "Cleaning",
    description: "Restores hygiene.",
    effects: ["Hygiene +30"],
    priceCredits: 60,
    rarity: "Common",
  },
  {
    slug: "rift-toy",
    name: "Rift Toy",
    category: "Toys",
    description: "Improves happiness and bond.",
    effects: ["Happiness +22", "Bond +6"],
    priceCredits: 90,
    rarity: "Uncommon",
  },
  {
    slug: "medicine",
    name: "Medicine",
    category: "Medicine",
    description: "Helps recover a sick pet.",
    effects: ["Health +25", "May clear Sick"],
    priceCredits: 150,
    rarity: "Rare",
  },
  {
    slug: "dreamnest-bed",
    name: "Dreamnest Bed",
    category: "Bedding",
    description: "Improves rest and energy recovery.",
    effects: ["Energy +35", "Health +5"],
    priceCredits: 110,
    rarity: "Uncommon",
  },
  {
    slug: "revival-bloom",
    name: "Revival Bloom",
    category: "Recovery",
    description:
      "Recovers a dormant pet. Does not revive a permanently deceased pet unless rules explicitly permit it.",
    effects: ["Dormant → Stable (when applicable)"],
    priceCredits: 500,
    rarity: "Epic",
  },
] as const;
