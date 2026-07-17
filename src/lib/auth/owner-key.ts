import { cookies } from "next/headers";
import { authDefaults } from "@/lib/config/project";
import { secureCookieOptions } from "@/lib/auth/cookie-options";

/**
 * Stable owner key for Phase 1 demo stores (eggs, care, training).
 * Prefer session cookie; fall back to guest cookie.
 */
export async function resolveOwnerKey(guestCookieName = "rift_guest"): Promise<{
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
  if (guest) {
    return { ownerKey: `guest_${guest}`, isGuest: true, guestToken: guest };
  }
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return { ownerKey: `guest_${token}`, isGuest: true, guestToken: token };
}

export function attachGuestCookie(
  res: { cookies: { set: (name: string, value: string, opts: Record<string, unknown>) => void } },
  guestToken: string | null,
  cookieName = "rift_guest",
) {
  if (!guestToken) return;
  res.cookies.set(cookieName, guestToken, secureCookieOptions(60 * 60 * 24 * 30));
}
