"use client";

import { useEffect, useRef, useState } from "react";
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
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "riftwilds-music-prefs";

const TRACKS = [
  { src: "/sounds/music/sector.mp3", label: "Sector" },
  { src: "/sounds/music/airy.mp3", label: "Airy" },
  { src: "/sounds/music/magic-space.mp3", label: "Magic Space" },
  { src: "/sounds/music/pulse.mp3", label: "Pulse" },
  { src: "/sounds/music/urgent.mp3", label: "Urgent" },
  { src: "/sounds/music/transmission.mp3", label: "Transmission" },
  { src: "/sounds/music/space-graveyard.mp3", label: "Space Graveyard" },
  { src: "/sounds/music/menacing-otherworld.mp3", label: "Menacing Otherworld" },
  { src: "/sounds/music/dark-things.mp3", label: "Dark Things" },
  { src: "/sounds/music/sirens-in-darkness.mp3", label: "Sirens in Darkness" },
] as const;

type Prefs = {
  hidden: boolean;
  muted: boolean;
  volume: number;
  trackIndex: number;
};

const DEFAULT_PREFS: Prefs = {
  hidden: false,
  muted: false,
  volume: 0.35,
  trackIndex: 0,
};

function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      hidden: Boolean(parsed.hidden),
      muted: Boolean(parsed.muted),
      volume:
        typeof parsed.volume === "number"
          ? Math.min(1, Math.max(0, parsed.volume))
          : DEFAULT_PREFS.volume,
      trackIndex:
        typeof parsed.trackIndex === "number" &&
        parsed.trackIndex >= 0 &&
        parsed.trackIndex < TRACKS.length
          ? parsed.trackIndex
          : 0,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hidden, setHidden] = useState(DEFAULT_PREFS.hidden);
  const [muted, setMuted] = useState(DEFAULT_PREFS.muted);
  const [volume, setVolume] = useState(DEFAULT_PREFS.volume);
  const [trackIndex, setTrackIndex] = useState(DEFAULT_PREFS.trackIndex);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const {
    muted: sfxMuted,
    volume: sfxVolume,
    setMuted: setSfxMuted,
    setVolume: setSfxVolume,
    unlock: unlockSfx,
  } = useSfx();

  useEffect(() => {
    const prefs = readPrefs();
    setHidden(prefs.hidden);
    setMuted(prefs.muted);
    setVolume(prefs.volume);
    setTrackIndex(prefs.trackIndex);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writePrefs({ hidden, muted, volume, trackIndex });
  }, [ready, hidden, muted, volume, trackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !ready) return;

    const track = TRACKS[trackIndex] ?? TRACKS[0];
    const nextSrc = track.src;
    const currentPath = audio.getAttribute("src") || "";
    const wasPlaying = !audio.paused;

    if (!currentPath.endsWith(nextSrc)) {
      audio.src = nextSrc;
      audio.loop = true;
      if (wasPlaying) {
        void audio.play().catch(() => setPlaying(false));
      }
    }

    audio.muted = muted;
    audio.volume = muted ? 0 : volume;
  }, [ready, muted, volume, trackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    unlockSfx();

    if (!audio.getAttribute("src")) {
      audio.src = TRACKS[trackIndex]?.src ?? TRACKS[0].src;
      audio.loop = true;
    }

    if (audio.paused) {
      try {
        audio.muted = muted;
        audio.volume = muted ? 0 : volume;
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  function stepTrack(delta: number) {
    setTrackIndex((i) => (i + delta + TRACKS.length) % TRACKS.length);
  }

  function selectTrack(index: number) {
    setTrackIndex(index);
    const audio = audioRef.current;
    if (!audio || playing || !audio.paused) return;
    void (async () => {
      try {
        audio.src = TRACKS[index].src;
        audio.loop = true;
        audio.muted = muted;
        audio.volume = muted ? 0 : volume;
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    })();
  }

  const track = TRACKS[trackIndex] ?? TRACKS[0];

  return (
    <>
      <audio ref={audioRef} preload="metadata" className="hidden" aria-hidden />

      {!ready ? null : hidden ? (
        <button
          type="button"
          onClick={() => setHidden(false)}
          className={cn(
            "focus-ring fixed right-0 z-[60] flex h-11 w-8 items-center justify-center",
            "bottom-[calc(5.25rem+var(--safe-bottom))] md:bottom-5",
            "rounded-l-lg border border-r-0 border-[var(--stroke)]",
            "bg-[rgba(18,18,28,0.92)] text-[var(--cyan)] backdrop-blur-md",
            "shadow-[var(--shadow-panel)] transition-colors hover:bg-[rgba(22,22,37,0.98)]",
            "hover:border-[var(--stroke-strong)]",
          )}
          aria-label="Show music player"
          title="Show music"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
      ) : (
        <div
          className={cn(
            "fixed right-3 z-[60] flex flex-col items-stretch gap-1.5",
            "bottom-[calc(5.25rem+var(--safe-bottom))] md:bottom-5 md:right-5",
          )}
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
              {TRACKS.map((t, i) => {
                const active = i === trackIndex;
                return (
                  <button
                    key={t.src}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => selectTrack(i)}
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
              onClick={() => stepTrack(-1)}
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
              onClick={() => stepTrack(1)}
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
                  }}
                  className="h-1 w-12 cursor-pointer accent-[var(--amber)]"
                  aria-label="Sound effects volume"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--cyan)]"
              aria-label={muted ? "Unmute music" : "Mute music"}
              aria-pressed={muted}
              title="Music mute"
            >
              {muted || volume === 0 ? (
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
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setVolume(next);
                  if (next > 0 && muted) setMuted(false);
                  if (next === 0) setMuted(true);
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
