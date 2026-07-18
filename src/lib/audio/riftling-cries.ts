/**
 * Per-species Riftling signature cries.
 * Assets: public/assets/audio/riftlings/{slug}.wav (mirrored under public/sounds/sfx/riftlings/).
 * Plays on the pet bus — creature SFX only; does not duck commercial music beds.
 */

import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import { audioManager } from "@/lib/audio/manager";
import { clamp01, prefersReducedSound } from "@/lib/audio/prefs";

export type RiftlingCryMood = "cry" | "idle" | "happy";

export type RiftlingCryEntry = {
  slug: string;
  /** Canonical packaging path. */
  path: string;
  /** Preferred runtime path (sounds mirror). */
  runtimePath: string;
};

const MOOD_GAIN: Record<RiftlingCryMood, number> = {
  cry: 0.72,
  idle: 0.42,
  happy: 0.65,
};

const MOOD_PLAYBACK_RATE: Record<RiftlingCryMood, number> = {
  cry: 1,
  idle: 0.92,
  happy: 1.12,
};

const DEFAULT_COMPANION_SLUG = "riftpup";
const COMPANION_SLUG_KEY = "riftwilds-companion-species-slug";

let lastPlayedAt = 0;
const GLOBAL_COOLDOWN_MS = 420;
const fileCache = new Map<string, HTMLAudioElement>();
const fileFailed = new Set<string>();

/** Every launch species maps to a unique cry path. */
export const RIFTLING_CRY_CATALOG: Record<string, RiftlingCryEntry> = Object.fromEntries(
  LAUNCH_SPECIES.map((sp) => [
    sp.slug,
    {
      slug: sp.slug,
      path: `/assets/audio/riftlings/${sp.slug}.wav`,
      runtimePath: `/sounds/sfx/riftlings/${sp.slug}.wav`,
    },
  ]),
);

export function riftlingCryPath(slug: string): string | null {
  const entry = RIFTLING_CRY_CATALOG[slug];
  return entry?.path ?? null;
}

export function hasRiftlingCry(slug: string): boolean {
  return Boolean(RIFTLING_CRY_CATALOG[slug]);
}

export function allRiftlingCrySlugs(): string[] {
  return Object.keys(RIFTLING_CRY_CATALOG);
}

/** Persist companion species for Live World idle / react vocalizations. */
export function setCompanionSpeciesSlug(slug: string | null | undefined): void {
  if (typeof window === "undefined") return;
  try {
    if (!slug || !RIFTLING_CRY_CATALOG[slug]) {
      localStorage.removeItem(COMPANION_SLUG_KEY);
      return;
    }
    localStorage.setItem(COMPANION_SLUG_KEY, slug);
  } catch {
    /* ignore quota */
  }
}

export function getCompanionSpeciesSlug(): string {
  if (typeof window === "undefined") return DEFAULT_COMPANION_SLUG;
  try {
    const raw = localStorage.getItem(COMPANION_SLUG_KEY);
    if (raw && RIFTLING_CRY_CATALOG[raw]) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_COMPANION_SLUG;
}

export type PlayRiftlingCryOpts = {
  mood?: RiftlingCryMood;
  force?: boolean;
  gainScale?: number;
  /** Skip prefers-reduced-sound gate (e.g. explicit user click). */
  ignoreReducedSound?: boolean;
};

/**
 * Play a species signature cry on the pet volume bus.
 * Falls back silently if the file is missing (procedural pet care SFX still fire elsewhere).
 */
export function playRiftlingCry(slug: string | null | undefined, opts?: PlayRiftlingCryOpts): void {
  if (typeof window === "undefined") return;
  if (!slug || !RIFTLING_CRY_CATALOG[slug]) return;

  const mood: RiftlingCryMood = opts?.mood ?? "cry";
  if (!opts?.force && !opts?.ignoreReducedSound && prefersReducedSound() && mood === "idle") {
    return;
  }

  const petGain = audioManager.gainFor("pet");
  if (petGain <= 0) return;

  const now = performance.now();
  if (!opts?.force && now - lastPlayedAt < GLOBAL_COOLDOWN_MS) return;
  lastPlayedAt = now;

  const entry = RIFTLING_CRY_CATALOG[slug]!;
  const volume = clamp01(
    petGain * MOOD_GAIN[mood] * clamp01(opts?.gainScale ?? 1),
  );
  const rate = MOOD_PLAYBACK_RATE[mood];

  // Prefer runtime mirror; fall back to assets path.
  tryPlay(entry.runtimePath, volume, rate, () => {
    tryPlay(entry.path, volume, rate, () => {
      fileFailed.add(entry.runtimePath);
      fileFailed.add(entry.path);
    });
  });
}

export function playCompanionCry(opts?: PlayRiftlingCryOpts): void {
  playRiftlingCry(getCompanionSpeciesSlug(), opts);
}

function tryPlay(src: string, volume: number, rate: number, onFail: () => void): void {
  if (fileFailed.has(src)) {
    onFail();
    return;
  }
  let failed = false;
  const failOnce = () => {
    if (failed) return;
    failed = true;
    fileFailed.add(src);
    onFail();
  };
  try {
    void audioManager.unlock();
    let proto = fileCache.get(src);
    if (!proto) {
      proto = new Audio(src);
      proto.preload = "auto";
      fileCache.set(src, proto);
    }
    const node = proto.cloneNode(true) as HTMLAudioElement;
    node.volume = volume;
    try {
      node.playbackRate = rate;
    } catch {
      /* some browsers reject extreme rates */
    }
    node.addEventListener("error", failOnce, { once: true });
    void node.play().catch(failOnce);
  } catch {
    failOnce();
  }
}
