/**
 * First-visit origin story gate.
 *
 * Preference: first-time visitors hitting `/` go to `/about` (cinematic story).
 * Returning visitors who already dismissed or left the story land on normal home.
 * We intentionally do NOT force the story on every visit — better UX than always-redirect.
 */

export const ORIGIN_STORY_SEEN_COOKIE = "riftwilds-seen-origin-story";
export const ORIGIN_STORY_SEEN_VALUE = "1";
/** 1 year — long enough that returning players aren't re-forced into the intro. */
export const ORIGIN_STORY_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function hasSeenOriginStoryCookie(
  cookieValue: string | undefined | null,
): boolean {
  return cookieValue === ORIGIN_STORY_SEEN_VALUE;
}

/** Client-side: persist that the visitor has seen/dismissed the origin story. */
export function markOriginStorySeen(): void {
  if (typeof document === "undefined") return;

  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${ORIGIN_STORY_SEEN_COOKIE}=${ORIGIN_STORY_SEEN_VALUE}; Path=/; Max-Age=${ORIGIN_STORY_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;

  try {
    localStorage.setItem(ORIGIN_STORY_SEEN_COOKIE, ORIGIN_STORY_SEEN_VALUE);
  } catch {
    // Private mode / quota — cookie alone is enough for the middleware gate.
  }
}

export function hasSeenOriginStoryClient(): boolean {
  if (typeof document === "undefined") return false;

  const fromCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ORIGIN_STORY_SEEN_COOKIE}=`))
    ?.split("=")[1];
  if (hasSeenOriginStoryCookie(fromCookie)) return true;

  try {
    return localStorage.getItem(ORIGIN_STORY_SEEN_COOKIE) === ORIGIN_STORY_SEEN_VALUE;
  } catch {
    return false;
  }
}
