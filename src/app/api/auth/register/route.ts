import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerEmailAccount } from "@/lib/auth/email-auth";
import { mapRegistrationFailure } from "@/lib/auth/registration-errors";
import { setCsrfCookie, createCsrfToken } from "@/lib/auth/csrf";
import { canExposeAuthDevSecrets } from "@/lib/auth/mail";
import { AppError, ErrorCodes } from "@/lib/errors/app-error";
import { withApiGuard } from "@/lib/security/api-guard";

const bodySchema = z.object({
  email: z.string().email("Enter a valid email address.").max(254),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .max(128, "Password is too long."),
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(
      /^[A-Za-z][A-Za-z0-9_]{2,23}$/,
      "Username must start with a letter and use letters, numbers, or _.",
    ),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Accept the Terms of Service to continue." }),
  }),
  acceptPrivacy: z.literal(true, {
    errorMap: () => ({ message: "Accept the Privacy Policy to continue." }),
  }),
  rememberMe: z.boolean().optional(),
});

function firstFieldMessage(
  fieldErrors: Record<string, string[] | undefined>,
): string | null {
  for (const messages of Object.values(fieldErrors)) {
    if (messages?.[0]) return messages[0];
  }
  return null;
}

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
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >;
      throw new AppError({
        code: ErrorCodes.VALIDATION,
        message:
          firstFieldMessage(fieldErrors) ??
          "Check your username, email, password, and legal checkboxes.",
        requestId,
        status: 400,
        fieldErrors,
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
    const expose = canExposeAuthDevSecrets();

    return NextResponse.json({
      ok: true,
      requestId,
      userId: result.userId,
      accountStatus: result.accountStatus,
      needsVerification: result.needsVerification,
      emailDelivery: result.emailDelivery,
      // Local/dev only — production emails the code/link; never return raw secrets.
      verificationToken: expose ? result.verificationToken : undefined,
      verificationCode: expose ? result.verificationCode : undefined,
      verificationExpiresAt: result.verificationExpiresAt,
      next: result.needsVerification ? "/verify-email" : "/onboarding",
      csrf,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { ok: false, error: error.toJSON() },
        { status: error.status },
      );
    }
    console.error("[auth/register]", requestId, error);
    const mapped = mapRegistrationFailure(error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: mapped.code,
          message: mapped.message,
          requestId,
          fieldErrors: mapped.fieldErrors,
          retryable: mapped.retryable,
        },
      },
      { status: mapped.status },
    );
  }
}
