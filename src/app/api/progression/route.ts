import { NextResponse } from "next/server";
import { attachGuestCookie, guestIdentityFields, resolveOwnerKey } from "@/lib/auth/owner-key";
import { getSessionContext } from "@/lib/auth/session";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getProgressionSnapshot, getProgressionState, saveProgressionState } from "@/lib/progression";
import { loadProgressionFromPrisma } from "@/lib/progression/persist";
import { withApiGuard } from "@/lib/security/api-guard";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "progression-get",
    limit: 120,
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
  if (session?.userId) {
    const fromDb = await loadProgressionFromPrisma(ownerKey, session.userId);
    if (fromDb) {
      const current = getProgressionState(ownerKey);
      saveProgressionState({
        ...current,
        ...fromDb,
        ownerKey,
        userId: session.userId,
        notifications: current.notifications,
        processedRequestIds: current.processedRequestIds,
        grantedMatchIds: current.grantedMatchIds,
        comboActivities: current.comboActivities,
        comboWindowStartedAt: current.comboWindowStartedAt,
      });
    }
  }

  const snapshot = getProgressionSnapshot(ownerKey);
  const res = NextResponse.json({
    requestId: guard.requestId,
    enabled: true,
    snapshot,
    ...guestIdentityFields(isGuest, guestToken),
  });
  if (isGuest) attachGuestCookie(res, guestToken);
  return res;
}
