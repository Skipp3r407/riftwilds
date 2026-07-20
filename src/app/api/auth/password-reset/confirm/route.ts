import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/auth/email-auth";
import { createRequestId } from "@/lib/utils/request-id";
import { ErrorCodes } from "@/lib/errors/app-error";

const bodySchema = z.object({
  token: z.string().min(16).max(200),
  password: z.string().min(10).max(128),
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
          message: "Invalid reset payload",
          requestId,
          retryable: false,
        },
      },
      { status: 400 },
    );
  }

  const result = await resetPasswordWithToken(parsed.data);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.VALIDATION,
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
    next: "/login",
  });
}
