/**
 * Modular auth provider registry — email / social first, wallet optional.
 * SIWS wallet flow remains the production Web3 path; OAuth stubs are scaffolding.
 */

export type AuthProviderId =
  | "email"
  | "google"
  | "discord"
  | "twitter"
  | "wallet_siws"
  | "nakama_guest"
  | "clerk_stub"
  | "nextauth_stub";

export type AuthProviderKind = "email" | "oauth" | "wallet" | "bridge";

export type AuthProviderDef = {
  id: AuthProviderId;
  kind: AuthProviderKind;
  label: string;
  description: string;
  /** Shown on /login as primary (email/social) vs secondary (wallet). */
  priority: "primary" | "secondary";
  /** Runtime readiness — stubs stay disabled until credentials exist. */
  implemented: boolean;
  featureFlag?: string;
};

export const AUTH_PROVIDERS: AuthProviderDef[] = [
  {
    id: "email",
    kind: "email",
    label: "Email",
    description: "Magic-link or passwordless email — recommended for newcomers.",
    priority: "primary",
    implemented: false,
    featureFlag: "AUTH_EMAIL_ENABLED",
  },
  {
    id: "google",
    kind: "oauth",
    label: "Google",
    description: "Social sign-in stub (NextAuth / Clerk adapter later).",
    priority: "primary",
    implemented: false,
    featureFlag: "AUTH_SOCIAL_ENABLED",
  },
  {
    id: "discord",
    kind: "oauth",
    label: "Discord",
    description: "Community social sign-in stub.",
    priority: "primary",
    implemented: false,
    featureFlag: "AUTH_SOCIAL_ENABLED",
  },
  {
    id: "twitter",
    kind: "oauth",
    label: "X / Twitter",
    description: "Social sign-in stub.",
    priority: "primary",
    implemented: false,
    featureFlag: "AUTH_SOCIAL_ENABLED",
  },
  {
    id: "wallet_siws",
    kind: "wallet",
    label: "Solana wallet",
    description: "Sign-In With Solana — full Web3 features when connected.",
    priority: "secondary",
    implemented: true,
    featureFlag: "AUTH_WALLET_SIWS_ENABLED",
  },
  {
    id: "nakama_guest",
    kind: "bridge",
    label: "Nakama guest",
    description:
      "Bridge rift_guest device auth to Nakama for multiplayer — does not replace SIWS or demo owner keys.",
    priority: "secondary",
    implemented: true,
    featureFlag: "NAKAMA_AUTH_BRIDGE_ENABLED",
  },
  {
    id: "nextauth_stub",
    kind: "bridge",
    label: "NextAuth bridge",
    description: "Adapter placeholder for NextAuth.js session sync.",
    priority: "secondary",
    implemented: false,
    featureFlag: "AUTH_NEXTAUTH_BRIDGE_ENABLED",
  },
  {
    id: "clerk_stub",
    kind: "bridge",
    label: "Clerk bridge",
    description: "Adapter placeholder for Clerk session sync.",
    priority: "secondary",
    implemented: false,
    featureFlag: "AUTH_CLERK_BRIDGE_ENABLED",
  },
];

export function listAuthProviders(opts?: {
  priority?: "primary" | "secondary";
  implementedOnly?: boolean;
}): AuthProviderDef[] {
  return AUTH_PROVIDERS.filter((p) => {
    if (opts?.priority && p.priority !== opts.priority) return false;
    if (opts?.implementedOnly && !p.implemented) return false;
    return true;
  });
}
