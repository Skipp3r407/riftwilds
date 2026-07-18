/**
 * Shutdown flush stubs — call before process exit / deploy drain.
 * Phase 1: flush in-memory dirty saves to Prisma when enabled.
 */

import { getOrCreateSave, upsertSave } from "@/lib/persistence/memory-store";
import { emptyDirtyFlags } from "@/lib/persistence/dirty-flags";
import { isPersistencePrismaEnabled, persistSaveToPrisma } from "@/lib/persistence/prisma-adapter";

const flushHandlers = new Set<() => Promise<void>>();

export function registerShutdownFlush(handler: () => Promise<void>): () => void {
  flushHandlers.add(handler);
  return () => flushHandlers.delete(handler);
}

/** Flush a single owner's dirty state (best-effort). */
export async function flushOwnerSave(ownerKey: string): Promise<{ flushed: boolean }> {
  const save = getOrCreateSave(ownerKey);
  if (
    !save.dirty.categoryA &&
    !save.dirty.categoryB &&
    !save.dirty.categoryC &&
    !save.dirty.position
  ) {
    return { flushed: false };
  }

  if (isPersistencePrismaEnabled()) {
    await persistSaveToPrisma(save);
  }

  save.dirty = emptyDirtyFlags();
  save.updatedAt = Date.now();
  upsertSave(save);
  return { flushed: true };
}

/** Invoke all registered flush handlers + optional owner list. */
export async function runShutdownFlush(ownerKeys: string[] = []): Promise<{
  ownersFlushed: number;
  handlersRun: number;
}> {
  let ownersFlushed = 0;
  for (const key of ownerKeys) {
    const r = await flushOwnerSave(key);
    if (r.flushed) ownersFlushed += 1;
  }
  let handlersRun = 0;
  for (const h of flushHandlers) {
    await h();
    handlersRun += 1;
  }
  return { ownersFlushed, handlersRun };
}
