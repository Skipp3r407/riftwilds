/**
 * In-process pub/sub for Pet Reward Vault realtime (SSE).
 * No fabricated ticks — publishers only fire on verified vault mutations.
 */

import type { VaultRealtimeEvent } from "@/lib/rewards/types";

type Listener = (event: VaultRealtimeEvent) => void;

const listeners = new Set<Listener>();

export function subscribeVaultEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publishVaultEvent(event: VaultRealtimeEvent): void {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      /* isolate subscriber failures */
    }
  }
}

/** Test helper */
export function __resetVaultEventBus(): void {
  listeners.clear();
}
