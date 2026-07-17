/**
 * Shared cookie security flags for session + guest keys.
 *
 * Important: `Secure` cookies are dropped by browsers (and many HTTP clients)
 * on plain `http://` — including local `next start`. That forked guest identity
 * and caused hatchery claim→list→hatch mismatches in production-mode local runs.
 *
 * Rule: Secure only when the public app URL is HTTPS (or COOKIE_SECURE=true).
 */
export function shouldUseSecureCookies(): boolean {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (appUrl.startsWith("https://")) return true;
  if (appUrl.startsWith("http://")) return false;
  // Fallback: production assumes HTTPS deploy unless told otherwise.
  return process.env.NODE_ENV === "production";
}

export function secureCookieOptions(maxAgeSeconds?: number) {
  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldUseSecureCookies(),
    path: "/",
  };
  if (typeof maxAgeSeconds === "number") {
    return { ...base, maxAge: maxAgeSeconds };
  }
  return base;
}
