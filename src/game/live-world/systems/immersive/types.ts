/**
 * Immersive Live World display / HUD preferences (client-persisted).
 */

import type { HudPanelLayout } from "@/game/live-world/systems/immersive/hud-panel-layout";

export type HudUiMode = "standard" | "minimal" | "immersive" | "cinematic";

/** Preferred window presentation — browser Fullscreen API may fall back to viewport-expand. */
export type WindowModePreference = "windowed" | "browser-fullscreen" | "viewport-expand";

export type ChatDisplayMode = "pinned" | "auto-hide" | "transparent" | "collapsed";

export type MinimapCorner = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export type CameraFocusTarget = "player" | "riftling" | "free";

export type { HudPanelId, HudPanelPosition, HudPanelLayout } from "@/game/live-world/systems/immersive/hud-panel-layout";

export type ImmersiveSettings = {
  hudMode: HudUiMode;
  hudOpacity: number;
  autoHideHud: boolean;
  autoHideDelayMs: number;
  windowModePreference: WindowModePreference;
  chatMode: ChatDisplayMode;
  /** Immersion toolbar (bottom center) collapsed to a peek tab */
  toolbarCollapsed: boolean;
  /** Presence / social panel (bottom-left) */
  presenceHudCollapsed: boolean;
  /** Happening now / Population panel (top-right) */
  townActivityCollapsed: boolean;
  /** Map name / keeper status chips (top) */
  statusChromeCollapsed: boolean;
  minimapHidden: boolean;
  minimapCollapsed: boolean;
  minimapOpacity: number;
  minimapSize: number;
  minimapCorner: MinimapCorner;
  minimapLocked: boolean;
  /** Free-form panel positions (px). Empty = CSS defaults / docked stack. */
  hudPanelLayout: HudPanelLayout;
  smoothZoom: boolean;
  reducedMotion: boolean;
  largeUi: boolean;
  highContrast: boolean;
  performanceCull: boolean;
  particleBudget: "full" | "reduced" | "minimal";
};

export const IMMERSIVE_SETTINGS_STORAGE_KEY = "riftwilds-live-world-immersive-v1";

export const DEFAULT_IMMERSIVE_SETTINGS: ImmersiveSettings = {
  hudMode: "standard",
  hudOpacity: 1,
  autoHideHud: false,
  autoHideDelayMs: 2500,
  windowModePreference: "windowed",
  chatMode: "pinned",
  toolbarCollapsed: false,
  presenceHudCollapsed: false,
  townActivityCollapsed: false,
  statusChromeCollapsed: false,
  minimapHidden: false,
  minimapCollapsed: false,
  minimapOpacity: 0.92,
  minimapSize: 148,
  minimapCorner: "top-right",
  minimapLocked: false,
  hudPanelLayout: {},
  smoothZoom: true,
  reducedMotion: false,
  largeUi: false,
  highContrast: false,
  performanceCull: false,
  particleBudget: "full",
};

export type HudRevealReason =
  | "pointer"
  | "key"
  | "combat"
  | "message"
  | "damage"
  | "quest"
  | "menu"
  | "manual";
