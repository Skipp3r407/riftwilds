import { Session } from "@heroiclabs/nakama-js";
import type { NakamaSessionSnapshot } from "@/lib/nakama/types";

export const NAKAMA_SESSION_STORAGE_KEY = "rift_nakama_session";

export function sessionToSnapshot(session: Session): NakamaSessionSnapshot {
  return {
    token: session.token,
    refreshToken: session.refresh_token,
    userId: session.user_id ?? "",
    username: session.username ?? "",
    expiresAt: session.expires_at ?? 0,
    created: Boolean(session.created),
    vars: (session.vars as Record<string, string> | undefined) ?? undefined,
  };
}

export function snapshotToSession(snapshot: NakamaSessionSnapshot): Session {
  return Session.restore(snapshot.token, snapshot.refreshToken);
}

export function readStoredNakamaSession(): NakamaSessionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(NAKAMA_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NakamaSessionSnapshot;
    if (!parsed?.token || !parsed?.refreshToken || !parsed?.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeNakamaSession(snapshot: NakamaSessionSnapshot | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!snapshot) {
      window.sessionStorage.removeItem(NAKAMA_SESSION_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(NAKAMA_SESSION_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Private mode / quota — in-memory session still works for the tab.
  }
}

export function clearNakamaSession(): void {
  storeNakamaSession(null);
}

export function isSessionExpired(snapshot: NakamaSessionSnapshot, skewSec = 30): boolean {
  if (!snapshot.expiresAt) return false;
  const now = Math.floor(Date.now() / 1000);
  return now >= snapshot.expiresAt - skewSec;
}
