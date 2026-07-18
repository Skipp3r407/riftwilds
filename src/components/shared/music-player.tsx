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
import { MUSIC_PLAYLIST, musicEngine } from "@/lib/audio/music";
import { cn } from "@/lib/utils/cn";

const UI_STORAGE_KEY = "riftwilds-music-ui";
/** Collapse the floating bar after this idle window. */
const AUTO_HIDE_MS = 30_000;

type UiPrefs = {
  hidden: boolean;
  trackIndex: number;
};

const DEFAULT_UI: UiPrefs = {
  hidden: false,
  trackIndex: 0,
};

function readUi(): UiPrefs {
  if (typeof window === "undefined") return DEFAULT_UI;
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
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
    };
  } catch {
    return DEFAULT_UI;
  }
}

function writeUi(prefs: UiPrefs) {
  try {
    localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function MusicPlayer() {
  const pathname = usePathname();
  const inLiveWorld = Boolean(pathname?.startsWith("/live-world"));
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hidden, setHidden] = useState(DEFAULT_UI.hidden);
  const [trackIndex, setTrackIndex] = useState(DEFAULT_UI.trackIndex);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const interactingRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { volumes, setVolume, mutedAll, unlock } = useAudio();
  const {
    muted: sfxMuted,
    volume: sfxVolume,
    setMuted: setSfxMuted,
    setVolume: setSfxVolume,
    unlock: unlockSfx,
  } = useSfx();

  const musicVolume = volumes.music;
  const musicMuted = mutedAll || musicVolume <= 0;

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
    setTrackIndex(prefs.trackIndex);
    musicEngine.init();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeUi({ hidden, trackIndex });
  }, [ready, hidden, trackIndex]);

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
      musicEngine.pause();
      setPlaying(false);
      return;
    }
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
    setTrackIndex(index);
    await musicEngine.playTrack(index, 600);
    setPlaying(musicEngine.isPlaying());
  }

  const track = MUSIC_PLAYLIST[trackIndex] ?? MUSIC_PLAYLIST[0];

  const shellMotion = "motion-safe:transition-[opacity,transform] motion-safe:duration-200";

  return (
    <>
      {!ready ? null : hidden ? (
        <button
          type="button"
          onClick={() => setHidden(false)}
          className={cn(
            "focus-ring fixed right-0 z-[60] flex h-11 w-8 items-center justify-center",
            "bottom-[calc(5.25rem+var(--safe-bottom))] md:bottom-5",
            "rounded-l-lg border border-r-0 border-[var(--stroke)]",
            "bg-[rgba(18,18,28,0.92)] text-[var(--cyan)] backdrop-blur-md",
            "shadow-[var(--shadow-panel)]",
            shellMotion,
            "hover:bg-[rgba(22,22,37,0.98)] hover:border-[var(--stroke-strong)]",
          )}
          aria-label="Show ambience player"
          title="Show ambience"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
      ) : (
        <div
          className={cn(
            "fixed right-3 z-[60] flex flex-col items-stretch gap-1.5",
            "bottom-[calc(5.25rem+var(--safe-bottom))] md:bottom-5 md:right-5",
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
              className={cn(
                "max-h-56 overflow-y-auto rounded-2xl border border-[var(--stroke)]",
                "bg-[rgba(18,18,28,0.96)] p-1.5 shadow-[var(--shadow-panel)] backdrop-blur-md",
              )}
              role="listbox"
              aria-label="Ambient playlist"
            >
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
                      "focus-ring flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-[11px]",
                      "transition-colors",
                      active
                        ? "bg-[rgba(61,231,255,0.12)] text-[var(--cyan)]"
                        : "text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text)]",
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 shrink-0 font-mono text-[9px] tabular-nums",
                        active ? "text-[var(--amber)]" : "text-[var(--text-dim)]",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <div
            className={cn(
              "flex items-center gap-1.5 rounded-2xl border border-[var(--stroke)]",
              "bg-[rgba(18,18,28,0.92)] p-1.5 pl-2 shadow-[var(--shadow-panel)] backdrop-blur-md",
            )}
            role="region"
            aria-label="Music and sound effects"
          >
            <button
              type="button"
              onClick={() => void togglePlay()}
              className={cn(
                "focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                "border border-[rgba(61,231,255,0.25)] bg-[rgba(61,231,255,0.1)]",
                "text-[var(--cyan)] transition-colors hover:bg-[rgba(61,231,255,0.18)]",
                playing && "shadow-[0_0_18px_rgba(61,231,255,0.25)]",
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
              className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--cyan)]"
              aria-label="Previous track"
              title="Previous"
            >
              <ChevronLeft size={16} aria-hidden />
            </button>

            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="font-display text-[9px] uppercase tracking-[0.18em] text-[var(--amber)]">
                Ambience
              </span>
              <button
                type="button"
                onClick={() => setPlaylistOpen((o) => !o)}
                className="focus-ring max-w-[9.5rem] truncate text-left text-[11px] text-[var(--text-muted)] hover:text-[var(--cyan)]"
                aria-label={`Current track: ${track.label}. Open playlist`}
                aria-expanded={playlistOpen}
                title="Browse playlist"
              >
                {track.label}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void stepTrack(1)}
              className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--cyan)]"
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
                  ? "text-[var(--cyan)]"
                  : "text-[var(--text-muted)] hover:text-[var(--cyan)]",
              )}
              aria-label={playlistOpen ? "Hide playlist" : "Show playlist"}
              aria-pressed={playlistOpen}
              title="Playlist"
            >
              <ListMusic size={16} aria-hidden />
            </button>

            <div className="mx-0.5 hidden h-6 w-px bg-[var(--stroke)] sm:block" aria-hidden />

            <div className="flex items-center gap-1" title="Sound effects">
              <button
                type="button"
                onClick={() => {
                  unlockSfx();
                  setSfxMuted(!sfxMuted);
                }}
                className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--amber)]"
                aria-label={sfxMuted ? "Unmute sound effects" : "Mute sound effects"}
                aria-pressed={sfxMuted}
              >
                {sfxMuted || sfxVolume === 0 ? (
                  <VolumeX size={15} aria-hidden />
                ) : (
                  <Volume2 size={15} aria-hidden />
                )}
              </button>
              <label className="hidden items-center gap-1 sm:flex">
                <span className="font-display text-[8px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
                  SFX
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={sfxMuted ? 0 : sfxVolume}
                  onChange={(e) => {
                    unlockSfx();
                    setSfxVolume(Number(e.target.value));
                    bumpActivity();
                  }}
                  className="h-1 w-12 cursor-pointer accent-[var(--amber)]"
                  aria-label="Sound effects volume"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                unlock();
                if (musicMuted) setVolume("music", 0.35);
                else setVolume("music", 0);
              }}
              className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--cyan)]"
              aria-label={musicMuted ? "Unmute music" : "Mute music"}
              aria-pressed={musicMuted}
              title="Music mute"
            >
              {musicMuted ? (
                <VolumeX size={16} aria-hidden />
              ) : (
                <Volume2 size={16} aria-hidden />
              )}
            </button>

            <label className="hidden items-center sm:flex">
              <span className="sr-only">Music volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={musicMuted ? 0 : musicVolume}
                onChange={(e) => {
                  unlock();
                  setVolume("music", Number(e.target.value));
                  bumpActivity();
                }}
                className="h-1 w-16 cursor-pointer accent-[var(--cyan)]"
                aria-label="Music volume"
              />
            </label>

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
        </div>
      )}
    </>
  );
}
