import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { shouldUseSecureCookies } from "@/lib/auth/cookie-options";

export const CSRF_COOKIE_NAME = "ph_csrf";

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCsrfToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function csrfCookieOptions() {
  return {
    httpOnly: false, // double-submit cookie pattern — readable by client JS
    sameSite: "lax" as const,
    // Match session cookies: never force Secure on plain http://localhost.
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function setCsrfCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(CSRF_COOKIE_NAME, token, csrfCookieOptions());
}

export function verifyCsrfDoubleSubmit(cookieToken: string | undefined, headerToken: string | undefined): boolean {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length < 16 || headerToken.length < 16) return false;
  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
