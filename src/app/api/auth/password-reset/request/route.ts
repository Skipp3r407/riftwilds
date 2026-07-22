import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetToken } from "@/lib/auth/email-auth";
import { canExposeAuthDevSecrets } from "@/lib/auth/mail";
import { withApiGuard } from "@/lib/security/api-guard";
import { ErrorCodes } from "@/lib/errors/app-error";

const bodySchema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: NextRequest) {
  const guard = await withApiGuard({
    bucket: "auth-password-reset",
    limit: 8,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.VALIDATION,
          message: "Valid email required",
          requestId: guard.requestId,
          retryable: false,
        },
      },
      { status: 400 },
    );
  }

  const result = await createPasswordResetToken(parsed.data.email);
  const expose = canExposeAuthDevSecrets();

  return NextResponse.json({
    ok: true,
    requestId: guard.requestId,
    message:
      result.emailDelivery === "console"
        ? "If an account exists, a reset link was issued (email not configured — check on-screen or the server console)."
        : "If an account exists, a reset link was issued.",
    emailDelivery: result.emailDelivery,
    // Local/dev only — never return raw tokens in production.
    resetToken: expose ? result.token : undefined,
  });
}
