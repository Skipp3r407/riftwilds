/**
 * Server-side generation service — jobs, retries, cleanup.
 * Never modifies occupied maps destructively; never client-driven seeds.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { createRequestId } from "@/lib/utils/request-id";
import { GENERATION_MAX_ATTEMPTS } from "@/lib/world-expansion/config";
import { runGenerationPipeline } from "@/lib/world-expansion/generation-pipeline";
import { assertTransition, canTransition } from "@/lib/world-expansion/lifecycle";
import { getExpansionStore } from "@/lib/world-expansion/store";
import { getTemplate } from "@/lib/world-expansion/templates";
import { validateGeneratedMap } from "@/lib/world-expansion/validation";
import type {
  ExpansionRequest,
  GenerationJob,
  MapKind,
  TemplateKey,
  WorldMapRecord,
} from "@/lib/world-expansion/types";

function serverSeed(templateKey: TemplateKey, sourceMapId: string | null): string {
  // Client cannot pick seeds — server entropy only.
  return `srv_${templateKey}_${sourceMapId ?? "root"}_${createRequestId().slice(0, 12)}`;
}

export function planExpansion(params: {
  reason: ExpansionRequest["reason"];
  sourceMapId: string | null;
  templateKey: TemplateKey;
  mapKind: MapKind;
  priority?: number;
  note?: string;
  adminActorId?: string | null;
}): ExpansionRequest {
  const s = getExpansionStore();
  const requestId = `exp_${createRequestId()}`;
  const now = new Date().toISOString();
  const req: ExpansionRequest = {
    requestId,
    reason: params.reason,
    sourceMapId: params.sourceMapId,
    templateKey: params.templateKey,
    mapKind: params.mapKind,
    lifecycle: "PLANNED",
    priority: params.priority ?? 50,
    createdAt: now,
    updatedAt: now,
    jobId: null,
    resultingMapId: null,
    note: params.note ?? null,
    adminActorId: params.adminActorId ?? null,
  };
  s.requests.set(requestId, req);
  trackAnalytics("world_expansion_planned", { requestId, reason: params.reason });
  return req;
}

export function queueExpansion(requestId: string):
  | { ok: true; request: ExpansionRequest; job: GenerationJob }
  | { ok: false; error: string } {
  if (!isFeatureEnabled("WORLD_EXPANSION_ENABLED")) {
    return { ok: false, error: "disabled" };
  }
  const s = getExpansionStore();
  const req = s.requests.get(requestId);
  if (!req) return { ok: false, error: "missing_request" };
  const t = assertTransition(req.lifecycle, "QUEUED");
  if (!t.ok) return t;

  const jobId = `job_${createRequestId()}`;
  const seed = serverSeed(req.templateKey, req.sourceMapId);
  const job: GenerationJob = {
    jobId,
    expansionRequestId: requestId,
    status: "queued",
    attempts: 0,
    maxAttempts: GENERATION_MAX_ATTEMPTS,
    seed,
    templateKey: req.templateKey,
    mapId: null,
    lastError: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  req.lifecycle = "QUEUED";
  req.jobId = jobId;
  req.updatedAt = new Date().toISOString();
  s.jobs.set(jobId, job);
  s.requests.set(requestId, req);
  return { ok: true, request: req, job };
}

/**
 * Run one generation attempt. Occupied OPEN maps are never mutated destructively.
 */
export function runGenerationJob(jobId: string):
  | { ok: true; map: WorldMapRecord; job: GenerationJob; request: ExpansionRequest }
  | { ok: false; error: string; job?: GenerationJob } {
  const s = getExpansionStore();
  const job = s.jobs.get(jobId);
  if (!job) return { ok: false, error: "missing_job" };
  const req = s.requests.get(job.expansionRequestId);
  if (!req) return { ok: false, error: "missing_request" };

  if (job.status === "succeeded") {
    const map = job.mapId ? s.maps.get(job.mapId) : null;
    if (map) return { ok: true, map, job, request: req };
  }

  job.status = job.attempts > 0 ? "retrying" : "running";
  job.attempts += 1;
  job.updatedAt = new Date().toISOString();
  if (canTransition(req.lifecycle, "GENERATING")) {
    req.lifecycle = "GENERATING";
  }
  req.updatedAt = job.updatedAt;

  const mapId = `map_${createRequestId().slice(0, 10)}`;
  const template = getTemplate(req.templateKey);
  const regionSlug =
    req.sourceMapId && s.maps.get(req.sourceMapId)
      ? s.maps.get(req.sourceMapId)!.regionSlug
      : template.biome === "meadow"
        ? "riftwild-commons"
        : `region_${template.biome}`;

  try {
    const result = runGenerationPipeline({
      mapId,
      seed: job.seed,
      templateKey: req.templateKey,
      mapKind: req.mapKind,
      regionSlug,
      parentMapId: req.sourceMapId,
      overflowEventKey: req.mapKind === "overflow" ? `evt_${req.reason}` : null,
      expiresAt:
        req.mapKind === "overflow"
          ? new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
          : null,
    });

    const map = result.map as WorldMapRecord;
    // Refuse to overwrite any occupied map
    const existing = s.maps.get(mapId);
    if (existing && existing.lifecycle === "OPEN" && existing.playersOnline > 0) {
      throw new Error("refuse_destructive_overwrite");
    }

    if (canTransition(req.lifecycle, "VALIDATING") || req.lifecycle === "GENERATING") {
      req.lifecycle = "VALIDATING";
    }
    const report = validateGeneratedMap(map);
    map.validationReportId = report.reportId;
    map.lifecycle = report.passed ? "PENDING_REVIEW" : "FAILED";
    map.updatedAt = new Date().toISOString();

    if (!report.passed) {
      job.status = job.attempts >= job.maxAttempts ? "failed" : "retrying";
      job.lastError = report.checks
        .filter((c) => !c.ok)
        .map((c) => c.key)
        .join(",");
      job.updatedAt = map.updatedAt;
      req.lifecycle = job.status === "failed" ? "FAILED" : "QUEUED";
      req.updatedAt = map.updatedAt;
      s.jobs.set(jobId, job);
      s.requests.set(req.requestId, req);
      // Cleanup failed draft — never leave half-open player maps
      if (job.status === "failed") {
        cleanupFailedDraft(mapId);
        job.status = "cleaned_up";
      }
      return { ok: false, error: "validation_failed", job };
    }

    s.maps.set(mapId, map);
    job.mapId = mapId;
    job.status = "succeeded";
    job.lastError = null;
    job.updatedAt = map.updatedAt;
    req.lifecycle = "PENDING_REVIEW";
    req.resultingMapId = mapId;
    req.updatedAt = map.updatedAt;
    s.jobs.set(jobId, job);
    s.requests.set(req.requestId, req);
    trackAnalytics("world_expansion_generated", { mapId, jobId });
    return { ok: true, map, job, request: req };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "generation_error";
    job.lastError = msg;
    job.status = job.attempts >= job.maxAttempts ? "failed" : "retrying";
    job.updatedAt = new Date().toISOString();
    req.lifecycle = job.status === "failed" ? "FAILED" : "QUEUED";
    req.updatedAt = job.updatedAt;
    s.jobs.set(jobId, job);
    s.requests.set(req.requestId, req);
    return { ok: false, error: msg, job };
  }
}

export function cleanupFailedDraft(mapId: string): void {
  const s = getExpansionStore();
  const map = s.maps.get(mapId);
  if (!map) return;
  if (map.lifecycle === "OPEN" || map.playersOnline > 0 || map.plotsOccupied > 0) {
    return; // never destroy occupied
  }
  s.maps.delete(mapId);
}

export function approveAndOpenMap(params: {
  mapId: string;
  adminActorId: string;
  skipReview?: boolean;
}):
  | { ok: true; map: WorldMapRecord }
  | { ok: false; error: string } {
  const s = getExpansionStore();
  const map = s.maps.get(params.mapId);
  if (!map) return { ok: false, error: "missing_map" };

  const steps: Array<"APPROVED" | "SEEDING" | "OPEN"> = ["APPROVED", "SEEDING", "OPEN"];
  for (const step of steps) {
    if (map.lifecycle === step) continue;
    if (map.lifecycle === "PENDING_REVIEW" && step === "APPROVED") {
      map.lifecycle = "APPROVED";
    } else if (map.lifecycle === "APPROVED" && step === "SEEDING") {
      map.lifecycle = "SEEDING";
      seedNpcsAndEvents(map);
    } else if (map.lifecycle === "SEEDING" && step === "OPEN") {
      map.lifecycle = "OPEN";
      map.openedAt = new Date().toISOString();
    } else if (params.skipReview && map.lifecycle === "PENDING_REVIEW") {
      map.lifecycle = "APPROVED";
      seedNpcsAndEvents(map);
      map.lifecycle = "OPEN";
      map.openedAt = new Date().toISOString();
      break;
    } else {
      const t = assertTransition(map.lifecycle, step);
      if (!t.ok && map.lifecycle !== step) {
        // allow sequential path
      }
    }
  }

  // Normalize path
  if (map.lifecycle === "PENDING_REVIEW" || map.lifecycle === "APPROVED") {
    if (map.lifecycle === "PENDING_REVIEW") map.lifecycle = "APPROVED";
    map.lifecycle = "SEEDING";
    seedNpcsAndEvents(map);
    map.lifecycle = "OPEN";
    map.openedAt = new Date().toISOString();
  } else if (map.lifecycle === "SEEDING") {
    map.lifecycle = "OPEN";
    map.openedAt = new Date().toISOString();
  }

  if (map.lifecycle !== "OPEN") {
    return { ok: false, error: `cannot_open_from_${map.lifecycle}` };
  }

  map.updatedAt = new Date().toISOString();
  s.maps.set(map.mapId, map);
  s.audit.push({
    id: createRequestId(),
    at: map.updatedAt,
    actorId: params.adminActorId,
    action: "approve_open",
    mapId: map.mapId,
    detail: map.publicName,
  });
  const req = [...s.requests.values()].find((r) => r.resultingMapId === map.mapId);
  if (req) {
    req.lifecycle = "OPEN";
    req.updatedAt = map.updatedAt;
    s.requests.set(req.requestId, req);
  }
  trackAnalytics("world_expansion_opened", { mapId: map.mapId });
  return { ok: true, map };
}

/** Seed NPCs/events — never fake player accounts. */
function seedNpcsAndEvents(map: WorldMapRecord): void {
  map.entityCount = Math.max(map.entityCount, map.hubs.length * 6 + 12);
  map.visitors = 0;
  map.playersOnline = 0;
}

export function planAndGenerate(params: {
  reason: ExpansionRequest["reason"];
  sourceMapId: string | null;
  templateKey: TemplateKey;
  mapKind: MapKind;
  autoOpen?: boolean;
  adminActorId?: string;
}):
  | { ok: true; map: WorldMapRecord; request: ExpansionRequest }
  | { ok: false; error: string } {
  const planned = planExpansion(params);
  const queued = queueExpansion(planned.requestId);
  if (!queued.ok) return queued;
  const gen = runGenerationJob(queued.job.jobId);
  if (!gen.ok) return { ok: false, error: gen.error };
  if (params.autoOpen) {
    const opened = approveAndOpenMap({
      mapId: gen.map.mapId,
      adminActorId: params.adminActorId ?? "system",
      skipReview: true,
    });
    if (!opened.ok) return opened;
    return { ok: true, map: opened.map, request: gen.request };
  }
  return { ok: true, map: gen.map, request: gen.request };
}
