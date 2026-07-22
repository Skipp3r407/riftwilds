/**
 * Procedural regional ambience — soft Web Audio layers + optional loop files.
 */

import { REGION_AMBIENT, type AmbientLayerRecipe } from "@/lib/audio/catalog";
import { audioManager } from "@/lib/audio/manager";
import { clamp01 } from "@/lib/audio/prefs";

type AmbientHandle = {
  regionId: string;
  nodes: AudioNode[];
  stop: () => void;
  setGain: (v: number) => void;
};

function createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function buildLayers(
  ctx: AudioContext,
  dest: AudioNode,
  recipe: AmbientLayerRecipe,
  initialGain: number,
): AmbientHandle["nodes"] & { gain: GainNode } {
  const bus = ctx.createGain();
  bus.gain.value = Math.max(0.0001, initialGain);
  bus.connect(dest);

  const nodes: AudioNode[] = [bus];

  // Pure oscillators read as a continuous "hum" — skip unless gain is clearly audible.
  if (recipe.droneGain > 0.01) {
    const drone = ctx.createOscillator();
    drone.type = recipe.droneType === "square" || recipe.droneType === "sawtooth"
      ? "triangle"
      : recipe.droneType;
    drone.frequency.value = recipe.droneHz;
    const droneLp = ctx.createBiquadFilter();
    droneLp.type = "lowpass";
    droneLp.frequency.value = Math.min(420, recipe.droneHz * 3.2);
    droneLp.Q.value = 0.5;
    const droneG = ctx.createGain();
    droneG.gain.value = Math.min(0.035, recipe.droneGain * 0.55);
    drone.connect(droneLp);
    droneLp.connect(droneG);
    droneG.connect(bus);
    drone.start();
    nodes.push(drone, droneLp, droneG);
  }

  if (recipe.padHz && recipe.padGain && recipe.padGain > 0.01) {
    const pad = ctx.createOscillator();
    pad.type = "sine";
    pad.frequency.value = recipe.padHz;
    const padLp = ctx.createBiquadFilter();
    padLp.type = "lowpass";
    padLp.frequency.value = Math.min(600, recipe.padHz * 2.5);
    const padG = ctx.createGain();
    padG.gain.value = Math.min(0.02, recipe.padGain * 0.5);
    pad.connect(padLp);
    padLp.connect(padG);
    padG.connect(bus);
    pad.start();
    nodes.push(pad, padLp, padG);

    if (recipe.lfoHz) {
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = recipe.lfoHz;
      const lfoG = ctx.createGain();
      lfoG.gain.value = padG.gain.value * 0.25;
      lfo.connect(lfoG);
      lfoG.connect(padG.gain);
      lfo.start();
      nodes.push(lfo, lfoG);
    }
  }

  if (recipe.noiseGain > 0) {
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = recipe.noiseFilterHz;
    filter.Q.value = 0.7;
    const nG = ctx.createGain();
    nG.gain.value = recipe.noiseGain;
    noise.connect(filter);
    filter.connect(nG);
    nG.connect(bus);
    noise.start();
    nodes.push(noise, filter, nG);
  }

  return Object.assign(nodes, { gain: bus });
}

class AmbientEngine {
  private handle: AmbientHandle | null = null;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private dayNightMul = 1;
  private weatherMul = 1;
  private loopEl: HTMLAudioElement | null = null;
  private bound = false;

  private ensureBound() {
    if (this.bound || typeof window === "undefined") return;
    this.bound = true;
    audioManager.subscribe(() => this.applyGain());
    // Same lifecycle silence as playlist beds (oscillators survive tab close).
    void import("@/lib/audio/beds").then((m) => m.installBedLifecycleGuards());
  }

  async startRegion(regionId: string, fadeMs = 1200) {
    this.ensureBound();
    if (typeof window === "undefined") return;
    if (audioManager.prefersReduced()) {
      this.stop(400);
      return;
    }
    const recipe = REGION_AMBIENT[regionId] ?? REGION_AMBIENT.menu;
    if (!recipe) return;
    if (this.handle?.regionId === regionId) {
      this.applyGain();
      return;
    }

    await this.crossfadeTo(regionId, recipe, fadeMs);
  }

  startMenu(fadeMs = 900) {
    return this.startRegion("menu", fadeMs);
  }

  stop(fadeMs = 600) {
    const h = this.handle;
    this.handle = null;
    if (this.loopEl) {
      const el = this.loopEl;
      this.loopEl = null;
      this.fadeHtml(el, 0, fadeMs, () => {
        el.pause();
        el.removeAttribute("src");
      });
    }
    if (!h) return;
    const g = (h.nodes as unknown as { gain: GainNode }).gain;
    if (g && fadeMs > 0) {
      const ctx = g.context;
      const now = ctx.currentTime;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0.0001, now + fadeMs / 1000);
      if (this.fadeTimer) clearTimeout(this.fadeTimer);
      this.fadeTimer = setTimeout(() => h.stop(), fadeMs + 40);
    } else {
      h.stop();
    }
  }

  setDayNightMultiplier(mul: number) {
    this.dayNightMul = clamp01(mul);
    this.applyGain();
  }

  setWeatherMultiplier(mul: number) {
    this.weatherMul = clamp01(mul);
    this.applyGain();
  }

  getActiveRegion(): string | null {
    return this.handle?.regionId ?? null;
  }

  private applyGain() {
    if (!this.handle) return;
    const base = audioManager.gainFor("ambient");
    const v = Math.max(0.0001, base * this.dayNightMul * this.weatherMul);
    const g = (this.handle.nodes as unknown as { gain: GainNode }).gain;
    if (g) g.gain.value = v;
    if (this.loopEl) this.loopEl.volume = clamp01(v * 0.22);
  }

  private async crossfadeTo(
    regionId: string,
    recipe: AmbientLayerRecipe,
    fadeMs: number,
  ) {
    const prev = this.handle;
    const ctx = await audioManager.getContext();
    const dest = await audioManager.getMasterDestination();
    if (!ctx || !dest) return;

    const initial = Math.max(
      0.0001,
      audioManager.gainFor("ambient") * this.dayNightMul * this.weatherMul,
    );
    const built = buildLayers(ctx, dest, recipe, 0.0001);
    const gain = built.gain;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(initial, now + fadeMs / 1000);

    const oscillators = built.filter(
      (n) => n instanceof OscillatorNode || n instanceof AudioBufferSourceNode,
    ) as Array<OscillatorNode | AudioBufferSourceNode>;

    this.handle = {
      regionId,
      nodes: built,
      setGain: (v) => {
        gain.gain.value = Math.max(0.0001, v);
      },
      stop: () => {
        for (const n of oscillators) {
          try {
            n.stop();
          } catch {
            /* already stopped */
          }
        }
        try {
          gain.disconnect();
        } catch {
          /* ignore */
        }
      },
    };

    this.tryLoopFile(regionId, initial);

    if (prev) {
      const pg = (prev.nodes as unknown as { gain: GainNode }).gain;
      if (pg) {
        pg.gain.cancelScheduledValues(now);
        pg.gain.setValueAtTime(pg.gain.value, now);
        pg.gain.linearRampToValueAtTime(0.0001, now + fadeMs / 1000);
      }
      setTimeout(() => prev.stop(), fadeMs + 40);
    }
  }

  private tryLoopFile(regionId: string, volume: number) {
    if (this.loopEl) {
      this.loopEl.pause();
      this.loopEl = null;
    }
    // Marketing menu: skip the short tonal WAV — it stacked with oscillators
    // and read as a constant site-wide hum. Live World regions keep their beds.
    if (regionId === "menu") return;

    const src = `/sounds/ambient/${regionId}.wav`;
    try {
      const el = new Audio(src);
      el.loop = true;
      el.volume = clamp01(volume * 0.22);
      el.preload = "auto";
      void el.play().catch(() => {
        /* missing file — procedural only */
      });
      this.loopEl = el;
    } catch {
      /* ignore */
    }
  }

  private fadeHtml(
    el: HTMLAudioElement,
    to: number,
    ms: number,
    done?: () => void,
  ) {
    const from = el.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      el.volume = clamp01(from + (to - from) * p);
      if (p < 1) requestAnimationFrame(step);
      else done?.();
    };
    requestAnimationFrame(step);
  }
}

export const ambientEngine = new AmbientEngine();

export function startRegionAmbient(regionId: string, fadeMs?: number) {
  return ambientEngine.startRegion(regionId, fadeMs);
}

export function startMenuAmbient(fadeMs?: number) {
  return ambientEngine.startMenu(fadeMs);
}

export function stopAmbient(fadeMs?: number) {
  ambientEngine.stop(fadeMs);
}
