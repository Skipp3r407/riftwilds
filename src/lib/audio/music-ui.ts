/**
 * Floating MusicPlayer UI prefs (track index / hidden / explicit pause / shuffle).
 * Shared so adaptive soundscapes can respect a user pause without importing React.
 */

export const MUSIC_UI_STORAGE_KEY = "riftwilds-music-ui";

export type MusicUiPrefs = {
  hidden: boolean;
  trackIndex: number;
  /** Explicit user pause — skip autoplay / procedural beds until they hit play. */
  paused: boolean;
  /** Randomize next / end-of-track selection (shuffle bag, no immediate repeat). */
  shuffle: boolean;
};

export const DEFAULT_MUSIC_UI: MusicUiPrefs = {
  hidden: false,
  trackIndex: 0,
  paused: false,
  shuffle: false,
};

/** True when the user explicitly paused the floating ambience player. */
export function readMusicUiPaused(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(MUSIC_UI_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<MusicUiPrefs>;
    return Boolean(parsed.paused);
  } catch {
    return false;
  }
}
