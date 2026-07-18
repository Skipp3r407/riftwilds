/**
 * Positional audio stubs — distance-based gain for forge / portal / water.
 * Phaser scenes pass world positions; no full PannerNode mesh required yet.
 */

import { audioManager } from "@/lib/audio/manager";
import { clamp01 } from "@/lib/audio/prefs";

export type PositionalSourceKind = "forge" | "portal" | "water" | "custom";

export type PositionalSource = {
  id: string;
  kind: PositionalSourceKind;
  x: number;
  y: number;
  /** Distance where gain reaches ~0. */
  radius: number;
  /** Peak gain at source (0–1), before ambient bus. */
  peak?: number;
};

type ActiveLoop = {
  source: PositionalSource;
  osc: OscillatorNode | null;
  noise: AudioBufferSourceNode | null;
  gain: GainNode;
};

const KIND_TONE: Record<
  PositionalSourceKind,
  { freq: number; type: OscillatorType; noise?: boolean }
> = {
  forge: { freq: 70, type: "sawtooth", noise: true },
  portal: { freq: 180, type: "sine", noise: false },
  water: { freq: 0, type: "sine", noise: true },
  custom: { freq: 140, type: "triangle", noise: false },
};

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Linear distance attenuation 1 at 0 → 0 at radius. */
export function distanceGain(
  dx: number,
  dy: number,
  radius: number,
  peak = 1,
): number {
  if (radius <= 0) return 0;
  const d = Math.hypot(dx, dy);
  if (d >= radius) return 0;
  return clamp01(peak * (1 - d / radius));
}

class PositionalAudio {
  private loops = new Map<string, ActiveLoop>();
  private listener = { x: 0, y: 0 };

  setListener(x: number, y: number) {
    this.listener = { x, y };
    this.updateGains();
  }

  async upsert(source: PositionalSource) {
    if (typeof window === "undefined") return;
    if (audioManager.prefersReduced()) return;
    const existing = this.loops.get(source.id);
    if (existing) {
      existing.source = source;
      this.updateGains();
      return;
    }
    const ctx = await audioManager.getContext();
    const dest = await audioManager.getMasterDestination();
    if (!ctx || !dest) return;

    const bus = ctx.createGain();
    bus.gain.value = 0.0001;
    bus.connect(dest);

    const tone = KIND_TONE[source.kind];
    let osc: OscillatorNode | null = null;
    let noise: AudioBufferSourceNode | null = null;

    if (tone.freq > 0) {
      osc = ctx.createOscillator();
      osc.type = tone.type;
      osc.frequency.value = tone.freq;
      const g = ctx.createGain();
      g.gain.value = 0.04;
      osc.connect(g);
      g.connect(bus);
      osc.start();
    }
    if (tone.noise) {
      noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer(ctx);
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = source.kind === "water" ? "lowpass" : "bandpass";
      filter.frequency.value = source.kind === "water" ? 900 : 500;
      const g = ctx.createGain();
      g.gain.value = source.kind === "water" ? 0.05 : 0.03;
      noise.connect(filter);
      filter.connect(g);
      g.connect(bus);
      noise.start();
    }

    this.loops.set(source.id, { source, osc, noise, gain: bus });
    this.updateGains();
  }

  remove(id: string) {
    const loop = this.loops.get(id);
    if (!loop) return;
    try {
      loop.osc?.stop();
      loop.noise?.stop();
      loop.gain.disconnect();
    } catch {
      /* ignore */
    }
    this.loops.delete(id);
  }

  clear() {
    for (const id of [...this.loops.keys()]) this.remove(id);
  }

  private updateGains() {
    const ambient = audioManager.gainFor("ambient");
    for (const loop of this.loops.values()) {
      const g = distanceGain(
        this.listener.x - loop.source.x,
        this.listener.y - loop.source.y,
        loop.source.radius,
        loop.source.peak ?? 1,
      );
      loop.gain.gain.value = Math.max(0.0001, g * ambient * 0.7);
    }
  }
}

export const positionalAudio = new PositionalAudio();
