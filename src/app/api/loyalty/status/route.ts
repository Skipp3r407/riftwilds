import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { getLoyaltyStatus } from "@/lib/loyalty/service";
import { withApiGuard } from "@/lib/security/api-guard";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "loyalty-status",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const status = getLoyaltyStatus(ownerKey);
  const res = NextResponse.json({
    ok: true,
    requestId: guard.requestId,
    ...status,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
