/**
 * Phase-1 in-process store for world sessions / saves.
 * Mirrors Credits ledger pattern: hot path in memory; Prisma optional.
 */

import { emptyDirtyFlags } from "@/lib/persistence/dirty-flags";
import { DEFAULT_SPAWN, MAX_SNAPSHOTS_PER_OWNER } from "@/lib/persistence/config";
import type {
  DirtyFlags,
  LogoutZoneKind,
  PlayStateBlob,
  WorldSaveRecord,
  WorldSessionRecord,
} from "@/lib/persistence/types";

export type SafeCheckpointRecord = {
  ownerKey: string;
  userId: string | null;
  mapId: string;
  posX: number;
  posY: number;
  zoneId: string;
  zoneKind: LogoutZoneKind;
  restBonusApplied: boolean;
  loggedOutAt: number;
  requestId: string | null;
};

export type SnapshotRecord = {
  id: string;
  ownerKey: string;
  userId: string | null;
  version: number;
  reason: string;
  category: string;
  mapId: string;
  posX: number;
  posY: number;
  payload: unknown;
  requestId: string | null;
  createdAt: number;
};

export type SleepStubRecord = {
  ownerKey: string;
  userId: string | null;
  mapId: string;
  posX: number;
  posY: number;
  displayName: string | null;
  visibleToVisitors: boolean;
  expiresAt: number;
  active: boolean;
};

export type IdempotencyRecord = {
  ownerKey: string;
  requestId: string;
  route: string;
  response: unknown;
  expiresAt: number;
};

type StoreShape = {
  sessions: Map<string, WorldSessionRecord>;
  activeByOwner: Map<string, string>;
  saves: Map<string, WorldSaveRecord>;
  checkpoints: Map<string, SafeCheckpointRecord>;
  snapshots: Map<string, SnapshotRecord[]>;
  sleepStubs: Map<string, SleepStubRecord>;
  idempotency: Map<string, IdempotencyRecord>;
};

const g = globalThis as typeof globalThis & {
  __riftwildsPersistenceStore?: StoreShape;
};

function store(): StoreShape {
  if (!g.__riftwildsPersistenceStore) {
    g.__riftwildsPersistenceStore = {
      sessions: new Map(),
      activeByOwner: new Map(),
      saves: new Map(),
      checkpoints: new Map(),
      snapshots: new Map(),
      sleepStubs: new Map(),
      idempotency: new Map(),
    };
  }
  return g.__riftwildsPersistenceStore;
}

export function resetPersistenceStoreForTests(): void {
  g.__riftwildsPersistenceStore = {
    sessions: new Map(),
    activeByOwner: new Map(),
    saves: new Map(),
    checkpoints: new Map(),
    snapshots: new Map(),
    sleepStubs: new Map(),
    idempotency: new Map(),
  };
}

export function createEmptySave(ownerKey: string, userId: string | null = null): WorldSaveRecord {
  const now = Date.now();
  return {
    ownerKey,
    userId,
    version: 0,
    mapId: DEFAULT_SPAWN.mapId,
    posX: DEFAULT_SPAWN.x,
    posY: DEFAULT_SPAWN.y,
    lastSafeMapId: DEFAULT_SPAWN.mapId,
    lastSafePosX: DEFAULT_SPAWN.x,
    lastSafePosY: DEFAULT_SPAWN.y,
    lastSafeZoneId: "central-plaza",
    lastSafeZoneKind: "SETTLEMENT",
    playState: null,
    dirty: emptyDirtyFlags(),
    lastCategoryAAt: null,
    lastCategoryBAt: null,
    lastCategoryCAt: null,
    lastRequestId: null,
    schemaVersion: 1,
    updatedAt: now,
  };
}

export function getSave(ownerKey: string): WorldSaveRecord | null {
  return store().saves.get(ownerKey) ?? null;
}

export function upsertSave(record: WorldSaveRecord): WorldSaveRecord {
  store().saves.set(record.ownerKey, record);
  return record;
}

export function getOrCreateSave(ownerKey: string, userId: string | null = null): WorldSaveRecord {
  const existing = getSave(ownerKey);
  if (existing) {
    if (userId && !existing.userId) {
      existing.userId = userId;
      upsertSave(existing);
    }
    return existing;
  }
  const created = createEmptySave(ownerKey, userId);
  return upsertSave(created);
}

export function getSession(sessionId: string): WorldSessionRecord | null {
  return store().sessions.get(sessionId) ?? null;
}

export function getActiveSessionId(ownerKey: string): string | null {
  return store().activeByOwner.get(ownerKey) ?? null;
}

export function getActiveSession(ownerKey: string): WorldSessionRecord | null {
  const id = getActiveSessionId(ownerKey);
  if (!id) return null;
  return getSession(id);
}

export function putSession(session: WorldSessionRecord): WorldSessionRecord {
  store().sessions.set(session.id, session);
  if (
    session.status === "ACTIVE" ||
    session.status === "RECONNECTING"
  ) {
    store().activeByOwner.set(session.ownerKey, session.id);
  }
  return session;
}

export function clearActiveSession(ownerKey: string, sessionId?: string): void {
  const cur = store().activeByOwner.get(ownerKey);
  if (!sessionId || cur === sessionId) {
    store().activeByOwner.delete(ownerKey);
  }
}

export function getCheckpoint(ownerKey: string): SafeCheckpointRecord | null {
  return store().checkpoints.get(ownerKey) ?? null;
}

export function putCheckpoint(cp: SafeCheckpointRecord): SafeCheckpointRecord {
  store().checkpoints.set(cp.ownerKey, cp);
  return cp;
}

export function listSnapshots(ownerKey: string): SnapshotRecord[] {
  return store().snapshots.get(ownerKey) ?? [];
}

export function pushSnapshot(snap: SnapshotRecord): void {
  const list = store().snapshots.get(snap.ownerKey) ?? [];
  list.unshift(snap);
  while (list.length > MAX_SNAPSHOTS_PER_OWNER) list.pop();
  store().snapshots.set(snap.ownerKey, list);
}

export function getSleepStub(ownerKey: string): SleepStubRecord | null {
  return store().sleepStubs.get(ownerKey) ?? null;
}

export function putSleepStub(stub: SleepStubRecord): void {
  store().sleepStubs.set(stub.ownerKey, stub);
}

export function deactivateSleepStub(ownerKey: string): void {
  const stub = store().sleepStubs.get(ownerKey);
  if (stub) {
    stub.active = false;
    store().sleepStubs.set(ownerKey, stub);
  }
}

function idemKey(ownerKey: string, requestId: string, route: string): string {
  return `${ownerKey}::${route}::${requestId}`;
}

export function getIdempotency(
  ownerKey: string,
  requestId: string,
  route: string,
): IdempotencyRecord | null {
  const row = store().idempotency.get(idemKey(ownerKey, requestId, route));
  if (!row) return null;
  if (row.expiresAt < Date.now()) {
    store().idempotency.delete(idemKey(ownerKey, requestId, route));
    return null;
  }
  return row;
}

export function putIdempotency(row: IdempotencyRecord): void {
  store().idempotency.set(idemKey(row.ownerKey, row.requestId, row.route), row);
}

export function mergePlayState(
  base: PlayStateBlob | null,
  patch: PlayStateBlob | null | undefined,
): PlayStateBlob | null {
  if (!patch) return base;
  if (!base) return { ...patch };
  return { ...base, ...patch, updatedAt: Date.now() };
}

export function cloneDirty(flags: DirtyFlags): DirtyFlags {
  return { ...flags };
}
