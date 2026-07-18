import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolvePersistenceOwner } from "@/lib/persistence/owner-resolve";
import {
  evaluateLogoutSafety,
  getSafeLogoutCountdownMs,
  performLogout,
} from "@/lib/persistence/logout";
import { assertCanLeaveWorld } from "@/lib/persistence/integration-hooks";
import { persistSaveToPrisma } from "@/lib/persistence/prisma-adapter";
import { getWorldSave } from "@/lib/persistence/save-state";
import type { LogoutMode } from "@/lib/persistence/types";

export async function POST(request: Request) {
  if (!featureFlagDefaults.WORLD_PERSISTENCE_ENABLED) {
    return jsonError("World persistence disabled", 503, "disabled");
  }

  const owner = await resolvePersistenceOwner();
  const guard = await withApiGuard({
    bucket: "persistence-logout",
    limit: 30,
    clientKey: owner.ownerKey,
    auditAction: "world_logout",
    actorId: owner.userId,
  });
  if (!guard.ok) return guard.response;

  let body: {
    mode?: LogoutMode;
    mapId?: string;
    x?: number;
    y?: number;
    playState?: Record<string, unknown>;
    inCombat?: boolean;
    requestId?: string;
    leaveSleepingStub?: boolean;
    marketplaceSettlementPending?: boolean;
    travelInProgress?: boolean;
    previewOnly?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json", guard.requestId);
  }

  if (body.mapId == null || body.x == null || body.y == null) {
    return jsonError("mapId, x, y required", 400, "bad_request", guard.requestId);
  }

  const safety = evaluateLogoutSafety({
    mapId: body.mapId,
    x: body.x,
    y: body.y,
  });

  if (body.previewOnly) {
    return jsonOk(
      {
        ...safety,
        countdownMs: getSafeLogoutCountdownMs(),
        neverChargesSol: true,
        neverDeletesItems: true,
      },
      guard.requestId,
    );
  }

  const leave = assertCanLeaveWorld({
    marketplaceSettlementPending: body.marketplaceSettlementPending,
    travelInProgress: body.travelInProgress,
  });
  if (!leave.ok) {
    return jsonError(leave.message, 409, leave.code, guard.requestId);
  }

  const mode: LogoutMode =
    body.mode ?? (safety.safe ? "safe" : "unsafe");

  const result = performLogout({
    ownerKey: owner.ownerKey,
    userId: owner.userId,
    mode,
    position: { mapId: body.mapId, x: body.x, y: body.y },
    playState: body.playState ?? null,
    inCombat: body.inCombat,
    requestId: body.requestId ?? guard.requestId,
    leaveSleepingStub: body.leaveSleepingStub,
  });

  if (!result.ok) {
    return jsonError(result.error, 400, result.code, guard.requestId);
  }

  void persistSaveToPrisma(getWorldSave(owner.ownerKey));

  return jsonOk(
    {
      ...result,
      countdownMs: getSafeLogoutCountdownMs(),
      neverChargesSol: true,
      neverDeletesItems: true,
    },
    guard.requestId,
  );
}
