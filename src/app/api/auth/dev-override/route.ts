import { NextResponse } from "next/server";
import {
  DEV_KEEPER_PROFILE,
  isDevOverrideRuntimeAllowed,
} from "@/lib/auth/dev-override";
import { createCsrfToken, setCsrfCookie } from "@/lib/auth/csrf";
import { createDevOverrideSession } from "@/lib/auth/session";
import { ErrorCodes } from "@/lib/errors/app-error";
import { withApiGuard } from "@/lib/security/api-guard";

/**
 * Development Override — issues a local signed Dev Keeper session.
 * Always 403 when NODE_ENV === "production" (never trust the client).
 */
export async function GET() {
  const allowed = isDevOverrideRuntimeAllowed();
  return NextResponse.json({
    ok: true,
    allowed,
    label: "Developer Override",
    subtitle: "For Local Development Only",
    productionLocked: process.env.NODE_ENV === "production",
  });
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "auth-dev-override",
    limit: 30,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  // Hard server reject — never trust client-only flags.
  // True production is always locked; preview needs an explicit bypass flag.
  if (!isDevOverrideRuntimeAllowed()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: "Development Override is disabled in this environment.",
          requestId: guard.requestId,
          retryable: false,
        },
      },
      { status: 403, headers: { "X-Request-Id": guard.requestId } },
    );
  }

  try {
    const session = await createDevOverrideSession();
    const csrf = createCsrfToken();
    await setCsrfCookie(csrf);

    return NextResponse.json({
      ok: true,
      requestId: guard.requestId,
      mode: session.mode,
      next: "/play",
      developer: true,
      profile: {
        userId: DEV_KEEPER_PROFILE.userId,
        displayName: DEV_KEEPER_PROFILE.displayName,
        username: DEV_KEEPER_PROFILE.username,
        role: DEV_KEEPER_PROFILE.role,
        level: DEV_KEEPER_PROFILE.level,
        softCurrency: DEV_KEEPER_PROFILE.softCurrency,
        shards: DEV_KEEPER_PROFILE.shards,
        unlocks: DEV_KEEPER_PROFILE.unlocks,
        developer: true,
      },
      mockSeed: true,
      csrf,
      note: "Local signed session — not written to production DB. Mock state seeds in localStorage.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.INTERNAL,
          message: "Could not create Development Override session.",
          requestId: guard.requestId,
          retryable: true,
        },
      },
      { status: 500, headers: { "X-Request-Id": guard.requestId } },
    );
  }
}
