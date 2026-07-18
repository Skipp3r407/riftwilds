/** Pure helpers for site-header auto-hide on Live World routes. */

export const LIVE_WORLD_SITE_NAV_HIDE_MS = 2800;
export const LIVE_WORLD_SITE_NAV_FADED_OPACITY = 0;

export function isLiveWorldPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === "/live-world" || pathname.startsWith("/live-world/");
}

export type SiteNavAutohideState = {
  revealed: boolean;
  lastActivityAt: number;
  /** Hovering the nav or top hot-zone. */
  hovering: boolean;
  /** Dropdown / mobile drawer / focus trap — stay open. */
  pinned: boolean;
};

export function createSiteNavAutohideState(now = Date.now()): SiteNavAutohideState {
  return {
    revealed: true,
    lastActivityAt: now,
    hovering: false,
    pinned: false,
  };
}

export function bumpSiteNavActivity(
  state: SiteNavAutohideState,
  now = Date.now(),
): SiteNavAutohideState {
  return {
    ...state,
    revealed: true,
    lastActivityAt: now,
  };
}

export function setSiteNavHovering(
  state: SiteNavAutohideState,
  hovering: boolean,
  now = Date.now(),
): SiteNavAutohideState {
  if (hovering) {
    return { ...state, hovering: true, revealed: true, lastActivityAt: now };
  }
  return { ...state, hovering: false, lastActivityAt: now };
}

export function setSiteNavPinned(
  state: SiteNavAutohideState,
  pinned: boolean,
  now = Date.now(),
): SiteNavAutohideState {
  if (pinned) {
    return { ...state, pinned: true, revealed: true, lastActivityAt: now };
  }
  return { ...state, pinned: false, lastActivityAt: now };
}

export function tickSiteNavAutohide(
  state: SiteNavAutohideState,
  enabled: boolean,
  now = Date.now(),
  hideMs = LIVE_WORLD_SITE_NAV_HIDE_MS,
): SiteNavAutohideState {
  if (!enabled) {
    return { ...state, revealed: true };
  }
  if (state.pinned || state.hovering) {
    return { ...state, revealed: true };
  }
  if (now - state.lastActivityAt >= hideMs) {
    return { ...state, revealed: false };
  }
  return { ...state, revealed: true };
}

export function siteNavChromeVisible(state: SiteNavAutohideState, enabled: boolean): boolean {
  if (!enabled) return true;
  return state.revealed || state.hovering || state.pinned;
}
