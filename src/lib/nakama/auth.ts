/**
 * Nakama authentication helpers.
 * Bridges to existing guest/`rift_guest` identity — does not replace SIWS or owner-key.
 */

import type { Session } from "@heroiclabs/nakama-js";
import { getNakamaClient } from "@/lib/nakama/client";
import { isNakamaSliceEnabled } from "@/lib/nakama/config";
import {
  clearNakamaSession,
  isSessionExpired,
  readStoredNakamaSession,
  sessionToSnapshot,
  snapshotToSession,
  storeNakamaSession,
} from "@/lib/nakama/session";
import type { AuthenticatedNakama, NakamaAuthMethod } from "@/lib/nakama/types";

const GUEST_DEVICE_PREFIX = "rift_guest_";

function assertAuthBridge(): void {
  if (!isNakamaSliceEnabled("NAKAMA_AUTH_BRIDGE_ENABLED")) {
    throw new Error("NAKAMA_AUTH_BRIDGE_DISABLED");
  }
}

function wrap(session: Session, method: NakamaAuthMethod): AuthenticatedNakama {
  const snapshot = sessionToSnapshot(session);
  storeNakamaSession(snapshot);
  return { session, snapshot, method };
}

/** Authenticate (or create) a Nakama account keyed to the Riftwilds guest token. */
export async function authenticateGuestDevice(
  guestToken: string,
  opts?: { username?: string; create?: boolean },
): Promise<AuthenticatedNakama> {
  assertAuthBridge();
  if (!guestToken || guestToken.length < 8) {
    throw new Error("INVALID_GUEST_TOKEN");
  }
  const client = getNakamaClient();
  const deviceId = `${GUEST_DEVICE_PREFIX}${guestToken}`;
  const session = await client.authenticateDevice(deviceId, opts?.create ?? true, opts?.username);
  return wrap(session, "guest_device");
}

/** Email + password via Nakama (local create). Does not replace modular auth scaffolding. */
export async function authenticateEmailAccount(
  email: string,
  password: string,
  opts?: { username?: string; create?: boolean },
): Promise<AuthenticatedNakama> {
  assertAuthBridge();
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@") || password.length < 8) {
    throw new Error("INVALID_EMAIL_OR_PASSWORD");
  }
  const client = getNakamaClient();
  const session = await client.authenticateEmail(
    normalized,
    password,
    opts?.create ?? true,
    opts?.username,
  );
  return wrap(session, "email");
}

/** Custom-id auth for linking sess_* owner keys later (opt-in). */
export async function authenticateCustomId(
  customId: string,
  opts?: { username?: string; create?: boolean },
): Promise<AuthenticatedNakama> {
  assertAuthBridge();
  if (!customId || customId.length < 6) {
    throw new Error("INVALID_CUSTOM_ID");
  }
  const client = getNakamaClient();
  const session = await client.authenticateCustom(
    customId,
    opts?.create ?? true,
    opts?.username,
  );
  return wrap(session, "custom");
}

/** Restore session from storage; refresh if near expiry. */
export async function restoreOrRefreshSession(): Promise<AuthenticatedNakama | null> {
  if (!isNakamaSliceEnabled("NAKAMA_AUTH_BRIDGE_ENABLED")) return null;
  const stored = readStoredNakamaSession();
  if (!stored) return null;

  let session = snapshotToSession(stored);
  const client = getNakamaClient();

  if (isSessionExpired(stored) || session.isexpired(Date.now() / 1000)) {
    try {
      session = await client.sessionRefresh(session);
    } catch {
      clearNakamaSession();
      return null;
    }
  }

  return wrap(session, stored.vars?.auth_method === "email" ? "email" : "guest_device");
}

export async function logoutNakama(): Promise<void> {
  const stored = readStoredNakamaSession();
  if (!stored) {
    clearNakamaSession();
    return;
  }
  try {
    const client = getNakamaClient();
    const session = snapshotToSession(stored);
    await client.sessionLogout(session, session.token, session.refresh_token);
  } catch {
    // Best-effort — always clear local snapshot.
  } finally {
    clearNakamaSession();
  }
}

export function getActiveNakamaUserId(): string | null {
  return readStoredNakamaSession()?.userId ?? null;
}
