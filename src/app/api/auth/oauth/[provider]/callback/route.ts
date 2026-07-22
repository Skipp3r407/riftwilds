import { NextRequest, NextResponse } from "next/server";
import { createRequestId } from "@/lib/utils/request-id";
import { createCsrfToken, setCsrfCookie } from "@/lib/auth/csrf";
import {
  appBaseUrl,
  completeGoogleOAuth,
  isOAuthProvider,
  oauthEnvReady,
} from "@/lib/auth/oauth";

/**
 * OAuth provider callback — Google fully wired; Discord/Apple return setup guidance.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const requestId = createRequestId();
  const { provider: raw } = await context.params;
  const provider = raw.toLowerCase();
  const base = appBaseUrl();

  if (!isOAuthProvider(provider)) {
    return NextResponse.redirect(`${base}/login?oauth=unknown`);
  }

  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      `${base}/login?oauth_error=${encodeURIComponent(error)}`,
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(`${base}/login?oauth_error=missing_code`);
  }

  if (!oauthEnvReady(provider)) {
    return NextResponse.redirect(`${base}/login?oauth_error=not_configured`);
  }

  if (provider === "google") {
    const result = await completeGoogleOAuth({
      code,
      state,
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
      requestId,
    });

    if (!result.ok) {
      return NextResponse.redirect(
        `${base}/login?oauth_error=${encodeURIComponent(result.error)}`,
      );
    }

    const csrf = createCsrfToken();
    await setCsrfCookie(csrf);

    const next =
      result.accountStatus === "PENDING_VERIFICATION"
        ? `/verify-email?returnUrl=${encodeURIComponent(result.returnUrl)}`
        : result.returnUrl.startsWith("/")
          ? result.returnUrl
          : "/onboarding";

    return NextResponse.redirect(new URL(next, base).toString());
  }

  // Discord / Apple: authorize redirect works when keys exist; full token exchange TBD.
  return NextResponse.redirect(
    `${base}/login?oauth=${provider}-callback-pending&requestId=${requestId}`,
  );
}
