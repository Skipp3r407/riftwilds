import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolvePersistenceOwner } from "@/lib/persistence/owner-resolve";
import { autosaveWorldState } from "@/lib/persistence/save-state";
import type { SaveCategory } from "@/lib/persistence/enums";
import { persistSaveToPrisma } from "@/lib/persistence/prisma-adapter";

export async function POST(request: Request) {
  if (!featureFlagDefaults.WORLD_PERSISTENCE_ENABLED) {
    return jsonError("World persistence disabled", 503, "disabled");
  }

  const owner = await resolvePersistenceOwner();
  const guard = await withApiGuard({
    bucket: "persistence-autosave",
    limit: 60,
    clientKey: owner.ownerKey,
  });
  if (!guard.ok) return guard.response;

  let body: {
    sessionId?: string;
    mapId?: string;
    x?: number;
    y?: number;
    playState?: Record<string, unknown>;
    categories?: SaveCategory[];
    requestId?: string;
    force?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json", guard.requestId);
  }

  if (body.mapId == null || body.x == null || body.y == null) {
    return jsonError("mapId, x, y required", 400, "bad_request", guard.requestId);
  }

  const result = autosaveWorldState({
    ownerKey: owner.ownerKey,
    userId: owner.userId,
    sessionId: body.sessionId ?? null,
    position: { mapId: body.mapId, x: body.x, y: body.y },
    playState: body.playState ?? null,
    categories: body.categories?.length ? body.categories : ["B_PROGRESSION"],
    requestId: body.requestId ?? guard.requestId,
    force: body.force,
  });

  if (!result.ok) {
    return jsonError(result.error, 400, result.code, guard.requestId);
  }

  void persistSaveToPrisma(result.save);

  return jsonOk(
    {
      version: result.save.version,
      snapshotId: result.snapshotId,
      idempotentReplay: result.idempotentReplay,
      mapId: result.save.mapId,
      x: result.save.posX,
      y: result.save.posY,
      lastSafe: {
        mapId: result.save.lastSafeMapId,
        x: result.save.lastSafePosX,
        y: result.save.lastSafePosY,
        zoneId: result.save.lastSafeZoneId,
        zoneKind: result.save.lastSafeZoneKind,
      },
    },
    guard.requestId,
  );
}
