/**
 * Adaptive music stem layers — procedural pads / pulse / choir overlays.
 * Complements CC0 HTMLAudio beds in MusicEngine (true multi-stem files = Phase 2).
 */

import { audioManager } from "@/lib/audio/manager";
import { clamp01 } from "@/lib/audio/prefs";

export type StemLayerId = "pad" | "pulse" | "choir" | "tension";

type StemNodes = {
  id: StemLayerId;
  osc: OscillatorNode[];
  gain: GainNode;
};

class MusicStemMixer {
  private layers = new Map<StemLayerId, StemNodes>();
  private bus: GainNode | null = null;
  private intensity = 0;
  private active = false;
  private bound = false;

  isActive() {
    return this.active;
  }

  /** Start combat/boss stem bed under the music bus. */
  async startCombatBed() {
    if (typeof window === "undefined") return;
    if (audioManager.prefersReduced()) return;
    await this.ensure();
    this.active = true;
    await this.setIntensity(0.65);
  }

  async startBossBed() {
    if (typeof window === "undefined") return;
    if (audioManager.prefersReduced()) return;
    await this.ensure();
    this.active = true;
    await this.setIntensity(0.9);
  }

  async stop(fadeMs = 800) {
    const ctx = await audioManager.getContext();
    if (!ctx || !this.bus) {
      this.active = false;
      this.teardown();
      return;
    }
    this.active = false;
    if (fadeMs <= 0) {
      this.teardown();
      return;
    }
    const t = ctx.currentTime;
    this.bus.gain.cancelScheduledValues(t);
    this.bus.gain.setValueAtTime(this.bus.gain.value, t);
    this.bus.gain.linearRampToValueAtTime(0.0001, t + fadeMs / 1000);
    window.setTimeout(() => {
      this.teardown();
    }, fadeMs + 40);
  }

  async setIntensity(value: number) {
    this.intensity = clamp01(value);
    await this.ensure();
    if (!this.bus) return;
    const music = audioManager.gainFor("music");
    // Keep stems under the music bed — never clip.
    const target = Math.max(0.0001, music * 0.22 * this.intensity);
    const ctx = await audioManager.getContext();
    if (!ctx) return;
    this.bus.gain.setTargetAtTime(target, ctx.currentTime, 0.25);

    this.setLayer("pad", 0.35 + this.intensity * 0.2);
    this.setLayer("pulse", this.intensity > 0.4 ? 0.15 + this.intensity * 0.35 : 0.02);
    this.setLayer("choir", this.intensity > 0.55 ? (this.intensity - 0.55) * 0.5 : 0.01);
    this.setLayer("tension", this.intensity > 0.7 ? (this.intensity - 0.7) * 0.6 : 0.01);
  }

  private setLayer(id: StemLayerId, gain: number) {
    const layer = this.layers.get(id);
    if (!layer) return;
    layer.gain.gain.value = Math.max(0.0001, clamp01(gain) * 0.08);
  }

  private async ensure() {
    if (this.bound) return;
    const ctx = await audioManager.getContext();
    const dest = await audioManager.getMasterDestination();
    if (!ctx || !dest) return;

    this.bus = ctx.createGain();
    this.bus.gain.value = 0.0001;
    this.bus.connect(dest);

    this.spawnLayer(ctx, "pad", [
      { freq: 110, type: "sine" },
      { freq: 165, type: "triangle" },
    ]);
    this.spawnLayer(ctx, "pulse", [{ freq: 55, type: "triangle" }]);
    this.spawnLayer(ctx, "choir", [
      { freq: 220, type: "sine" },
      { freq: 277, type: "sine" },
      { freq: 330, type: "sine" },
    ]);
    this.spawnLayer(ctx, "tension", [
      { freq: 90, type: "sawtooth" },
      { freq: 180, type: "triangle" },
    ]);

    // Soft LFO on pulse for heartbeat feel
    const pulse = this.layers.get("pulse");
    if (pulse) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 1.6;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 0.04;
      lfo.connect(lfoG);
      lfoG.connect(pulse.gain.gain);
      lfo.start();
    }

    this.bound = true;
    if (!this.unsub) {
      this.unsub = audioManager.subscribe(() => {
        if (this.active) void this.setIntensity(this.intensity);
      });
    }
  }

  private unsub: (() => void) | null = null;

  private spawnLayer(
    ctx: AudioContext,
    id: StemLayerId,
    partials: Array<{ freq: number; type: OscillatorType }>,
  ) {
    if (!this.bus) return;
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = id === "choir" ? 2400 : id === "tension" ? 900 : 1400;
    gain.connect(lp);
    lp.connect(this.bus);

    const oscs: OscillatorNode[] = [];
    for (const p of partials) {
      const osc = ctx.createOscillator();
      osc.type = p.type === "sawtooth" || p.type === "square" ? "triangle" : p.type;
      osc.frequency.value = p.freq;
      const g = ctx.createGain();
      g.gain.value = 0.35 / partials.length;
      osc.connect(g);
      g.connect(gain);
      osc.start();
      oscs.push(osc);
    }
    this.layers.set(id, { id, osc: oscs, gain });
  }

  private teardown() {
    for (const layer of this.layers.values()) {
      for (const osc of layer.osc) {
        try {
          osc.stop();
        } catch {
          /* ignore */
        }
      }
      try {
        layer.gain.disconnect();
      } catch {
        /* ignore */
      }
    }
    this.layers.clear();
    try {
      this.bus?.disconnect();
    } catch {
      /* ignore */
    }
    this.bus = null;
    this.bound = false;
    this.unsub?.();
    this.unsub = null;
  }
}

export const musicStems = new MusicStemMixer();
