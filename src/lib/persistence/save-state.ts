/**
 * Server-authoritative autosave / restore for Category B/C.
 * Category A remains on Credits / inventory ledgers (immediate).
 */

import { randomUUID } from "crypto";
import { shouldAutosaveNow } from "@/lib/persistence/categories";
import { PERSISTENCE_SCHEMA_VERSION, IDEMPOTENCY_TTL_MS } from "@/lib/persistence/config";
import { clearDirty, markDirty } from "@/lib/persistence/dirty-flags";
import { stripUntrustedCategoryA } from "@/lib/persistence/anti-exploit";
import {
  getActiveSession,
  getCheckpoint,
  getIdempotency,
  getOrCreateSave,
  getSession,
  listSnapshots,
  mergePlayState,
  putIdempotency,
  pushSnapshot,
  upsertSave,
} from "@/lib/persistence/memory-store";
import { buildRestoreResult, validatePositionPayload } from "@/lib/persistence/position-validate";
import { findLogoutZoneAt } from "@/game/live-world/persistence/safe-logout-zones";
import type {
  AutosaveRequest,
  RestoreResult,
  SaveCategory,
  WorldSaveRecord,
} from "@/lib/persistence/types";

const ROUTE_AUTOSAVE = "persistence.autosave";

export function restoreWorldState(ownerKey: string): RestoreResult {
  const session = getActiveSession(ownerKey);
  const save = getOrCreateSave(ownerKey);
  const checkpoint = getCheckpoint(ownerKey);
  const preferSafe =
    session?.status === "LOGGED_OUT_UNSAFE" ||
    session?.status === "DISCONNECTED" ||
    session?.status === "EXPIRED";
  return buildRestoreResult({ session, save, checkpoint, preferSafeOnUnsafeLogout: preferSafe });
}

export function autosaveWorldState(req: AutosaveRequest):
  | { ok: true; save: WorldSaveRecord; snapshotId: string | null; idempotentReplay: boolean }
  | { ok: false; error: string; code: string } {
  const existing = getIdempotency(req.ownerKey, req.requestId, ROUTE_AUTOSAVE);
  if (existing) {
    return {
      ok: true,
      save: getOrCreateSave(req.ownerKey, req.userId ?? null),
      snapshotId: null,
      idempotentReplay: true,
    };
  }

  const pos = validatePositionPayload(req.position);
  if (!pos.ok) {
    return { ok: false, error: "Invalid position", code: pos.error };
  }

  const save = getOrCreateSave(req.ownerKey, req.userId ?? null);
  const t = Date.now();
  const categories = req.categories.length
    ? req.categories
    : (["B_PROGRESSION"] as SaveCategory[]);

  // Category A on this path only marks dirty — never mutates balances.
  for (const cat of categories) {
    const lastAt =
      cat === "A_CRITICAL"
        ? save.lastCategoryAAt
        : cat === "B_PROGRESSION"
          ? save.lastCategoryBAt
          : save.lastCategoryCAt;
    const dirty =
      cat === "A_CRITICAL"
        ? save.dirty.categoryA || Boolean(req.force)
        : cat === "B_PROGRESSION"
          ? save.dirty.categoryB || Boolean(req.playState) || Boolean(req.force)
          : save.dirty.categoryC || Boolean(req.force);

    if (
      !shouldAutosaveNow({
        category: cat,
        lastSavedAt: lastAt,
        now: t,
        dirty: dirty || Boolean(req.force),
        force: req.force,
      }) &&
      !req.force
    ) {
      continue;
    }

    if (cat === "A_CRITICAL") {
      save.dirty = markDirty(save.dirty, "A_CRITICAL");
      save.lastCategoryAAt = t;
      // Actual credit writes happen via /api/credits — not here.
      continue;
    }

    save.mapId = pos.position.mapId;
    save.posX = pos.position.x;
    save.posY = pos.position.y;

    const zone = findLogoutZoneAt(pos.position.mapId, pos.position.x, pos.position.y);
    if (zone) {
      save.lastSafeMapId = zone.mapId;
      save.lastSafePosX = pos.position.x;
      save.lastSafePosY = pos.position.y;
      save.lastSafeZoneId = zone.zoneId;
      save.lastSafeZoneKind = zone.zoneKind;
    }

    if (req.playState) {
      const stripped = stripUntrustedCategoryA(
        req.playState as Record<string, unknown>,
      ) as typeof req.playState;
      save.playState = mergePlayState(save.playState, stripped);
      save.dirty = markDirty(save.dirty, "B_PROGRESSION");
    }

    if (cat === "B_PROGRESSION") save.lastCategoryBAt = t;
    if (cat === "C_COSMETIC") save.lastCategoryCAt = t;
  }

  save.dirty = clearDirty(save.dirty, categories.filter((c) => c !== "A_CRITICAL"));
  save.version += 1;
  save.lastRequestId = req.requestId;
  save.schemaVersion = PERSISTENCE_SCHEMA_VERSION;
  save.updatedAt = t;
  if (req.userId) save.userId = req.userId;
  upsertSave(save);

  if (req.sessionId) {
    const session = getSession(req.sessionId);
    if (session && session.ownerKey === req.ownerKey) {
      session.lastAutosaveAt = t;
      session.mapId = save.mapId;
      session.posX = save.posX;
      session.posY = save.posY;
      session.updatedAt = t;
    }
  }

  let snapshotId: string | null = null;
  if (req.force || categories.includes("B_PROGRESSION")) {
    snapshotId = randomUUID();
    pushSnapshot({
      id: snapshotId,
      ownerKey: req.ownerKey,
      userId: req.userId ?? null,
      version: save.version,
      reason: req.force ? "force_autosave" : "autosave",
      category: "B_PROGRESSION",
      mapId: save.mapId,
      posX: save.posX,
      posY: save.posY,
      payload: {
        playState: save.playState,
        lastSafe: {
          mapId: save.lastSafeMapId,
          x: save.lastSafePosX,
          y: save.lastSafePosY,
          zoneId: save.lastSafeZoneId,
          zoneKind: save.lastSafeZoneKind,
        },
      },
      requestId: req.requestId,
      createdAt: t,
    });
  }

  putIdempotency({
    ownerKey: req.ownerKey,
    requestId: req.requestId,
    route: ROUTE_AUTOSAVE,
    response: { version: save.version, snapshotId },
    expiresAt: t + IDEMPOTENCY_TTL_MS,
  });

  return { ok: true, save, snapshotId, idempotentReplay: false };
}

export function markProgressionDirty(ownerKey: string, category: SaveCategory = "B_PROGRESSION"): void {
  const save = getOrCreateSave(ownerKey);
  save.dirty = markDirty(save.dirty, category);
  save.updatedAt = Date.now();
  upsertSave(save);
}

export function getSaveSnapshots(ownerKey: string) {
  return listSnapshots(ownerKey);
}

export function getWorldSave(ownerKey: string): WorldSaveRecord {
  return getOrCreateSave(ownerKey);
}
