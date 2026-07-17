/**
 * Wallet-optional identity scaffolding.
 * Does not replace SIWS; provides types + merge rules for email/social → wallet link.
 */

import { listAuthProviders, type AuthProviderId } from "@/lib/auth/providers";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

export type SoftIdentity = {
  userId: string;
  displayName: string;
  email?: string | null;
  avatarUrl?: string | null;
  providerIds: AuthProviderId[];
  walletLinked: boolean;
  walletAddress: string | null;
  createdVia: "email" | "social" | "wallet" | "demo";
};

export type AuthOnboardingStep =
  | "choose_login"
  | "email_or_social"
  | "create_riftkeeper"
  | "optional_wallet"
  | "holdings_recognized"
  | "play";

export type AuthOnboardingPlan = {
  recommendedFirst: "email_or_social";
  walletRequiredForPlay: false;
  walletRequiredForClaims: true;
  walletRequiredForSolMarketplace: true;
  steps: AuthOnboardingStep[];
  providersPrimary: ReturnType<typeof listAuthProviders>;
  providersSecondary: ReturnType<typeof listAuthProviders>;
  flags: {
    emailEnabled: boolean;
    socialEnabled: boolean;
    walletSiwsEnabled: boolean;
    walletOptionalPlay: boolean;
  };
  copy: {
    headline: string;
    lede: string;
    walletLater: string;
  };
};

/** Recommended journey: email/social first, wallet later. */
export function getAuthOnboardingPlan(): AuthOnboardingPlan {
  return {
    recommendedFirst: "email_or_social",
    walletRequiredForPlay: false,
    walletRequiredForClaims: true,
    walletRequiredForSolMarketplace: true,
    steps: [
      "choose_login",
      "email_or_social",
      "create_riftkeeper",
      "optional_wallet",
      "holdings_recognized",
      "play",
    ],
    providersPrimary: listAuthProviders({ priority: "primary" }),
    providersSecondary: listAuthProviders({ priority: "secondary" }),
    flags: {
      emailEnabled: featureFlagDefaults.AUTH_EMAIL_ENABLED,
      socialEnabled: featureFlagDefaults.AUTH_SOCIAL_ENABLED,
      walletSiwsEnabled: featureFlagDefaults.AUTH_WALLET_SIWS_ENABLED,
      walletOptionalPlay: featureFlagDefaults.AUTH_WALLET_OPTIONAL_PLAY,
    },
    copy: {
      headline: "Become a Riftkeeper",
      lede: "Sign in with email or social to play. Connect a Solana wallet later for token utility, claims, and marketplace settlements.",
      walletLater:
        "Wallet connect is optional for soft-currency play. Link when you are ready for Web3 features.",
    },
  };
}

/**
 * Identity merge rules (scaffolding) — never silently drop progress.
 * Production merge should run inside a transaction with admin audit.
 */
export type IdentityMergePlan = {
  keepUserId: string;
  absorbUserId: string;
  linkWalletAddress: string;
  preserve: string[];
  blockedIf: string[];
};

export function planWalletLinkMerge(params: {
  accountUserId: string;
  walletOnlyUserId: string | null;
  walletAddress: string;
}): IdentityMergePlan {
  return {
    keepUserId: params.accountUserId,
    absorbUserId: params.walletOnlyUserId ?? params.accountUserId,
    linkWalletAddress: params.walletAddress,
    preserve: [
      "player_profile",
      "creatures",
      "eggs",
      "inventory",
      "quest_progress",
      "achievements",
      "soft_currency",
    ],
    blockedIf: [
      "both_sides_have_conflicting_primary_wallet",
      "absorb_user_is_banned",
      "merge_already_in_progress",
    ],
  };
}

/** Demo soft identity for UI when OAuth is not live yet. */
export function createDemoSoftIdentity(displayName = "Riftkeeper"): SoftIdentity {
  return {
    userId: "demo_soft_identity",
    displayName,
    email: null,
    avatarUrl: null,
    providerIds: ["email"],
    walletLinked: false,
    walletAddress: null,
    createdVia: "demo",
  };
}
