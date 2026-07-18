import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_IMMERSIVE_SETTINGS,
  IMMERSIVE_SETTINGS_STORAGE_KEY,
  cycleHudMode,
  normalizeImmersiveSettings,
  loadImmersiveSettings,
  persistImmersiveSettings,
  resolveAutoHideEnabled,
  resolveBaseHudOpacity,
  suggestedChromeCollapseForHudMode,
  createHudVisibilityState,
  revealHud,
  tickHudVisibility,
  hudChromeOpacity,
  shouldShowChromeLayer,
  describeFullscreenLabel,
  isFullscreenShortcut,
  isFullscreenApiAvailable,
  resolveParticleEmitScale,
  shouldCullPropAtDistance,
  togglePhotoMode,
  createPhotoModeState,
  capturePhotoStub,
  toggleRiftlingFocus,
  createCameraEnhanceState,
  listImmersiveControllerStubs,
  createFloatingChipFadeState,
  revealFloatingChip,
  setFloatingChipHeld,
  tickFloatingChipFade,
  floatingChipOpacity,
  resolveFloatingChipFadeEnabled,
  resolveFloatingChipFadedOpacity,
  isLiveWorldPath,
  createSiteNavAutohideState,
  bumpSiteNavActivity,
  setSiteNavHovering,
  setSiteNavPinned,
  tickSiteNavAutohide,
  siteNavChromeVisible,
  LIVE_WORLD_SITE_NAV_HIDE_MS,
} from "@/game/live-world/systems/immersive";

function stubStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
    matchMedia: () => ({ matches: false }),
  });
  return store;
}

describe("Immersive settings", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes invalid values", () => {
    const n = normalizeImmersiveSettings({
      hudMode: "nope" as never,
      hudOpacity: 9,
      autoHideDelayMs: 10,
      minimapSize: 9999,
    });
    expect(n.hudMode).toBe("standard");
    expect(n.hudOpacity).toBe(1);
    expect(n.autoHideDelayMs).toBe(500);
    expect(n.minimapSize).toBe(240);
  });

  it("persists and reloads", () => {
    const store = stubStorage();
    persistImmersiveSettings({
      ...DEFAULT_IMMERSIVE_SETTINGS,
      hudMode: "immersive",
      autoHideHud: true,
    });
    expect(store.get(IMMERSIVE_SETTINGS_STORAGE_KEY)).toContain("immersive");
    expect(loadImmersiveSettings().hudMode).toBe("immersive");
    expect(loadImmersiveSettings().autoHideHud).toBe(true);
  });

  it("cycles HUD modes", () => {
    expect(cycleHudMode("standard")).toBe("minimal");
    expect(cycleHudMode("cinematic")).toBe("standard");
  });

  it("normalizes and persists chrome collapse flags", () => {
    const store = stubStorage();
    persistImmersiveSettings({
      ...DEFAULT_IMMERSIVE_SETTINGS,
      toolbarCollapsed: true,
      presenceHudCollapsed: true,
      townActivityCollapsed: true,
      statusChromeCollapsed: true,
    });
    const loaded = loadImmersiveSettings();
    expect(loaded.toolbarCollapsed).toBe(true);
    expect(loaded.presenceHudCollapsed).toBe(true);
    expect(loaded.townActivityCollapsed).toBe(true);
    expect(loaded.statusChromeCollapsed).toBe(true);
    expect(store.get(IMMERSIVE_SETTINGS_STORAGE_KEY)).toContain("toolbarCollapsed");
  });

  it("suggests peek-tab chrome for immersive modes", () => {
    expect(suggestedChromeCollapseForHudMode("immersive").toolbarCollapsed).toBe(true);
    expect(suggestedChromeCollapseForHudMode("standard").toolbarCollapsed).toBe(false);
  });

  it("forces auto-hide for immersive/cinematic", () => {
    expect(
      resolveAutoHideEnabled({ ...DEFAULT_IMMERSIVE_SETTINGS, hudMode: "immersive" }),
    ).toBe(true);
    expect(
      resolveBaseHudOpacity({ ...DEFAULT_IMMERSIVE_SETTINGS, hudMode: "cinematic" }),
    ).toBe(0);
  });
});

describe("HUD visibility", () => {
  it("reveals then auto-hides after delay", () => {
    const settings = {
      ...DEFAULT_IMMERSIVE_SETTINGS,
      hudMode: "immersive" as const,
      autoHideDelayMs: 1000,
    };
    let state = createHudVisibilityState(0);
    state = revealHud(state, "pointer", 0);
    expect(hudChromeOpacity(state, settings)).toBeGreaterThan(0);
    state = tickHudVisibility(state, settings, 1500);
    expect(state.visible).toBe(false);
    expect(hudChromeOpacity(state, settings)).toBe(0);
  });

  it("minimal mode keeps status/toolbar/chat", () => {
    const settings = { ...DEFAULT_IMMERSIVE_SETTINGS, hudMode: "minimal" as const };
    const state = createHudVisibilityState();
    expect(shouldShowChromeLayer("status", settings, state)).toBe(true);
    expect(shouldShowChromeLayer("minimap", settings, state)).toBe(false);
    expect(shouldShowChromeLayer("chat", settings, state)).toBe(true);
  });
});

describe("Floating HUD chip fade", () => {
  it("forces fade in immersive and stays readable on hover hold", () => {
    const settings = {
      ...DEFAULT_IMMERSIVE_SETTINGS,
      hudMode: "immersive" as const,
      autoHideDelayMs: 1000,
    };
    expect(resolveFloatingChipFadeEnabled(settings)).toBe(true);
    let state = createFloatingChipFadeState(0);
    state = revealFloatingChip(state, 0);
    expect(floatingChipOpacity(state, settings)).toBe(1);
    state = tickFloatingChipFade(state, settings, 1500);
    expect(state.awake).toBe(false);
    expect(floatingChipOpacity(state, settings)).toBe(resolveFloatingChipFadedOpacity(settings));
    expect(floatingChipOpacity(state, settings)).toBeLessThanOrEqual(0.15);

    state = setFloatingChipHeld(state, true, 1600);
    expect(floatingChipOpacity(state, settings)).toBe(1);
  });

  it("leaves standard chips opaque unless auto-hide HUD is on", () => {
    const off = { ...DEFAULT_IMMERSIVE_SETTINGS, hudMode: "standard" as const };
    expect(resolveFloatingChipFadeEnabled(off)).toBe(false);
    expect(floatingChipOpacity(createFloatingChipFadeState(), off)).toBe(1);

    const on = { ...off, autoHideHud: true, autoHideDelayMs: 1000 };
    expect(resolveFloatingChipFadeEnabled(on)).toBe(true);
    let state = revealFloatingChip(createFloatingChipFadeState(0), 0);
    // Standard uses a gentler floor delay (≥3500ms).
    state = tickFloatingChipFade(state, on, 4000);
    expect(floatingChipOpacity(state, on)).toBe(0.15);
  });
});

describe("Live World site nav autohide", () => {
  it("detects live-world routes", () => {
    expect(isLiveWorldPath("/live-world")).toBe(true);
    expect(isLiveWorldPath("/live-world/spectate")).toBe(true);
    expect(isLiveWorldPath("/world")).toBe(false);
  });

  it("hides after idle and stays open while pinned or hovering", () => {
    let state = createSiteNavAutohideState(0);
    state = bumpSiteNavActivity(state, 0);
    expect(siteNavChromeVisible(state, true)).toBe(true);
    state = tickSiteNavAutohide(state, true, LIVE_WORLD_SITE_NAV_HIDE_MS + 100);
    expect(siteNavChromeVisible(state, true)).toBe(false);

    state = setSiteNavHovering(state, true, LIVE_WORLD_SITE_NAV_HIDE_MS + 200);
    expect(siteNavChromeVisible(state, true)).toBe(true);
    state = setSiteNavHovering(state, false, LIVE_WORLD_SITE_NAV_HIDE_MS + 300);
    state = setSiteNavPinned(state, true, LIVE_WORLD_SITE_NAV_HIDE_MS + 400);
    state = tickSiteNavAutohide(state, true, LIVE_WORLD_SITE_NAV_HIDE_MS + 5000);
    expect(siteNavChromeVisible(state, true)).toBe(true);
  });
});

describe("Fullscreen helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("labels enter/exit", () => {
    expect(describeFullscreenLabel(false)).toMatch(/Enter/i);
    expect(describeFullscreenLabel(true)).toMatch(/Exit/i);
  });

  it("detects F11 and Alt+Enter shortcuts", () => {
    expect(
      isFullscreenShortcut({
        code: "F11",
        key: "F11",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      }),
    ).toBe("f11");
    expect(
      isFullscreenShortcut({
        code: "Enter",
        key: "Enter",
        altKey: true,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      }),
    ).toBe("alt-enter");
  });

  it("reports API availability without throwing", () => {
    expect(typeof isFullscreenApiAvailable()).toBe("boolean");
  });
});

describe("Performance + photo + camera stubs", () => {
  it("scales particles for minimal budget", () => {
    const scale = resolveParticleEmitScale({
      particleBudget: "minimal",
      performanceCull: true,
      hudMode: "immersive",
    });
    expect(scale.density).toBeLessThan(0.5);
    expect(scale.cullDistant).toBe(true);
    expect(shouldCullPropAtDistance(1200, { performanceCull: true })).toBe(true);
  });

  it("toggles photo mode and captures stub shot", () => {
    const next = togglePhotoMode(createPhotoModeState(), 100);
    expect(next.active).toBe(true);
    const shot = capturePhotoStub("riftwild-commons", 100);
    expect(shot.ok).toBe(true);
    expect(shot.shotId).toContain("riftwild-commons");
  });

  it("toggles riftling focus and lists controller stubs", () => {
    const focused = toggleRiftlingFocus(createCameraEnhanceState());
    expect(focused.focus).toBe("riftling");
    expect(listImmersiveControllerStubs().length).toBeGreaterThan(3);
  });
});
