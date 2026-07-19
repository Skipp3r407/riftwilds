import type { RevenueSourceKey } from "../types";
import { ingestRevenue, type IngestInput } from "../service";

export type RevenueAdapter = {
  key: RevenueSourceKey;
  label: string;
  description: string;
  /** Map external event → ingest payload (without idempotencyKey if provided separately) */
  normalize: (event: Record<string, unknown>) => Omit<IngestInput, "idempotencyKey"> & {
    idempotencyKey?: string;
  };
};

export async function runAdapter(
  adapter: RevenueAdapter,
  event: Record<string, unknown>,
  opts?: { actorId?: string | null; requestId?: string | null },
) {
  const normalized = adapter.normalize(event);
  const idempotencyKey =
    normalized.idempotencyKey ??
    `${adapter.key}:${String(event.id ?? event.txSignature ?? Date.now())}`;
  return ingestRevenue({
    ...normalized,
    sourceKey: adapter.key,
    idempotencyKey,
    actorId: opts?.actorId,
    requestId: opts?.requestId,
    triggerDistribute: true,
  });
}
