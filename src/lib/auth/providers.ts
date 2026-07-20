/**
 * Modular auth provider registry — account required; wallet optional after sign-in.
 */

export type AuthProviderId =
  | "email"
  | "google"
  | "discord"
  | "apple"
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
  priority: "primary" | "secondary";
  implemented: boolean;
  featureFlag?: string;
};

function oauthKeysPresent(id: "google" | "discord" | "apple"): boolean {
  if (typeof process === "undefined") return false;
  if (id === "google") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  if (id === "discord") {
    return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  }
  return Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID);
}

export const AUTH_PROVIDERS: AuthProviderDef[] = [
  {
    id: "email",
    kind: "email",
    label: "Email & password",
    description: "Create a Riftkeeper account — required before gameplay.",
    priority: "primary",
    implemented: true,
    featureFlag: "AUTH_EMAIL_ENABLED",
  },
  {
    id: "google",
    kind: "oauth",
    label: "Google",
    description: "Social sign-in (live when GOOGLE_CLIENT_* keys are set).",
    priority: "primary",
    implemented: true,
    featureFlag: "AUTH_SOCIAL_ENABLED",
  },
  {
    id: "discord",
    kind: "oauth",
    label: "Discord",
    description: "Community social sign-in (scaffold until keys configured).",
    priority: "primary",
    implemented: true,
    featureFlag: "AUTH_SOCIAL_ENABLED",
  },
  {
    id: "apple",
    kind: "oauth",
    label: "Apple",
    description: "Sign in with Apple (scaffold until keys configured).",
    priority: "primary",
    implemented: true,
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
    description: "Sign-In With Solana — creates/links account; wallet does not replace login.",
    priority: "secondary",
    implemented: true,
    featureFlag: "AUTH_WALLET_SIWS_ENABLED",
  },
  {
    id: "nakama_guest",
    kind: "bridge",
    label: "Nakama (account session)",
    description:
      "Nakama multiplayer after app account — anonymous rift_guest bridge disabled when account gate is on.",
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
  }).map((p) => {
    if (p.kind === "oauth" && (p.id === "google" || p.id === "discord" || p.id === "apple")) {
      return {
        ...p,
        description: oauthKeysPresent(p.id)
          ? p.description
          : `${p.label} scaffold — add OAuth keys to enable live redirect.`,
      };
    }
    return p;
  });
}
