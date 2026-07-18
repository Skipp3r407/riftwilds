"use client";

import { useEffect, useRef, useState } from "react";
import type { ListenTrack } from "@/content/fan-kit";
import { cn } from "@/lib/utils/cn";

type Props = {
  tracks: ListenTrack[];
};

export function ListenStrip({ tracks }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const play = async (track: ListenTrack) => {
    setError(null);
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = true;
      }
      const audio = audioRef.current;
      if (activeId === track.id && !audio.paused) {
        audio.pause();
        setActiveId(null);
        return;
      }
      audio.src = track.src;
      audio.volume = 0.55;
      await audio.play();
      setActiveId(track.id);
    } catch {
      setError("Tap again after interacting with the page — browsers block autoplay.");
      setActiveId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tracks.map((track) => {
          const playing = activeId === track.id;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => play(track)}
              className={cn(
                "panel focus-ring group p-4 text-left transition duration-300",
                playing && "border-[var(--amber)] shadow-[0_0_24px_rgba(255,184,77,0.18)]",
              )}
              aria-pressed={playing}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm text-white">{track.label}</p>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-[0.16em]",
                    playing ? "text-[var(--amber)]" : "text-[var(--cyan)]",
                  )}
                >
                  {playing ? "Playing" : "Preview"}
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">{track.blurb}</p>
              <div
                className="mt-3 flex h-8 items-end gap-0.5"
                aria-hidden
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-1.5 rounded-sm bg-[var(--cyan)]/40 transition-all",
                      playing && "animate-pulse bg-[var(--amber)]/70",
                    )}
                    style={{
                      height: `${30 + ((i * 17) % 50)}%`,
                      animationDelay: playing ? `${i * 60}ms` : undefined,
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-[var(--amber)]">{error}</p>}
      <p className="text-xs text-[var(--text-dim)]">
        Looping teasers from the in-game soundtrack. Full player also lives in the floating music
        control.
      </p>
    </div>
  );
}
