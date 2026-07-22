import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { getSessionContext } from "@/lib/auth/session";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { claimDailyLogin } from "@/lib/progression";
import { withApiGuard } from "@/lib/security/api-guard";

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "progression-daily",
    limit: 20,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.KEEPER_PROGRESSION_ENABLED) {
    return NextResponse.json({ enabled: false }, { status: 403 });
  }

  const { ownerKey, isGuest, guestToken, authorized } = await resolveOwnerKey();
  if (!authorized || !ownerKey) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const session = await getSessionContext();
  const result = claimDailyLogin({
    ownerKey,
    userId: session?.userId ?? null,
  });

  const res = NextResponse.json({
    requestId: guard.requestId,
    ...result,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
