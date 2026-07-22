import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmailCode, verifyEmailToken } from "@/lib/auth/email-auth";
import { createRequestId } from "@/lib/utils/request-id";
import { ErrorCodes } from "@/lib/errors/app-error";
import { getFullSessionContext } from "@/lib/auth/session";

const bodySchema = z
  .object({
    token: z.string().min(16).max(200).optional(),
    code: z.string().min(4).max(12).optional(),
    email: z.string().email().max(254).optional(),
  })
  .refine((v) => Boolean(v.token || v.code), {
    message: "Provide a verification code or link token",
  });

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.VALIDATION,
          message: "Verification code or token required",
          requestId,
          retryable: false,
        },
      },
      { status: 400 },
    );
  }

  let result: { ok: true; userId: string } | { ok: false; error: string };

  if (parsed.data.token) {
    result = await verifyEmailToken(parsed.data.token);
  } else {
    const session = await getFullSessionContext().catch(() => null);
    result = await verifyEmailCode({
      code: parsed.data.code!,
      userId: session?.userId,
      email: parsed.data.email,
    });
  }

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
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    requestId,
    userId: result.userId,
    next: "/onboarding",
  });
}

/** Link clicks: /api/auth/verify-email?token=… → verify then redirect. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!token) {
    return NextResponse.redirect(`${appUrl}/verify-email`);
  }
  const result = await verifyEmailToken(token);
  if (!result.ok) {
    return NextResponse.redirect(
      `${appUrl}/verify-email?error=${encodeURIComponent(result.error)}`,
    );
  }
  return NextResponse.redirect(`${appUrl}/onboarding`);
}
