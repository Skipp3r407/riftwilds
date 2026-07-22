import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginEmailAccount } from "@/lib/auth/email-auth";
import {
  CSRF_COOKIE_NAME,
  createCsrfToken,
  csrfCookieOptions,
  setCsrfCookie,
} from "@/lib/auth/csrf";
import { secureCookieOptions } from "@/lib/auth/cookie-options";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/session";
import { authDefaults } from "@/lib/config/project";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const guard = await withApiGuard({
    bucket: "auth-login",
    limit: 20,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const requestId = guard.requestId;
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError({
        code: ErrorCodes.VALIDATION,
        message: "Invalid login payload",
        requestId,
        status: 400,
      });
    }

    const result = await loginEmailAccount({
      ...parsed.data,
      ip: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
      requestId,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: ErrorCodes.UNAUTHORIZED,
            message: result.error,
            requestId,
            retryable: false,
          },
        },
        { status: 401 },
      );
    }

    const csrf = createCsrfToken();
    await setCsrfCookie(csrf);

    const next =
      result.accountStatus === "PENDING_VERIFICATION"
        ? "/verify-email"
        : result.accountStatus === "PARENTAL_CONSENT_REQUIRED"
          ? "/onboarding?step=parental"
          : result.onboardingComplete
            ? "/play"
            : "/onboarding";

    // Attach cookies on the response object too — cookies().set alone can miss
    // some Route Handler responses (same pattern as /api/auth/dev-override).
    const sessionMaxAge = result.rememberMe ? 60 * 60 * 24 * 30 : undefined;
    const refreshMaxAge = result.rememberMe
      ? 60 * 60 * 24 * 30
      : 60 * 60 * 24 * 14;

    const res = NextResponse.json({
      ok: true,
      requestId,
      userId: result.userId,
      accountStatus: result.accountStatus,
      onboardingComplete: result.onboardingComplete,
      next,
      csrf,
    });
    res.cookies.set(authDefaults.COOKIE_NAME, result.sessionToken, {
      ...secureCookieOptions(sessionMaxAge),
      expires: result.sessionExpiresAt,
    });
    res.cookies.set(REFRESH_COOKIE_NAME, result.refreshToken, {
      ...secureCookieOptions(refreshMaxAge),
      expires: result.refreshExpiresAt,
    });
    res.cookies.set(CSRF_COOKIE_NAME, csrf, csrfCookieOptions());
    return res;
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.toJSON() }, { status: error.status });
    }
    return NextResponse.json(
      {
        error: {
          code: ErrorCodes.INTERNAL,
          message: "Login failed",
          requestId,
          retryable: true,
        },
      },
      { status: 500 },
    );
  }
}
