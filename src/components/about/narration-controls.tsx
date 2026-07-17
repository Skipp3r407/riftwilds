"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX, Captions } from "lucide-react";
import { narrationScript } from "@/content/about/riftwilds-origin";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

/**
 * Optional origin narration — muted by default, never autoplays loudly.
 * Uses browser speechSynthesis when available; transcript always remains available.
 */
export function NarrationControls({ className }: Props) {
  const transcriptId = useId();
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const cancelRef = useRef(false);

  const stopSpeech = useCallback(() => {
    cancelRef.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  const speakFrom = useCallback(
    async (start: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setPlaying(false);
        return;
      }
      cancelRef.current = false;
      setPlaying(true);

      for (let i = start; i < narrationScript.length; i++) {
        if (cancelRef.current) break;
        setLineIndex(i);
        const utter = new SpeechSynthesisUtterance(narrationScript[i]);
        utter.rate = 0.92;
        utter.pitch = 0.95;
        utter.volume = muted ? 0 : 0.85;
        await new Promise<void>((resolve) => {
          utter.onend = () => resolve();
          utter.onerror = () => resolve();
          window.speechSynthesis.speak(utter);
        });
      }

      if (!cancelRef.current) {
        setPlaying(false);
        setLineIndex(0);
      }
    },
    [muted],
  );

  const onPlayToggle = () => {
    if (playing) {
      stopSpeech();
      return;
    }
    void speakFrom(lineIndex);
  };

  const onMuteToggle = () => {
    const next = !muted;
    setMuted(next);
    if (next) {
      stopSpeech();
    }
  };

  return (
    <div
      className={cn(
        "panel border border-[var(--stroke)] bg-[rgba(10,12,20,0.72)] p-4 md:p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-display text-xs uppercase tracking-[0.18em] text-[var(--cyan)]">
          Origin narration
        </p>
        <span className="text-xs text-[var(--text-dim)]">Optional · muted by default</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-secondary focus-ring inline-flex items-center gap-2 text-sm"
          onClick={onPlayToggle}
          aria-pressed={playing}
        >
          {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
          {playing ? "Pause narration" : "Play narration"}
        </button>
        <button
          type="button"
          className="btn-secondary focus-ring inline-flex items-center gap-2 text-sm"
          onClick={onMuteToggle}
          aria-pressed={muted}
          aria-label={muted ? "Unmute narration" : "Mute narration"}
        >
          {muted ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
          {muted ? "Muted" : "Unmuted"}
        </button>
        <button
          type="button"
          className="btn-secondary focus-ring inline-flex items-center gap-2 text-sm"
          onClick={() => setShowTranscript((v) => !v)}
          aria-expanded={showTranscript}
          aria-controls={transcriptId}
        >
          <Captions size={16} aria-hidden />
          Transcript
        </button>
      </div>

      {playing && !muted ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]" aria-live="polite">
          {narrationScript[lineIndex]}
        </p>
      ) : null}

      <div
        id={transcriptId}
        hidden={!showTranscript}
        className="mt-4 max-h-64 overflow-y-auto rounded-md border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] p-4"
      >
        <h3 className="font-display text-sm text-white">Full narration transcript</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--text-muted)]">
          {narrationScript.map((line, i) => (
            <li
              key={i}
              className={cn(playing && i === lineIndex && "text-[var(--cyan)]")}
            >
              {line}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
