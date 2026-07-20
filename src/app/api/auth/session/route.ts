import { NextResponse } from "next/server";
import {
  DEV_OVERRIDE_USER_ID,
  isDevOverrideRuntimeAllowed,
} from "@/lib/auth/dev-override";
import { getFullSessionContext } from "@/lib/auth/session";
import { evaluateAccountStatus } from "@/lib/auth/account-status";
import { createRequestId } from "@/lib/utils/request-id";

export async function GET() {
  const requestId = createRequestId();
  const session = await getFullSessionContext();
  if (!session) {
    return NextResponse.json({
      requestId,
      authenticated: false,
      session: null,
      canPlay: false,
    });
  }

  const gate = evaluateAccountStatus({
    status: session.accountStatus,
    onboardingComplete: session.onboardingComplete,
    lockedUntil: session.lockedUntil,
  });

  return NextResponse.json({
    requestId,
    authenticated: true,
    canPlay: gate.ok === true,
    gate:
      gate.ok === true
        ? { ok: true }
        : {
            ok: false,
            reason: gate.reason,
            message: gate.message,
            redirectTo: gate.redirectTo,
          },
    session: {
      userId: session.userId,
      walletAddress: session.walletAddress,
      role: session.role,
      tokenTier: session.tokenTier,
      authMethod: session.authMethod,
      accountStatus: session.accountStatus,
      onboardingComplete: session.onboardingComplete,
      emailVerified: session.emailVerified,
      email: session.email,
      displayName: session.displayName,
      username: session.username,
      lastLocationPath: session.lastLocationPath,
      developer:
        isDevOverrideRuntimeAllowed() &&
        session.userId === DEV_OVERRIDE_USER_ID,
    },
  });
}
