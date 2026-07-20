import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerEmailAccount } from "@/lib/auth/email-auth";
import { setCsrfCookie, createCsrfToken } from "@/lib/auth/csrf";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { createRequestId } from "@/lib/utils/request-id";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(10).max(128),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  rememberMe: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const guard = await withApiGuard({
    bucket: "auth-register",
    limit: 10,
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
        message: "Invalid registration payload",
        requestId,
        status: 400,
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      });
    }

    const result = await registerEmailAccount({
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
            code: ErrorCodes.VALIDATION,
            message: result.error,
            requestId,
            fieldErrors: result.fieldErrors,
            retryable: false,
          },
        },
        { status: 400 },
      );
    }

    const csrf = createCsrfToken();
    await setCsrfCookie(csrf);

    return NextResponse.json({
      ok: true,
      requestId,
      userId: result.userId,
      accountStatus: result.accountStatus,
      needsVerification: result.needsVerification,
      // Local/dev only — production should send email, never return raw token.
      verificationToken:
        process.env.NODE_ENV === "production" ? undefined : result.verificationToken,
      next: result.needsVerification ? "/verify-email" : "/onboarding",
      csrf,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.toJSON() }, { status: error.status });
    }
    return NextResponse.json(
      {
        error: {
          code: ErrorCodes.INTERNAL,
          message: "Registration failed",
          requestId,
          retryable: true,
        },
      },
      { status: 500 },
    );
  }
}
