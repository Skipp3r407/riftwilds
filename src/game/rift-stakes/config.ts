/**
 * Rift Stakes configuration — optional SOL wager mode only.
 * Casual / Ranked / Training never read these values.
 */

import { featureFlagDefaults } from "@/lib/config/feature-flags";
import type {
  StakeTier,
  TreasuryAllocationBps,
  VipFeeTier,
} from "@/game/rift-stakes/types";

/** 1 SOL in lamports */
export const LAMPORTS_PER_SOL = 1_000_000_000;

/** Default platform fee: 2% */
export const DEFAULT_FEE_BPS = 200;

/** Hard maximum platform fee: 5% — enforced in calc + admin + contract interface */
export const MAX_FEE_BPS = 500;

/** Soft floor (0% allowed for promos / VIP) */
export const MIN_FEE_BPS = 0;

/** Display-only network fee estimate (not escrow-deducted) */
export const ESTIMATED_NETWORK_FEE_LAMPORTS = 10_000;

/**
 * Internal accounting allocation of collected platform fees.
 * On-chain transfer still goes to a single treasury wallet;
 * buckets are bookkeeping only.
 */
export const TREASURY_ALLOCATION_BPS: TreasuryAllocationBps = {
  development: 5000, // 50%
  tournaments: 2000, // 20%
  community: 1500, // 15%
  infrastructure: 1500, // 15%
};

export const STAKE_TIERS: readonly StakeTier[] = [
  {
    id: "micro",
    label: "Micro",
    stakeLamports: 50_000_000, // 0.05 SOL
    description: "Lowest entry — learn the stakes flow.",
  },
  {
    id: "low",
    label: "Low",
    stakeLamports: 100_000_000, // 0.10 SOL
    description: "Small pot for short sessions.",
  },
  {
    id: "standard",
    label: "Standard",
    stakeLamports: 200_000_000, // 0.20 SOL each → 0.40 pot
    description: "Default demo tier.",
  },
  {
    id: "high",
    label: "High",
    stakeLamports: 500_000_000, // 0.50 SOL
    description: "Higher risk — confirmation required.",
  },
] as const;

/** Full-bleed lobby card heroes (no baked labels / SOL amounts). */
export const STAKE_TIER_THUMBNAILS: Record<StakeTier["id"], string> = {
  micro: "/assets/ui/rift-stakes/tier-micro.png",
  low: "/assets/ui/rift-stakes/tier-low.png",
  standard: "/assets/ui/rift-stakes/tier-standard.png",
  high: "/assets/ui/rift-stakes/tier-high.png",
};

export const DEFAULT_VIP_TIERS: readonly VipFeeTier[] = [
  {
    id: "keeper",
    label: "Keeper",
    feeBps: 150,
    minMatches: 25,
    note: "1.5% after 25 settled stakes matches.",
  },
  {
    id: "riftlord",
    label: "Riftlord",
    feeBps: 100,
    minMatches: 100,
    note: "1.0% after 100 settled stakes matches.",
  },
] as const;

export const DISCONNECT_RULES = {
  /** Opponent AFK beyond this → forfeit + payout to connected player (after lock) */
  FORFEIT_AFTER_MS: 90_000,
  /** Both disconnect before lock → full refund, no fee */
  PRE_LOCK_REFUND: true,
  /** Both disconnect after lock with no resolve → refund both, no fee */
  POST_LOCK_DOUBLE_DISCONNECT_REFUND: true,
} as const;

export const DISCLOSURES = {
  optional:
    "Rift Stakes is optional real-SOL entertainment. Casual, Ranked, and Training stay free and never require a wallet.",
  noAutoEnroll:
    "You are never auto-enrolled. Confirm stake, fee, and payout before joining.",
  serverAuth:
    "Winners are decided server-side. Clients cannot trigger payouts.",
  demo:
    "DEMO mode simulates escrow + fees locally. No real SOL moves until on-chain deploy + compliance flags.",
  feeOnlyStakes:
    "Platform fees apply only to Rift Stakes. Free modes never pay a SOL fee.",
} as const;

/**
 * Local preview: enabled when NODE_ENV !== production OR env override.
 * Production builds keep the flag default false unless explicitly set.
 */
export function isRiftStakesEnabled(): boolean {
  const flags = featureFlagDefaults as Record<string, boolean>;
  if (flags.RIFT_STAKES_ENABLED === true) return true;
  // Env override for local preview without editing defaults
  if (process.env.RIFT_STAKES_ENABLED === "true") return true;
  return false;
}

/** Real on-chain escrow (not DEMO). Requires wallet + separate compliance. */
export function isRiftStakesOnChainLive(): boolean {
  const flags = featureFlagDefaults as Record<string, boolean>;
  return (
    isRiftStakesEnabled() &&
    flags.RIFT_STAKES_ONCHAIN_ENABLED === true &&
    flags.SOL_WALLET_ENABLED === true
  );
}

export function getStakeTier(id: string): StakeTier | undefined {
  return STAKE_TIERS.find((t) => t.id === id);
}

export function clampFeeBps(bps: number): number {
  if (!Number.isFinite(bps)) return DEFAULT_FEE_BPS;
  const n = Math.trunc(bps);
  if (n < MIN_FEE_BPS) return MIN_FEE_BPS;
  if (n > MAX_FEE_BPS) return MAX_FEE_BPS;
  return n;
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function formatSol(lamports: number, digits = 4): string {
  return lamportsToSol(lamports).toFixed(digits);
}
