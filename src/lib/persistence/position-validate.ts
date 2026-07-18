/**
 * Position validation + spawn fallback chain.
 * Order: active session → save state → safe checkpoint → default spawn.
 */

import { DEFAULT_SPAWN, MAX_POSITION_DELTA_PER_HEARTBEAT } from "@/lib/persistence/config";
import type {
  RestoreResult,
  WorldPositionPayload,
  WorldSaveRecord,
  WorldSessionRecord,
} from "@/lib/persistence/types";
import type { SafeCheckpointRecord } from "@/lib/persistence/memory-store";
import { isSafeLogoutPosition } from "@/game/live-world/persistence/safe-logout-zones";

const KNOWN_MAPS = new Set([
  "riftwild-commons",
  "ember-crater",
  "tidefall-coast",
  "whispering-grove",
  "stormpeak-ridges",
  "stonevein-canyon",
  "frostveil-reach",
  "golden-savannah",
  "hollow-mire",
  "scrapyard-expanse",
  "lantern-marsh",
  "celestial-rift",
]);

export function isKnownMapId(mapId: string): boolean {
  return KNOWN_MAPS.has(mapId) || /^[a-z0-9-]{3,64}$/.test(mapId);
}

export function validatePositionPayload(
  pos: WorldPositionPayload,
): { ok: true; position: WorldPositionPayload } | { ok: false; error: string } {
  if (!pos || typeof pos.mapId !== "string" || !isKnownMapId(pos.mapId)) {
    return { ok: false, error: "invalid_map" };
  }
  if (
    typeof pos.x !== "number" ||
    typeof pos.y !== "number" ||
    !Number.isFinite(pos.x) ||
    !Number.isFinite(pos.y)
  ) {
    return { ok: false, error: "invalid_coords" };
  }
  if (pos.x < -512 || pos.y < -512 || pos.x > 8192 || pos.y > 8192) {
    return { ok: false, error: "coords_out_of_bounds" };
  }
  return {
    ok: true,
    position: {
      mapId: pos.mapId,
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      facingRad: typeof pos.facingRad === "number" ? pos.facingRad : 0,
    },
  };
}

/** Anti-teleport: reject absurd jumps between heartbeats (same map). */
export function validatePositionDelta(params: {
  previous: WorldPositionPayload;
  next: WorldPositionPayload;
  maxDelta?: number;
}): { ok: true } | { ok: false; error: string; distance: number } {
  if (params.previous.mapId !== params.next.mapId) {
    // Region travel is allowed via travel APIs — not heartbeat teleport.
    return { ok: false, error: "map_change_via_heartbeat", distance: Infinity };
  }
  const dx = params.next.x - params.previous.x;
  const dy = params.next.y - params.previous.y;
  const distance = Math.hypot(dx, dy);
  const max = params.maxDelta ?? MAX_POSITION_DELTA_PER_HEARTBEAT;
  if (distance > max) {
    return { ok: false, error: "teleport_rejected", distance };
  }
  return { ok: true };
}

export function buildRestoreResult(params: {
  session: WorldSessionRecord | null;
  save: WorldSaveRecord | null;
  checkpoint: SafeCheckpointRecord | null;
  preferSafeOnUnsafeLogout?: boolean;
}): RestoreResult {
  const { session, save, checkpoint } = params;

  if (session && (session.status === "ACTIVE" || session.status === "RECONNECTING")) {
    return {
      ok: true,
      source: "active_session",
      position: { mapId: session.mapId, x: session.posX, y: session.posY, facingRad: session.facingRad },
      safeCheckpoint: checkpoint
        ? {
            mapId: checkpoint.mapId,
            x: checkpoint.posX,
            y: checkpoint.posY,
            zoneId: checkpoint.zoneId,
            zoneKind: checkpoint.zoneKind,
          }
        : null,
      playState: save?.playState ?? null,
      version: save?.version ?? session.version,
      inCombat: session.inCombat,
      reconnectDeadline: session.reconnectDeadline,
      warning: session.inCombat
        ? "You disconnected in combat. You are not invulnerable — rejoin carefully."
        : null,
    };
  }

  if (session?.status === "LOGGED_OUT_UNSAFE" || params.preferSafeOnUnsafeLogout) {
    if (checkpoint) {
      return {
        ok: true,
        source: "safe_checkpoint",
        position: { mapId: checkpoint.mapId, x: checkpoint.posX, y: checkpoint.posY },
        safeCheckpoint: {
          mapId: checkpoint.mapId,
          x: checkpoint.posX,
          y: checkpoint.posY,
          zoneId: checkpoint.zoneId,
          zoneKind: checkpoint.zoneKind,
        },
        playState: save?.playState ?? null,
        version: save?.version ?? 0,
        inCombat: false,
        reconnectDeadline: null,
        warning:
          "Restored to your last safe checkpoint after an unsafe logout or crash.",
      };
    }
  }

  if (save) {
    const pos = { mapId: save.mapId, x: save.posX, y: save.posY };
    const safe = isSafeLogoutPosition(pos.mapId, pos.x, pos.y);
    if (!safe && checkpoint) {
      return {
        ok: true,
        source: "safe_checkpoint",
        position: { mapId: checkpoint.mapId, x: checkpoint.posX, y: checkpoint.posY },
        safeCheckpoint: {
          mapId: checkpoint.mapId,
          x: checkpoint.posX,
          y: checkpoint.posY,
          zoneId: checkpoint.zoneId,
          zoneKind: checkpoint.zoneKind,
        },
        playState: save.playState,
        version: save.version,
        inCombat: false,
        reconnectDeadline: null,
        warning: "Last position was unsafe; restored to safe checkpoint.",
      };
    }
    return {
      ok: true,
      source: "save_state",
      position: pos,
      safeCheckpoint: checkpoint
        ? {
            mapId: checkpoint.mapId,
            x: checkpoint.posX,
            y: checkpoint.posY,
            zoneId: checkpoint.zoneId,
            zoneKind: checkpoint.zoneKind,
          }
        : save.lastSafeMapId != null &&
            save.lastSafePosX != null &&
            save.lastSafePosY != null &&
            save.lastSafeZoneId != null &&
            save.lastSafeZoneKind != null
          ? {
              mapId: save.lastSafeMapId,
              x: save.lastSafePosX,
              y: save.lastSafePosY,
              zoneId: save.lastSafeZoneId,
              zoneKind: save.lastSafeZoneKind,
            }
          : null,
      playState: save.playState,
      version: save.version,
      inCombat: false,
      reconnectDeadline: null,
      warning: null,
    };
  }

  if (checkpoint) {
    return {
      ok: true,
      source: "safe_checkpoint",
      position: { mapId: checkpoint.mapId, x: checkpoint.posX, y: checkpoint.posY },
      safeCheckpoint: {
        mapId: checkpoint.mapId,
        x: checkpoint.posX,
        y: checkpoint.posY,
        zoneId: checkpoint.zoneId,
        zoneKind: checkpoint.zoneKind,
      },
      playState: null,
      version: 0,
      inCombat: false,
      reconnectDeadline: null,
      warning: null,
    };
  }

  return {
    ok: true,
    source: "default_spawn",
    position: { mapId: DEFAULT_SPAWN.mapId, x: DEFAULT_SPAWN.x, y: DEFAULT_SPAWN.y },
    safeCheckpoint: null,
    playState: null,
    version: 0,
    inCombat: false,
    reconnectDeadline: null,
    warning: null,
  };
}
