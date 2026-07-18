import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { getSessionContext } from "@/lib/auth/session";
import {
  getOwnerActiveSession,
  getWorldSession,
  endSessionStatus,
} from "@/lib/persistence/world-session";
import { getWorldSave, getSaveSnapshots } from "@/lib/persistence/save-state";
import { getCheckpoint } from "@/lib/persistence/memory-store";

/**
 * Admin session tools stub — inspect / force-end world play sessions.
 * Requires admin role. No destructive mass actions in Phase 1.
 */
export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session || session.role !== "admin") {
    return jsonError("Admin only", 403, "forbidden");
  }

  const guard = await withApiGuard({
    bucket: "admin-sessions",
    limit: 60,
    clientKey: session.userId,
    auditAction: "admin_sessions_list",
    actorId: session.userId,
  });
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const ownerKey = url.searchParams.get("ownerKey");
  const sessionId = url.searchParams.get("sessionId");

  if (sessionId) {
    const world = getWorldSession(sessionId);
    return jsonOk({ session: world }, guard.requestId);
  }

  if (ownerKey) {
    const active = getOwnerActiveSession(ownerKey);
    const save = getWorldSave(ownerKey);
    const checkpoint = getCheckpoint(ownerKey);
    const snapshots = getSaveSnapshots(ownerKey).slice(0, 5);
    return jsonOk(
      {
        ownerKey,
        activeSession: active,
        save: {
          version: save.version,
          mapId: save.mapId,
          x: save.posX,
          y: save.posY,
          dirty: save.dirty,
          updatedAt: save.updatedAt,
        },
        checkpoint,
        recentSnapshots: snapshots,
      },
      guard.requestId,
    );
  }

  return jsonOk(
    {
      note: "Pass ?ownerKey= or ?sessionId= to inspect. Force-end via POST.",
      tools: ["inspect", "force_end", "list_snapshots"],
    },
    guard.requestId,
  );
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session || session.role !== "admin") {
    return jsonError("Admin only", 403, "forbidden");
  }

  const guard = await withApiGuard({
    bucket: "admin-sessions-mutate",
    limit: 20,
    clientKey: session.userId,
    auditAction: "admin_session_force_end",
    actorId: session.userId,
  });
  if (!guard.ok) return guard.response;

  let body: { action?: string; sessionId?: string; ownerKey?: string; reason?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400, "invalid_json", guard.requestId);
  }

  if (body.action === "force_end") {
    const world =
      (body.sessionId ? getWorldSession(body.sessionId) : null) ??
      (body.ownerKey ? getOwnerActiveSession(body.ownerKey) : null);
    if (!world) {
      return jsonError("Session not found", 404, "not_found", guard.requestId);
    }
    endSessionStatus(world, "FORCE_ENDED");
    return jsonOk(
      {
        sessionId: world.id,
        status: "FORCE_ENDED",
        reason: body.reason ?? "admin_force_end",
      },
      guard.requestId,
    );
  }

  return jsonError("Unknown action", 400, "bad_request", guard.requestId);
}
