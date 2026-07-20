/**
 * Account-required identity plan — wallet links after sign-in, never replaces account.
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
  | "verify_email"
  | "create_riftkeeper"
  | "legal_accept"
  | "optional_wallet"
  | "holdings_recognized"
  | "play";

export type AuthOnboardingPlan = {
  recommendedFirst: "email_or_social";
  /** Absolute rule: account required before gameplay. */
  accountRequiredForPlay: true;
  walletRequiredForPlay: false;
  walletRequiredForClaims: true;
  walletRequiredForSolMarketplace: true;
  guestGameplayAllowed: false;
  steps: AuthOnboardingStep[];
  providersPrimary: ReturnType<typeof listAuthProviders>;
  providersSecondary: ReturnType<typeof listAuthProviders>;
  flags: {
    emailEnabled: boolean;
    socialEnabled: boolean;
    walletSiwsEnabled: boolean;
    walletOptionalPlay: boolean;
    accountRequiredForPlay: boolean;
  };
  copy: {
    headline: string;
    lede: string;
    walletLater: string;
  };
};

/** Recommended journey: create account first, wallet later. */
export function getAuthOnboardingPlan(): AuthOnboardingPlan {
  return {
    recommendedFirst: "email_or_social",
    accountRequiredForPlay: true,
    walletRequiredForPlay: false,
    walletRequiredForClaims: true,
    walletRequiredForSolMarketplace: true,
    guestGameplayAllowed: false,
    steps: [
      "choose_login",
      "email_or_social",
      "verify_email",
      "create_riftkeeper",
      "legal_accept",
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
      accountRequiredForPlay: featureFlagDefaults.AUTH_ACCOUNT_REQUIRED_FOR_PLAY,
    },
    copy: {
      headline: "Become a Riftkeeper",
      lede: "Create a free account to play. Guest and anonymous gameplay are disabled — sign in before hatchery, battles, Live World, and marketplace.",
      walletLater:
        "Connect a Solana wallet after you have an account — wallets never replace your Riftkeeper login.",
    },
  };
}

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
      "no_signed_in_account",
    ],
  };
}

/** @deprecated Demo soft identity — guest play removed. */
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
