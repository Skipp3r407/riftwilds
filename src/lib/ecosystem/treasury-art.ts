/**
 * Community Treasury page art — illustration paths only.
 * Never encode live balances here.
 */

export const TREASURY_HERO_SRC = "/assets/treasury/hero.png";
export const TREASURY_BUDGET_ART_SRC = "/assets/treasury/budget-allocation.png";

export const TREASURY_BUCKET_ART: Record<
  string,
  { imageSrc: string; iconSrc: string; accent: string }
> = {
  growth: {
    imageSrc: "/assets/treasury/growth.png",
    iconSrc: "/assets/treasury/icon-growth.png",
    accent: "#ffb84d",
  },
  reward_vault: {
    imageSrc: "/assets/treasury/reward-vault.png",
    iconSrc: "/assets/treasury/icon-rewards.png",
    accent: "#3de7ff",
  },
  events: {
    imageSrc: "/assets/treasury/events.png",
    iconSrc: "/assets/treasury/icon-events.png",
    accent: "#3dffb0",
  },
  ops: {
    imageSrc: "/assets/treasury/operations.png",
    iconSrc: "/assets/treasury/icon-ops.png",
    accent: "#9bb4ff",
  },
  reserves: {
    imageSrc: "/assets/treasury/reserves.png",
    iconSrc: "/assets/treasury/icon-reserves.png",
    accent: "#ff8a6a",
  },
};

/** Budget policy row keys → icon + bar color (allocation % only — not SOL). */
export const TREASURY_BUDGET_ART: Record<
  string,
  { iconSrc: string; accent: string }
> = {
  rewards: {
    iconSrc: "/assets/treasury/icon-rewards.png",
    accent: "#3de7ff",
  },
  growth: {
    iconSrc: "/assets/treasury/icon-growth.png",
    accent: "#ffb84d",
  },
  events: {
    iconSrc: "/assets/treasury/icon-events.png",
    accent: "#3dffb0",
  },
  ops: {
    iconSrc: "/assets/treasury/icon-ops.png",
    accent: "#9bb4ff",
  },
  reserves: {
    iconSrc: "/assets/treasury/icon-reserves.png",
    accent: "#ff8a6a",
  },
};
