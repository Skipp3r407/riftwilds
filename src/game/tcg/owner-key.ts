import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  attachGuestCookie,
  GUEST_COOKIE_NAME,
  isValidGuestToken,
  resolveOwnerKey,
} from "@/lib/auth/owner-key";
import { authDefaults } from "@/lib/config/project";

/** @deprecated Prefer shared `rift_guest` via resolveOwnerKey — kept for legacy cookie reads. */
export const TCG_GUEST_COOKIE = "tcg_guest";

/**
 * Stable TCG owner identity — same guest key as hatchery / companion grants.
 * Prefer session; then shared `rift_guest`; legacy `tcg_guest` still accepted once.
 */
export async function resolveTcgOwnerKey(): Promise<{
  key: string;
  guestToken: string | null;
  mintedGuest: boolean;
}> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) {
    return {
      key: `sess_${session.slice(0, 24)}`,
      guestToken: null,
      mintedGuest: false,
    };
  }

  const shared = jar.get(GUEST_COOKIE_NAME)?.value;
  if (isValidGuestToken(shared)) {
    return { key: `guest_${shared}`, guestToken: shared, mintedGuest: false };
  }

  // Legacy TCG-only cookie — migrate onto shared guest identity.
  const legacy = jar.get(TCG_GUEST_COOKIE)?.value;
  if (isValidGuestToken(legacy)) {
    return { key: `guest_${legacy}`, guestToken: legacy, mintedGuest: false };
  }

  const resolved = await resolveOwnerKey();
  return {
    key: resolved.ownerKey,
    guestToken: resolved.guestToken,
    mintedGuest: Boolean(resolved.guestToken),
  };
}

/** Read-only: null when no session/guest cookie (used by turn route). */
export async function readTcgOwnerKey(): Promise<string | null> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) return `sess_${session.slice(0, 24)}`;
  const shared = jar.get(GUEST_COOKIE_NAME)?.value;
  if (isValidGuestToken(shared)) return `guest_${shared}`;
  const legacy = jar.get(TCG_GUEST_COOKIE)?.value;
  if (isValidGuestToken(legacy)) return `guest_${legacy}`;
  return null;
}

export function attachTcgGuestCookie(
  res: NextResponse,
  guestToken: string | null,
): NextResponse {
  if (!isValidGuestToken(guestToken)) return res;
  // Primary shared cookie (hatchery + TCG binder).
  attachGuestCookie(res, guestToken, GUEST_COOKIE_NAME);
  // Keep legacy cookie in sync so mid-session clients do not fork identity.
  attachGuestCookie(res, guestToken, TCG_GUEST_COOKIE);
  return res;
}
