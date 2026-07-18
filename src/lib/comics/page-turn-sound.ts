/**
 * Soft paper-rustle for comic page turns (procedural Web Audio).
 * Respects comic settings.sfxEnabled; no asset files required.
 */

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedCtx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      sharedCtx = new AC();
    }
    if (sharedCtx.state === "suspended") {
      void sharedCtx.resume();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

function noiseBuffer(ctx: AudioContext, seconds = 0.35): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // Brown-ish noise — softer paper scrape than white noise
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buf;
}

/** Play a short parchment rustle. No-op when disabled or Audio unavailable. */
export function playPageTurnSound(enabled: boolean, direction: 1 | -1 | 0 = 1): void {
  if (!enabled || direction === 0) return;
  const ctx = getCtx();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 0.32);
  src.playbackRate.value = direction > 0 ? 1.05 : 0.92;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = direction > 0 ? 1400 : 1100;
  filter.Q.value = 0.7;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.045, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.028, t0 + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + 0.32);
}

/** Soft cover-open thump + rustle. */
export function playCoverOpenSound(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getCtx();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(90, t0);
  osc.frequency.exponentialRampToValueAtTime(48, t0 + 0.18);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.24);

  window.setTimeout(() => playPageTurnSound(enabled, 1), 80);
}
