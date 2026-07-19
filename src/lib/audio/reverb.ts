/**
 * Stereo reverb zones via ConvolverNode + generated impulse responses.
 * Web Audio stereo path — 5.1/7.1 deferred (see ADD).
 */

import { audioManager } from "@/lib/audio/manager";
import { clamp01 } from "@/lib/audio/prefs";

export type ReverbZoneId =
  | "none"
  | "open"
  | "forest"
  | "cave"
  | "temple"
  | "arena"
  | "underwater"
  | "void";

type ZoneRecipe = {
  decaySec: number;
  wet: number;
  filterHz: number;
};

const ZONES: Record<ReverbZoneId, ZoneRecipe> = {
  none: { decaySec: 0.05, wet: 0, filterHz: 8000 },
  open: { decaySec: 0.35, wet: 0.08, filterHz: 4500 },
  forest: { decaySec: 0.55, wet: 0.14, filterHz: 2800 },
  cave: { decaySec: 1.4, wet: 0.28, filterHz: 1800 },
  temple: { decaySec: 1.8, wet: 0.32, filterHz: 3200 },
  arena: { decaySec: 1.1, wet: 0.22, filterHz: 3600 },
  underwater: { decaySec: 0.9, wet: 0.35, filterHz: 900 },
  void: { decaySec: 2.2, wet: 0.4, filterHz: 1200 },
};

function buildImpulse(ctx: AudioContext, decaySec: number): AudioBuffer {
  const len = Math.max(1, Math.floor(ctx.sampleRate * decaySec));
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / len;
      const env = Math.pow(1 - t, 2.4);
      // Slight L/R decorrelation for stereo width
      const n = (Math.random() * 2 - 1) * (ch === 0 ? 1 : 0.92);
      data[i] = n * env;
    }
  }
  return buf;
}

class ReverbEngine {
  private zone: ReverbZoneId = "none";
  private convolver: ConvolverNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private input: GainNode | null = null;
  private bound = false;

  getZone() {
    return this.zone;
  }

  /** Shared insert for engines that want wet path (optional). */
  async getInput(): Promise<AudioNode | null> {
    await this.ensureGraph();
    return this.input;
  }

  async setZone(zone: ReverbZoneId, fadeMs = 400) {
    this.zone = zone;
    await this.ensureGraph();
    if (!this.wetGain || !this.filter || !this.convolver) return;
    const recipe = ZONES[zone];
    const ctx = await audioManager.getContext();
    if (!ctx) return;

    this.convolver.buffer = buildImpulse(ctx, Math.max(0.05, recipe.decaySec));
    this.filter.frequency.setTargetAtTime(
      recipe.filterHz,
      ctx.currentTime,
      fadeMs / 3000,
    );
    const ambient = audioManager.gainFor("ambient");
    const wet = clamp01(recipe.wet * ambient);
    this.wetGain.gain.setTargetAtTime(Math.max(0.0001, wet), ctx.currentTime, fadeMs / 3000);
  }

  /** Map soundscape / biome keywords → zone. */
  zoneForMode(mode: string, regionId?: string | null): ReverbZoneId {
    if (mode === "battle" || mode === "arena" || mode === "boss") return "arena";
    if (mode === "housing") return "open";
    if (mode === "codex" || mode === "deck") return "temple";
    if (regionId?.includes("forest") || regionId?.includes("elderwood") || regionId?.includes("marsh")) {
      return "forest";
    }
    if (regionId?.includes("void") || regionId?.includes("hollow")) return "void";
    if (regionId?.includes("citadel") || regionId?.includes("radiant")) return "temple";
    if (regionId?.includes("coast") || regionId?.includes("moonwater")) return "underwater";
    if (regionId?.includes("canyon") || regionId?.includes("crater") || regionId?.includes("alloy")) {
      return "cave";
    }
    return "open";
  }

  private async ensureGraph() {
    if (this.bound) return;
    const ctx = await audioManager.getContext();
    const dest = await audioManager.getMasterDestination();
    if (!ctx || !dest) return;

    this.input = ctx.createGain();
    this.dryGain = ctx.createGain();
    this.dryGain.gain.value = 1;
    this.wetGain = ctx.createGain();
    this.wetGain.gain.value = 0.0001;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 4000;
    this.convolver = ctx.createConvolver();
    this.convolver.buffer = buildImpulse(ctx, 0.4);

    this.input.connect(this.dryGain);
    this.dryGain.connect(dest);
    this.input.connect(this.filter);
    this.filter.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(dest);
    this.bound = true;
  }
}

export const reverbEngine = new ReverbEngine();
export { ZONES as REVERB_ZONE_RECIPES };
