/**
 * Dedicated Mobile & Tablet Battle Experience — viewport classes + prefs.
 * Desktop (≥1920) stays flagship; phone/tablet use intentional layouts, not scaled chrome.
 */

export type BattleViewportClass =
  | "phone-portrait"
  | "phone-landscape"
  | "tablet-portrait"
  | "tablet-landscape"
  | "desktop"
  | "large";

export type BattlePerfProfile = "auto" | "high" | "balanced" | "battery";

export type BattleA11yPrefs = {
  /** Enlarge hand + field card hit targets. */
  largeCard: boolean;
  /** Bias primary actions toward the dominant thumb edge. */
  oneHand: boolean;
  /** Stronger borders / meter contrast on battle chrome. */
  highContrast: boolean;
};

export const BATTLE_VIEWPORT_KEY = "riftwilds.battle.viewport-override";
export const BATTLE_LANDSCAPE_PROMPT_KEY = "riftwilds.battle.landscape-prompt";
export const BATTLE_PERF_PROFILE_KEY = "riftwilds.battle.perf-profile";
export const BATTLE_A11Y_LARGE_CARD_KEY = "riftwilds.battle.a11y.large-card";
export const BATTLE_A11Y_ONE_HAND_KEY = "riftwilds.battle.a11y.one-hand";
export const BATTLE_A11Y_HIGH_CONTRAST_KEY = "riftwilds.battle.a11y.high-contrast";
export const BATTLE_HAND_EXPANDED_KEY = "riftwilds.battle.hand-expanded";

/** Intentional layout bands (CSS + JS share these numbers). */
export const BATTLE_BREAKPOINTS = {
  phonePortraitMax: 640,
  phoneLandscapeMin: 640,
  phoneLandscapeMax: 932,
  tabletPortraitMin: 768,
  tabletPortraitMax: 1024,
  tabletLandscapeMin: 1024,
  tabletLandscapeMax: 1366,
  desktopMin: 1920,
  largeMin: 2560,
} as const;

/**
 * Phone / tablet portrait desk — stack stage + sticky hand instead of side rails.
 * Includes narrow landscape phones (≤767) so foldables still get the thumb layout.
 */
export const PORTRAIT_BATTLE_LAYOUT_MQ =
  "(max-width: 1023px) and (orientation: portrait), (max-width: 767px)";

/** Phone landscape — preferred mobile battle (no-scroll stack). */
export const PHONE_LANDSCAPE_BATTLE_MQ =
  "(max-width: 932px) and (orientation: landscape)";

/** Tablet landscape band. */
export const TABLET_LANDSCAPE_BATTLE_MQ =
  "(min-width: 1024px) and (max-width: 1366px) and (orientation: landscape)";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

function safeSessionGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

export function matchesPortraitBattleLayout(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia(PORTRAIT_BATTLE_LAYOUT_MQ).matches;
  } catch {
    return false;
  }
}

export function isLandscapeOrientation(
  width = typeof window !== "undefined" ? window.innerWidth : 1024,
  height = typeof window !== "undefined" ? window.innerHeight : 768,
): boolean {
  if (typeof window !== "undefined") {
    try {
      if (window.matchMedia("(orientation: landscape)").matches) return true;
      if (window.matchMedia("(orientation: portrait)").matches) return false;
    } catch {
      /* fall through */
    }
  }
  return width > height;
}

/**
 * Resolve the intentional battle viewport class from dimensions.
 * Priority: large → desktop → phone bands → tablet bands → desktop fallback.
 */
export function resolveBattleViewport(
  width: number,
  height: number,
  orientation?: "portrait" | "landscape",
): BattleViewportClass {
  const landscape =
    orientation === "landscape"
      ? true
      : orientation === "portrait"
        ? false
        : isLandscapeOrientation(width, height);

  if (width >= BATTLE_BREAKPOINTS.largeMin) return "large";
  if (width >= BATTLE_BREAKPOINTS.desktopMin) return "desktop";

  if (!landscape && width <= BATTLE_BREAKPOINTS.phonePortraitMax) {
    return "phone-portrait";
  }
  if (landscape && width <= BATTLE_BREAKPOINTS.phoneLandscapeMax) {
    return "phone-landscape";
  }
  if (!landscape && width <= BATTLE_BREAKPOINTS.tabletPortraitMax) {
    return "tablet-portrait";
  }
  if (landscape && width <= BATTLE_BREAKPOINTS.tabletLandscapeMax) {
    return "tablet-landscape";
  }

  // 1367–1919 (and tall phones that miss phone bands): desktop chrome, minor spacing.
  return "desktop";
}

export function readBattleViewport(): BattleViewportClass {
  if (typeof window === "undefined") return "desktop";
  return resolveBattleViewport(window.innerWidth, window.innerHeight);
}

export function isPhoneBattleViewport(vp: BattleViewportClass): boolean {
  return vp === "phone-portrait" || vp === "phone-landscape";
}

export function isTabletBattleViewport(vp: BattleViewportClass): boolean {
  return vp === "tablet-portrait" || vp === "tablet-landscape";
}

export function isCompactBattleViewport(vp: BattleViewportClass): boolean {
  return isPhoneBattleViewport(vp) || isTabletBattleViewport(vp);
}

/** Soft default: collapse intel/feed on portrait when never saved. */
export function readBattleIntelCollapsedForViewport(portrait: boolean): boolean {
  const raw = safeGet("riftwilds.battle.intel-collapsed");
  if (raw === "0") return false;
  if (raw === "1") return true;
  return portrait;
}

export function readBattleFeedCollapsedForViewport(portrait: boolean): boolean {
  const raw = safeGet("riftwilds.battle.feed-collapsed");
  if (raw === "0") return false;
  if (raw === "1") return true;
  return portrait;
}

/** Landscape recommend prompt — session dismiss; never force rotate. */
export function shouldShowLandscapePrompt(vp: BattleViewportClass): boolean {
  if (vp !== "phone-portrait") return false;
  if (safeSessionGet(BATTLE_LANDSCAPE_PROMPT_KEY) === "dismissed") return false;
  if (safeGet(BATTLE_LANDSCAPE_PROMPT_KEY) === "never") return false;
  return true;
}

export function dismissLandscapePrompt(permanent = false) {
  safeSessionSet(BATTLE_LANDSCAPE_PROMPT_KEY, "dismissed");
  if (permanent) safeSet(BATTLE_LANDSCAPE_PROMPT_KEY, "never");
}

export function readBattlePerfProfile(): BattlePerfProfile {
  const raw = safeGet(BATTLE_PERF_PROFILE_KEY);
  if (raw === "high" || raw === "balanced" || raw === "battery" || raw === "auto") {
    return raw;
  }
  return "auto";
}

export function writeBattlePerfProfile(profile: BattlePerfProfile) {
  safeSet(BATTLE_PERF_PROFILE_KEY, profile);
}

/** Resolved profile after Auto (coarse pointer / narrow → balanced). */
export function resolveBattlePerfProfile(
  stored: BattlePerfProfile,
  vp: BattleViewportClass,
): Exclude<BattlePerfProfile, "auto"> {
  if (stored !== "auto") return stored;
  if (isPhoneBattleViewport(vp)) return "balanced";
  if (isTabletBattleViewport(vp)) return "balanced";
  return "high";
}

export function readBattleA11yPrefs(): BattleA11yPrefs {
  return {
    largeCard: safeGet(BATTLE_A11Y_LARGE_CARD_KEY) === "1",
    oneHand: safeGet(BATTLE_A11Y_ONE_HAND_KEY) === "1",
    highContrast: safeGet(BATTLE_A11Y_HIGH_CONTRAST_KEY) === "1",
  };
}

export function writeBattleA11yPrefs(prefs: Partial<BattleA11yPrefs>) {
  if (prefs.largeCard != null) {
    safeSet(BATTLE_A11Y_LARGE_CARD_KEY, prefs.largeCard ? "1" : "0");
  }
  if (prefs.oneHand != null) {
    safeSet(BATTLE_A11Y_ONE_HAND_KEY, prefs.oneHand ? "1" : "0");
  }
  if (prefs.highContrast != null) {
    safeSet(BATTLE_A11Y_HIGH_CONTRAST_KEY, prefs.highContrast ? "1" : "0");
  }
}

export function readHandExpandedDefault(vp: BattleViewportClass): boolean {
  const raw = safeGet(BATTLE_HAND_EXPANDED_KEY);
  if (raw === "0") return false;
  if (raw === "1") return true;
  // Phone landscape keeps hand compact by default (no-scroll budget).
  return vp !== "phone-landscape";
}

export function writeHandExpanded(expanded: boolean) {
  safeSet(BATTLE_HAND_EXPANDED_KEY, expanded ? "1" : "0");
}

export function applyBattleViewportDocumentAttrs(opts: {
  viewport: BattleViewportClass;
  perf: Exclude<BattlePerfProfile, "auto">;
  a11y: BattleA11yPrefs;
  handExpanded: boolean;
}) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.battleViewport = opts.viewport;
  root.dataset.battlePerf = opts.perf;
  root.dataset.battleLargeCard = opts.a11y.largeCard ? "true" : "false";
  root.dataset.battleOneHand = opts.a11y.oneHand ? "true" : "false";
  root.dataset.battleHighContrast = opts.a11y.highContrast ? "true" : "false";
  root.dataset.battleHandExpanded = opts.handExpanded ? "true" : "false";
}

export function clearBattleViewportDocumentAttrs() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  delete root.dataset.battleViewport;
  delete root.dataset.battlePerf;
  delete root.dataset.battleLargeCard;
  delete root.dataset.battleOneHand;
  delete root.dataset.battleHighContrast;
  delete root.dataset.battleHandExpanded;
}
