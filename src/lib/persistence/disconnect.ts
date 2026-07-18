/**
 * Disconnect recovery — reconnect grace + combat disconnect policy.
 */

import { RECONNECT_GRACE_MS } from "@/lib/persistence/config";
import { combatDisconnectPolicy } from "@/lib/persistence/anti-exploit";
import {
  getActiveSession,
  getOrCreateSave,
  getCheckpoint,
} from "@/lib/persistence/memory-store";
import { buildRestoreResult } from "@/lib/persistence/position-validate";
import {
  heartbeatWorldSession,
  markSessionDisconnect,
  startWorldSession,
} from "@/lib/persistence/world-session";
import type { HeartbeatRequest, RestoreResult } from "@/lib/persistence/types";

export function beginDisconnectRecovery(params: {
  sessionId: string;
  ownerKey: string;
}):
  | {
      ok: true;
      reconnectDeadline: number;
      graceMs: number;
      invulnerable: false;
      combatWarning: string | null;
    }
  | { ok: false; error: string; code: string } {
  const result = markSessionDisconnect(params);
  if (!result.ok) return result;
  return {
    ok: true,
    reconnectDeadline: result.session.reconnectDeadline ?? Date.now() + RECONNECT_GRACE_MS,
    graceMs: RECONNECT_GRACE_MS,
    invulnerable: false,
    combatWarning: result.combat.message,
  };
}

export function attemptReconnect(params: {
  ownerKey: string;
  userId?: string | null;
  sessionId?: string | null;
  clientInstanceId?: string | null;
  heartbeat?: Omit<HeartbeatRequest, "ownerKey" | "sessionId"> & { sessionId?: string };
}):
  | { ok: true; restored: RestoreResult; sessionId: string; warnings: string[] }
  | { ok: false; error: string; code: string } {
  let session = params.sessionId
    ? getActiveSession(params.ownerKey)
    : getActiveSession(params.ownerKey);

  if (!session || (params.sessionId && session.id !== params.sessionId)) {
    // Resume or create
    session = startWorldSession({
      ownerKey: params.ownerKey,
      userId: params.userId,
      clientInstanceId: params.clientInstanceId,
    });
  }

  const warnings: string[] = [];
  const combat = combatDisconnectPolicy(session.inCombat);
  if (combat.message) warnings.push(combat.message);
  // Explicit: never invulnerable
  if (combat.invulnerable) {
    return { ok: false, error: "Invariant broken", code: "invuln_forbidden" };
  }

  if (params.heartbeat) {
    const hb = heartbeatWorldSession({
      ownerKey: params.ownerKey,
      userId: params.userId,
      sessionId: session.id,
      position: params.heartbeat.position,
      inCombat: params.heartbeat.inCombat ?? session.inCombat,
      clientInstanceId: params.clientInstanceId,
      requestId: params.heartbeat.requestId,
    });
    if (!hb.ok) return hb;
    warnings.push(...hb.warnings);
    session = hb.session;
  } else if (session.status === "RECONNECTING") {
    session.status = "ACTIVE";
    session.reconnectDeadline = null;
    session.disconnectAt = null;
    session.lastHeartbeatAt = Date.now();
  }

  const restored = buildRestoreResult({
    session,
    save: getOrCreateSave(params.ownerKey, params.userId ?? null),
    checkpoint: getCheckpoint(params.ownerKey),
  });

  return { ok: true, restored, sessionId: session.id, warnings };
}

export function getReconnectGraceMs(): number {
  return RECONNECT_GRACE_MS;
}
