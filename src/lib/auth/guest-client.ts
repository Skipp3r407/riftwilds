/**
 * Client-side guest identity for demo hatchery / pets / TCG APIs.
 *
 * Mobile Safari (and some WebViews) can drop or delay httpOnly Set-Cookie on
 * fetch responses. Persist the guest token from JSON and resend it as a header
 * so claim → list → hatch (and practice match start → turn) stays on the same
 * owner key.
 *
 * Also mint a token *before* the first API call so React Strict Mode double
 * mounts cannot race two server-minted identities (classic MATCH_NOT_FOUND
 * after a successful MATCH_START).
 */

export const GUEST_TOKEN_STORAGE_KEY = "rift_guest_token";
export const GUEST_TOKEN_HEADER = "x-rift-guest";

const TOKEN_RE = /^[a-zA-Z0-9]{8,32}$/;

export function isValidGuestToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_RE.test(value);
}

function mintClientGuestToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function readStoredGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(GUEST_TOKEN_STORAGE_KEY);
    return isValidGuestToken(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeGuestToken(token: string | null | undefined): void {
  if (typeof window === "undefined" || !isValidGuestToken(token)) return;
  try {
    window.sessionStorage.setItem(GUEST_TOKEN_STORAGE_KEY, token);
  } catch {
    // Private mode / quota — cookie path may still work.
  }
}

/** Ensure a stable guest token exists before parallel match/start calls. */
export function ensureClientGuestToken(): string | null {
  if (typeof window === "undefined") return null;
  const existing = readStoredGuestToken();
  if (existing) return existing;
  const minted = mintClientGuestToken();
  storeGuestToken(minted);
  return readStoredGuestToken();
}

export function rememberGuestTokenFromPayload(data: unknown): void {
  if (!data || typeof data !== "object") return;
  const token = (data as { guestToken?: unknown }).guestToken;
  storeGuestToken(typeof token === "string" ? token : null);
}

/** Fetch with credentials + guest header for stable demo ownership. */
export async function guestFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const token = ensureClientGuestToken();
  if (token) headers.set(GUEST_TOKEN_HEADER, token);

  return fetch(input, {
    ...init,
    credentials: "same-origin",
    headers,
  });
}
