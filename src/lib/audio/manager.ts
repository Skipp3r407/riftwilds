/**
 * Centralized Audio Manager — volume groups, mute, fade/duck, unlock, context.
 * Music / ambient / SFX engines subscribe here; do not create parallel prefs.
 */

import {
  clamp01,
  effectiveVolume,
  prefersReducedSound,
  readAudioPrefs,
  writeAudioPrefs,
} from "@/lib/audio/prefs";
import {
  DEFAULT_AUDIO_PREFS,
  type AudioPrefs,
  type AudioPriority,
  type AudioVolumeGroup,
} from "@/lib/audio/types";

type PrefsListener = (prefs: AudioPrefs) => void;

type DuckState = {
  id: string;
  amount: number;
  until: number;
  buses: Array<"music" | "ambient">;
};

class AudioManager {
  private prefs: AudioPrefs = DEFAULT_AUDIO_PREFS;
  private listeners = new Set<PrefsListener>();
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private unlocked = false;
  private gestureBound = false;
  private ducks = new Map<string, DuckState>();
  private duckTimer: ReturnType<typeof setInterval> | null = null;
  private musicDuck = 1;
  private ambientDuck = 1;

  init() {
    if (typeof window === "undefined") return;
    this.prefs = readAudioPrefs();
    this.bindGestureUnlock();
    this.emit();
  }

  getPrefs(): AudioPrefs {
    return this.prefs;
  }

  subscribe(listener: PrefsListener): () => void {
    this.listeners.add(listener);
    listener(this.prefs);
    return () => this.listeners.delete(listener);
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  prefersReduced(): boolean {
    return prefersReducedSound();
  }

  setMutedAll(muted: boolean) {
    this.prefs = { ...this.prefs, mutedAll: muted };
    this.persist();
  }

  toggleMuteAll() {
    this.setMutedAll(!this.prefs.mutedAll);
  }

  setVolume(group: AudioVolumeGroup, volume: number) {
    const v = clamp01(volume);
    let mutedAll = this.prefs.mutedAll;
    if (group === "master" && v === 0) mutedAll = true;
    // Raising any bus implies the user wants sound again (floating player / SFX).
    if (v > 0) mutedAll = false;
    this.prefs = {
      ...this.prefs,
      mutedAll,
      volumes: { ...this.prefs.volumes, [group]: v },
    };
    this.persist();
    this.applyMasterGain();
  }

  /** Effective linear gain for a volume group (includes master + mute-all). */
  gainFor(group: Exclude<AudioVolumeGroup, "master">): number {
    let g = effectiveVolume(this.prefs, group);
    if (group === "music") g *= this.musicDuck;
    if (group === "ambient") g *= this.ambientDuck;
    return g;
  }

  /** Duck music/ambient briefly for combat stingers / UI focus. */
  duck(
    id: string,
    opts: {
      amount?: number;
      durationMs?: number;
      buses?: Array<"music" | "ambient">;
      priority?: AudioPriority;
    } = {},
  ) {
    const amount = clamp01(opts.amount ?? 0.45);
    const durationMs = opts.durationMs ?? 900;
    const buses = opts.buses ?? ["music", "ambient"];
    this.ducks.set(id, {
      id,
      amount,
      until: performance.now() + durationMs,
      buses,
    });
    this.recomputeDucks();
    this.ensureDuckTicker();
  }

  clearDuck(id: string) {
    this.ducks.delete(id);
    this.recomputeDucks();
  }

  async unlock(): Promise<void> {
    if (typeof window === "undefined") return;
    const ctx = await this.ensureContext();
    if (ctx?.state === "running") this.unlocked = true;
  }

  /** Suspend the shared AudioContext (page hide / unload). Next unlock/play resumes it. */
  suspendContext() {
    if (!this.ctx || this.ctx.state !== "running") return;
    void this.ctx.suspend().catch(() => {
      /* ignore */
    });
  }

  async getContext(): Promise<AudioContext | null> {
    return this.ensureContext();
  }

  /** Shared destination after master gain (for procedural buses). */
  async getMasterDestination(): Promise<AudioNode | null> {
    const ctx = await this.ensureContext();
    if (!ctx) return null;
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
      this.applyMasterGain();
    }
    return this.masterGain;
  }

  private persist() {
    writeAudioPrefs(this.prefs);
    this.emit();
  }

  private emit() {
    for (const l of this.listeners) l(this.prefs);
  }

  private applyMasterGain() {
    if (!this.masterGain) return;
    const v = this.prefs.mutedAll ? 0 : clamp01(this.prefs.volumes.master);
    this.masterGain.gain.value = Math.max(0.0001, v);
  }

  private recomputeDucks() {
    const now = performance.now();
    let music = 1;
    let ambient = 1;
    for (const d of this.ducks.values()) {
      if (d.until <= now) {
        this.ducks.delete(d.id);
        continue;
      }
      const factor = 1 - d.amount;
      if (d.buses.includes("music")) music = Math.min(music, factor);
      if (d.buses.includes("ambient")) ambient = Math.min(ambient, factor);
    }
    this.musicDuck = music;
    this.ambientDuck = ambient;
    this.emit();
  }

  private ensureDuckTicker() {
    if (this.duckTimer || typeof window === "undefined") return;
    this.duckTimer = setInterval(() => {
      if (this.ducks.size === 0) {
        if (this.duckTimer) clearInterval(this.duckTimer);
        this.duckTimer = null;
        return;
      }
      this.recomputeDucks();
    }, 200);
  }

  private bindGestureUnlock() {
    if (this.gestureBound || typeof window === "undefined") return;
    this.gestureBound = true;
    const unlock = () => {
      void this.unlock();
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
  }

  private async ensureContext(): Promise<AudioContext | null> {
    if (typeof window === "undefined") return null;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!this.ctx) this.ctx = new AC();
    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        return this.ctx;
      }
    }
    this.unlocked = this.ctx.state === "running";
    return this.ctx;
  }
}

export const audioManager = new AudioManager();

if (typeof window !== "undefined") {
  audioManager.init();
}

export function unlockAudio() {
  void audioManager.unlock();
}
