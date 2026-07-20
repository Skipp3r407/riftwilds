import { NextResponse } from "next/server";
import { clearGameplayCookies } from "@/lib/auth/account-gate";
import { destroySession, getSessionContext } from "@/lib/auth/session";
import { writeSecurityAudit } from "@/lib/auth/security-audit";
import { createRequestId } from "@/lib/utils/request-id";

export async function POST() {
  const requestId = createRequestId();
  const session = await getSessionContext();
  await destroySession();
  await clearGameplayCookies();
  if (session) {
    await writeSecurityAudit({
      userId: session.userId,
      action: "auth.logout",
      requestId,
    });
  }
  return NextResponse.json({ requestId, ok: true });
}
