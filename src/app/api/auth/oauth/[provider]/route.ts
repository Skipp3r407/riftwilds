import { NextRequest, NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { createRequestId } from "@/lib/utils/request-id";

const PROVIDERS = ["google", "discord", "apple"] as const;
type OAuthProvider = (typeof PROVIDERS)[number];

function envReady(provider: OAuthProvider): boolean {
  if (provider === "google") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  if (provider === "discord") {
    return Boolean(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
  }
  if (provider === "apple") {
    return Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID);
  }
  return false;
}

/**
 * OAuth scaffold — redirects to provider when keys exist; otherwise returns setup instructions.
 * Wallet never replaces account; OAuth creates/links AuthAccount rows when wired.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const requestId = createRequestId();
  const { provider: raw } = await context.params;
  const provider = raw.toLowerCase() as OAuthProvider;

  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json(
      { ok: false, error: "Unknown OAuth provider", requestId },
      { status: 404 },
    );
  }

  if (!featureFlagDefaults.AUTH_SOCIAL_ENABLED) {
    return NextResponse.json(
      {
        ok: false,
        error: "Social sign-in is disabled",
        requestId,
        provider,
      },
      { status: 503 },
    );
  }

  if (!envReady(provider)) {
    return NextResponse.json({
      ok: false,
      scaffold: true,
      provider,
      requestId,
      message: `${provider} OAuth keys are not configured. Set env vars and retry.`,
      envHints:
        provider === "google"
          ? ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]
          : provider === "discord"
            ? ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"]
            : ["APPLE_CLIENT_ID", "APPLE_TEAM_ID", "APPLE_KEY_ID"],
      returnUrl: request.nextUrl.searchParams.get("returnUrl") ?? "/play",
    });
  }

  // Placeholder authorize URL — full OAuth callback wiring lands with credentials.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const state = crypto.randomUUID();
  const authorize =
    provider === "google"
      ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${appUrl}/api/auth/oauth/google/callback`)}&response_type=code&scope=openid%20email%20profile&state=${state}`
      : provider === "discord"
        ? `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${appUrl}/api/auth/oauth/discord/callback`)}&response_type=code&scope=identify%20email&state=${state}`
        : `${appUrl}/login?oauth=apple-pending`;

  return NextResponse.redirect(authorize);
}
