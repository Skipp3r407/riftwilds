import { NextRequest, NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { createRequestId } from "@/lib/utils/request-id";
import {
  isOAuthProvider,
  oauthAuthorizeUrl,
  oauthEnvReady,
  setOAuthStateCookie,
  type OAuthProviderId,
} from "@/lib/auth/oauth";

/**
 * Start OAuth — sets CSRF state cookie, redirects to provider when keys exist.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const requestId = createRequestId();
  const { provider: raw } = await context.params;
  const provider = raw.toLowerCase();

  if (!isOAuthProvider(provider)) {
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

  if (!oauthEnvReady(provider)) {
    return NextResponse.json({
      ok: false,
      scaffold: true,
      provider,
      requestId,
      message: `${provider} OAuth keys are not configured. Set env vars and retry.`,
      envHints:
        provider === "google"
          ? ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "NEXT_PUBLIC_APP_URL"]
          : provider === "discord"
            ? ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"]
            : ["APPLE_CLIENT_ID", "APPLE_TEAM_ID", "APPLE_KEY_ID"],
      docs: "/docs/AUTH_SETUP.md",
      hint:
        provider === "google"
          ? "Connect Google in .env (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)."
          : `Add ${provider} OAuth keys in .env to enable.`,
      returnUrl: request.nextUrl.searchParams.get("returnUrl") ?? "/play",
    });
  }

  const returnUrlRaw = request.nextUrl.searchParams.get("returnUrl") ?? "/play";
  const returnUrl =
    returnUrlRaw.startsWith("/") && !returnUrlRaw.startsWith("//")
      ? returnUrlRaw
      : "/play";
  const state = crypto.randomUUID();

  await setOAuthStateCookie({
    state,
    provider: provider as OAuthProviderId,
    returnUrl,
    issuedAt: Date.now(),
  });

  const authorize = oauthAuthorizeUrl(provider, state);
  if (!authorize) {
    return NextResponse.redirect(
      new URL(`/login?oauth=${provider}-pending`, request.url),
    );
  }

  return NextResponse.redirect(authorize);
}
