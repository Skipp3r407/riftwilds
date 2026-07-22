import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyOnboardingProgress, getOnboardingState } from "@/lib/auth/onboarding";
import { getFullSessionContext } from "@/lib/auth/session";
import { createRequestId } from "@/lib/utils/request-id";
import { ErrorCodes } from "@/lib/errors/app-error";

const bodySchema = z.object({
  displayName: z.string().min(2).max(40).optional(),
  username: z.string().min(3).max(24).optional(),
  dateOfBirth: z.string().optional(),
  region: z.string().min(2).max(8).optional(),
  acceptTerms: z.boolean().optional(),
  acceptPrivacy: z.boolean().optional(),
  starterKeeperId: z.string().optional(),
  claimStarterEgg: z.boolean().optional(),
  tutorialIntroSeen: z.boolean().optional(),
  parentalConsent: z.boolean().optional(),
});

export async function GET() {
  const requestId = createRequestId();
  const session = await getFullSessionContext();
  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Sign in required",
          requestId,
          retryable: false,
        },
      },
      { status: 401 },
    );
  }
  const state = await getOnboardingState(session.userId);
  return NextResponse.json({
    ok: true,
    requestId,
    state,
    profile: {
      displayName: session.displayName,
      username: session.username,
      email: session.email,
    },
  });
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const session = await getFullSessionContext();
  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Sign in required",
          requestId,
          retryable: false,
        },
      },
      { status: 401 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.VALIDATION,
          message: "Invalid onboarding payload",
          requestId,
          retryable: false,
        },
      },
      { status: 400 },
    );
  }

  const result = await applyOnboardingProgress(session.userId, parsed.data);
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

  const destination =
    result.state.complete
      ? session.lastLocationPath && session.lastLocationPath.startsWith("/")
        ? session.lastLocationPath
        : "/play"
      : "/onboarding";

  return NextResponse.json({
    ok: true,
    requestId,
    state: result.state,
    next: destination,
  });
}
