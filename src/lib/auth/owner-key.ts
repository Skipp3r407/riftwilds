import { cookies, headers } from "next/headers";
import { authDefaults } from "@/lib/config/project";
import { secureCookieOptions } from "@/lib/auth/cookie-options";

export const GUEST_COOKIE_NAME = "rift_guest";
export const GUEST_TOKEN_HEADER = "x-rift-guest";

const TOKEN_RE = /^[a-zA-Z0-9]{8,32}$/;

export function isValidGuestToken(value: unknown): value is string {
  return typeof value === "string" && TOKEN_RE.test(value);
}

function newGuestToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

/**
 * Stable owner key for Phase 1 demo stores (eggs, care, training).
 * Prefer session cookie; fall back to guest cookie, then client-sent guest header
 * (needed when mobile browsers drop/delay Set-Cookie on fetch).
 */
export async function resolveOwnerKey(guestCookieName = GUEST_COOKIE_NAME): Promise<{
  ownerKey: string;
  isGuest: boolean;
  guestToken: string | null;
}> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) {
    return { ownerKey: `sess_${session.slice(0, 24)}`, isGuest: false, guestToken: null };
  }

  const guest = jar.get(guestCookieName)?.value;
  if (isValidGuestToken(guest)) {
    return { ownerKey: `guest_${guest}`, isGuest: true, guestToken: guest };
  }

  const hdrs = await headers();
  const fromHeader = hdrs.get(GUEST_TOKEN_HEADER);
  if (isValidGuestToken(fromHeader)) {
    return { ownerKey: `guest_${fromHeader}`, isGuest: true, guestToken: fromHeader };
  }

  const token = newGuestToken();
  return { ownerKey: `guest_${token}`, isGuest: true, guestToken: token };
}

export function attachGuestCookie(
  res: { cookies: { set: (name: string, value: string, opts: Record<string, unknown>) => void } },
  guestToken: string | null,
  cookieName = GUEST_COOKIE_NAME,
) {
  if (!isValidGuestToken(guestToken)) return;
  res.cookies.set(cookieName, guestToken, secureCookieOptions(60 * 60 * 24 * 30));
}

/** Include guestToken in API JSON so clients can persist identity without relying on cookies alone. */
export function guestIdentityFields(isGuest: boolean, guestToken: string | null) {
  if (!isGuest || !isValidGuestToken(guestToken)) return {};
  return { guestToken };
}
