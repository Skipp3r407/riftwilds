/**
 * World play session — heartbeat, reconnect grace, combat flag.
 * Phase 1: in-memory lease. Phase 2+: WebSocket lease (see backlog).
 */

import { randomUUID } from "crypto";
import {
  HEARTBEAT_MISS_TTL_MS,
  RECONNECT_GRACE_MS,
} from "@/lib/persistence/config";
import { emptyDirtyFlags, markDirty } from "@/lib/persistence/dirty-flags";
import {
  clearActiveSession,
  getActiveSession,
  getOrCreateSave,
  getSession,
  putSession,
} from "@/lib/persistence/memory-store";
import { assertHeartbeatSafety, combatDisconnectPolicy } from "@/lib/persistence/anti-exploit";
import { validatePositionPayload } from "@/lib/persistence/position-validate";
import type {
  DirtyFlags,
  HeartbeatRequest,
  WorldSessionRecord,
} from "@/lib/persistence/types";

function now() {
  return Date.now();
}

export function startWorldSession(params: {
  ownerKey: string;
  userId?: string | null;
  authSessionId?: string | null;
  clientInstanceId?: string | null;
  mapId?: string;
  x?: number;
  y?: number;
}): WorldSessionRecord {
  const existing = getActiveSession(params.ownerKey);
  if (existing && (existing.status === "ACTIVE" || existing.status === "RECONNECTING")) {
    // Take over / resume same lease
    existing.status = "ACTIVE";
    existing.reconnectDeadline = null;
    existing.disconnectAt = null;
    existing.lastHeartbeatAt = now();
    existing.clientInstanceId = params.clientInstanceId ?? existing.clientInstanceId;
    existing.updatedAt = now();
    existing.version += 1;
    return putSession(existing);
  }

  const save = getOrCreateSave(params.ownerKey, params.userId ?? null);
  const session: WorldSessionRecord = {
    id: randomUUID(),
    ownerKey: params.ownerKey,
    userId: params.userId ?? null,
    authSessionId: params.authSessionId ?? null,
    status: "ACTIVE",
    mapId: params.mapId ?? save.mapId,
    posX: params.x ?? save.posX,
    posY: params.y ?? save.posY,
    facingRad: 0,
    inCombat: false,
    combatStartedAt: null,
    lastHeartbeatAt: now(),
    lastAutosaveAt: null,
    reconnectDeadline: null,
    disconnectAt: null,
    logoutZoneId: null,
    logoutZoneKind: null,
    clientInstanceId: params.clientInstanceId ?? null,
    version: 0,
    dirty: emptyDirtyFlags(),
    createdAt: now(),
    updatedAt: now(),
  };
  return putSession(session);
}

export function heartbeatWorldSession(req: HeartbeatRequest):
  | { ok: true; session: WorldSessionRecord; warnings: string[] }
  | { ok: false; error: string; code: string } {
  const session = getSession(req.sessionId);
  if (!session || session.ownerKey !== req.ownerKey) {
    return { ok: false, error: "Session not found", code: "session_not_found" };
  }
  if (
    session.status === "LOGGED_OUT_SAFE" ||
    session.status === "LOGGED_OUT_UNSAFE" ||
    session.status === "FORCE_ENDED" ||
    session.status === "EXPIRED"
  ) {
    return { ok: false, error: "Session ended", code: "session_ended" };
  }

  const posCheck = validatePositionPayload(req.position);
  if (!posCheck.ok) {
    return { ok: false, error: "Invalid position", code: posCheck.error };
  }

  const safety = assertHeartbeatSafety({
    req,
    previous: { mapId: session.mapId, x: session.posX, y: session.posY },
  });
  if (!safety.ok) {
    return { ok: false, error: safety.message, code: safety.code };
  }

  const warnings: string[] = [];
  if (session.status === "RECONNECTING") {
    if (session.reconnectDeadline && now() > session.reconnectDeadline) {
      session.status = "EXPIRED";
      clearActiveSession(session.ownerKey, session.id);
      putSession(session);
      return { ok: false, error: "Reconnect grace expired", code: "reconnect_expired" };
    }
    session.status = "ACTIVE";
    session.reconnectDeadline = null;
    session.disconnectAt = null;
    warnings.push("Reconnected within grace window.");
  }

  // Allow map updates from travel-synced heartbeats
  session.mapId = posCheck.position.mapId;
  session.posX = posCheck.position.x;
  session.posY = posCheck.position.y;
  if (typeof posCheck.position.facingRad === "number") {
    session.facingRad = posCheck.position.facingRad;
  }
  session.lastHeartbeatAt = now();
  session.updatedAt = now();
  session.version += 1;
  session.dirty = markDirty(session.dirty, "position");

  if (typeof req.inCombat === "boolean") {
    if (req.inCombat && !session.inCombat) {
      session.combatStartedAt = now();
      session.dirty = markDirty(session.dirty, "combat");
    }
    if (!req.inCombat && session.inCombat) {
      session.combatStartedAt = null;
    }
    session.inCombat = req.inCombat;
  }

  if (req.clientInstanceId) session.clientInstanceId = req.clientInstanceId;
  if (req.userId) session.userId = req.userId;

  putSession(session);
  return { ok: true, session, warnings };
}

export function markSessionDisconnect(params: {
  sessionId: string;
  ownerKey: string;
}):
  | { ok: true; session: WorldSessionRecord; combat: ReturnType<typeof combatDisconnectPolicy> }
  | { ok: false; error: string; code: string } {
  const session = getSession(params.sessionId);
  if (!session || session.ownerKey !== params.ownerKey) {
    return { ok: false, error: "Session not found", code: "session_not_found" };
  }
  if (session.status !== "ACTIVE" && session.status !== "RECONNECTING") {
    return { ok: false, error: "Session not active", code: "session_not_active" };
  }

  const t = now();
  session.status = "RECONNECTING";
  session.disconnectAt = t;
  session.reconnectDeadline = t + RECONNECT_GRACE_MS;
  session.updatedAt = t;
  putSession(session);

  return {
    ok: true,
    session,
    combat: combatDisconnectPolicy(session.inCombat),
  };
}

/** Expire stale sessions that missed heartbeats past TTL + grace. */
export function sweepStaleSessions(at = now()): number {
  let expired = 0;
  // Iterate active owners
  const active = getActiveSession;
  // We only have owner→id index; scan via known active getters is enough for Phase 1 tests.
  // Full sweep uses list from memory — expose via internal iteration in tests.
  void active;
  void at;
  void expired;
  return sweepAllSessions(at);
}

function sweepAllSessions(at: number): number {
  const g = globalThis as typeof globalThis & {
    __riftwildsPersistenceStore?: { sessions: Map<string, WorldSessionRecord> };
  };
  const sessions = g.__riftwildsPersistenceStore?.sessions;
  if (!sessions) return 0;
  let count = 0;
  for (const session of sessions.values()) {
    if (session.status === "ACTIVE") {
      if (at - session.lastHeartbeatAt > HEARTBEAT_MISS_TTL_MS) {
        session.status = "RECONNECTING";
        session.disconnectAt = at;
        session.reconnectDeadline = at + RECONNECT_GRACE_MS;
        session.updatedAt = at;
        putSession(session);
      }
    }
    if (session.status === "RECONNECTING") {
      if (session.reconnectDeadline && at > session.reconnectDeadline) {
        session.status = session.inCombat ? "DISCONNECTED" : "EXPIRED";
        clearActiveSession(session.ownerKey, session.id);
        session.updatedAt = at;
        putSession(session);
        count += 1;
      }
    }
  }
  return count;
}

export function endSessionStatus(
  session: WorldSessionRecord,
  status: "LOGGED_OUT_SAFE" | "LOGGED_OUT_UNSAFE" | "FORCE_ENDED",
  dirty?: DirtyFlags,
): WorldSessionRecord {
  session.status = status;
  session.updatedAt = now();
  session.reconnectDeadline = null;
  if (dirty) session.dirty = dirty;
  clearActiveSession(session.ownerKey, session.id);
  return putSession(session);
}

export function getWorldSession(sessionId: string): WorldSessionRecord | null {
  return getSession(sessionId);
}

export function getOwnerActiveSession(ownerKey: string): WorldSessionRecord | null {
  return getActiveSession(ownerKey);
}
