import { NextRequest, NextResponse } from "next/server";
import { resendEmailVerification } from "@/lib/auth/email-auth";
import { canExposeAuthDevSecrets } from "@/lib/auth/mail";
import { getFullSessionContext } from "@/lib/auth/session";
import { ErrorCodes } from "@/lib/errors/app-error";
import { withApiGuard } from "@/lib/security/api-guard";

export async function POST(request: NextRequest) {
  const guard = await withApiGuard({
    bucket: "auth-verify-resend",
    limit: 6,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const requestId = guard.requestId;
  const session = await getFullSessionContext().catch(() => null);
  if (!session?.userId) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Sign in to resend a verification code.",
          requestId,
          retryable: false,
        },
      },
      { status: 401 },
    );
  }

  const result = await resendEmailVerification({ userId: session.userId });
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: result.retryAfterSeconds
            ? ErrorCodes.RATE_LIMITED
            : ErrorCodes.VALIDATION,
          message: result.error,
          requestId,
          retryable: true,
          retryAfterSeconds: result.retryAfterSeconds,
        },
      },
      { status: result.retryAfterSeconds ? 429 : 400 },
    );
  }

  const expose = canExposeAuthDevSecrets();
  return NextResponse.json({
    ok: true,
    requestId,
    verificationExpiresAt: result.verificationExpiresAt,
    emailDelivery: result.emailDelivery,
    // Local/dev only — production emails the code; never return raw secrets.
    verificationToken: expose ? result.verificationToken : undefined,
    verificationCode: expose ? result.verificationCode : undefined,
  });
}
