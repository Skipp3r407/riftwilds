"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComicPage } from "@/content/comics/types";
import {
  comicPageNarrationUrl,
  pageHasNarration,
} from "@/lib/comics/narration";

type Options = {
  issueSlug: string;
  pageNumber: number;
  page: ComicPage;
  enabled: boolean;
  /** False while cover closed — stops VO */
  active: boolean;
};

export type ComicNarrationState = {
  available: boolean;
  playing: boolean;
  muted: boolean;
  status: "idle" | "loading" | "playing" | "paused" | "missing" | "error";
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
};

/**
 * Plays pre-generated page VO when narration is enabled.
 * Missing clips → silent fallback (no network TTS at runtime).
 */
export function useComicNarration({
  issueSlug,
  pageNumber,
  page,
  enabled,
  active,
}: Options): ComicNarrationState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [status, setStatus] = useState<ComicNarrationState["status"]>("idle");
  const hasText = pageHasNarration(page);
  const src = comicPageNarrationUrl(issueSlug, pageNumber);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "none";
      audioRef.current.addEventListener("ended", () => {
        setPlaying(false);
        setStatus("idle");
      });
      audioRef.current.addEventListener("pause", () => {
        setPlaying(false);
      });
      audioRef.current.addEventListener("play", () => {
        setPlaying(true);
        setStatus("playing");
      });
    }
    return audioRef.current;
  }, []);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.removeAttribute("src");
    try {
      a.load();
    } catch {
      // ignore
    }
    setPlaying(false);
    setStatus("idle");
  }, []);

  const play = useCallback(() => {
    if (!enabled || !active || !hasText) return;
    const a = ensureAudio();
    a.muted = muted;
    setStatus("loading");
    if (!a.src.includes(src)) {
      a.src = src;
    }
    void a
      .play()
      .then(() => {
        setStatus("playing");
        setPlaying(true);
      })
      .catch(() => {
        setStatus("missing");
        setPlaying(false);
      });
  }, [active, enabled, ensureAudio, hasText, muted, src]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setStatus((s) => (s === "playing" || s === "loading" ? "paused" : s));
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) pause();
    else play();
  }, [pause, play, playing]);

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    if (audioRef.current) audioRef.current.muted = next;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  useEffect(() => {
    if (!enabled || !active || !hasText) {
      stop();
      return;
    }
    const a = ensureAudio();
    a.muted = muted;
    setStatus("loading");
    a.src = src;
    void a
      .play()
      .then(() => {
        setStatus("playing");
        setPlaying(true);
      })
      .catch(() => {
        setStatus("missing");
        setPlaying(false);
      });
    return () => {
      a.pause();
    };
  }, [active, enabled, ensureAudio, hasText, muted, pageNumber, src, stop]);

  useEffect(() => {
    return () => {
      stop();
      audioRef.current = null;
    };
  }, [stop]);

  return {
    available: hasText,
    playing,
    muted,
    status: hasText ? status : "idle",
    play,
    pause,
    togglePlay,
    toggleMute,
    setMuted,
  };
}
