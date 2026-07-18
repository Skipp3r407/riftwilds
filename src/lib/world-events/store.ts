/**
 * In-memory Dynamic World Events store (Phase 1) — mirrors loyalty / presence hot path.
 */

import {
  WORLD_EVENT_AUDIT_LIMIT,
  WORLD_EVENT_HISTORY_LIMIT,
} from "@/lib/world-events/config";
import type {
  WorldEventAuditEntry,
  WorldEventInstance,
  WorldEventParticipant,
  WorldEventSchedulerState,
} from "@/lib/world-events/types";

type WorldEventMaps = {
  instances: Map<string, WorldEventInstance>;
  participants: Map<string, WorldEventParticipant>;
  scheduler: WorldEventSchedulerState;
  audit: WorldEventAuditEntry[];
};

const g = globalThis as typeof globalThis & { __rwWorldEvents?: WorldEventMaps };

function maps(): WorldEventMaps {
  if (!g.__rwWorldEvents) {
    g.__rwWorldEvents = {
      instances: new Map(),
      participants: new Map(),
      scheduler: {
        lastTickAt: null,
        lastSpawnAt: null,
        spawnCooldownUntil: 0,
        activeInstanceId: null,
        historyIds: [],
      },
      audit: [],
    };
  }
  return g.__rwWorldEvents;
}

function participantKey(userId: string, eventInstanceId: string): string {
  return `${userId}::${eventInstanceId}`;
}

export function getSchedulerState(): WorldEventSchedulerState {
  return maps().scheduler;
}

export function saveSchedulerState(next: WorldEventSchedulerState): void {
  maps().scheduler = next;
}

export function getWorldEventInstance(id: string): WorldEventInstance | null {
  return maps().instances.get(id) ?? null;
}

export function saveWorldEventInstance(instance: WorldEventInstance): void {
  maps().instances.set(instance.id, instance);
}

export function getActiveWorldEventInstance(): WorldEventInstance | null {
  const id = maps().scheduler.activeInstanceId;
  if (!id) return null;
  return maps().instances.get(id) ?? null;
}

export function listRecentWorldEvents(limit = 12): WorldEventInstance[] {
  const ids = maps().scheduler.historyIds.slice(-limit).reverse();
  const active = getActiveWorldEventInstance();
  const out: WorldEventInstance[] = [];
  if (active) out.push(active);
  for (const id of ids) {
    if (active && id === active.id) continue;
    const inst = maps().instances.get(id);
    if (inst) out.push(inst);
  }
  return out;
}

export function pushWorldEventHistory(id: string): void {
  const s = maps().scheduler;
  s.historyIds = [...s.historyIds.filter((x) => x !== id), id].slice(
    -WORLD_EVENT_HISTORY_LIMIT,
  );
}

export function getWorldEventParticipant(
  userId: string,
  eventInstanceId: string,
): WorldEventParticipant | null {
  return maps().participants.get(participantKey(userId, eventInstanceId)) ?? null;
}

export function saveWorldEventParticipant(p: WorldEventParticipant): void {
  maps().participants.set(participantKey(p.userId, p.eventInstanceId), p);
}

export function appendWorldEventAudit(entry: Omit<WorldEventAuditEntry, "at">): void {
  const row: WorldEventAuditEntry = { ...entry, at: new Date().toISOString() };
  const audit = maps().audit;
  audit.push(row);
  if (audit.length > WORLD_EVENT_AUDIT_LIMIT) {
    audit.splice(0, audit.length - WORLD_EVENT_AUDIT_LIMIT);
  }
}

export function listWorldEventAudit(limit = 20): WorldEventAuditEntry[] {
  return maps().audit.slice(-limit).reverse();
}

export function resetWorldEventsStoreForTests(): void {
  g.__rwWorldEvents = {
    instances: new Map(),
    participants: new Map(),
    scheduler: {
      lastTickAt: null,
      lastSpawnAt: null,
      spawnCooldownUntil: 0,
      activeInstanceId: null,
      historyIds: [],
    },
    audit: [],
  };
}
