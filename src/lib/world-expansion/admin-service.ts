/**
 * Admin world-expansion controls — lifecycle, approve/pause/force/retry/archive/rename.
 * All mutations audited.
 */

import { createRequestId } from "@/lib/utils/request-id";
import { beginArchive, completeArchive } from "@/lib/world-expansion/archive";
import {
  approveAndOpenMap,
  planAndGenerate,
  queueExpansion,
  runGenerationJob,
} from "@/lib/world-expansion/generation-service";
import { assertTransition } from "@/lib/world-expansion/lifecycle";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { ExpansionLifecycle, TemplateKey, WorldMapRecord } from "@/lib/world-expansion/types";

function audit(actorId: string, action: string, mapId: string | null, detail: string): void {
  getExpansionStore().audit.push({
    id: createRequestId(),
    at: new Date().toISOString(),
    actorId,
    action,
    mapId,
    detail,
  });
}

export function adminListMaps(): WorldMapRecord[] {
  return [...getExpansionStore().maps.values()];
}

export function adminApprove(mapId: string, actorId: string) {
  const result = approveAndOpenMap({ mapId, adminActorId: actorId, skipReview: true });
  if (result.ok) audit(actorId, "approve", mapId, result.map.publicName);
  return result;
}

export function adminPause(mapId: string, actorId: string) {
  const s = getExpansionStore();
  const map = s.maps.get(mapId);
  if (!map) return { ok: false as const, error: "missing" };
  const t = assertTransition(map.lifecycle, "PAUSED");
  if (!t.ok) return { ok: false as const, error: t.error };
  map.lifecycle = "PAUSED";
  map.updatedAt = new Date().toISOString();
  s.maps.set(mapId, map);
  audit(actorId, "pause", mapId, "paused");
  return { ok: true as const, map };
}

export function adminResume(mapId: string, actorId: string) {
  const s = getExpansionStore();
  const map = s.maps.get(mapId);
  if (!map) return { ok: false as const, error: "missing" };
  const t = assertTransition(map.lifecycle, "OPEN");
  if (!t.ok) return { ok: false as const, error: t.error };
  map.lifecycle = "OPEN";
  map.updatedAt = new Date().toISOString();
  s.maps.set(mapId, map);
  audit(actorId, "resume", mapId, "open");
  return { ok: true as const, map };
}

export function adminForceGenerate(params: {
  actorId: string;
  templateKey: TemplateKey;
  sourceMapId?: string | null;
  mapKind?: "permanent" | "overflow";
  autoOpen?: boolean;
}) {
  const result = planAndGenerate({
    reason: "admin",
    sourceMapId: params.sourceMapId ?? null,
    templateKey: params.templateKey,
    mapKind: params.mapKind ?? "permanent",
    autoOpen: params.autoOpen ?? false,
    adminActorId: params.actorId,
  });
  if (result.ok) audit(params.actorId, "force_generate", result.map.mapId, params.templateKey);
  return result;
}

export function adminRetryJob(jobId: string, actorId: string) {
  const job = getExpansionStore().jobs.get(jobId);
  if (!job) return { ok: false as const, error: "missing_job" };
  if (job.status === "succeeded") return { ok: false as const, error: "already_succeeded" };
  const req = getExpansionStore().requests.get(job.expansionRequestId);
  if (req && req.lifecycle === "FAILED") {
    const q = queueExpansion(req.requestId);
    if (!q.ok) return q;
    const run = runGenerationJob(q.job.jobId);
    audit(actorId, "retry", run.ok ? run.map.mapId : null, jobId);
    return run;
  }
  const run = runGenerationJob(jobId);
  audit(actorId, "retry", run.ok ? run.map.mapId : null, jobId);
  return run;
}

export function adminRename(mapId: string, publicName: string, actorId: string) {
  const s = getExpansionStore();
  const map = s.maps.get(mapId);
  if (!map) return { ok: false as const, error: "missing" };
  const prev = map.publicName;
  map.publicName = publicName.slice(0, 64);
  map.updatedAt = new Date().toISOString();
  s.maps.set(mapId, map);
  audit(actorId, "rename", mapId, `${prev} → ${map.publicName}`);
  return { ok: true as const, map };
}

export function adminArchive(mapId: string, actorId: string, complete?: boolean) {
  if (complete) return completeArchive({ mapId, adminActorId: actorId });
  return beginArchive({ mapId, adminActorId: actorId });
}

export function adminSetLifecycle(
  mapId: string,
  lifecycle: ExpansionLifecycle,
  actorId: string,
) {
  const s = getExpansionStore();
  const map = s.maps.get(mapId);
  if (!map) return { ok: false as const, error: "missing" };
  const t = assertTransition(map.lifecycle, lifecycle);
  if (!t.ok) return { ok: false as const, error: t.error };
  map.lifecycle = lifecycle;
  map.updatedAt = new Date().toISOString();
  s.maps.set(mapId, map);
  audit(actorId, "set_lifecycle", mapId, lifecycle);
  return { ok: true as const, map };
}

export function adminAuditLog(limit = 50) {
  return getExpansionStore().audit.slice(-limit).reverse();
}

export function adminSnapshot() {
  const s = getExpansionStore();
  return {
    maps: [...s.maps.values()].map((m) => ({
      mapId: m.mapId,
      name: m.publicName,
      lifecycle: m.lifecycle,
      mapKind: m.mapKind,
      crowdLabel: m.crowdLabel,
      playersOnline: m.playersOnline,
      plotsOccupied: m.plotsOccupied,
      plotsTotal: m.plotsTotal,
      templateKey: m.templateKey,
      allowsPermanentHousing: m.allowsPermanentHousing,
    })),
    requests: [...s.requests.values()],
    jobs: [...s.jobs.values()],
    audit: adminAuditLog(30),
  };
}
