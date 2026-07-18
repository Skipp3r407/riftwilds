import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import { getSocialPresenceSnapshot } from "@/lib/social-presence";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-status",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.SOCIAL_PRESENCE_ENABLED) {
    return NextResponse.json({
      requestId: guard.requestId,
      enabled: false,
      snapshot: null,
    });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const snapshot = getSocialPresenceSnapshot({ userId: ownerKey });
  const res = NextResponse.json({
    requestId: guard.requestId,
    enabled: true,
    snapshot,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
