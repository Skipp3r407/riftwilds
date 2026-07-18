/**
 * Archive / consolidation — notify, free relocate, never delete owned property without migration.
 */

import { createRequestId } from "@/lib/utils/request-id";
import { assertTransition } from "@/lib/world-expansion/lifecycle";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { WorldMapRecord } from "@/lib/world-expansion/types";

export type ArchiveNotice = {
  noticeId: string;
  mapId: string;
  message: string;
  freeRelocateUntil: string;
  createdAt: string;
};

type ArchiveStore = { notices: ArchiveNotice[] };

function notices(): ArchiveStore {
  const g = globalThis as unknown as { __rwWorldExpansionArchive?: ArchiveStore };
  if (!g.__rwWorldExpansionArchive) g.__rwWorldExpansionArchive = { notices: [] };
  return g.__rwWorldExpansionArchive;
}

export function beginArchive(params: {
  mapId: string;
  adminActorId: string;
  freeRelocateDays?: number;
}):
  | { ok: true; map: WorldMapRecord; notice: ArchiveNotice }
  | { ok: false; error: string; message: string } {
  const s = getExpansionStore();
  const map = s.maps.get(params.mapId);
  if (!map) return { ok: false, error: "missing", message: "Map not found." };
  if (map.plotsOccupied > 0 && map.allowsPermanentHousing) {
    // Must notify + offer free relocate — never hard-delete
  }
  const t = assertTransition(map.lifecycle, "ARCHIVING");
  if (!t.ok && map.lifecycle !== "OPEN" && map.lifecycle !== "PAUSED") {
    return { ok: false, error: t.error, message: "Cannot archive from this state." };
  }
  map.lifecycle = "ARCHIVING";
  map.updatedAt = new Date().toISOString();
  s.maps.set(map.mapId, map);

  const days = params.freeRelocateDays ?? 14;
  const notice: ArchiveNotice = {
    noticeId: createRequestId(),
    mapId: map.mapId,
    message: `${map.publicName} is consolidating. Free relocation is available. Owned property is never deleted without migration.`,
    freeRelocateUntil: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  notices().notices.push(notice);
  s.audit.push({
    id: createRequestId(),
    at: notice.createdAt,
    actorId: params.adminActorId,
    action: "begin_archive",
    mapId: map.mapId,
    detail: notice.message,
  });
  return { ok: true, map, notice };
}

export function completeArchive(params: {
  mapId: string;
  adminActorId: string;
  force?: boolean;
}):
  | { ok: true; map: WorldMapRecord }
  | { ok: false; error: string; message: string } {
  const s = getExpansionStore();
  const map = s.maps.get(params.mapId);
  if (!map) return { ok: false, error: "missing", message: "Map not found." };
  if (map.plotsOccupied > 0 && !params.force) {
    return {
      ok: false,
      error: "owned_property",
      message: "Migrate owned plots before archive completes.",
    };
  }
  map.lifecycle = "ARCHIVED";
  map.archivedAt = new Date().toISOString();
  map.updatedAt = map.archivedAt;
  // Never delete owned property records — strip only if force after migration
  s.maps.set(map.mapId, map);
  s.audit.push({
    id: createRequestId(),
    at: map.updatedAt,
    actorId: params.adminActorId,
    action: "complete_archive",
    mapId: map.mapId,
    detail: params.force ? "force" : "clean",
  });
  return { ok: true, map };
}

export function listArchiveNotices(mapId?: string): ArchiveNotice[] {
  const all = notices().notices;
  return mapId ? all.filter((n) => n.mapId === mapId) : all;
}
