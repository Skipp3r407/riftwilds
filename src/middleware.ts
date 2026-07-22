import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocalPreviewBypass } from "@/lib/auth/account-play-policy";
import { shouldUseSecureCookies } from "@/lib/auth/cookie-options";
import {
  buildLoginRedirectPath,
  isProtectedApiPath,
  isProtectedPath,
} from "@/lib/auth/protected-routes";
import { authDefaults } from "@/lib/config/project";
import {
  ORIGIN_STORY_COOKIE_MAX_AGE_SECONDS,
  ORIGIN_STORY_SEEN_COOKIE,
  ORIGIN_STORY_SEEN_VALUE,
  hasSeenOriginStoryCookie,
} from "@/lib/origin-story";

/**
 * Edge middleware (Next 16: prefer `proxy.ts` for Node runtime; keep middleware for edge cookie gates).
 * - Maintenance rewrite
 * - NO ACCOUNT = NO GAMEPLAY: protected pages → /login?returnUrl=
 * - Protected APIs → 401 without ph_session cookie (status checked in layouts/APIs)
 * - Admin cookie presence
 * - First-visit origin story
 */
function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|linkedinbot|twitterbot|whatsapp|preview/i.test(
    userAgent,
  );
}

function hasSessionCookie(request: NextRequest): boolean {
  const value = request.cookies.get(authDefaults.COOKIE_NAME)?.value;
  return Boolean(value && value.length >= 16);
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (process.env.MAINTENANCE_MODE === "true") {
    if (
      !path.startsWith("/api/health") &&
      !path.startsWith("/api/ready") &&
      path !== "/maintenance"
    ) {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
  }

  const previewBypass = isLocalPreviewBypass();

  // Protected gameplay APIs — no cookie ⇒ no data (do not mint guests).
  if (isProtectedApiPath(path) && !hasSessionCookie(request) && !previewBypass) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in required — guest gameplay is disabled.",
          retryable: false,
        },
      },
      { status: 401, headers: { "X-Request-Id": crypto.randomUUID() } },
    );
  }

  // Protected pages — cookie presence only at the edge.
  if (isProtectedPath(path) && !hasSessionCookie(request) && !previewBypass) {
    const returnUrl = `${path}${request.nextUrl.search}`;
    return NextResponse.redirect(
      new URL(buildLoginRedirectPath(returnUrl), request.url),
    );
  }

  if (path.startsWith("/admin")) {
    if (!hasSessionCookie(request) && !previewBypass) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("returnUrl", "/admin");
      url.searchParams.set("admin", "login-required");
      return NextResponse.redirect(url);
    }
  }

  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/" && searchParams.has("home")) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("home");
    const res = NextResponse.redirect(url);
    res.cookies.set(ORIGIN_STORY_SEEN_COOKIE, ORIGIN_STORY_SEEN_VALUE, {
      path: "/",
      maxAge: ORIGIN_STORY_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      secure: shouldUseSecureCookies(),
    });
    res.headers.set("X-Request-Id", crypto.randomUUID());
    return res;
  }

  if (
    pathname === "/" &&
    !hasSeenOriginStoryCookie(request.cookies.get(ORIGIN_STORY_SEEN_COOKIE)?.value) &&
    !isLikelyBot(request.headers.get("user-agent"))
  ) {
    const about = request.nextUrl.clone();
    about.pathname = "/about";
    about.search = "";
    const res = NextResponse.redirect(about);
    res.headers.set("X-Request-Id", crypto.randomUUID());
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("X-Request-Id", crypto.randomUUID());
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|assets/|api/health|api/ready|api/auth).*)",
  ],
};
