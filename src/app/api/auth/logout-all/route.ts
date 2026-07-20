import { NextResponse } from "next/server";
import { destroyAllSessions, getSessionContext } from "@/lib/auth/session";
import { clearGameplayCookies } from "@/lib/auth/account-gate";
import { writeSecurityAudit } from "@/lib/auth/security-audit";
import { createRequestId } from "@/lib/utils/request-id";
import { ErrorCodes } from "@/lib/errors/app-error";

export async function POST() {
  const requestId = createRequestId();
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: "Not signed in",
          requestId,
          retryable: false,
        },
      },
      { status: 401 },
    );
  }

  const count = await destroyAllSessions(session.userId);
  await clearGameplayCookies();
  await writeSecurityAudit({
    userId: session.userId,
    action: "auth.logout_all",
    requestId,
    metadata: { sessionsRevoked: count },
  });

  return NextResponse.json({ ok: true, requestId, sessionsRevoked: count });
}
