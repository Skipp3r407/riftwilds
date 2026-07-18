import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolvePersistenceOwner } from "@/lib/persistence/owner-resolve";
import { heartbeatWorldSession } from "@/lib/persistence/world-session";
import { HEARTBEAT_INTERVAL_MS, RECONNECT_GRACE_MS } from "@/lib/persistence/config";

export async function POST(request: Request) {
  if (!featureFlagDefaults.WORLD_PERSISTENCE_ENABLED) {
    return jsonError("World persistence disabled", 503, "disabled");
  }

  const owner = await resolvePersistenceOwner();
  const guard = await withApiGuard({
    bucket: "persistence-heartbeat",
    limit: 240,
    clientKey: owner.ownerKey,
  });
  if (!guard.ok) return guard.response;

  let body: {
    sessionId?: string;
    mapId?: string;
    x?: number;
    y?: number;
    facingRad?: number;
    inCombat?: boolean;
    clientInstanceId?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json", guard.requestId);
  }

  if (!body.sessionId || body.mapId == null || body.x == null || body.y == null) {
    return jsonError("sessionId, mapId, x, y required", 400, "bad_request", guard.requestId);
  }

  const result = heartbeatWorldSession({
    ownerKey: owner.ownerKey,
    userId: owner.userId,
    sessionId: body.sessionId,
    position: {
      mapId: body.mapId,
      x: body.x,
      y: body.y,
      facingRad: body.facingRad,
    },
    inCombat: body.inCombat,
    clientInstanceId: body.clientInstanceId,
    requestId: guard.requestId,
  });

  if (!result.ok) {
    return jsonError(result.error, 409, result.code, guard.requestId);
  }

  return jsonOk(
    {
      sessionId: result.session.id,
      status: result.session.status,
      version: result.session.version,
      inCombat: result.session.inCombat,
      warnings: result.warnings,
      heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS,
      reconnectGraceMs: RECONNECT_GRACE_MS,
    },
    guard.requestId,
  );
}
