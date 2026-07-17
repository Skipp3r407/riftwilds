/**
 * Reward Center — pending / claimable / lifetime + sources.
 * Community treasury framing — NOT "buy coin → earn".
 */

import {
  getCurrentEpochState,
  getWalletClaimBalance,
  getCommunityActivitySnapshot,
} from "@/lib/rewards/vault-store";

export type RewardSourceKind =
  | "marketplace"
  | "event"
  | "quest"
  | "guild"
  | "pet"
  | "referral"
  | "daily"
  | "creator"
  | "verified_deposit";

export type RewardSourceRow = {
  kind: RewardSourceKind;
  label: string;
  description: string;
  /** Filename slug under public/assets/rewards/{slug}.png */
  imageSlug: string;
  pendingLabel: string;
  claimableLabel: string;
  lifetimeLabel: string;
  available: boolean;
};

export type RewardCenterDashboard = {
  title: string;
  lede: string;
  framing: string;
  epoch: ReturnType<typeof getCurrentEpochState> | null;
  wallet: {
    connected: boolean;
    claimableLamports: string | null;
    lifetimeClaimedLamports: string | null;
  };
  sources: RewardSourceRow[];
  communityActivity: ReturnType<typeof getCommunityActivitySnapshot>;
  claimsEnabled: boolean;
  disclaimers: string[];
  refreshedAt: string;
};

const SOURCE_DEFS: Omit<
  RewardSourceRow,
  "pendingLabel" | "claimableLabel" | "lifetimeLabel" | "available"
>[] = [
  {
    kind: "pet",
    label: "Community Reward Treasury",
    description: "Eligible pets share verified treasury deposits each epoch.",
    imageSlug: "community-reward-treasury",
  },
  {
    kind: "marketplace",
    label: "Marketplace fees",
    description: "Verified fee settlements that fund the Community Reward Treasury.",
    imageSlug: "marketplace-fees",
  },
  {
    kind: "quest",
    label: "Quest rewards",
    description: "Soft-currency / cosmetic quest payouts (not SOL from token buys).",
    imageSlug: "quest-rewards",
  },
  {
    kind: "event",
    label: "Events & festivals",
    description: "Seasonal and festival distributions when funded.",
    imageSlug: "events-festivals",
  },
  {
    kind: "guild",
    label: "Guild contributions",
    description: "Guild boss / restoration stubs — authority later.",
    imageSlug: "guild-contributions",
  },
  {
    kind: "daily",
    label: "Daily keeper loop",
    description: "Care streaks and daily missions (soft rewards).",
    imageSlug: "daily-keeper-loop",
  },
  {
    kind: "referral",
    label: "Referrals",
    description: "Scaffolding — anti-abuse required before live.",
    imageSlug: "referrals",
  },
  {
    kind: "creator",
    label: "Creator purchases",
    description: "Optional creator allocations into the vault when verified.",
    imageSlug: "creator-purchases",
  },
  {
    kind: "verified_deposit",
    label: "Verified deposits",
    description: "Project-controlled deposits recorded by the vault ledger.",
    imageSlug: "verified-deposits",
  },
];

export function getRewardCenterDashboard(opts?: {
  walletKey?: string | null;
  claimsEnabled?: boolean;
}): RewardCenterDashboard {
  const walletKey = opts?.walletKey ?? null;
  const claimsEnabled = opts?.claimsEnabled ?? false;
  const epoch = getCurrentEpochState();
  const walletBal = walletKey ? getWalletClaimBalance(walletKey) : null;

  const sources: RewardSourceRow[] = SOURCE_DEFS.map((s) => {
    const isPetOrVault =
      s.kind === "pet" || s.kind === "marketplace" || s.kind === "verified_deposit";
    return {
      ...s,
      pendingLabel: isPetOrVault ? "Epoch open pool" : "Stub",
      claimableLabel:
        isPetOrVault && walletBal
          ? `${walletBal.claimableLamports} lamports`
          : isPetOrVault
            ? "Connect wallet"
            : "N/A",
      lifetimeLabel:
        isPetOrVault && walletBal
          ? `${walletBal.lifetimeClaimedLamports} lamports`
          : "N/A",
      available: isPetOrVault,
    };
  });

  return {
    title: "Reward Center",
    lede: "Track pending, claimable, and lifetime rewards funded by the community treasury.",
    framing:
      "Rewards come from verified game revenue, marketplace fees, and optional creator allocations — not from buying the launch coin.",
    epoch,
    wallet: {
      connected: Boolean(walletKey),
      claimableLamports: walletBal?.claimableLamports ?? null,
      lifetimeClaimedLamports: walletBal?.lifetimeClaimedLamports ?? null,
    },
    sources,
    communityActivity: getCommunityActivitySnapshot(),
    claimsEnabled,
    disclaimers: [
      "Buying or trading the Pump.fun / DEX token does not automatically pay SOL to pet owners.",
      "Claim buttons stay disabled until REWARD_CLAIMS_ENABLED and settlement authority are live.",
      "Blank values mean unknown or not yet funded — not a promise of future income.",
    ],
    refreshedAt: new Date().toISOString(),
  };
}
