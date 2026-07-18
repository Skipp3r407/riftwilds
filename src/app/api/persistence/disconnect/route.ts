import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { resolvePersistenceOwner } from "@/lib/persistence/owner-resolve";
import {
  attemptReconnect,
  beginDisconnectRecovery,
} from "@/lib/persistence/disconnect";

export async function POST(request: Request) {
  if (!featureFlagDefaults.WORLD_PERSISTENCE_ENABLED) {
    return jsonError("World persistence disabled", 503, "disabled");
  }

  const owner = await resolvePersistenceOwner();
  const guard = await withApiGuard({
    bucket: "persistence-disconnect",
    limit: 60,
    clientKey: owner.ownerKey,
  });
  if (!guard.ok) return guard.response;

  let body: {
    action?: "disconnect" | "reconnect";
    sessionId?: string;
    clientInstanceId?: string;
    mapId?: string;
    x?: number;
    y?: number;
    inCombat?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json", guard.requestId);
  }

  const action = body.action ?? "disconnect";

  if (action === "disconnect") {
    if (!body.sessionId) {
      return jsonError("sessionId required", 400, "bad_request", guard.requestId);
    }
    const result = beginDisconnectRecovery({
      sessionId: body.sessionId,
      ownerKey: owner.ownerKey,
    });
    if (!result.ok) {
      return jsonError(result.error, 409, result.code, guard.requestId);
    }
    return jsonOk(
      {
        ...result,
        invulnerable: false,
        note: "Combat disconnect never grants invulnerability.",
      },
      guard.requestId,
    );
  }

  const reconnect = attemptReconnect({
    ownerKey: owner.ownerKey,
    userId: owner.userId,
    sessionId: body.sessionId,
    clientInstanceId: body.clientInstanceId,
    heartbeat:
      body.mapId != null && body.x != null && body.y != null
        ? {
            position: { mapId: body.mapId, x: body.x, y: body.y },
            inCombat: body.inCombat,
          }
        : undefined,
  });

  if (!reconnect.ok) {
    return jsonError(reconnect.error, 409, reconnect.code, guard.requestId);
  }

  return jsonOk(
    {
      sessionId: reconnect.sessionId,
      restored: reconnect.restored,
      warnings: reconnect.warnings,
      invulnerable: false,
    },
    guard.requestId,
  );
}
