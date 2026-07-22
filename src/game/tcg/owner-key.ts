import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  attachGuestCookie,
  GUEST_COOKIE_NAME,
  GUEST_TOKEN_HEADER,
  isValidGuestToken,
  resolveOwnerKey,
} from "@/lib/auth/owner-key";
import {
  isGuestGameplayAllowed,
  isLocalPreviewBypass,
  LOCAL_PREVIEW_OWNER_KEY,
} from "@/lib/auth/account-play-policy";
import { authDefaults } from "@/lib/config/project";

/** @deprecated Prefer shared `rift_guest` via resolveOwnerKey — kept for legacy cookie reads. */
export const TCG_GUEST_COOKIE = "tcg_guest";

/**
 * Stable TCG owner identity.
 * When account is required, returns unauthorized (no guest mint) —
 * except local preview bypass, which seats a stable preview keeper.
 */
export async function resolveTcgOwnerKey(): Promise<{
  key: string;
  guestToken: string | null;
  mintedGuest: boolean;
  authorized: boolean;
}> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) {
    return {
      key: `sess_${session.slice(0, 24)}`,
      guestToken: null,
      mintedGuest: false,
      authorized: true,
    };
  }

  // Keep Practice Board playable when layout/middleware use preview bypass
  // without a ph_session cookie (classic false NO_SESSION / “Session lost”).
  if (isLocalPreviewBypass()) {
    return {
      key: LOCAL_PREVIEW_OWNER_KEY,
      guestToken: null,
      mintedGuest: false,
      authorized: true,
    };
  }

  if (!isGuestGameplayAllowed()) {
    return {
      key: "",
      guestToken: null,
      mintedGuest: false,
      authorized: false,
    };
  }

  const shared = jar.get(GUEST_COOKIE_NAME)?.value;
  if (isValidGuestToken(shared)) {
    return { key: `guest_${shared}`, guestToken: shared, mintedGuest: false, authorized: true };
  }

  const legacy = jar.get(TCG_GUEST_COOKIE)?.value;
  if (isValidGuestToken(legacy)) {
    return { key: `guest_${legacy}`, guestToken: legacy, mintedGuest: false, authorized: true };
  }

  // Prefer client-sent header before minting — stops Strict Mode double-start
  // from seating the same board under two guest keys.
  const hdrs = await headers();
  const fromHeader = hdrs.get(GUEST_TOKEN_HEADER);
  if (isValidGuestToken(fromHeader)) {
    return {
      key: `guest_${fromHeader}`,
      guestToken: fromHeader,
      mintedGuest: false,
      authorized: true,
    };
  }

  const resolved = await resolveOwnerKey();
  return {
    key: resolved.ownerKey,
    guestToken: resolved.guestToken,
    mintedGuest: Boolean(resolved.guestToken),
    authorized: resolved.authorized,
  };
}

/**
 * Read-only owner key for turn actions.
 * Accepts session / guest cookies OR `x-rift-guest` (cookie delay / drop).
 * Does not mint — missing identity → null (401 NO_SESSION).
 */
export async function readTcgOwnerKey(): Promise<string | null> {
  const jar = await cookies();
  const session = jar.get(authDefaults.COOKIE_NAME)?.value;
  if (session) return `sess_${session.slice(0, 24)}`;
  if (isLocalPreviewBypass()) return LOCAL_PREVIEW_OWNER_KEY;
  if (!isGuestGameplayAllowed()) return null;
  const shared = jar.get(GUEST_COOKIE_NAME)?.value;
  if (isValidGuestToken(shared)) return `guest_${shared}`;
  const legacy = jar.get(TCG_GUEST_COOKIE)?.value;
  if (isValidGuestToken(legacy)) return `guest_${legacy}`;
  const hdrs = await headers();
  const fromHeader = hdrs.get(GUEST_TOKEN_HEADER);
  if (isValidGuestToken(fromHeader)) return `guest_${fromHeader}`;
  return null;
}

export function attachTcgGuestCookie(
  res: NextResponse,
  guestToken: string | null,
): NextResponse {
  if (!isGuestGameplayAllowed()) return res;
  if (!isValidGuestToken(guestToken)) return res;
  attachGuestCookie(res, guestToken, GUEST_COOKIE_NAME);
  attachGuestCookie(res, guestToken, TCG_GUEST_COOKIE);
  return res;
}
