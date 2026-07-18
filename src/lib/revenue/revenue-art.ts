/**
 * Economy / revenue surface art — illustration paths only.
 * Never encode live balances here.
 */

export const REVENUE_ART_V = "rev2";

const metric = (slug: string) => `/assets/revenue/metrics/${slug}.png?v=${REVENUE_ART_V}`;
const section = (slug: string) => `/assets/revenue/sections/${slug}.png?v=${REVENUE_ART_V}`;
const holderStat = (slug: string) =>
  `/assets/revenue/holder-stats/${slug}.png?v=${REVENUE_ART_V}`;

export const REVENUE_SECTION_ART = {
  holderRewards: section("section-reward-treasury"),
  transparency: section("section-transparency"),
  allocation: section("section-allocation"),
} as const;

/** Community Reward Treasury 3×3 stat tile icons (illustration paths only). */
export const HOLDER_REWARD_STAT_ART = {
  currentEpoch: { imageSrc: holderStat("epoch"), accent: "#3de7ff" },
  availableEpochPool: { imageSrc: holderStat("epoch-pool"), accent: "#ffb84d" },
  totalEligibleWeight: { imageSrc: holderStat("eligible-weight"), accent: "#9bb4ff" },
  walletEligibility: { imageSrc: holderStat("wallet"), accent: "#3de7ff" },
  selectedRewardPets: { imageSrc: holderStat("reward-pets"), accent: "#9b7bff" },
  yourRewardWeight: { imageSrc: holderStat("reward-weight"), accent: "#3dffb0" },
  claimableSol: { imageSrc: holderStat("claimable"), accent: "#ffb84d" },
  pendingEstimate: { imageSrc: holderStat("pending-estimate"), accent: "#ffb84d" },
  nextSnapshot: { imageSrc: holderStat("snapshot"), accent: "#3de7ff" },
} as const;

/** Demo transparency metric keys → card background art. */
export const TRANSPARENCY_METRIC_ART: Record<
  string,
  { imageSrc: string; accent: string }
> = {
  shop_revenue: { imageSrc: metric("shop"), accent: "#3de7ff" },
  marketplace_revenue: { imageSrc: metric("marketplace"), accent: "#3de7ff" },
  crafting_fee_revenue: { imageSrc: metric("crafting"), accent: "#ffb84d" },
  upgrade_fee_revenue: { imageSrc: metric("upgrade"), accent: "#9bb4ff" },
  growth_reserve: { imageSrc: metric("growth"), accent: "#ffb84d" },
  pet_holder_rewards: { imageSrc: metric("rewards"), accent: "#9b7bff" },
  operations: { imageSrc: metric("operations"), accent: "#ffb84d" },
  community_events: { imageSrc: metric("events"), accent: "#3dffb0" },
  seller_proceeds: { imageSrc: metric("seller"), accent: "#3de7ff" },
  holder_claimed: { imageSrc: metric("claimed"), accent: "#3dffb0" },
  holder_pending: { imageSrc: metric("pending"), accent: "#ffb84d" },
  holder_unclaimed: { imageSrc: metric("unclaimed"), accent: "#9bb4ff" },
};

/** Policy allocation bucket ids → illustrated card art (reuse treasury set). */
export const ALLOCATION_BUCKET_ART: Record<
  string,
  { imageSrc: string; iconSrc: string; accent: string }
> = {
  GROWTH: {
    imageSrc: "/assets/treasury/growth.png",
    iconSrc: "/assets/treasury/icon-growth.png",
    accent: "#3de7ff",
  },
  PET_REWARDS: {
    imageSrc: "/assets/treasury/reward-vault.png",
    iconSrc: "/assets/treasury/icon-rewards.png",
    accent: "#9b7bff",
  },
  OPERATIONS: {
    imageSrc: "/assets/treasury/operations.png",
    iconSrc: "/assets/treasury/icon-ops.png",
    accent: "#ffb84d",
  },
  EVENTS: {
    imageSrc: "/assets/treasury/events.png",
    iconSrc: "/assets/treasury/icon-events.png",
    accent: "#3dffb0",
  },
  EMERGENCY: {
    imageSrc: "/assets/treasury/reserves.png",
    iconSrc: "/assets/treasury/icon-reserves.png",
    accent: "#ff6b6b",
  },
};

const growthUse = (slug: string) =>
  `/assets/revenue/growth-uses/${slug}.webp?v=${REVENUE_ART_V}`;

/** Growth Treasury “how funds may be used” card art. */
export const GROWTH_USE_ART = {
  dex: {
    imageSrc: growthUse("dex"),
    accent: "#3de7ff",
  },
  marketing: {
    imageSrc: growthUse("marketing"),
    accent: "#ffb84d",
  },
  gamedev: {
    imageSrc: growthUse("gamedev"),
    accent: "#9bb4ff",
  },
  services: {
    imageSrc: growthUse("services"),
    accent: "#3dffb0",
  },
} as const;

/** Public wallet row icons (reuse treasury medallions + vault badge). */
export const PUBLIC_WALLET_ICONS = {
  Collection: "/assets/ui/economy/vault.png",
  Growth: "/assets/treasury/icon-growth.png",
  "Community Rewards": "/assets/treasury/icon-rewards.png",
  Operations: "/assets/treasury/icon-ops.png",
  Events: "/assets/treasury/icon-events.png",
  Emergency: "/assets/treasury/icon-reserves.png",
} as const;
