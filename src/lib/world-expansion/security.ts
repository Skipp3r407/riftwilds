/**
 * Map generation security — client cannot create maps or pick seeds.
 * Rate limits + idempotent relocation enforced at API layer.
 */

import type { WorldMapRecord } from "@/lib/world-expansion/types";

const FORBIDDEN_CLIENT_FIELDS = [
  "seed",
  "generatorVersion",
  "templateVersion",
  "seedVersion",
  "validationReportId",
] as const;

export function assertServerOnlySeed(seed: string | undefined | null): {
  ok: boolean;
  error?: string;
} {
  if (seed == null || seed === "") return { ok: true };
  // Any client-supplied seed is rejected
  return { ok: false, error: "client_seed_forbidden" };
}

export function assertClientCannotCreateMaps(body: Record<string, unknown>): {
  ok: boolean;
  error?: string;
} {
  if (body.action === "create_map" || body.action === "generate" || body.seed != null) {
    return { ok: false, error: "client_map_create_forbidden" };
  }
  if (body.forceSeed || body.generatorSeed) {
    return { ok: false, error: "client_seed_forbidden" };
  }
  return { ok: true };
}

export function stripSecretsFromMap(map: WorldMapRecord): Record<string, unknown> {
  const clone = { ...map } as Record<string, unknown>;
  for (const key of FORBIDDEN_CLIENT_FIELDS) {
    delete clone[key];
  }
  return clone;
}

export function isAdminAction(action: string): boolean {
  return [
    "approve",
    "pause",
    "resume",
    "force_generate",
    "retry",
    "archive",
    "rename",
    "set_lifecycle",
    "tick",
    "admin_snapshot",
  ].includes(action);
}
