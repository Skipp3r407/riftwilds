import {
  DEFAULT_IMMERSIVE_SETTINGS,
  IMMERSIVE_SETTINGS_STORAGE_KEY,
  type ImmersiveSettings,
  type HudUiMode,
  type WindowModePreference,
  type ChatDisplayMode,
  type MinimapCorner,
} from "@/game/live-world/systems/immersive/types";
import {
  clearHudPanelLayout,
  normalizeHudPanelLayout,
} from "@/game/live-world/systems/immersive/hud-panel-layout";

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(1, Math.max(0, n));
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

const HUD_MODES: HudUiMode[] = ["standard", "minimal", "immersive", "cinematic"];
const WINDOW_MODES: WindowModePreference[] = [
  "windowed",
  "browser-fullscreen",
  "viewport-expand",
];
const CHAT_MODES: ChatDisplayMode[] = ["pinned", "auto-hide", "transparent", "collapsed"];
const CORNERS: MinimapCorner[] = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
];
const PARTICLE: ImmersiveSettings["particleBudget"][] = ["full", "reduced", "minimal"];

export function normalizeImmersiveSettings(
  partial: Partial<ImmersiveSettings> | null | undefined,
): ImmersiveSettings {
  const base = { ...DEFAULT_IMMERSIVE_SETTINGS, ...(partial ?? {}) };
  return {
    hudMode: HUD_MODES.includes(base.hudMode) ? base.hudMode : "standard",
    hudOpacity: clamp01(base.hudOpacity),
    autoHideHud: !!base.autoHideHud,
    autoHideDelayMs: clamp(base.autoHideDelayMs, 500, 15000),
    windowModePreference: WINDOW_MODES.includes(base.windowModePreference)
      ? base.windowModePreference
      : "windowed",
    chatMode: CHAT_MODES.includes(base.chatMode) ? base.chatMode : "pinned",
    toolbarCollapsed: !!base.toolbarCollapsed,
    presenceHudCollapsed: !!base.presenceHudCollapsed,
    townActivityCollapsed: !!base.townActivityCollapsed,
    statusChromeCollapsed: !!base.statusChromeCollapsed,
    minimapHidden: !!base.minimapHidden,
    minimapCollapsed: !!base.minimapCollapsed,
    minimapOpacity: clamp01(base.minimapOpacity),
    minimapSize: clamp(base.minimapSize, 96, 240),
    minimapCorner: CORNERS.includes(base.minimapCorner) ? base.minimapCorner : "top-right",
    minimapLocked: !!base.minimapLocked,
    hudPanelLayout: normalizeHudPanelLayout(base.hudPanelLayout),
    smoothZoom: !!base.smoothZoom,
    reducedMotion: !!base.reducedMotion,
    largeUi: !!base.largeUi,
    highContrast: !!base.highContrast,
    performanceCull: !!base.performanceCull,
    particleBudget: PARTICLE.includes(base.particleBudget) ? base.particleBudget : "full",
  };
}

export function loadImmersiveSettings(): ImmersiveSettings {
  if (typeof window === "undefined") return { ...DEFAULT_IMMERSIVE_SETTINGS };
  try {
    const raw = window.localStorage.getItem(IMMERSIVE_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_IMMERSIVE_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ImmersiveSettings>;
    return normalizeImmersiveSettings(parsed);
  } catch {
    return { ...DEFAULT_IMMERSIVE_SETTINGS };
  }
}

export function persistImmersiveSettings(settings: ImmersiveSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      IMMERSIVE_SETTINGS_STORAGE_KEY,
      JSON.stringify(normalizeImmersiveSettings(settings)),
    );
  } catch {
    /* quota / private mode */
  }
}

export function updateImmersiveSettings(
  patch: Partial<ImmersiveSettings>,
): ImmersiveSettings {
  const next = normalizeImmersiveSettings({ ...loadImmersiveSettings(), ...patch });
  persistImmersiveSettings(next);
  return next;
}

export function cycleHudMode(current: HudUiMode): HudUiMode {
  const i = HUD_MODES.indexOf(current);
  return HUD_MODES[(i + 1) % HUD_MODES.length]!;
}

/**
 * Suggested chrome collapse when switching HUD modes.
 * Immersive / cinematic prefer peek tabs; does not override user toggles unless applied by caller.
 */
export function suggestedChromeCollapseForHudMode(
  mode: HudUiMode,
): Pick<
  ImmersiveSettings,
  | "toolbarCollapsed"
  | "presenceHudCollapsed"
  | "townActivityCollapsed"
  | "statusChromeCollapsed"
> {
  if (mode === "cinematic") {
    return {
      toolbarCollapsed: true,
      presenceHudCollapsed: true,
      townActivityCollapsed: true,
      statusChromeCollapsed: true,
    };
  }
  if (mode === "immersive") {
    return {
      toolbarCollapsed: true,
      presenceHudCollapsed: true,
      townActivityCollapsed: true,
      statusChromeCollapsed: false,
    };
  }
  if (mode === "minimal") {
    return {
      toolbarCollapsed: false,
      presenceHudCollapsed: true,
      townActivityCollapsed: true,
      statusChromeCollapsed: false,
    };
  }
  return {
    toolbarCollapsed: false,
    presenceHudCollapsed: false,
    townActivityCollapsed: false,
    statusChromeCollapsed: false,
  };
}

export function resolveAutoHideEnabled(settings: ImmersiveSettings): boolean {
  if (settings.hudMode === "immersive" || settings.hudMode === "cinematic") return true;
  return settings.autoHideHud;
}

export function resolveBaseHudOpacity(settings: ImmersiveSettings): number {
  if (settings.hudMode === "cinematic") return 0;
  if (settings.hudMode === "minimal") return Math.min(settings.hudOpacity, 0.55);
  return settings.hudOpacity;
}

export function prefersReducedMotion(settings: ImmersiveSettings): boolean {
  if (settings.reducedMotion) return true;
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Clear free-form panel positions and restore docked defaults. */
export function resetHudPanelLayoutSettings(
  settings: ImmersiveSettings,
): ImmersiveSettings {
  return normalizeImmersiveSettings({
    ...settings,
    hudPanelLayout: clearHudPanelLayout(),
    minimapCorner: "top-right",
  });
}
