/**
 * Music engine — HTMLAudio crossfade + region theme mapping.
 * Independent from the floating MusicPlayer UI prefs (track index / hidden),
 * but shares AudioManager volume groups.
 */

import { REGION_MUSIC } from "@/lib/audio/catalog";
import { audioManager } from "@/lib/audio/manager";
import { clamp01 } from "@/lib/audio/prefs";

/**
 * Site ambience playlist. `gain` boosts very quiet bed tracks so they stay
 * audible at typical Music bus levels without clipping louder cues.
 */
const PLAYLIST = [
  { src: "/sounds/music/sector.mp3", label: "Sector", mood: "Wander", gain: 2.4 },
  { src: "/sounds/music/airy.mp3", label: "Airy", mood: "Coast", gain: 2.6 },
  { src: "/sounds/music/magic-space.mp3", label: "Magic Space", mood: "Wonder", gain: 1 },
  { src: "/sounds/music/pulse.mp3", label: "Pulse", mood: "Storm", gain: 2.2 },
  { src: "/sounds/music/urgent.mp3", label: "Urgent", mood: "Ember", gain: 2.5 },
  { src: "/sounds/music/transmission.mp3", label: "Transmission", mood: "Stone", gain: 1.15 },
  { src: "/sounds/music/icy-realm.mp3", label: "Icy Realm", mood: "Frost", gain: 1 },
  { src: "/sounds/music/menacing-otherworld.mp3", label: "Menacing Otherworld", mood: "Ruin", gain: 1 },
  { src: "/sounds/music/dark-things.mp3", label: "Dark Things", mood: "Void", gain: 1 },
  { src: "/sounds/music/sirens-in-darkness.mp3", label: "Sirens in Darkness", mood: "Radiant", gain: 1.1 },
] as const;

type MusicMode = "idle" | "menu" | "region" | "manual";
type MusicListener = () => void;

function fisherYates(indices: number[]): number[] {
  const out = [...indices];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

class MusicEngine {
  private a: HTMLAudioElement | null = null;
  private b: HTMLAudioElement | null = null;
  private active: "a" | "b" = "a";
  private mode: MusicMode = "idle";
  private regionId: string | null = null;
  private trackIndex = 0;
  private trackGain = 1;
  private playing = false;
  private unsub: (() => void) | null = null;
  private dayNightMul = 1;
  private listeners = new Set<MusicListener>();
  /** Bumps to cancel in-flight crossfade rAF ticks (prevents pausing the live bed). */
  private fadeGen = 0;
  private fading = false;
  /** When true, next / end-of-track pick from a shuffled bag (no immediate repeat). */
  private shuffle = false;
  /** Remaining indices for the current shuffle pass. */
  private shuffleBag: number[] = [];
  /** Recent track history for shuffle "previous". */
  private history: number[] = [];

  init() {
    if (typeof window === "undefined") return;
    if (!this.a) {
      this.a = new Audio();
      this.a.preload = "auto";
      this.a.loop = false;
      this.bindEnded(this.a);
    }
    if (!this.b) {
      this.b = new Audio();
      this.b.preload = "auto";
      this.b.loop = false;
      this.bindEnded(this.b);
    }
    if (!this.unsub) {
      this.unsub = audioManager.subscribe(() => this.applyVolume());
    }
    // Arm pagehide/visibility silence without a static beds ↔ music import cycle.
    void import("@/lib/audio/beds").then((m) => m.installBedLifecycleGuards());
  }

  /** UI sync — fires when play state, track index, or shuffle changes. */
  subscribe(listener: MusicListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }

  private bindEnded(el: HTMLAudioElement) {
    el.addEventListener("ended", () => {
      // Only the live bed advances; ignore the faded-out twin after crossfade.
      if (el !== this.current()) return;
      if (!this.playing) return;
      if (this.fading) return;
      void this.next(700);
    });
  }

  getPlaylist() {
    return PLAYLIST;
  }

  getTrackIndex() {
    return this.trackIndex;
  }

  isPlaying() {
    return this.playing;
  }

  getMode() {
    return this.mode;
  }

  isShuffle() {
    return this.shuffle;
  }

  setShuffle(on: boolean) {
    this.shuffle = on;
    if (on) {
      this.refillShuffleBag(this.trackIndex);
    } else {
      this.shuffleBag = [];
    }
    this.emit();
  }

  setDayNightMultiplier(mul: number) {
    this.dayNightMul = clamp01(mul);
    this.applyVolume();
  }

  /** True when the live bed element already has a source loaded. */
  hasLoadedTrack() {
    const el = this.current();
    return Boolean(el?.getAttribute("src"));
  }

  /**
   * Resume the current bed without seeking, or start `index` if nothing is loaded.
   * Safe for MusicPlayer remount / autoplay — never restarts a playing track.
   */
  async resumeOrPlay(index: number, fadeMs = 500) {
    this.init();
    if (this.playing && this.hasLoadedTrack()) return;
    if (this.hasLoadedTrack()) {
      await this.play();
      return;
    }
    await this.playTrack(index, fadeMs);
  }

  async playTrack(index: number, fadeMs = 800) {
    this.init();
    this.mode = "manual";
    const nextIndex = ((index % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    const track = PLAYLIST[nextIndex]!;
    // Same track already audible — do not seek to 0 or re-crossfade.
    if (this.playing && nextIndex === this.trackIndex) {
      const el = this.current();
      const src = el?.getAttribute("src") || "";
      if (el && !el.paused && (src === track.src || src.endsWith(track.src))) {
        this.trackGain = track.gain;
        this.applyVolume();
        this.emit();
        return;
      }
    }
    if (this.playing && nextIndex !== this.trackIndex) {
      this.history.push(this.trackIndex);
      if (this.history.length > PLAYLIST.length) this.history.shift();
    }
    this.trackIndex = nextIndex;
    this.trackGain = track.gain;
    if (this.shuffle) {
      this.shuffleBag = this.shuffleBag.filter((i) => i !== this.trackIndex);
      if (this.shuffleBag.length === 0) this.refillShuffleBag(this.trackIndex);
    }
    this.emit();
    await this.crossfadeTo(track.src, fadeMs);
  }

  async playRegionTheme(regionId: string, fadeMs = 1400) {
    this.init();
    if (audioManager.prefersReduced()) {
      this.pause();
      return;
    }
    this.mode = "region";
    this.regionId = regionId;
    const theme = REGION_MUSIC[regionId] ?? REGION_MUSIC.menu;
    if (!theme) return;
    const idx = PLAYLIST.findIndex((t) => t.src === theme.src);
    if (idx >= 0) {
      if (this.playing && idx !== this.trackIndex) {
        this.history.push(this.trackIndex);
        if (this.history.length > PLAYLIST.length) this.history.shift();
      }
      this.trackIndex = idx;
      this.trackGain = PLAYLIST[idx]!.gain;
      if (this.shuffle) {
        this.shuffleBag = this.shuffleBag.filter((i) => i !== this.trackIndex);
        if (this.shuffleBag.length === 0) this.refillShuffleBag(this.trackIndex);
      }
    } else {
      this.trackGain = 1;
    }
    this.emit();
    await this.crossfadeTo(theme.src, fadeMs);
  }

  async playMenuTheme(fadeMs = 1000) {
    return this.playRegionTheme("menu", fadeMs);
  }

  async play() {
    this.init();
    await audioManager.unlock();
    const el = this.current();
    if (!el) return;
    if (!el.getAttribute("src")) {
      const track = PLAYLIST[this.trackIndex] ?? PLAYLIST[0];
      el.src = track.src;
      el.loop = false;
      this.trackGain = track.gain;
    }
    this.applyVolume();
    try {
      await el.play();
      this.playing = true;
      this.emit();
    } catch {
      this.playing = false;
      this.emit();
    }
  }

  pause() {
    this.fadeGen += 1;
    this.fading = false;
    this.current()?.pause();
    this.other()?.pause();
    this.playing = false;
    if (this.a) this.a.volume = 0;
    if (this.b) this.b.volume = 0;
    this.emit();
  }

  async next(fadeMs = 600) {
    await this.playTrack(this.pickNextIndex(), fadeMs);
  }

  async prev(fadeMs = 600) {
    await this.playTrack(this.pickPrevIndex(), fadeMs);
  }

  /** Smooth crossfade API for external callers. */
  async crossfadeTo(src: string, fadeMs = 1000) {
    this.init();
    await audioManager.unlock();
    const from = this.current();
    const to = this.other();
    if (!from || !to) return;

    const same =
      (from.getAttribute("src") || "").endsWith(src) && !from.paused && this.playing;
    if (same) {
      this.applyVolume();
      return;
    }

    // Cancel any in-flight fade so a stale completion cannot pause the live bed
    // or flip `active` onto a paused element (audible cutoff after a few seconds).
    const gen = ++this.fadeGen;
    this.fading = true;

    // Keep playlist gain in sync when callers pass a raw src (region / menu).
    const idx = PLAYLIST.findIndex((t) => t.src === src || src.endsWith(t.src));
    if (idx >= 0) this.trackGain = PLAYLIST[idx]!.gain;

    to.src = src;
    to.loop = false;
    to.volume = 0;
    try {
      await to.play();
    } catch {
      if (gen === this.fadeGen) {
        this.fading = false;
        this.playing = false;
        this.emit();
      }
      return;
    }

    if (gen !== this.fadeGen) return;

    // Mark playing as soon as audio is audible — do not wait for fade end
    // (UI reads isPlaying() right after playTrack / crossfadeTo resolves).
    this.playing = true;
    this.emit();

    const t0 = performance.now();
    const fromStart = from.volume;
    const tick = (now: number) => {
      if (gen !== this.fadeGen) return;
      const p = Math.min(1, (now - t0) / Math.max(1, fadeMs));
      const targetVol = this.targetVolume();
      to.volume = clamp01(targetVol * p);
      if (!from.paused && from.getAttribute("src")) {
        from.volume = clamp01(fromStart * (1 - p));
      }
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        from.pause();
        from.volume = 0;
        this.active = this.active === "a" ? "b" : "a";
        this.fading = false;
        this.playing = true;
        this.applyVolume();
        this.emit();
      }
    };
    requestAnimationFrame(tick);
  }

  private refillShuffleBag(exclude: number | null) {
    const pool = PLAYLIST.map((_, i) => i).filter((i) => i !== exclude);
    this.shuffleBag = fisherYates(pool.length > 0 ? pool : PLAYLIST.map((_, i) => i));
  }

  private pickNextIndex(): number {
    if (!this.shuffle || PLAYLIST.length <= 1) {
      return (this.trackIndex + 1) % PLAYLIST.length;
    }
    if (this.shuffleBag.length === 0) {
      this.refillShuffleBag(this.trackIndex);
    }
    const next = this.shuffleBag.shift();
    if (typeof next === "number") return next;
    return (this.trackIndex + 1) % PLAYLIST.length;
  }

  private pickPrevIndex(): number {
    if (this.shuffle && this.history.length > 0) {
      return this.history.pop()!;
    }
    return (this.trackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
  }

  private current() {
    return this.active === "a" ? this.a : this.b;
  }

  private other() {
    return this.active === "a" ? this.b : this.a;
  }

  private targetVolume() {
    return clamp01(audioManager.gainFor("music") * this.dayNightMul * this.trackGain);
  }

  private applyVolume() {
    if (!this.a || !this.b) return;
    if (!this.playing) {
      this.a.volume = 0;
      this.b.volume = 0;
      return;
    }
    // Mid-crossfade: rAF owns both volumes (re-reads targetVolume each frame).
    if (this.fading) return;
    const el = this.current();
    const other = this.other();
    if (el) el.volume = this.targetVolume();
    if (other) other.volume = 0;
  }
}

export const musicEngine = new MusicEngine();

export function playRegionMusic(regionId: string, fadeMs?: number) {
  return musicEngine.playRegionTheme(regionId, fadeMs);
}

export function playMenuMusic(fadeMs?: number) {
  return musicEngine.playMenuTheme(fadeMs);
}

export function crossfadeMusic(src: string, fadeMs?: number) {
  return musicEngine.crossfadeTo(src, fadeMs);
}

export { PLAYLIST as MUSIC_PLAYLIST };
