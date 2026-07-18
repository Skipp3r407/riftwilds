import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { withApiGuard } from "@/lib/security/api-guard";
import { claimIdleParticipation } from "@/lib/social-presence";

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "social-presence-idle",
    limit: 20,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (
    !featureFlagDefaults.SOCIAL_PRESENCE_ENABLED ||
    !featureFlagDefaults.SOCIAL_PRESENCE_IDLE_REWARDS_ENABLED
  ) {
    return NextResponse.json({ ok: false, error: "feature_disabled" }, { status: 403 });
  }

  const { ownerKey, isGuest, guestToken } = await resolveOwnerKey();
  const result = claimIdleParticipation({ userId: ownerKey });
  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
