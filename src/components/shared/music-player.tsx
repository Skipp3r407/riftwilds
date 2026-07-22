"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useAudio } from "@/hooks/use-audio";
import { useSfx } from "@/hooks/use-sfx";
import { stopAmbient } from "@/lib/audio/ambient";
import { pauseAllBeds } from "@/lib/audio/beds";
import { audioManager } from "@/lib/audio/manager";
import { MUSIC_PLAYLIST, musicEngine } from "@/lib/audio/music";
import {
  DEFAULT_MUSIC_UI,
  MUSIC_UI_STORAGE_KEY,
  type MusicUiPrefs,
} from "@/lib/audio/music-ui";
import { cn } from "@/lib/utils/cn";

/** Collapse the floating bar after this idle window. */
const AUTO_HIDE_MS = 30_000;

/** Warm fantasy glass — matches Live World HUD / site chrome (not cold sci-fi violet). */
const PLAYER_SHELL =
  "lw-hud-glass rounded-xl border border-[var(--stroke-bronze)] shadow-[0_10px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(232,213,176,0.12)]";

const RANGE_CLASS =
  "h-1.5 w-14 cursor-pointer accent-[var(--amber)] sm:w-[4.25rem]";

type UiPrefs = MusicUiPrefs;
const DEFAULT_UI = DEFAULT_MUSIC_UI;

/** Marketing shell has no MobileGameNav — keep the dock low. */
const MARKETING_PREFIXES = [
  "/about",
  "/analytics",
  "/bugs",
  "/codex",
  "/coloring",
  "/comics",
  "/community",
  "/creators",
  "/creatures",
  "/docs",
  "/downloads",
  "/economy",
  "/fairness",
  "/fan-kit",
  "/feedback",
  "/legal",
  "/login",
  "/patch-notes",
  "/press",
  "/printables",
  "/token",
  "/transparency",
  "/treasury",
  "/updates",
] as const;

function isMarketingPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  // Game credits lives under /economy/credits while marketing owns /economy*.
  if (pathname === "/economy/credits" || pathname.startsWith("/economy/credits/")) {
    return false;
  }
  return MARKETING_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function isBattlePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/tcg/battle" ||
    pathname.startsWith("/tcg/battle/") ||
    pathname === "/battle" ||
    pathname.startsWith("/battle/")
  );
}

function readUi(): UiPrefs {
  if (typeof window === "undefined") return DEFAULT_UI;
  try {
    const raw = localStorage.getItem(MUSIC_UI_STORAGE_KEY);
    if (!raw) {
      // migrate track from legacy music prefs
      const legacy = localStorage.getItem("riftwilds-music-prefs");
      if (legacy) {
        const p = JSON.parse(legacy) as Partial<UiPrefs & { muted?: boolean; volume?: number }>;
        return {
          hidden: Boolean(p.hidden),
          trackIndex:
            typeof p.trackIndex === "number" &&
            p.trackIndex >= 0 &&
            p.trackIndex < MUSIC_PLAYLIST.length
              ? p.trackIndex
              : 0,
          paused: Boolean(p.paused),
        };
      }
      return DEFAULT_UI;
    }
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    return {
      hidden: Boolean(parsed.hidden),
      trackIndex:
        typeof parsed.trackIndex === "number" &&
        parsed.trackIndex >= 0 &&
        parsed.trackIndex < MUSIC_PLAYLIST.length
          ? parsed.trackIndex
          : 0,
      // Missing key ⇒ autoplay on (new installs / older prefs without `paused`).
      paused: Boolean(parsed.paused),
    };
  } catch {
    return DEFAULT_UI;
  }
}

/** Mute-all, zero music/master, or reduced-sound prefs — do not force audible autoplay. */
function shouldSkipAutoplay(): boolean {
  if (audioManager.prefersReduced()) return true;
  const prefs = audioManager.getPrefs();
  if (prefs.mutedAll) return true;
  if (prefs.volumes.master <= 0 || prefs.volumes.music <= 0) return true;
  return false;
}

function writeUi(prefs: UiPrefs) {
  try {
    localStorage.setItem(MUSIC_UI_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

function BusSlider({
  label,
  muted,
  volume,
  onMuteToggle,
  onVolume,
  muteLabel,
  unmuteLabel,
  volumeLabel,
}: {
  label: string;
  muted: boolean;
  volume: number;
  onMuteToggle: () => void;
  onVolume: (v: number) => void;
  muteLabel: string;
  unmuteLabel: string;
  volumeLabel: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-0.5">
      <button
        type="button"
        onClick={onMuteToggle}
        className={cn(
          "focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          muted
            ? "text-[var(--stone)] hover:text-[var(--amber)]"
            : "text-[var(--amber)] hover:text-[var(--radiant)]",
        )}
        aria-label={muted ? unmuteLabel : muteLabel}
        aria-pressed={muted}
      >
        {muted || volume === 0 ? (
          <VolumeX size={14} aria-hidden />
        ) : (
          <Volume2 size={14} aria-hidden />
        )}
      </button>
      <label className="flex min-w-0 flex-col gap-0.5">
        <span className="font-display text-[8px] uppercase tracking-[0.16em] text-[var(--stone)]">
          {label}
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          className={RANGE_CLASS}
          aria-label={volumeLabel}
        />
      </label>
    </div>
  );
}

export function MusicPlayer() {
  const pathname = usePathname();
  const inLiveWorld = Boolean(pathname?.startsWith("/live-world"));
  const onMarketing = isMarketingPath(pathname);
  const onBattle = isBattlePath(pathname);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hidden, setHidden] = useState(DEFAULT_UI.hidden);
  const [trackIndex, setTrackIndex] = useState(DEFAULT_UI.trackIndex);
  const [pausedPref, setPausedPref] = useState(DEFAULT_UI.paused);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const interactingRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackIndexRef = useRef(DEFAULT_UI.trackIndex);
  const pausedPrefRef = useRef(DEFAULT_UI.paused);
  const { volumes, setVolume, mutedAll, setMutedAll, unlock } = useAudio();
  const {
    muted: sfxMuted,
    volume: sfxVolume,
    setMuted: setSfxMuted,
    setVolume: setSfxVolume,
    unlock: unlockSfx,
  } = useSfx();

  const musicVolume = volumes.music;
  const musicMuted = mutedAll || musicVolume <= 0;

  trackIndexRef.current = trackIndex;
  pausedPrefRef.current = pausedPref;

  function clearHideTimer() {
    if (hideTimerRef.current != null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }

  function scheduleAutoHide() {
    clearHideTimer();
    if (!ready || hidden || interactingRef.current) return;
    hideTimerRef.current = setTimeout(() => {
      setPlaylistOpen(false);
      setHidden(true);
    }, AUTO_HIDE_MS);
  }

  function setInteracting(active: boolean) {
    interactingRef.current = active;
    if (active) clearHideTimer();
    else scheduleAutoHide();
  }

  /** Reset the idle countdown (click / slider / keys while not already hovering). */
  function bumpActivity() {
    if (interactingRef.current) return;
    scheduleAutoHide();
  }

  useEffect(() => {
    const prefs = readUi();
    setHidden(prefs.hidden);
    setPausedPref(prefs.paused);
    musicEngine.init();
    const enginePlaying = musicEngine.isPlaying();
    setPlaying(enginePlaying);
    // Prefer live engine track while audio is active; otherwise restore UI browse index.
    setTrackIndex(enginePlaying ? musicEngine.getTrackIndex() : prefs.trackIndex);
    setReady(true);
    return musicEngine.subscribe(() => {
      const enginePlayingNow = musicEngine.isPlaying();
      setPlaying(enginePlayingNow);
      // Mirror engine track while audio is active (region themes / crossfades).
      // When paused, leave local browsing (prev/next) alone.
      if (enginePlayingNow) {
        setTrackIndex(musicEngine.getTrackIndex());
      }
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeUi({ hidden, trackIndex, paused: pausedPref });
  }, [ready, hidden, trackIndex, pausedPref]);

  // Autoplay on mount; if the browser blocks it, start on the first user gesture.
  useEffect(() => {
    if (!ready) return;
    if (musicEngine.isPlaying()) return;
    if (pausedPrefRef.current || shouldSkipAutoplay()) return;

    let cancelled = false;
    let gestureCleanup: (() => void) | null = null;

    const wantsAutoplay = () =>
      !cancelled && !pausedPrefRef.current && !shouldSkipAutoplay() && !musicEngine.isPlaying();

    const start = async () => {
      if (!wantsAutoplay()) return false;
      unlock();
      await musicEngine.playTrack(trackIndexRef.current, 500);
      if (cancelled) return musicEngine.isPlaying();
      const ok = musicEngine.isPlaying();
      setPlaying(ok);
      return ok;
    };

    const armGestureUnlock = () => {
      if (gestureCleanup || cancelled) return;
      const onGesture = () => {
        gestureCleanup?.();
        gestureCleanup = null;
        void start();
      };
      window.addEventListener("pointerdown", onGesture, { passive: true });
      window.addEventListener("keydown", onGesture);
      window.addEventListener("touchstart", onGesture, { passive: true });
      gestureCleanup = () => {
        window.removeEventListener("pointerdown", onGesture);
        window.removeEventListener("keydown", onGesture);
        window.removeEventListener("touchstart", onGesture);
      };
    };

    void (async () => {
      const ok = await start();
      if (!ok && wantsAutoplay()) armGestureUnlock();
    })();

    return () => {
      cancelled = true;
      gestureCleanup?.();
      gestureCleanup = null;
    };
  }, [ready, unlock]);

  // Start / clear the 30s idle timer when the bar is shown or collapsed.
  useEffect(() => {
    if (!ready || hidden) {
      if (hideTimerRef.current != null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      interactingRef.current = false;
      return;
    }
    if (interactingRef.current) return;
    hideTimerRef.current = setTimeout(() => {
      setPlaylistOpen(false);
      setHidden(true);
    }, AUTO_HIDE_MS);
    return () => {
      if (hideTimerRef.current != null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [ready, hidden]);

  // Marketing pages: never keep procedural ambience running.
  // (Old bug: auto-started menu drone + menu.wav → site-wide hum after unlock.)
  // Live World owns regional / hub ambience; leaving that route clears the bed.
  useEffect(() => {
    if (!ready) return;
    if (inLiveWorld) return;
    stopAmbient(350);
  }, [ready, inLiveWorld]);

  async function togglePlay() {
    unlock();
    unlockSfx();
    if (playing) {
      // Persist pause before stopping beds so async soundscapes respect it.
      const next: UiPrefs = { hidden, trackIndex, paused: true };
      writeUi(next);
      setPausedPref(true);
      // HTMLAudio.pause alone leaves Web Audio drones/stems humming.
      pauseAllBeds();
      setPlaying(false);
      return;
    }
    const next: UiPrefs = { hidden, trackIndex, paused: false };
    writeUi(next);
    setPausedPref(false);
    await musicEngine.playTrack(trackIndex, 500);
    setPlaying(musicEngine.isPlaying());
  }

  async function stepTrack(delta: number) {
    unlock();
    const next = (trackIndex + delta + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length;
    setTrackIndex(next);
    if (playing) {
      await musicEngine.playTrack(next, 600);
      setPlaying(musicEngine.isPlaying());
    }
  }

  async function selectTrack(index: number) {
    unlock();
    setPausedPref(false);
    setTrackIndex(index);
    await musicEngine.playTrack(index, 600);
    setPlaying(musicEngine.isPlaying());
  }

  function unmuteMusic() {
    unlock();
    if (mutedAll) setMutedAll(false);
    if (musicVolume <= 0) setVolume("music", 0.35);
  }

  const track = MUSIC_PLAYLIST[trackIndex] ?? MUSIC_PLAYLIST[0];
  const trackCount = MUSIC_PLAYLIST.length;
  const trackOrdinal = String(trackIndex + 1).padStart(2, "0");

  const shellMotion = "motion-safe:transition-[opacity,transform] motion-safe:duration-200";

  // Clear mobile game nav on game routes; sit lower on marketing; clear battle CTAs.
  // Scroll-to-top (.scroll-to-top--*) stacks above via --dock-music-height + --dock-stack-gap.
  const dockPosition = cn(
    "fixed right-3 z-[55]",
    onBattle
      ? "bottom-[calc(7rem+var(--safe-bottom))] md:bottom-8 md:right-5"
      : onMarketing
        ? "bottom-[calc(1.25rem+var(--safe-bottom))] md:bottom-5 md:right-5"
        : "bottom-[calc(5.25rem+var(--safe-bottom))] md:bottom-5 md:right-5",
  );

  const collapsedPosition = cn(
    "focus-ring fixed right-0 z-[55] flex h-11 w-8 items-center justify-center",
    onBattle
      ? "bottom-[calc(7rem+var(--safe-bottom))] md:bottom-8"
      : onMarketing
        ? "bottom-[calc(1.25rem+var(--safe-bottom))] md:bottom-5"
        : "bottom-[calc(5.25rem+var(--safe-bottom))] md:bottom-5",
    "rounded-l-xl border border-r-0 border-[var(--stroke-bronze)]",
    "bg-[rgba(22,18,14,0.92)] text-[var(--amber)] backdrop-blur-md",
    "shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(232,213,176,0.1)]",
    shellMotion,
    "hover:bg-[rgba(28,24,18,0.98)] hover:border-[var(--stroke-amber)] hover:text-[var(--radiant)]",
  );

  return (
    <>
      {!ready ? null : hidden ? (
        <button
          type="button"
          onClick={() => setHidden(false)}
          className={collapsedPosition}
          aria-label="Show ambience player"
          title="Show ambience"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
      ) : (
        <div
          className={cn(
            dockPosition,
            "flex max-w-[min(100vw-1.5rem,26rem)] flex-col items-stretch gap-2",
            shellMotion,
          )}
          onPointerEnter={() => setInteracting(true)}
          onPointerLeave={() => setInteracting(false)}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setInteracting(false);
            }
          }}
          onPointerDown={bumpActivity}
          onKeyDown={bumpActivity}
        >
          {playlistOpen ? (
            <div
              className={cn(PLAYER_SHELL, "max-h-72 overflow-y-auto p-1.5")}
              role="listbox"
              aria-label="Ambient playlist"
            >
              <div className="flex items-baseline justify-between gap-2 px-2.5 pb-1.5 pt-1">
                <p className="font-display text-[9px] uppercase tracking-[0.16em] text-[var(--stone)]">
                  Ambience playlist
                </p>
                <p className="font-mono text-[9px] tabular-nums text-[var(--text-dim)]">
                  {trackCount} tracks
                </p>
              </div>
              {MUSIC_PLAYLIST.map((t, i) => {
                const active = i === trackIndex;
                return (
                  <button
                    key={t.src}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => void selectTrack(i)}
                    className={cn(
                      "focus-ring flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left",
                      "transition-[color,background,box-shadow] duration-150",
                      active
                        ? "bg-[rgba(255,184,77,0.12)] text-[var(--text)] shadow-[inset_2px_0_0_var(--amber)]"
                        : "text-[var(--text-muted)] hover:bg-[rgba(232,213,176,0.06)] hover:text-[var(--text)]",
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 shrink-0 font-mono text-[9px] tabular-nums",
                        active ? "text-[var(--amber)]" : "text-[var(--text-dim)]",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] leading-tight">{t.label}</span>
                      <span
                        className={cn(
                          "mt-0.5 block font-display text-[8px] uppercase tracking-[0.14em]",
                          active ? "text-[var(--amber)]" : "text-[var(--stone)]",
                        )}
                      >
                        {t.mood}
                      </span>
                    </span>
                    {active && playing ? (
                      <span className="ml-auto shrink-0 font-display text-[8px] uppercase tracking-[0.12em] text-[var(--amber)]">
                        Now
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div
            className={cn(PLAYER_SHELL, "flex flex-col gap-1.5 p-2")}
            role="region"
            aria-label="Music and sound effects"
          >
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void togglePlay()}
                className={cn(
                  "focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  "border border-[var(--stroke-bronze)] bg-[rgba(20,16,12,0.55)]",
                  "text-[var(--amber)] transition-[color,background,border-color,box-shadow] duration-150",
                  "hover:border-[var(--stroke-amber)] hover:bg-[rgba(255,184,77,0.12)] hover:text-[var(--radiant)]",
                  playing &&
                    "border-[var(--stroke-amber)] bg-[rgba(255,184,77,0.14)] shadow-[inset_0_1px_0_rgba(232,213,176,0.14)]",
                )}
                aria-label={playing ? "Pause ambient music" : "Play ambient music"}
              >
                {playing ? (
                  <Pause size={18} aria-hidden />
                ) : (
                  <Play size={18} className="ml-0.5" aria-hidden />
                )}
              </button>

              <button
                type="button"
                onClick={() => void stepTrack(-1)}
                className="focus-ring flex h-8 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--amber)]"
                aria-label="Previous track"
                title="Previous"
              >
                <ChevronLeft size={16} aria-hidden />
              </button>

              <button
                type="button"
                onClick={() => setPlaylistOpen((o) => !o)}
                className="focus-ring min-w-0 flex-1 rounded-lg px-1 py-0.5 text-left hover:bg-[rgba(255,184,77,0.06)]"
                aria-label={`Current track: ${track.label}. Open playlist`}
                aria-expanded={playlistOpen}
                title="Browse playlist"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-[9px] uppercase tracking-[0.16em] text-[var(--stone)]">
                    Ambience
                  </span>
                  <span className="font-mono text-[8px] tabular-nums text-[var(--text-dim)]">
                    {trackOrdinal}/{String(trackCount).padStart(2, "0")}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[12px] leading-tight text-[var(--text)]">
                  {track.label}
                </span>
              </button>

              <button
                type="button"
                onClick={() => void stepTrack(1)}
                className="focus-ring flex h-8 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--amber)]"
                aria-label="Next track"
                title="Next"
              >
                <ChevronRight size={16} aria-hidden />
              </button>

              <button
                type="button"
                onClick={() => setPlaylistOpen((o) => !o)}
                className={cn(
                  "focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  playlistOpen
                    ? "bg-[rgba(255,184,77,0.12)] text-[var(--amber)]"
                    : "text-[var(--text-muted)] hover:text-[var(--amber)]",
                )}
                aria-label={playlistOpen ? "Hide playlist" : "Show playlist"}
                aria-pressed={playlistOpen}
                title="Playlist"
              >
                <ListMusic size={16} aria-hidden />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlaylistOpen(false);
                  setHidden(true);
                }}
                className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-dim)] transition-colors hover:text-[var(--amber)]"
                aria-label="Hide music player"
                title="Hide"
              >
                <X size={15} aria-hidden className="sm:hidden" />
                <ChevronRight size={16} aria-hidden className="hidden sm:block" />
              </button>
            </div>

            <div className="flex items-end justify-between gap-2 border-t border-[rgba(196,168,130,0.22)] pt-1.5">
              <BusSlider
                label="Music"
                muted={musicMuted}
                volume={musicVolume}
                muteLabel="Mute music"
                unmuteLabel="Unmute music"
                volumeLabel="Music volume"
                onMuteToggle={() => {
                  unlock();
                  if (musicMuted) unmuteMusic();
                  else setVolume("music", 0);
                  bumpActivity();
                }}
                onVolume={(v) => {
                  unlock();
                  setVolume("music", v);
                  bumpActivity();
                }}
              />
              <div className="h-6 w-px shrink-0 bg-[rgba(196,168,130,0.28)]" aria-hidden />
              <BusSlider
                label="SFX"
                muted={sfxMuted}
                volume={sfxVolume}
                muteLabel="Mute sound effects"
                unmuteLabel="Unmute sound effects"
                volumeLabel="Sound effects volume"
                onMuteToggle={() => {
                  unlockSfx();
                  setSfxMuted(!sfxMuted);
                  bumpActivity();
                }}
                onVolume={(v) => {
                  unlockSfx();
                  setSfxVolume(v);
                  bumpActivity();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
