import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolvePersistenceOwner } from "@/lib/persistence/owner-resolve";
import { startWorldSession } from "@/lib/persistence/world-session";
import { restoreWorldState } from "@/lib/persistence/save-state";
import { clearSleepStubOnLogin } from "@/lib/persistence/sleeping";
import { attachGuestCookie, guestIdentityFields } from "@/lib/auth/owner-key";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!featureFlagDefaults.WORLD_PERSISTENCE_ENABLED) {
    return jsonError("World persistence disabled", 503, "disabled");
  }

  const owner = await resolvePersistenceOwner();
  const guard = await withApiGuard({
    bucket: "persistence-session-start",
    limit: 30,
    clientKey: owner.ownerKey,
  });
  if (!guard.ok) return guard.response;

  let body: {
    clientInstanceId?: string;
    mapId?: string;
    x?: number;
    y?: number;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* empty */
  }

  clearSleepStubOnLogin(owner.ownerKey);
  const restored = restoreWorldState(owner.ownerKey);
  const session = startWorldSession({
    ownerKey: owner.ownerKey,
    userId: owner.userId,
    clientInstanceId: body.clientInstanceId ?? null,
    mapId: body.mapId ?? restored.position.mapId,
    x: body.x ?? restored.position.x,
    y: body.y ?? restored.position.y,
  });

  const res = NextResponse.json(
    {
      ok: true,
      requestId: guard.requestId,
      sessionId: session.id,
      status: session.status,
      restored,
      ...guestIdentityFields(owner.isGuest, owner.guestToken),
    },
    { headers: { "X-Request-Id": guard.requestId } },
  );
  attachGuestCookie(res, owner.guestToken);
  return res;
}
