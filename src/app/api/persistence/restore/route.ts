import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolvePersistenceOwner } from "@/lib/persistence/owner-resolve";
import { restoreWorldState } from "@/lib/persistence/save-state";
import { getOwnerActiveSession } from "@/lib/persistence/world-session";
import { attachGuestCookie, guestIdentityFields } from "@/lib/auth/owner-key";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!featureFlagDefaults.WORLD_PERSISTENCE_ENABLED) {
    return jsonError("World persistence disabled", 503, "disabled");
  }

  const owner = await resolvePersistenceOwner();
  const guard = await withApiGuard({
    bucket: "persistence-restore",
    limit: 60,
    clientKey: owner.ownerKey,
  });
  if (!guard.ok) return guard.response;

  void request;
  const restored = restoreWorldState(owner.ownerKey);
  const session = getOwnerActiveSession(owner.ownerKey);

  const res = NextResponse.json(
    {
      ok: true,
      requestId: guard.requestId,
      restored,
      sessionId: session?.id ?? null,
      sessionStatus: session?.status ?? null,
      ...guestIdentityFields(owner.isGuest, owner.guestToken),
    },
    { headers: { "X-Request-Id": guard.requestId } },
  );
  attachGuestCookie(res, owner.guestToken);
  return res;
}
