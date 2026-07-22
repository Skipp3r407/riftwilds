/**
 * Route prefixes that require a signed-in player account.
 * Marketing/legal/auth pages stay public.
 */

export const PUBLIC_AUTH_PATHS = [
  "/login",
  "/signup",
  "/onboarding",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/legal",
] as const;

/** Edge-safe cookie presence gate (full status checked in server layouts/APIs). */
export const PROTECTED_PATH_PREFIXES = [
  "/play",
  "/dashboard",
  "/world",
  "/live-world",
  "/live",
  "/battle",
  "/arena",
  "/rift-stakes",
  "/tcg",
  "/hatchery",
  "/marketplace",
  "/guilds",
  "/chat",
  "/comics",
  "/housing",
  "/homestead",
  "/neighborhoods",
  "/tournaments",
  "/profile",
  "/settings",
  "/wallet",
  "/inventory",
  "/rewards",
  "/loyalty",
  "/quests",
  "/social",
  "/collection",
  "/pets",
  "/creature",
  "/shop",
  "/exchange",
  "/economy/credits",
  "/collectibles",
  "/leaderboards",
  "/restoration",
  "/spirit-realm",
  "/ecosystem",
  "/memorials",
  "/academy",
] as const;

/** API prefixes that must not serve guest / anonymous gameplay data. */
export const PROTECTED_API_PREFIXES = [
  "/api/hatchery",
  "/api/pets",
  "/api/tcg",
  "/api/onboarding",
  "/api/marketplace",
  "/api/housing",
  "/api/neighborhoods",
  "/api/guilds",
  "/api/social",
  "/api/social-presence",
  "/api/loyalty",
  "/api/inventory",
  "/api/shop",
  "/api/wallet",
  "/api/credits",
  "/api/quests",
  "/api/arena",
  "/api/rift-stakes",
  "/api/battle",
  "/api/world",
  "/api/live-world",
  "/api/persistence",
  "/api/spirit",
  "/api/memorials",
  "/api/life-skills",
  "/api/world-expansion",
  "/api/world-events",
  "/api/world-bosses",
  "/api/festivals",
  "/api/player-cities",
  "/api/npc-relationships",
  "/api/hidden-lore",
  "/api/housing-competitions",
  "/api/nakama",
] as const;

export function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isProtectedPath(pathname: string): boolean {
  if (isPublicAuthPath(pathname)) return false;
  return PROTECTED_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isProtectedApiPath(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function buildLoginRedirectPath(returnUrl: string): string {
  const safe =
    returnUrl.startsWith("/") && !returnUrl.startsWith("//") ? returnUrl : "/play";
  return `/login?returnUrl=${encodeURIComponent(safe)}`;
}
