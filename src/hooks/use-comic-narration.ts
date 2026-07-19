"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ComicPage } from "@/content/comics/types";
import {
  comicPageNarrationUrl,
  pageHasNarration,
  pageNarrationScript,
} from "@/lib/comics/narration";
import { audioManager } from "@/lib/audio/manager";

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
  /** "clip" = pre-generated mp3; "speech" = browser Web Speech fallback */
  mode: "clip" | "speech" | "none";
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
};

function canUseSpeechSynthesis() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Plays pre-generated page VO when available.
 * Falls back to browser SpeechSynthesis so narration works locally without ElevenLabs clips.
 */
export function useComicNarration({
  issueSlug,
  pageNumber,
  page,
  enabled,
  active,
}: Options): ComicNarrationState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [status, setStatus] = useState<ComicNarrationState["status"]>("idle");
  const [mode, setMode] = useState<ComicNarrationState["mode"]>("none");
  const hasText = pageHasNarration(page);
  const src = comicPageNarrationUrl(issueSlug, pageNumber);
  const script = pageNarrationScript(page);

  const stopSpeech = useCallback(() => {
    if (canUseSpeechSynthesis()) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
  }, []);

  const stopAudio = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.removeAttribute("src");
    try {
      a.load();
    } catch {
      // ignore
    }
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
    stopAudio();
    setPlaying(false);
    setStatus("idle");
  }, [stopAudio, stopSpeech]);

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

  const voiceGain = () => {
    if (muted) return 0;
    return audioManager.gainFor("voice");
  };

  const playSpeech = useCallback(() => {
    if (!canUseSpeechSynthesis() || !script.trim()) {
      setStatus("missing");
      setMode("none");
      setPlaying(false);
      return;
    }
    stopSpeech();
    const u = new SpeechSynthesisUtterance(script);
    u.rate = 0.95;
    u.pitch = 1;
    u.volume = voiceGain();
    u.onend = () => {
      setPlaying(false);
      setStatus("idle");
    };
    u.onerror = () => {
      setPlaying(false);
      setStatus("error");
    };
    utteranceRef.current = u;
    setMode("speech");
    setStatus("playing");
    setPlaying(true);
    window.speechSynthesis.speak(u);
  }, [muted, script, stopSpeech]);

  const playClip = useCallback(() => {
    const a = ensureAudio();
    const gain = voiceGain();
    a.muted = gain <= 0;
    a.volume = Math.min(1, Math.max(0, gain));
    setStatus("loading");
    setMode("clip");
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
        // Missing mp3 → browser voice so Narration On still works locally
        playSpeech();
      });
  }, [ensureAudio, muted, playSpeech, src]);

  const play = useCallback(() => {
    if (!enabled || !active || !hasText) return;
    playClip();
  }, [active, enabled, hasText, playClip]);

  const pause = useCallback(() => {
    if (mode === "speech" && canUseSpeechSynthesis()) {
      window.speechSynthesis.pause();
      setPlaying(false);
      setStatus("paused");
      return;
    }
    audioRef.current?.pause();
    setPlaying(false);
    setStatus((s) => (s === "playing" || s === "loading" ? "paused" : s));
  }, [mode]);

  const togglePlay = useCallback(() => {
    if (playing) {
      pause();
      return;
    }
    if (status === "paused" && mode === "speech" && canUseSpeechSynthesis()) {
      window.speechSynthesis.resume();
      setPlaying(true);
      setStatus("playing");
      return;
    }
    play();
  }, [mode, pause, play, playing, status]);

  const setMuted = useCallback(
    (next: boolean) => {
      setMutedState(next);
      if (audioRef.current) audioRef.current.muted = next;
      if (utteranceRef.current) utteranceRef.current.volume = next ? 0 : 1;
      if (next && mode === "speech" && canUseSpeechSynthesis()) {
        window.speechSynthesis.cancel();
        setPlaying(false);
        setStatus("paused");
      }
    },
    [mode],
  );

  const toggleMute = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  useEffect(() => {
    if (!enabled || !active || !hasText) {
      stop();
      setMode("none");
      return;
    }
    playClip();
    return () => {
      stop();
    };
    // Re-run on page change / toggle; playClip/stop are stable enough for this UX
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional page-turn trigger
  }, [active, enabled, hasText, pageNumber, src]);

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
    mode: hasText ? mode : "none",
    play,
    pause,
    togglePlay,
    toggleMute,
    setMuted,
  };
}
