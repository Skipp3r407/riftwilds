"use client";

import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/hooks/use-audio";
import { playSfx } from "@/hooks/use-sfx";
import { AUDIO_VOLUME_GROUPS, type AudioVolumeGroup } from "@/lib/audio/types";
import { cn } from "@/lib/utils/cn";

const GROUP_LABELS: Record<AudioVolumeGroup, string> = {
  master: "Master",
  music: "Music",
  ambient: "Ambient",
  ui: "UI",
  sfx: "SFX",
  pet: "Pet",
  combat: "Combat",
  weather: "Weather",
};

const GROUP_HINTS: Partial<Record<AudioVolumeGroup, string>> = {
  master: "Scales every bus",
  music: "Exploration themes & playlist",
  ambient: "Regional layers & menu pad",
  ui: "Clicks, modals, map, chat",
  sfx: "World footsteps, gather, portals",
  pet: "Care actions & need cues",
  combat: "Arena hits & stingers",
  weather: "Rain, wind, thunder cues",
};

export function AudioSettingsPanel({ compact }: { compact?: boolean } = {}) {
  const { prefs, mutedAll, setMutedAll, setVolume, unlock } = useAudio();

  return (
    <div className={cn("space-y-5", compact && "space-y-3")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.16em] text-[var(--amber)]">
            Audio
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Volumes persist locally. Autoplay unlocks after your first click or keypress.
            Reduced-motion softens ambient beds.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary focus-ring inline-flex items-center gap-2 text-xs"
          aria-pressed={mutedAll}
          onClick={() => {
            unlock();
            setMutedAll(!mutedAll);
            if (mutedAll) playSfx("ui.click");
          }}
        >
          {mutedAll ? <VolumeX size={14} aria-hidden /> : <Volume2 size={14} aria-hidden />}
          {mutedAll ? "Unmute all" : "Mute all"}
        </button>
      </div>

      <ul className="space-y-3">
        {AUDIO_VOLUME_GROUPS.map((group) => {
          const value = mutedAll && group !== "master" ? 0 : prefs.volumes[group];
          return (
            <li key={group} className="panel-inset px-3 py-2.5">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <label
                  htmlFor={`audio-${group}`}
                  className="text-sm text-white"
                >
                  {GROUP_LABELS[group]}
                </label>
                <span className="font-mono text-[11px] tabular-nums text-[var(--text-dim)]">
                  {Math.round(value * 100)}%
                </span>
              </div>
              {GROUP_HINTS[group] ? (
                <p className="mb-1.5 text-[10px] text-[var(--text-dim)]">
                  {GROUP_HINTS[group]}
                </p>
              ) : null}
              <input
                id={`audio-${group}`}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={value}
                disabled={mutedAll && group !== "master"}
                onChange={(e) => {
                  unlock();
                  setVolume(group, Number(e.target.value));
                }}
                className="h-1.5 w-full cursor-pointer accent-[var(--cyan)]"
                aria-label={`${GROUP_LABELS[group]} volume`}
              />
            </li>
          );
        })}
      </ul>

      {!compact ? (
        <p className="text-xs text-[var(--text-dim)]">
          Also tweak the floating ambience player, or open{" "}
          <Link href="/settings/keybinds" className="text-[var(--cyan)]">
            keybinds
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
