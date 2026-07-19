/**
 * Shared audio types for the Riftwilds Audio Manager.
 */

export type AudioVolumeGroup =
  | "master"
  | "music"
  | "ambient"
  | "ui"
  | "sfx"
  | "pet"
  | "combat"
  | "weather"
  | "voice"
  | "notifications";

/** Playback bus used for ducking / priority. */
export type AudioBus =
  | "music"
  | "ambient"
  | "ui"
  | "sfx"
  | "pet"
  | "combat"
  | "weather"
  | "voice"
  | "notifications";

export type AudioPriority = "low" | "normal" | "high" | "critical";

export type TerrainFootstep =
  | "grass"
  | "path"
  | "stone"
  | "sand"
  | "snow"
  | "wood"
  | "water"
  | "lava"
  | "metal"
  | "void";

export type AudioPrefs = {
  mutedAll: boolean;
  volumes: Record<AudioVolumeGroup, number>;
};

export const AUDIO_VOLUME_GROUPS: AudioVolumeGroup[] = [
  "master",
  "music",
  "ambient",
  "ui",
  "sfx",
  "pet",
  "combat",
  "weather",
  "voice",
  "notifications",
];

export const DEFAULT_AUDIO_PREFS: AudioPrefs = {
  mutedAll: false,
  volumes: {
    master: 1,
    music: 0.35,
    ambient: 0.22,
    ui: 0.45,
    sfx: 0.45,
    pet: 0.5,
    combat: 0.55,
    weather: 0.35,
    voice: 0.65,
    notifications: 0.5,
  },
};

export const AUDIO_STORAGE_KEY = "riftwilds-audio-prefs";
export const LEGACY_SFX_STORAGE_KEY = "riftwilds-sfx-prefs";
export const LEGACY_MUSIC_STORAGE_KEY = "riftwilds-music-prefs";
