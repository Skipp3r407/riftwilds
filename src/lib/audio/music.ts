/**
 * Music engine — HTMLAudio crossfade + region theme mapping.
 * Independent from the floating MusicPlayer UI prefs (track index / hidden),
 * but shares AudioManager volume groups.
 */

import { REGION_MUSIC } from "@/lib/audio/catalog";
import { audioManager } from "@/lib/audio/manager";
import { clamp01 } from "@/lib/audio/prefs";

const PLAYLIST = [
  { src: "/sounds/music/sector.mp3", label: "Sector" },
  { src: "/sounds/music/airy.mp3", label: "Airy" },
  { src: "/sounds/music/magic-space.mp3", label: "Magic Space" },
  { src: "/sounds/music/pulse.mp3", label: "Pulse" },
  { src: "/sounds/music/urgent.mp3", label: "Urgent" },
  { src: "/sounds/music/transmission.mp3", label: "Transmission" },
  { src: "/sounds/music/space-graveyard.mp3", label: "Space Graveyard" },
  { src: "/sounds/music/menacing-otherworld.mp3", label: "Menacing Otherworld" },
  { src: "/sounds/music/dark-things.mp3", label: "Dark Things" },
  { src: "/sounds/music/sirens-in-darkness.mp3", label: "Sirens in Darkness" },
] as const;

type MusicMode = "idle" | "menu" | "region" | "manual";

class MusicEngine {
  private a: HTMLAudioElement | null = null;
  private b: HTMLAudioElement | null = null;
  private active: "a" | "b" = "a";
  private mode: MusicMode = "idle";
  private regionId: string | null = null;
  private trackIndex = 0;
  private playing = false;
  private unsub: (() => void) | null = null;
  private dayNightMul = 1;

  init() {
    if (typeof window === "undefined") return;
    if (!this.a) {
      this.a = new Audio();
      this.a.preload = "metadata";
      this.a.loop = true;
    }
    if (!this.b) {
      this.b = new Audio();
      this.b.preload = "metadata";
      this.b.loop = true;
    }
    if (!this.unsub) {
      this.unsub = audioManager.subscribe(() => this.applyVolume());
    }
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

  setDayNightMultiplier(mul: number) {
    this.dayNightMul = clamp01(mul);
    this.applyVolume();
  }

  async playTrack(index: number, fadeMs = 800) {
    this.init();
    this.mode = "manual";
    this.trackIndex = ((index % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    const track = PLAYLIST[this.trackIndex]!;
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
    if (idx >= 0) this.trackIndex = idx;
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
      el.src = PLAYLIST[this.trackIndex]?.src ?? PLAYLIST[0].src;
      el.loop = true;
    }
    this.applyVolume();
    try {
      await el.play();
      this.playing = true;
    } catch {
      this.playing = false;
    }
  }

  pause() {
    this.current()?.pause();
    this.other()?.pause();
    this.playing = false;
  }

  async next(fadeMs = 600) {
    await this.playTrack(this.trackIndex + 1, fadeMs);
  }

  async prev(fadeMs = 600) {
    await this.playTrack(this.trackIndex - 1, fadeMs);
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

    to.src = src;
    to.loop = true;
    to.volume = 0;
    try {
      await to.play();
    } catch {
      this.playing = false;
      return;
    }

    const targetVol = this.targetVolume();
    const t0 = performance.now();
    const fromStart = from.volume;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / Math.max(1, fadeMs));
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
        this.playing = true;
        this.applyVolume();
      }
    };
    requestAnimationFrame(tick);
  }

  private current() {
    return this.active === "a" ? this.a : this.b;
  }

  private other() {
    return this.active === "a" ? this.b : this.a;
  }

  private targetVolume() {
    return clamp01(audioManager.gainFor("music") * this.dayNightMul);
  }

  private applyVolume() {
    const el = this.current();
    if (!el) return;
    el.volume = this.playing ? this.targetVolume() : 0;
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
