import {
  AUDIO_STORAGE_KEY,
  AUDIO_VOLUME_GROUPS,
  DEFAULT_AUDIO_PREFS,
  LEGACY_MUSIC_STORAGE_KEY,
  LEGACY_SFX_STORAGE_KEY,
  type AudioPrefs,
  type AudioVolumeGroup,
} from "@/lib/audio/types";

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function effectiveVolume(
  prefs: AudioPrefs,
  group: Exclude<AudioVolumeGroup, "master">,
): number {
  if (prefs.mutedAll) return 0;
  const master = clamp01(prefs.volumes.master);
  const g = clamp01(prefs.volumes[group]);
  if (master <= 0 || g <= 0) return 0;
  return master * g;
}

export function normalizePrefs(raw: Partial<AudioPrefs> | null | undefined): AudioPrefs {
  const volumes = { ...DEFAULT_AUDIO_PREFS.volumes };
  if (raw?.volumes && typeof raw.volumes === "object") {
    for (const key of AUDIO_VOLUME_GROUPS) {
      const v = raw.volumes[key];
      if (typeof v === "number") volumes[key] = clamp01(v);
    }
  }
  return {
    mutedAll: Boolean(raw?.mutedAll),
    volumes,
  };
}

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/** Migrate legacy music/SFX mute+volume into unified prefs once. */
export function migrateLegacyPrefs(): AudioPrefs | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(AUDIO_STORAGE_KEY)) return null;

  const prefs = normalizePrefs(null);
  const sfx = readJson(LEGACY_SFX_STORAGE_KEY) as {
    muted?: boolean;
    volume?: number;
  } | null;
  const music = readJson(LEGACY_MUSIC_STORAGE_KEY) as {
    muted?: boolean;
    volume?: number;
  } | null;

  if (sfx) {
    if (typeof sfx.volume === "number") {
      const v = clamp01(sfx.volume);
      prefs.volumes.sfx = v;
      prefs.volumes.ui = v;
      prefs.volumes.pet = v;
      prefs.volumes.combat = v;
    }
    if (sfx.muted) prefs.mutedAll = false; // keep group mute via volume 0 path below
    if (sfx.muted) {
      prefs.volumes.sfx = 0;
      prefs.volumes.ui = 0;
    }
  }
  if (music) {
    if (typeof music.volume === "number") {
      prefs.volumes.music = clamp01(music.volume);
    }
    if (music.muted) prefs.volumes.music = 0;
  }

  return prefs;
}

export function readAudioPrefs(): AudioPrefs {
  if (typeof window === "undefined") return normalizePrefs(null);
  const existing = readJson(AUDIO_STORAGE_KEY) as Partial<AudioPrefs> | null;
  if (existing) return normalizePrefs(existing);
  const migrated = migrateLegacyPrefs();
  if (migrated) {
    writeAudioPrefs(migrated);
    return migrated;
  }
  return normalizePrefs(null);
}

export function writeAudioPrefs(prefs: AudioPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}

export function prefersReducedSound(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return true;
  } catch {
    /* ignore */
  }
  return false;
}
