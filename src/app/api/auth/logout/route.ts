import { NextRequest, NextResponse } from "next/server";
import { clearGameplayCookies } from "@/lib/auth/account-gate";
import { destroySession, getSessionContext } from "@/lib/auth/session";
import { writeSecurityAudit } from "@/lib/auth/security-audit";
import { createRequestId } from "@/lib/utils/request-id";

function safeNextPath(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/login";
}

async function clearSessionAndAudit(): Promise<string> {
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
  return requestId;
}

/** JSON logout for client buttons. */
export async function POST() {
  const requestId = await clearSessionAndAudit();
  return NextResponse.json({ requestId, ok: true });
}

/**
 * Redirect logout for Server Component gates that must clear cookies.
 * Cookie writes are illegal in RSC layouts — those layouts redirect here with ?next=.
 */
export async function GET(request: NextRequest) {
  await clearSessionAndAudit();
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  return NextResponse.redirect(new URL(next, request.url));
}
