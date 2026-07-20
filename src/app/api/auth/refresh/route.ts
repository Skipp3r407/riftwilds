import { NextResponse } from "next/server";
import { rotateRefreshSession } from "@/lib/auth/session";
import { createRequestId } from "@/lib/utils/request-id";
import { ErrorCodes } from "@/lib/errors/app-error";

export async function POST() {
  const requestId = createRequestId();
  const ok = await rotateRefreshSession();
  if (!ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Session refresh failed — sign in again.",
          requestId,
          retryable: false,
        },
      },
      { status: 401 },
    );
  }
  return NextResponse.json({ ok: true, requestId });
}
