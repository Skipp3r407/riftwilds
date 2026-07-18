/**
 * Safe / unsafe logout with countdown contract (UI) and checkpoint restore.
 * Never charges SOL. Never deletes items.
 */

import {
  IDEMPOTENCY_TTL_MS,
  REST_BONUS_STUB,
  SAFE_LOGOUT_COUNTDOWN_MS,
  UNSAFE_LOGOUT_WARNING,
} from "@/lib/persistence/config";
import { emptyDirtyFlags } from "@/lib/persistence/dirty-flags";
import { assertLogoutSafety, unsafeLogoutMessage } from "@/lib/persistence/anti-exploit";
import {
  getActiveSession,
  getCheckpoint,
  getIdempotency,
  getOrCreateSave,
  mergePlayState,
  putCheckpoint,
  putIdempotency,
  upsertSave,
} from "@/lib/persistence/memory-store";
import {
  findLogoutZoneAt,
  isRestLogoutZone,
} from "@/game/live-world/persistence/safe-logout-zones";
import { validatePositionPayload } from "@/lib/persistence/position-validate";
import { stripUntrustedCategoryA } from "@/lib/persistence/anti-exploit";
import { endSessionStatus } from "@/lib/persistence/world-session";
import { maybeCreateSleepStub } from "@/lib/persistence/sleeping";
import type { LogoutRequest, LogoutResult } from "@/lib/persistence/types";

const ROUTE_LOGOUT = "persistence.logout";

export function getSafeLogoutCountdownMs(): number {
  return SAFE_LOGOUT_COUNTDOWN_MS;
}

export function evaluateLogoutSafety(position: {
  mapId: string;
  x: number;
  y: number;
}): {
  safe: boolean;
  zone: ReturnType<typeof findLogoutZoneAt>;
  warning: string | null;
  countdownMs: number;
} {
  const zone = findLogoutZoneAt(position.mapId, position.x, position.y);
  return {
    safe: zone != null,
    zone,
    warning: zone ? null : UNSAFE_LOGOUT_WARNING,
    countdownMs: SAFE_LOGOUT_COUNTDOWN_MS,
  };
}

export function performLogout(req: LogoutRequest): LogoutResult {
  if (req.mode === "cancel") {
    return { ok: false, error: "Logout cancelled", code: "cancelled" };
  }

  const safety = assertLogoutSafety(req);
  if (!safety.ok) {
    return { ok: false, error: safety.message, code: safety.code };
  }

  const idem = getIdempotency(req.ownerKey, req.requestId, ROUTE_LOGOUT);
  if (idem && idem.response && typeof idem.response === "object") {
    return idem.response as LogoutResult;
  }

  const pos = validatePositionPayload(req.position);
  if (!pos.ok) {
    return { ok: false, error: "Invalid position", code: pos.error };
  }

  const zone = findLogoutZoneAt(pos.position.mapId, pos.position.x, pos.position.y);
  const session = getActiveSession(req.ownerKey);
  if (session?.inCombat || req.inCombat) {
    if (req.mode === "safe") {
      return {
        ok: false,
        error: "Cannot safely rest-logout during combat.",
        code: "combat_logout_blocked",
      };
    }
  }

  const save = getOrCreateSave(req.ownerKey, req.userId ?? null);
  const t = Date.now();

  if (req.playState) {
    const stripped = stripUntrustedCategoryA(
      req.playState as Record<string, unknown>,
    ) as typeof req.playState;
    save.playState = mergePlayState(save.playState, stripped);
  }

  let mode: "safe" | "unsafe" = "unsafe";
  let checkpoint = getCheckpoint(req.ownerKey);
  let restBonusApplied = false;
  let message = unsafeLogoutMessage();

  if (req.mode === "safe" && zone) {
    mode = "safe";
    restBonusApplied = Boolean(REST_BONUS_STUB.enabled && isRestLogoutZone(zone.zoneKind));
    checkpoint = putCheckpoint({
      ownerKey: req.ownerKey,
      userId: req.userId ?? null,
      mapId: pos.position.mapId,
      posX: pos.position.x,
      posY: pos.position.y,
      zoneId: zone.zoneId,
      zoneKind: zone.zoneKind,
      restBonusApplied,
      loggedOutAt: t,
      requestId: req.requestId,
    });
    save.mapId = pos.position.mapId;
    save.posX = pos.position.x;
    save.posY = pos.position.y;
    save.lastSafeMapId = zone.mapId;
    save.lastSafePosX = pos.position.x;
    save.lastSafePosY = pos.position.y;
    save.lastSafeZoneId = zone.zoneId;
    save.lastSafeZoneKind = zone.zoneKind;
    message = `Rested at ${zone.name}. Progress saved. No SOL charged.`;
  } else {
    mode = "unsafe";
    // Keep last safe checkpoint; snap restore position to it.
    if (checkpoint) {
      save.mapId = checkpoint.mapId;
      save.posX = checkpoint.posX;
      save.posY = checkpoint.posY;
    } else if (save.lastSafeMapId != null && save.lastSafePosX != null && save.lastSafePosY != null) {
      save.mapId = save.lastSafeMapId;
      save.posX = save.lastSafePosX;
      save.posY = save.lastSafePosY;
      checkpoint = putCheckpoint({
        ownerKey: req.ownerKey,
        userId: req.userId ?? null,
        mapId: save.lastSafeMapId,
        posX: save.lastSafePosX,
        posY: save.lastSafePosY,
        zoneId: save.lastSafeZoneId ?? "central-plaza",
        zoneKind: save.lastSafeZoneKind ?? "SETTLEMENT",
        restBonusApplied: false,
        loggedOutAt: t,
        requestId: req.requestId,
      });
    } else {
      // Fallback: use current position as emergency checkpoint in settlement if possible
      const fallbackZone = zone ?? {
        zoneId: "central-plaza",
        zoneKind: "SETTLEMENT" as const,
        mapId: "riftwild-commons",
        name: "Central Rift Plaza",
      };
      const mapId = zone ? pos.position.mapId : "riftwild-commons";
      const x = zone ? pos.position.x : 1024;
      const y = zone ? pos.position.y : 768;
      checkpoint = putCheckpoint({
        ownerKey: req.ownerKey,
        userId: req.userId ?? null,
        mapId,
        posX: x,
        posY: y,
        zoneId: fallbackZone.zoneId,
        zoneKind: fallbackZone.zoneKind,
        restBonusApplied: false,
        loggedOutAt: t,
        requestId: req.requestId,
      });
      save.mapId = mapId;
      save.posX = x;
      save.posY = y;
    }
    message = unsafeLogoutMessage();
  }

  save.version += 1;
  save.lastRequestId = req.requestId;
  save.dirty = emptyDirtyFlags();
  save.updatedAt = t;
  upsertSave(save);

  if (session) {
    endSessionStatus(
      session,
      mode === "safe" ? "LOGGED_OUT_SAFE" : "LOGGED_OUT_UNSAFE",
    );
    session.logoutZoneId = checkpoint?.zoneId ?? null;
    session.logoutZoneKind = checkpoint?.zoneKind ?? null;
  }

  const sleepingStubCreated = maybeCreateSleepStub({
    ownerKey: req.ownerKey,
    userId: req.userId ?? null,
    mapId: checkpoint?.mapId ?? save.mapId,
    posX: checkpoint?.posX ?? save.posX,
    posY: checkpoint?.posY ?? save.posY,
    leaveSleepingStub: Boolean(req.leaveSleepingStub),
    zoneKind: checkpoint?.zoneKind ?? null,
  });

  if (!checkpoint) {
    return { ok: false, error: "No checkpoint available", code: "no_checkpoint" };
  }

  const result: LogoutResult = {
    ok: true,
    mode,
    checkpoint: {
      mapId: checkpoint.mapId,
      x: checkpoint.posX,
      y: checkpoint.posY,
      zoneId: checkpoint.zoneId,
      zoneKind: checkpoint.zoneKind,
    },
    restBonusApplied,
    sleepingStubCreated,
    version: save.version,
    message,
  };

  putIdempotency({
    ownerKey: req.ownerKey,
    requestId: req.requestId,
    route: ROUTE_LOGOUT,
    response: result,
    expiresAt: t + IDEMPOTENCY_TTL_MS,
  });

  return result;
}
