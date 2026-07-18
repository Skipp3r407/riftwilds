import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { checkInDaily } from "@/lib/loyalty/service";
import { withApiGuard } from "@/lib/security/api-guard";

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "loyalty-checkin",
    limit: 30,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = checkInDaily({ userId: ownerKey });
  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
