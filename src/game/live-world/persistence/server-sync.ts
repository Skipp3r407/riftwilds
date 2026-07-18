/**
 * Client → server persistence sync (heartbeat, autosave, session).
 * Complements localStorage position-save; never sole source for Category A.
 */

import {
  CATEGORY_B_AUTOSAVE_MS,
  HEARTBEAT_INTERVAL_MS,
} from "@/lib/persistence/config";
import { loadLivePlayState } from "@/game/npcs/play-state";
import type { SavedWorldPosition } from "@/game/live-world/types";

export type PersistenceClientState = {
  sessionId: string | null;
  clientInstanceId: string;
  lastHeartbeatAt: number;
  lastAutosaveAt: number;
  inCombat: boolean;
};

const g = globalThis as typeof globalThis & {
  __riftPersistenceClient?: PersistenceClientState;
};

function state(): PersistenceClientState {
  if (!g.__riftPersistenceClient) {
    g.__riftPersistenceClient = {
      sessionId: null,
      clientInstanceId:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `client_${Date.now()}`,
      lastHeartbeatAt: 0,
      lastAutosaveAt: 0,
      inCombat: false,
    };
  }
  return g.__riftPersistenceClient;
}

export function getPersistenceClientState(): PersistenceClientState {
  return state();
}

export function setClientCombatFlag(inCombat: boolean): void {
  state().inCombat = inCombat;
}

async function postJson(url: string, body: unknown): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function startPersistenceSession(pos?: SavedWorldPosition): Promise<string | null> {
  const s = state();
  const data = await postJson("/api/persistence/session/start", {
    clientInstanceId: s.clientInstanceId,
    mapId: pos?.mapId,
    x: pos?.x,
    y: pos?.y,
  });
  if (data && typeof data.sessionId === "string") {
    s.sessionId = data.sessionId;
    return data.sessionId;
  }
  return null;
}

export async function syncHeartbeat(pos: {
  mapId: string;
  x: number;
  y: number;
  facingRad?: number;
}): Promise<void> {
  const s = state();
  if (!s.sessionId) return;
  const now = Date.now();
  if (now - s.lastHeartbeatAt < HEARTBEAT_INTERVAL_MS - 250) return;
  s.lastHeartbeatAt = now;
  await postJson("/api/persistence/heartbeat", {
    sessionId: s.sessionId,
    mapId: pos.mapId,
    x: pos.x,
    y: pos.y,
    facingRad: pos.facingRad,
    inCombat: s.inCombat,
    clientInstanceId: s.clientInstanceId,
  });
}

export async function syncAutosave(pos: {
  mapId: string;
  x: number;
  y: number;
  force?: boolean;
}): Promise<void> {
  const s = state();
  const now = Date.now();
  if (!pos.force && now - s.lastAutosaveAt < CATEGORY_B_AUTOSAVE_MS) return;
  s.lastAutosaveAt = now;

  let playState: Record<string, unknown> | undefined;
  try {
    playState = loadLivePlayState() as unknown as Record<string, unknown>;
  } catch {
    playState = undefined;
  }

  await postJson("/api/persistence/autosave", {
    sessionId: s.sessionId,
    mapId: pos.mapId,
    x: pos.x,
    y: pos.y,
    playState,
    categories: ["B_PROGRESSION"],
    requestId: `autosave_${s.clientInstanceId}_${now}`,
    force: pos.force,
  });
}

export async function notifyServerDisconnect(): Promise<void> {
  const s = state();
  if (!s.sessionId) return;
  await postJson("/api/persistence/disconnect", {
    action: "disconnect",
    sessionId: s.sessionId,
  });
}

export async function previewLogout(pos: {
  mapId: string;
  x: number;
  y: number;
}): Promise<{
  safe: boolean;
  warning: string | null;
  countdownMs: number;
  zone: { zoneId: string; zoneKind: string; name: string } | null;
} | null> {
  const data = await postJson("/api/persistence/logout", {
    previewOnly: true,
    mapId: pos.mapId,
    x: pos.x,
    y: pos.y,
  });
  if (!data) return null;
  return {
    safe: Boolean(data.safe),
    warning: (data.warning as string | null) ?? null,
    countdownMs: typeof data.countdownMs === "number" ? data.countdownMs : 5000,
    zone: (data.zone as { zoneId: string; zoneKind: string; name: string } | null) ?? null,
  };
}

export async function commitLogout(params: {
  mapId: string;
  x: number;
  y: number;
  mode: "safe" | "unsafe";
  inCombat?: boolean;
}): Promise<{ ok: boolean; message?: string }> {
  const s = state();
  let playState: Record<string, unknown> | undefined;
  try {
    playState = loadLivePlayState() as unknown as Record<string, unknown>;
  } catch {
    playState = undefined;
  }
  const data = await postJson("/api/persistence/logout", {
    mode: params.mode,
    mapId: params.mapId,
    x: params.x,
    y: params.y,
    playState,
    inCombat: params.inCombat ?? s.inCombat,
    requestId: `logout_${s.clientInstanceId}_${Date.now()}`,
    leaveSleepingStub: false,
  });
  if (data?.ok) {
    s.sessionId = null;
    return { ok: true, message: data.message as string | undefined };
  }
  return { ok: false, message: (data?.message as string) ?? "Logout failed" };
}
