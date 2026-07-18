"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createLiveWorldBridge,
  destroyLiveWorldBridge,
  type LiveWorldBridge,
} from "@/game/live-world/bridge";
import type {
  DialoguePayload,
  InteractPrompt,
  WorldHudStatus,
} from "@/game/live-world/types";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { LiveWorldGameCanvas } from "@/components/live-world/game-canvas";
import { LiveWorldLoadingScreen } from "@/components/live-world/loading-screen";
import { LiveWorldStatusBar } from "@/components/live-world/status-bar";
import { LiveWorldDialogueOverlay } from "@/components/live-world/dialogue-overlay";
import { LiveWorldMobileControls } from "@/components/live-world/mobile-controls";
import { WorldClockChip } from "@/components/live-world/world-clock-chip";
import { LiveWorldMinimap } from "@/components/live-world/minimap";
import { LiveWorldMapOverlay } from "@/components/live-world/world-map-overlay";
import { LiveWorldChatPanel } from "@/components/live-world/chat-panel";
import { LiveWorldInteractionMenu } from "@/components/live-world/interaction-menu";
import { LiveWorldEquipmentPanel } from "@/components/live-world/equipment-panel";
import { LiveWorldEmoteWheel } from "@/components/live-world/emote-wheel";
import { LiveWorldEmotePanel } from "@/components/live-world/emote-panel";
import { LiveWorldEmoteConsentToast } from "@/components/live-world/emote-consent-toast";
import { LiveWorldPauseMenu } from "@/components/live-world/pause-menu";
import {
  LiveWorldLogoutModal,
  type LogoutPreview,
} from "@/components/live-world/logout-modal";
import { KeybindsPanel } from "@/components/live-world/keybinds-panel";
import {
  commitLogout,
  previewLogout,
} from "@/game/live-world/persistence/server-sync";
import { LiveWorldCameraZoomControls } from "@/components/live-world/camera-zoom-controls";
import { FullscreenToggleButton } from "@/components/live-world/fullscreen-toggle-button";
import { ImmersiveSettingsPanel } from "@/components/live-world/immersive-settings-panel";
import { LiveWorldToolbar } from "@/components/live-world/live-world-toolbar";
import { HudLayer } from "@/components/live-world/hud-layer";
import { MapGoalsPanel } from "@/components/map-goals/map-goals-panel";
import { CreditsBalanceChip } from "@/components/credits/credits-balance-chip";
import { SocialPresenceHud } from "@/components/live-world/social-presence-hud";
import { TownActivityPanel } from "@/components/live-world/town-activity-panel";
import { FeaturedPlayerBanner } from "@/components/live-world/featured-player-banner";
import {
  minimapUsesTopRightStack,
  topRightHudStackClass,
  townActivityUsesTopRightStack,
} from "@/components/live-world/hud-slots";
import { getInputManager } from "@/game/live-world/input/input-manager";
import { cycleHudMode } from "@/game/live-world/systems/immersive/settings";
import type {
  HudPanelId,
  HudPanelPosition,
} from "@/game/live-world/systems/immersive/types";
import { isFullscreenShortcut } from "@/game/live-world/systems/immersive/fullscreen";
import { capturePhotoStub } from "@/game/live-world/systems/immersive/photo-mode";
import { useImmersiveSettings } from "@/hooks/use-immersive-settings";
import { useLiveWorldFullscreen } from "@/hooks/use-live-world-fullscreen";
import { useHudAutoHide } from "@/hooks/use-hud-auto-hide";
import { useSocialPresence } from "@/hooks/use-social-presence";
import { useWorldEvents } from "@/hooks/use-world-events";
import { HappeningNowBanner } from "@/components/live-world/happening-now-banner";
import { playSfx } from "@/hooks/use-sfx";
import { startMenuAmbient, stopAmbient } from "@/lib/audio/ambient";
import { playMenuMusic } from "@/lib/audio/music";

type Props = {
  playable: boolean;
};

export function LiveWorldShell({ playable }: Props) {
  const router = useRouter();
  const hostRef = useRef<HTMLElement | null>(null);
  const photoModeRef = useRef(false);
  const displaySettingsRef = useRef(false);
  const [entered, setEntered] = useState(false);
  const [bridge, setBridge] = useState<LiveWorldBridge | null>(null);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<WorldHudStatus | null>(null);
  const [dialogue, setDialogue] = useState<DialoguePayload | null>(null);
  const [prompt, setPrompt] = useState<InteractPrompt>({
    label: "",
    visible: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutPreview, setLogoutPreview] = useState<LogoutPreview | null>(null);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [showMapGoals, setShowMapGoals] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [riftlingFocused, setRiftlingFocused] = useState(false);
  const [photoToast, setPhotoToast] = useState<string | null>(null);
  photoModeRef.current = photoMode;
  displaySettingsRef.current = showDisplaySettings;

  const { settings, update: updateSettings, replace: replaceSettings } =
    useImmersiveSettings();
  const { reveal, opacity: hudOpacity, show: showLayer } = useHudAutoHide(settings);

  const setPanelPosition = useCallback(
    (id: HudPanelId, position: HudPanelPosition) => {
      updateSettings((prev) => ({
        hudPanelLayout: { ...prev.hudPanelLayout, [id]: position },
      }));
      reveal("manual");
    },
    [updateSettings, reveal],
  );

  const fullscreen = useLiveWorldFullscreen({
    targetRef: hostRef,
    preference: settings.windowModePreference,
    onPreferenceChange: (pref) => updateSettings({ windowModePreference: pref }),
  });

  const socialPresence = useSocialPresence({
    enabled: entered && playable && featureFlagDefaults.SOCIAL_PRESENCE_ENABLED,
    regionSlug: "riftwild-commons",
    locationId: "commons-plaza",
    restZoneKind: "town_plaza",
  });

  const worldEvents = useWorldEvents({
    enabled: entered && playable && featureFlagDefaults.LIVE_WORLD_EVENTS_ENABLED,
  });

  const mobileEnabled = featureFlagDefaults.LIVE_WORLD_MOBILE_CONTROLS_ENABLED;
  const spectatorEnabled = featureFlagDefaults.LIVE_WORLD_SPECTATOR_MODE_ENABLED;
  const mapGoalsEnabled = featureFlagDefaults.MAP_GOALS_ENABLED;

  // Expand only while actively fullscreen or using viewport-expand fallback.
  const expandedViewport = fullscreen.active;

  const toggleFullscreen = useCallback(() => {
    void fullscreen.toggle();
    reveal("manual");
  }, [fullscreen, reveal]);

  const beginLogoutFlow = useCallback(async () => {
    const pose = bridge?.playerPose.get();
    if (!pose) return;
    setLogoutBusy(true);
    const preview = await previewLogout({
      mapId: pose.regionSlug,
      x: Math.round(pose.x),
      y: Math.round(pose.y),
    });
    setLogoutBusy(false);
    if (!preview) {
      // Offline fallback — treat commons plaza as safe if unknown
      setLogoutPreview({
        safe: false,
        warning:
          "Could not reach save server. Logging out will use your last local checkpoint when available.",
        countdownMs: 5000,
        zone: null,
      });
    } else {
      setLogoutPreview(preview);
    }
    setLogoutOpen(true);
    reveal("menu");
  }, [bridge, reveal]);

  const confirmLogout = useCallback(async () => {
    if (logoutBusy) return;
    const pose = bridge?.playerPose.get();
    if (!pose || !logoutPreview) return;
    setLogoutBusy(true);
    const mode = logoutPreview.safe ? "safe" : "unsafe";
    await commitLogout({
      mapId: pose.regionSlug,
      x: Math.round(pose.x),
      y: Math.round(pose.y),
      mode,
    });
    setLogoutBusy(false);
    setLogoutOpen(false);
    setLogoutPreview(null);
    void fullscreen.exit();
    stopAmbient(400);
    void startMenuAmbient(800);
    void playMenuMusic(900);
    setEntered(false);
    setReady(false);
    setProgress(0);
    setPhotoMode(false);
  }, [bridge, logoutPreview, logoutBusy, fullscreen]);

  const cycleHud = useCallback(() => {
    const next = cycleHudMode(settings.hudMode);
    updateSettings({ hudMode: next });
    bridge?.setCinematicMode(next === "cinematic");
    reveal("manual");
  }, [settings.hudMode, updateSettings, bridge, reveal]);

  const togglePhoto = useCallback(() => {
    setPhotoMode((prev) => {
      const next = !prev;
      bridge?.setPhotoMode(next);
      if (next) {
        updateSettings({ hudMode: "cinematic" });
        bridge?.setCinematicMode(true);
        const shot = capturePhotoStub(status?.mapName ?? "world");
        setPhotoToast(shot.note);
        window.setTimeout(() => setPhotoToast(null), 2200);
      } else {
        bridge?.setCinematicMode(settings.hudMode === "cinematic");
      }
      return next;
    });
    reveal("manual");
  }, [bridge, reveal, status?.mapName, updateSettings, settings.hudMode]);

  const toggleRiftlingFocus = useCallback(() => {
    setRiftlingFocused((prev) => {
      const next = !prev;
      bridge?.queueCameraFocus(next ? "riftling" : "player");
      return next;
    });
    reveal("manual");
  }, [bridge, reveal]);

  const actionsRef = useRef({
    toggleFullscreen,
    cycleHud,
    toggleRiftlingFocus,
    togglePhoto,
    reveal,
    fullscreenToggle: fullscreen.toggle,
  });
  actionsRef.current = {
    toggleFullscreen,
    cycleHud,
    toggleRiftlingFocus,
    togglePhoto,
    reveal,
    fullscreenToggle: fullscreen.toggle,
  };

  useEffect(() => {
    if (!entered || !playable) return;
    const next = createLiveWorldBridge();
    setBridge(next);
    const input = getInputManager();
    input.attach();
    const unsub = input.subscribe(() => {
      const a = actionsRef.current;
      if (input.wasJustPressed("help")) {
        playSfx("ui.nav");
        router.push("/academy");
        return;
      }
      if (input.wasJustPressed("toggleFullscreen")) {
        void a.fullscreenToggle();
        a.reveal("key");
        return;
      }
      if (input.wasJustPressed("cycleHudMode")) {
        a.cycleHud();
        return;
      }
      if (input.wasJustPressed("focusRiftling")) {
        a.toggleRiftlingFocus();
        return;
      }
      if (input.wasJustPressed("togglePhotoMode")) {
        a.togglePhoto();
        return;
      }
      if (input.wasJustPressed("settings")) {
        setShowPause(false);
        setShowDisplaySettings(false);
        setShowSettings((v) => {
          const nextOpen = !v;
          if (nextOpen) input.setActivePanel("settings");
          else input.closePanel();
          return nextOpen;
        });
        a.reveal("menu");
      }
      if (input.peekJustPressed("escape")) {
        if (photoModeRef.current) {
          setPhotoMode(false);
          next.setPhotoMode(false);
          a.reveal("menu");
          return;
        }
        const panel = input.getActivePanel();
        if (panel === "equipment") {
          next.closeEquipmentPanel();
          playSfx("ui.modal_close");
          return;
        }
        if (displaySettingsRef.current) {
          setShowDisplaySettings(false);
          input.closePanel();
          return;
        }
        if (panel === "settings") {
          setShowSettings(false);
          input.closePanel();
          return;
        }
        if (!panel || panel === "pause") {
          setShowPause((v) => {
            const nextOpen = !v;
            if (nextOpen) input.setActivePanel("pause");
            else input.closePanel();
            return nextOpen;
          });
          a.reveal("menu");
        }
      } else if (
        input.peekJustPressed("moveUp") ||
        input.peekJustPressed("moveDown") ||
        input.peekJustPressed("interact") ||
        input.peekJustPressed("openChat")
      ) {
        a.reveal("key");
      }
    });
    return () => {
      unsub();
      input.detach();
      destroyLiveWorldBridge(next);
      setBridge(null);
    };
  }, [entered, playable, router]);

  // F11 is often browser-owned — sync HUD reveal after the browser toggles.
  // Alt+Enter / F are handled by keybinds (toggleFullscreen) to avoid double-toggle.
  useEffect(() => {
    if (!entered) return;
    const onKey = (e: KeyboardEvent) => {
      if (isFullscreenShortcut(e) === "f11") {
        window.setTimeout(() => reveal("key"), 50);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [entered, reveal]);

  useEffect(() => {
    if (!bridge) return;
    const unsubs = [
      bridge.ready.subscribe(setReady),
      bridge.loadingProgress.subscribe(setProgress),
      bridge.status.subscribe(setStatus),
      bridge.dialogue.subscribe((d) => {
        setDialogue(d);
        if (d) reveal("quest");
      }),
      bridge.interactPrompt.subscribe(setPrompt),
      bridge.navigateRequest.subscribe((path) => {
        if (!path) return;
        bridge.navigateRequest.set(null);
        playSfx("ui.nav");
        router.push(path);
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [bridge, router, reveal]);

  /** Hydrate companion cosmetic layers from server loadout when the scene is ready. */
  useEffect(() => {
    if (!bridge || !ready) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/pets/live-companion/equipment", {
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.appearance) {
          bridge.setPetAppearance(data.appearance);
        }
      } catch {
        /* offline / demo — layers stay empty until equip */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bridge, ready]);

  // Exit fullscreen when leaving the world so users are never trapped
  const exitFullscreen = fullscreen.exit;
  useEffect(() => {
    if (entered) return;
    void exitFullscreen();
  }, [entered, exitFullscreen]);

  const statusFallback = useMemo<WorldHudStatus>(
    () => ({
      connection: "loading",
      mapName: "Riftwild Commons",
      instanceLabel: "Local solo",
      playerLabel: "Keeper",
      petLabel: "Companion",
      hint: "Preparing…",
    }),
    [],
  );

  if (!playable) {
    return (
      <section className="panel p-8 text-center">
        <p className="font-display text-2xl text-white">Live World paused</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          `PLAYABLE_LIVE_WORLD_ENABLED` is off. Enable the flag to enter the browser world.
        </p>
      </section>
    );
  }

  if (!entered) {
    return (
      <section className="panel relative overflow-hidden p-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(61,231,255,0.18),transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(155,123,255,0.12),transparent_45%),linear-gradient(160deg,#0a0a0f,#12121c)]" />
        <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
          <p className="page-kicker">Playable habitat</p>
          <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
            Riftwild Commons
          </h2>
          <p className="mt-3 max-w-lg text-sm text-[var(--text-muted)] md:text-base">
            Step into the shared plaza. Control your Keeper, walk with your companion, and talk to
            Keepers — not a livestream.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="btn-primary focus-ring"
              onClick={() => {
                playSfx("world.portal");
                playSfx("event.stinger");
                stopAmbient(300);
                setEntered(true);
              }}
            >
              ENTER THE LIVE WORLD
            </button>
            {spectatorEnabled ? (
              <Link href="/live-world/spectate" className="btn-secondary focus-ring">
                Spectator view
              </Link>
            ) : (
              <span className="text-xs text-[var(--text-dim)]">
                Spectator mode off by default
              </span>
            )}
            <Link href="/settings/audio" className="btn-secondary focus-ring text-xs">
              Audio
            </Link>
            <Link href="/settings/keybinds" className="btn-secondary focus-ring text-xs">
              Keybinds
            </Link>
            <Link href="/academy" className="btn-secondary focus-ring text-xs">
              Academy / Help
            </Link>
          </div>
          <p className="mt-6 text-[11px] text-[var(--text-dim)]">
            WASD / arrows · Shift sprint · E interact · T emotes · F fullscreen · U HUD · Y focus
            companion · N photo · F1 Help · Esc menu · M map · Enter chat · scroll / +− zoom
          </p>
        </div>
      </section>
    );
  }

  const hostClass = expandedViewport
    ? "fixed inset-0 z-[80] bg-[#0a101c]"
    : "panel relative overflow-hidden p-0";

  const canvasWrapClass = expandedViewport
    ? "relative h-full w-full bg-[#0a101c]"
    : "relative h-[min(72vh,720px)] min-h-[420px] w-full bg-[#0a101c]";

  return (
    <section
      ref={(el) => {
        hostRef.current = el;
      }}
      className={hostClass}
      data-testid="live-world-host"
      data-display-mode={fullscreen.displayMode}
      data-hud-mode={settings.hudMode}
      onMouseMove={() => reveal("pointer")}
      onPointerDown={() => reveal("pointer")}
    >
      <div className={canvasWrapClass}>
        {bridge ? <LiveWorldGameCanvas bridge={bridge} className="absolute inset-0" /> : null}
        <LiveWorldLoadingScreen progress={progress} visible={!ready} />

        {!photoMode ? (
          <>
            {showLayer("status") ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
                <LiveWorldStatusBar
                  status={status ?? statusFallback}
                  collapsed={settings.statusChromeCollapsed}
                  onCollapsedChange={(statusChromeCollapsed) => {
                    updateSettings({ statusChromeCollapsed });
                    reveal("manual");
                  }}
                  reserveTopRight
                />
                <WorldClockChip
                  regionSlug={(status ?? statusFallback).mapName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}
                />
                <HappeningNowBanner
                  view={worldEvents.view}
                  onParticipate={(action) => {
                    void worldEvents.participate(action, ["MOVE", "INTERACT"]);
                    reveal("manual");
                  }}
                />
                {worldEvents.toast ? (
                  <p className="pointer-events-none absolute left-1/2 top-36 z-30 -translate-x-1/2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">
                    {worldEvents.toast}
                  </p>
                ) : null}
                <FeaturedPlayerBanner featured={socialPresence.featured} />
                <SocialPresenceHud
                  snapshot={socialPresence.snapshot}
                  toast={socialPresence.toast}
                  onClaimIdle={() => void socialPresence.claimIdle()}
                  onQuickAction={(kind) => {
                    const signal =
                      kind === "WAVE" || kind === "DANCE" || kind === "SIT"
                        ? "EMOTE"
                        : "INTERACT";
                    void socialPresence.recordAction(kind, signal);
                    reveal("manual");
                  }}
                  collapsed={settings.presenceHudCollapsed}
                  onCollapsedChange={(presenceHudCollapsed) => {
                    updateSettings({ presenceHudCollapsed });
                    reveal("manual");
                  }}
                  panelLayout={settings.hudPanelLayout}
                  onPanelPositionChange={(pos) => setPanelPosition("presence", pos)}
                />
              </HudLayer>
            ) : null}

            {/* Top-right column: minimap (TR) + world pulse / popular hubs — no overlap */}
            {(showLayer("status") && townActivityUsesTopRightStack(settings)) ||
            (bridge &&
              showLayer("minimap") &&
              minimapUsesTopRightStack(settings)) ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
                <div
                  className={topRightHudStackClass(settings.statusChromeCollapsed)}
                  data-testid="live-world-top-right-stack"
                >
                  {bridge &&
                  showLayer("minimap") &&
                  minimapUsesTopRightStack(settings) ? (
                    <LiveWorldMinimap
                      bridge={bridge}
                      settings={settings}
                      onSettingsPatch={updateSettings}
                      stacked
                      panelLayout={settings.hudPanelLayout}
                      onPanelPositionChange={(pos) => setPanelPosition("minimap", pos)}
                    />
                  ) : null}
                  {showLayer("status") && townActivityUsesTopRightStack(settings) ? (
                    <TownActivityPanel
                      snapshot={socialPresence.snapshot}
                      compact
                      stacked
                      collapsed={settings.townActivityCollapsed}
                      onCollapsedChange={(townActivityCollapsed) => {
                        updateSettings({ townActivityCollapsed });
                        reveal("manual");
                      }}
                      panelLayout={settings.hudPanelLayout}
                      onPanelPositionChange={(pos) =>
                        setPanelPosition("townActivity", pos)
                      }
                    />
                  ) : null}
                </div>
              </HudLayer>
            ) : null}

            {showLayer("status") && !townActivityUsesTopRightStack(settings) ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
                <TownActivityPanel
                  snapshot={socialPresence.snapshot}
                  compact
                  collapsed={settings.townActivityCollapsed}
                  onCollapsedChange={(townActivityCollapsed) => {
                    updateSettings({ townActivityCollapsed });
                    reveal("manual");
                  }}
                  panelLayout={settings.hudPanelLayout}
                  onPanelPositionChange={(pos) =>
                    setPanelPosition("townActivity", pos)
                  }
                />
              </HudLayer>
            ) : null}

            {bridge ? (
              <>
                {showLayer("minimap") && !minimapUsesTopRightStack(settings) ? (
                  <HudLayer opacity={hudOpacity} settings={settings}>
                    <LiveWorldMinimap
                      bridge={bridge}
                      settings={settings}
                      onSettingsPatch={updateSettings}
                      panelLayout={settings.hudPanelLayout}
                      onPanelPositionChange={(pos) => setPanelPosition("minimap", pos)}
                    />
                  </HudLayer>
                ) : null}
                <LiveWorldMapOverlay bridge={bridge} />
                {showLayer("chat") ? (
                  <HudLayer opacity={hudOpacity} settings={settings}>
                    <LiveWorldChatPanel
                      bridge={bridge}
                      chatMode={settings.chatMode}
                      onRevealHud={() => reveal("message")}
                      panelLayout={settings.hudPanelLayout}
                      onPanelPositionChange={(pos) => setPanelPosition("chat", pos)}
                    />
                  </HudLayer>
                ) : null}
                <LiveWorldInteractionMenu bridge={bridge} />
                <LiveWorldEquipmentPanel bridge={bridge} />
                <LiveWorldEmoteWheel bridge={bridge} />
                <LiveWorldEmotePanel bridge={bridge} />
                <LiveWorldEmoteConsentToast bridge={bridge} />
                <LiveWorldMobileControls bridge={bridge} enabled={mobileEnabled} />
                {showLayer("zoom") ? (
                  <HudLayer opacity={hudOpacity} settings={settings}>
                    <LiveWorldCameraZoomControls bridge={bridge} />
                  </HudLayer>
                ) : null}
                <LiveWorldDialogueOverlay
                  dialogue={dialogue}
                  prompt={prompt}
                  bridge={bridge}
                  onAdvance={() => bridge.advanceDialogue()}
                />
              </>
            ) : null}

            {showLayer("toolbar") ? (
              <LiveWorldToolbar
                fullscreenActive={fullscreen.active}
                onToggleFullscreen={toggleFullscreen}
                hudMode={settings.hudMode}
                onCycleHud={cycleHud}
                onOpenDisplaySettings={() => {
                  setShowPause(false);
                  setShowDisplaySettings(true);
                  getInputManager().setActivePanel("settings");
                  reveal("menu");
                }}
                photoMode={photoMode}
                onTogglePhoto={togglePhoto}
                riftlingFocused={riftlingFocused}
                onToggleRiftlingFocus={toggleRiftlingFocus}
                opacity={hudOpacity}
                collapsed={settings.toolbarCollapsed}
                onCollapsedChange={(toolbarCollapsed) => {
                  updateSettings({ toolbarCollapsed });
                  reveal("manual");
                }}
                panelLayout={settings.hudPanelLayout}
                onPanelPositionChange={(pos) => setPanelPosition("toolbar", pos)}
              />
            ) : null}
          </>
        ) : (
          <div className="pointer-events-auto absolute inset-x-0 top-3 z-40 flex justify-center">
            <button
              type="button"
              className="btn-secondary focus-ring text-xs"
              onClick={togglePhoto}
            >
              Exit photo mode (Esc / N)
            </button>
          </div>
        )}

        {photoToast ? (
          <p className="pointer-events-none absolute bottom-20 left-1/2 z-50 -translate-x-1/2 rounded bg-black/70 px-3 py-1 text-[11px] text-[var(--text-muted)]">
            {photoToast}
          </p>
        ) : null}

        <LiveWorldPauseMenu
          open={showPause}
          onClose={() => {
            setShowPause(false);
            getInputManager().closePanel();
          }}
          onOpenKeybinds={() => {
            setShowSettings(true);
            getInputManager().setActivePanel("settings");
          }}
          onOpenDisplaySettings={() => {
            setShowDisplaySettings(true);
            getInputManager().setActivePanel("settings");
          }}
          fullscreenActive={fullscreen.active}
          onToggleFullscreen={toggleFullscreen}
          onExitWorld={() => {
            void fullscreen.exit();
            stopAmbient(400);
            void startMenuAmbient(800);
            void playMenuMusic(900);
            setEntered(false);
            setReady(false);
            setProgress(0);
            setPhotoMode(false);
          }}
          onLogout={() => {
            void beginLogoutFlow();
          }}
        />

        <LiveWorldLogoutModal
          open={logoutOpen}
          preview={logoutPreview}
          busy={logoutBusy}
          onCancel={() => {
            setLogoutOpen(false);
            setLogoutPreview(null);
          }}
          onConfirm={() => {
            void confirmLogout();
          }}
        />

        {showDisplaySettings ? (
          <ImmersiveSettingsPanel
            settings={settings}
            onChange={updateSettings}
            onReplace={replaceSettings}
            fullscreenActive={fullscreen.active}
            onToggleFullscreen={toggleFullscreen}
            onClose={() => {
              setShowDisplaySettings(false);
              getInputManager().closePanel();
            }}
          />
        ) : null}

        {showSettings ? (
          <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="max-h-[90%] w-full max-w-xl overflow-auto rounded-lg border border-[var(--border)] bg-[#0c1420] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-display text-lg text-white">Keybinds</h3>
                <div className="flex gap-2">
                  <FullscreenToggleButton
                    active={fullscreen.active}
                    onToggle={toggleFullscreen}
                    compact
                  />
                  <button
                    type="button"
                    className="btn-secondary focus-ring text-xs"
                    onClick={() => {
                      setShowSettings(false);
                      getInputManager().closePanel();
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
              <KeybindsPanel compact />
            </div>
          </div>
        ) : null}

        {mapGoalsEnabled && showMapGoals && !photoMode ? (
          <div className="pointer-events-auto absolute bottom-14 left-3 z-30 max-h-[50%] w-[min(100%-1.5rem,22rem)] overflow-auto md:bottom-auto md:left-auto md:right-3 md:top-14">
            <MapGoalsPanel starterOnly />
          </div>
        ) : null}

        {!photoMode && showLayer("credits") ? (
          <HudLayer
            opacity={hudOpacity}
            settings={settings}
            className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2 md:left-auto md:right-3 md:top-3 md:bottom-auto"
          >
            {featureFlagDefaults.CREDITS_LEDGER_ENABLED ? (
              <div className="pointer-events-auto">
                <CreditsBalanceChip />
              </div>
            ) : null}
            {mapGoalsEnabled ? (
              <button
                type="button"
                className="btn-secondary focus-ring pointer-events-auto text-xs"
                onClick={() => {
                  playSfx("ui.click");
                  setShowMapGoals((v) => !v);
                  reveal("manual");
                }}
              >
                {showMapGoals ? "Hide goals" : "Map goals"}
              </button>
            ) : null}
            <FullscreenToggleButton
              active={fullscreen.active}
              onToggle={toggleFullscreen}
              compact
            />
            <button
              type="button"
              className="btn-secondary focus-ring pointer-events-auto text-xs"
              onClick={() => {
                playSfx("ui.click");
                void fullscreen.exit();
                stopAmbient(400);
                void startMenuAmbient(800);
                void playMenuMusic(900);
                setEntered(false);
                setReady(false);
                setProgress(0);
                setPhotoMode(false);
              }}
            >
              Exit world
            </button>
          </HudLayer>
        ) : null}
      </div>
    </section>
  );
}
