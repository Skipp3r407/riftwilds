/**
 * Reusable API middleware patterns — rate limit + audit for expansion routes.
 */

import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  memoryRateLimiter,
  type RateLimitResult,
} from "@/lib/security/rate-limit";
import { recordAudit } from "@/lib/security/audit-log";
import { createRequestId } from "@/lib/utils/request-id";

export type GuardOptions = {
  /** Rate limit bucket prefix, e.g. "world-clock". */
  bucket: string;
  limit?: number;
  windowMs?: number;
  /** Optional client key (IP / user id). */
  clientKey?: string;
  auditAction?: string;
  actorId?: string | null;
};

export async function withApiGuard(
  opts: GuardOptions,
): Promise<{ ok: true; requestId: string; rate: RateLimitResult } | { ok: false; response: NextResponse }> {
  const requestId = createRequestId();
  const limit = opts.limit ?? 60;
  const windowMs = opts.windowMs ?? 60_000;
  const key = `${opts.bucket}:${opts.clientKey ?? "anon"}`;
  const rate = await enforceRateLimit(memoryRateLimiter, key, limit, windowMs);

  if (!rate.success) {
    recordAudit({
      actorId: opts.actorId ?? null,
      action: "rate_limit_exceeded",
      entityType: "api",
      entityId: opts.bucket,
      requestId,
      metadata: { resetAt: rate.resetAt },
    });
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "rate_limited", requestId, resetAt: rate.resetAt },
        {
          status: 429,
          headers: {
            "X-Request-Id": requestId,
            "Retry-After": String(Math.ceil((rate.resetAt - Date.now()) / 1000)),
          },
        },
      ),
    };
  }

  if (opts.auditAction) {
    recordAudit({
      actorId: opts.actorId ?? null,
      action: opts.auditAction,
      entityType: "api",
      entityId: opts.bucket,
      requestId,
    });
  }

  return { ok: true, requestId, rate };
}

export function jsonOk<T extends Record<string, unknown>>(
  body: T,
  requestId: string,
  init?: { status?: number },
) {
  return NextResponse.json(
    { ok: true, requestId, ...body },
    {
      status: init?.status ?? 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
      },
    },
  );
}
