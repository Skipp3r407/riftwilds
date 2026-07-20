/**
 * Future-ready music / voice hooks for comic pages.
 * Reader toggles already persist musicEnabled / narrationEnabled.
 */

import type { ComicPage } from "@/content/comics/types";

export type ComicAudioCue = {
  pageId: string;
  musicCueId?: string;
  voiceCueId?: string;
  /** Suggested bed volume 0–1 when musicEnabled */
  musicGain?: number;
};

export function audioCuesForPage(page: ComicPage): ComicAudioCue {
  return {
    pageId: page.id,
    musicCueId: page.musicCueId ?? atmosphereMusic(page.atmosphere),
    voiceCueId: page.voiceCueId,
    musicGain: page.role === "splash" || page.layout === "splash" ? 0.55 : 0.35,
  };
}

function atmosphereMusic(atmosphere?: ComicPage["atmosphere"]): string | undefined {
  if (!atmosphere) return "cue-commons-soft";
  const map: Record<string, string> = {
    dawn: "cue-dawn-strings",
    day: "cue-commons-soft",
    dusk: "cue-lantern-dusk",
    night: "cue-night-rift",
    rift: "cue-rift-hum",
    festival: "cue-festival-drums",
    storm: "cue-storm-low",
    ruin: "cue-ruin-wind",
  };
  return map[atmosphere];
}

/** Stub player — no audio decode until assets exist. */
export function playMusicCueStub(_cueId: string, _enabled: boolean): void {
  // Intentionally empty — wire Howler / HTMLAudio when beds land under public/assets/audio/comics/
}
