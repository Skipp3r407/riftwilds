import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { shouldUseSecureCookies } from "@/lib/auth/cookie-options";
import { authDefaults } from "@/lib/config/project";
import {
  ORIGIN_STORY_COOKIE_MAX_AGE_SECONDS,
  ORIGIN_STORY_SEEN_COOKIE,
  ORIGIN_STORY_SEEN_VALUE,
  hasSeenOriginStoryCookie,
} from "@/lib/origin-story";

function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|linkedinbot|twitterbot|whatsapp|preview/i.test(
    userAgent,
  );
}

/**
 * Edge middleware: maintenance gate + admin session presence check + first-visit story gate.
 * Role verification still happens server-side in admin layouts/APIs.
 *
 * First-visit (not always): `/` → `/about` until `riftwilds-seen-origin-story` is set.
 * Bots skip the gate so `/` stays crawlable for SEO.
 */
export function middleware(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === "true") {
    const path = request.nextUrl.pathname;
    if (
      !path.startsWith("/api/health") &&
      !path.startsWith("/api/ready") &&
      path !== "/maintenance"
    ) {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = request.cookies.get(authDefaults.COOKIE_NAME)?.value;
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/play";
      url.searchParams.set("admin", "login-required");
      return NextResponse.redirect(url);
    }
  }

  const { pathname, searchParams } = request.nextUrl;

  // Explicit home intent (?home=1) always serves `/` and marks the story seen.
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
    "/((?!_next/static|_next/image|favicon.ico|assets/|api/health|api/ready).*)",
  ],
};
