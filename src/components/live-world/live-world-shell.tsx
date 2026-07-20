"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
import { getCompanionSpeciesSlug, setCompanionSpeciesSlug } from "@/lib/audio/riftling-cries";
import { LiveWorldGameCanvas } from "@/components/live-world/game-canvas";
import { LiveWorldLoadingScreen } from "@/components/live-world/loading-screen";
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
import { SocialPresenceHud } from "@/components/live-world/social-presence-hud";
import { WorldPulsePanel } from "@/components/live-world/world-pulse-panel";
import { RightColumnHud } from "@/components/live-world/right-column-hud";
import { VitalOrbs } from "@/components/live-world/vital-orbs";
import { ActionHotbar, type HotbarActionId } from "@/components/live-world/action-hotbar";
import { WorldRadialMenu } from "@/components/live-world/world-radial-menu";
import { FeaturedPlayerBanner } from "@/components/live-world/featured-player-banner";
import { TopCommandBar } from "@/components/live-world/top-command-bar";
import { PlayerStatusDock } from "@/components/live-world/player-status-dock";
import { HudFxLayer, emitHudFx } from "@/components/live-world/hud-fx-layer";
import {
  bottomCenterVitalsDockClass,
  bottomLeftHudStackClass,
  bottomRightRadialClass,
  chatUsesBottomLeftStack,
  interactPromptDockClass,
  midLeftHudStackClass,
  minimapUsesTopRightStack,
  presenceUsesBottomLeftStack,
  rightColumnHudStackClass,
  townActivityUsesMidLeftStack,
  worldClockDockClass,
} from "@/components/live-world/hud-slots";
import { getInputManager } from "@/game/live-world/input/input-manager";
import { cycleHudMode } from "@/game/live-world/systems/immersive/settings";
import type {
  HudPanelId,
  HudPanelPosition,
} from "@/game/live-world/systems/immersive/types";
import { isFullscreenShortcut } from "@/game/live-world/systems/immersive/fullscreen";
import { resolveLiveWorldDisplayLayout } from "@/game/live-world/systems/immersive/display-layout";
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

  const revealHudMessage = useCallback(() => {
    reveal("message");
  }, [reveal]);

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
    // Seed hatch species before Phaser Boot so the follower spawns with correct art.
    next.setCompanionSpeciesSlug(getCompanionSpeciesSlug());
    setBridge(next);
    const input = getInputManager();
    input.attach();
    const unsub = input.subscribe(() => {
      const a = actionsRef.current;
      if (input.wasJustPressed("help")) {
        playSfx("ui.nav");
        router.push("/help");
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
        // Chat panel collapses to peek on Escape; do not open pause.
        if (panel === "chat") {
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
        if (d) {
          // Dialogue freezes scene movement — never leave chat input stealing keys.
          getInputManager().setTypingFocused(false);
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          reveal("quest");
        }
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

  /**
   * Hydrate companion species (hatch art) + cosmetic layers when the scene is ready.
   * Species comes from owned pets / local hatch persist — never from ambient village props.
   */
  useEffect(() => {
    if (!bridge || !ready) return;
    let cancelled = false;
    void (async () => {
      try {
        const petsRes = await fetch("/api/pets", { credentials: "include" });
        const petsData = (await petsRes.json()) as {
          pets?: Array<{ speciesSlug?: string }>;
        };
        if (!cancelled && petsRes.ok && Array.isArray(petsData.pets)) {
          const slug = petsData.pets.find((p) => typeof p.speciesSlug === "string")
            ?.speciesSlug;
          if (slug) {
            setCompanionSpeciesSlug(slug);
            bridge.setCompanionSpeciesSlug(slug);
          }
        }
      } catch {
        /* guest / offline — fall back to localStorage hatch slug */
      }
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
        <Image
          src="/assets/live-world/commons-entry.png?v=lw2"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          unoptimized
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(61,231,255,0.12),transparent_50%),linear-gradient(160deg,rgba(10,10,15,0.82),rgba(18,18,28,0.78))]"
          aria-hidden
        />
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
            <Link href="/help" className="btn-secondary focus-ring text-xs">
              Help
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

  const { hostClass, canvasWrapClass } = resolveLiveWorldDisplayLayout(expandedViewport);

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
      <div className={canvasWrapClass} data-testid="live-world-canvas-wrap">
        {bridge ? (
          <LiveWorldGameCanvas bridge={bridge} className="absolute inset-0 z-0" />
        ) : null}
        <LiveWorldLoadingScreen progress={progress} visible={!ready} />

        {!photoMode ? (
          <>
            {/* Unified top Reliquary command bar */}
            {showLayer("status") || showLayer("credits") ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
                <TopCommandBar
                  status={status ?? statusFallback}
                  fullscreenActive={fullscreen.active}
                  onToggleFullscreen={toggleFullscreen}
                  onOpenMenu={() => {
                    setShowPause(true);
                    getInputManager().setActivePanel("pause");
                    reveal("menu");
                  }}
                  mapGoalsEnabled={mapGoalsEnabled}
                  showMapGoals={showMapGoals}
                  onToggleMapGoals={() => {
                    setShowMapGoals((v) => !v);
                    reveal("manual");
                  }}
                  notificationCount={worldEvents.toast ? 1 : 0}
                />
                {worldEvents.toast ? (
                  <p className="pointer-events-none absolute left-1/2 top-[4.5rem] z-30 -translate-x-1/2 rounded-lg border border-[var(--lw-trim)] bg-black/75 px-2.5 py-1 text-[10px] text-white shadow-[0_0_16px_var(--lw-glow-amber)]">
                    {worldEvents.toast}
                  </p>
                ) : null}
                <div
                  className="pointer-events-none absolute left-1/2 top-[4.25rem] z-30 flex w-[min(18rem,calc(100%-10rem))] -translate-x-1/2 flex-col items-center gap-1.5 md:top-[4.75rem]"
                  data-testid="live-world-top-center"
                >
                  <HappeningNowBanner
                    view={worldEvents.view}
                    stacked
                    onParticipate={(action) => {
                      void worldEvents.participate(action, ["MOVE", "INTERACT"]);
                      reveal("manual");
                    }}
                  />
                </div>
                <FeaturedPlayerBanner featured={socialPresence.featured} />
              </HudLayer>
            ) : null}

            {/* Mid-left: World Pulse event list */}
            {showLayer("status") && townActivityUsesMidLeftStack(settings) ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
                <div
                  className={midLeftHudStackClass(true)}
                  data-testid="live-world-mid-left-stack"
                >
                  <WorldPulsePanel
                    worldEvents={worldEvents.view}
                    snapshot={socialPresence.snapshot}
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
                </div>
              </HudLayer>
            ) : null}

            {showLayer("status") && !townActivityUsesMidLeftStack(settings) ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
                <WorldPulsePanel
                  worldEvents={worldEvents.view}
                  snapshot={socialPresence.snapshot}
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

            {/* Keep clock mounted for weather audio sync; weather line also in status bar */}
            <div className="sr-only" aria-hidden>
              <WorldClockChip
                regionSlug={(status ?? statusFallback).mapName
                  .toLowerCase()
                  .replace(/\s+/g, "-")}
                className={worldClockDockClass(settings)}
              />
            </div>

            {/* Bottom-left: presence peek + chat (coordinate with concurrent stacking work) */}
            {(showLayer("status") && presenceUsesBottomLeftStack(settings)) ||
            (bridge && showLayer("chat") && chatUsesBottomLeftStack(settings)) ? (
              <div
                className={bottomLeftHudStackClass()}
                data-testid="live-world-bottom-left-stack"
              >
                {showLayer("status") && presenceUsesBottomLeftStack(settings) ? (
                  <HudLayer opacity={hudOpacity} settings={settings}>
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
                      stacked
                      panelLayout={settings.hudPanelLayout}
                      onPanelPositionChange={(pos) => setPanelPosition("presence", pos)}
                    />
                  </HudLayer>
                ) : null}
                {bridge && showLayer("chat") && chatUsesBottomLeftStack(settings) ? (
                  <HudLayer opacity={hudOpacity} settings={settings}>
                    <LiveWorldChatPanel
                      bridge={bridge}
                      chatMode={settings.chatMode}
                      onChatModeChange={(chatMode) => updateSettings({ chatMode })}
                      onRevealHud={revealHudMessage}
                      stacked
                      panelLayout={settings.hudPanelLayout}
                      onPanelPositionChange={(pos) => setPanelPosition("chat", pos)}
                    />
                  </HudLayer>
                ) : null}
              </div>
            ) : null}

            {showLayer("status") && !presenceUsesBottomLeftStack(settings) ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
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

            {/* Right column: minimap → nearby → daily tasks → social status */}
            {(showLayer("status") ||
              (bridge && showLayer("minimap") && minimapUsesTopRightStack(settings))) ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
                <div
                  className={rightColumnHudStackClass(true)}
                  data-testid="live-world-right-column-stack"
                >
                  <RightColumnHud
                    snapshot={socialPresence.snapshot}
                    nearbyOpen={settings.nearbyDrawerOpen}
                    onNearbyOpenChange={(nearbyDrawerOpen) => {
                      updateSettings({ nearbyDrawerOpen });
                      reveal("manual");
                    }}
                    minimap={
                      bridge &&
                      showLayer("minimap") &&
                      minimapUsesTopRightStack(settings) ? (
                        <LiveWorldMinimap
                          bridge={bridge}
                          settings={settings}
                          onSettingsPatch={updateSettings}
                          stacked
                          panelLayout={settings.hudPanelLayout}
                          onPanelPositionChange={(pos) =>
                            setPanelPosition("minimap", pos)
                          }
                        />
                      ) : null
                    }
                  />
                </div>
              </HudLayer>
            ) : null}

            {/* Bottom-center: player status + vitals + tiered action bar */}
            {showLayer("toolbar") ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
                <div
                  className={bottomCenterVitalsDockClass(settings)}
                  data-testid="live-world-vitals-dock"
                >
                  <div className="flex flex-wrap items-end justify-center gap-2 md:gap-3">
                    <PlayerStatusDock status={status ?? statusFallback} />
                    <VitalOrbs />
                    <ActionHotbar
                      onAction={(id: HotbarActionId) => {
                        reveal("manual");
                        if (id === "chat") {
                          getInputManager().pulseAction("openChat");
                          return;
                        }
                        if (id === "emote") {
                          getInputManager().pulseAction("openEmoteWheel");
                          return;
                        }
                        if (id === "interact") {
                          bridge?.queueInteract();
                          return;
                        }
                        if (id === "pet" || id === "companion") {
                          toggleRiftlingFocus();
                          return;
                        }
                        if (id === "potion") {
                          emitHudFx({ kind: "heal", text: "+Care", x: 48, y: 55 });
                          return;
                        }
                        if (id === "mount") {
                          emitHudFx({ kind: "happy", text: "Mount!", x: 52, y: 58 });
                          return;
                        }
                        if (id === "quest") {
                          playSfx("ui.nav");
                          router.push("/quests");
                          return;
                        }
                        if (id === "cards" || id === "deck") {
                          playSfx("ui.nav");
                          router.push("/collection");
                          return;
                        }
                        if (id === "marketplace") {
                          playSfx("ui.nav");
                          router.push("/marketplace");
                          return;
                        }
                        if (!bridge) return;
                        if (id === "map") bridge.openWorldMap();
                        if (id === "inventory") {
                          playSfx("ui.nav");
                          router.push("/inventory");
                        }
                        if (id === "wave") {
                          void socialPresence.recordAction("WAVE", "EMOTE");
                        }
                        if (id === "rest") {
                          void socialPresence.recordAction("CAMPFIRE_REST", "INTERACT");
                        }
                      }}
                    />
                  </div>
                </div>
              </HudLayer>
            ) : null}

            <HudFxLayer />

            {/* Bottom-right radial menu */}
            {showLayer("toolbar") ? (
              <HudLayer opacity={hudOpacity} settings={settings}>
                <div className={bottomRightRadialClass()}>
                  <WorldRadialMenu
                    onOpenMap={() => bridge?.openWorldMap()}
                    onOpenSettings={() => {
                      setShowPause(false);
                      setShowDisplaySettings(true);
                      getInputManager().setActivePanel("settings");
                      reveal("menu");
                    }}
                  />
                </div>
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
                {showLayer("chat") && !chatUsesBottomLeftStack(settings) ? (
                  <HudLayer opacity={hudOpacity} settings={settings}>
                    <LiveWorldChatPanel
                      bridge={bridge}
                      chatMode={settings.chatMode}
                      onChatModeChange={(chatMode) => updateSettings({ chatMode })}
                      onRevealHud={revealHudMessage}
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
                  promptClassName={interactPromptDockClass(settings)}
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
          <div className="pointer-events-auto absolute right-3 top-[4.5rem] z-35 max-h-[45%] w-[min(100%-1.5rem,20rem)] overflow-auto md:right-4 md:top-20">
            <MapGoalsPanel starterOnly />
          </div>
        ) : null}

        {/* Credits / utils live in top-center + top-right reference docks above */}
      </div>
    </section>
  );
}
