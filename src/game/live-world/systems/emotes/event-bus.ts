/**
 * Local emote event bus — Phase 1 pub/sub.
 * Phase 2: mirror events over Live World WS with server-authoritative validation.
 */

import type { EmoteBusEvent } from "@/game/live-world/systems/emotes/types";

type Listener = (event: EmoteBusEvent) => void;

export type EmoteEventBus = {
  publish: (event: EmoteBusEvent) => void;
  subscribe: (fn: Listener) => () => void;
  /** Recent events for admin/debug (capped). */
  history: () => EmoteBusEvent[];
  clear: () => void;
};

export function createEmoteEventBus(maxHistory = 64): EmoteEventBus {
  const listeners = new Set<Listener>();
  const hist: EmoteBusEvent[] = [];

  return {
    publish(event) {
      hist.push(event);
      if (hist.length > maxHistory) hist.shift();
      listeners.forEach((fn) => {
        try {
          fn(event);
        } catch {
          /* ignore subscriber errors */
        }
      });
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    history: () => hist.slice(),
    clear: () => {
      hist.length = 0;
    },
  };
}
