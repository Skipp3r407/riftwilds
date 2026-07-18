/**
 * Generate short original WAV blips for Riftwilds SFX / ambient beds.
 * CC0 — procedural sine/triangle/noise only. No third-party samples.
 *
 * Usage: node scripts/assets/generate-audio-sfx.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

function writeWav(filePath, samples, sampleRate = 44100) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

function tone(freq, dur, { type = "sine", gain = 0.3, sampleRate = 44100 } = {}) {
  const n = Math.floor(sampleRate * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, i / (sampleRate * 0.01)) * Math.exp(-3 * t / dur);
    let v = 0;
    const ph = 2 * Math.PI * freq * t;
    if (type === "sine") v = Math.sin(ph);
    else if (type === "triangle") v = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
    else if (type === "square") v = Math.sin(ph) > 0 ? 1 : -1;
    else if (type === "sawtooth") v = 2 * ((freq * t) % 1) - 1;
    out[i] = v * gain * env;
  }
  return out;
}

function mix(...parts) {
  let len = 0;
  for (const p of parts) len = Math.max(len, p.offset + p.samples.length);
  const out = new Float32Array(len);
  for (const p of parts) {
    for (let i = 0; i < p.samples.length; i++) {
      out[p.offset + i] += p.samples[i];
    }
  }
  let peak = 0;
  for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 1) for (let i = 0; i < out.length; i++) out[i] /= peak;
  return out;
}

function noiseBed(dur, { gain = 0.08, filter = 0.02, sampleRate = 44100 } = {}) {
  const n = Math.floor(sampleRate * dur);
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 2 - 1;
    y = y + filter * (x - y);
    const env = Math.sin((Math.PI * i) / n);
    out[i] = y * gain * env;
  }
  return out;
}

const sfxDir = path.join(root, "public/sounds/sfx");
const ambientDir = path.join(root, "public/sounds/ambient");
const assetsDir = path.join(root, "public/assets/audio");

const clips = [
  ["ui-map-open.wav", mix(
    { offset: 0, samples: tone(380, 0.05, { type: "triangle", gain: 0.28 }) },
    { offset: Math.floor(44100 * 0.04), samples: tone(560, 0.08, { type: "sine", gain: 0.26 }) },
  )],
  ["ui-map-close.wav", mix(
    { offset: 0, samples: tone(520, 0.05, { type: "triangle", gain: 0.24 }) },
    { offset: Math.floor(44100 * 0.04), samples: tone(320, 0.07, { type: "sine", gain: 0.22 }) },
  )],
  ["ui-waypoint.wav", mix(
    { offset: 0, samples: tone(660, 0.05, { type: "sine", gain: 0.28 }) },
    { offset: Math.floor(44100 * 0.05), samples: tone(990, 0.08, { type: "triangle", gain: 0.24 }) },
  )],
  ["ui-chat-open.wav", tone(640, 0.03, { type: "sine", gain: 0.28 })],
  ["ui-chat-close.wav", tone(480, 0.03, { type: "sine", gain: 0.24 })],
  ["ui-chat-send.wav", tone(780, 0.035, { type: "triangle", gain: 0.26 })],
  ["pets-feed.wav", mix(
    { offset: 0, samples: tone(420, 0.04, { type: "triangle", gain: 0.28 }) },
    { offset: Math.floor(44100 * 0.04), samples: tone(560, 0.05, { type: "sine", gain: 0.24 }) },
  )],
  ["pets-water.wav", mix(
    { offset: 0, samples: tone(700, 0.04, { type: "sine", gain: 0.22 }) },
    { offset: Math.floor(44100 * 0.03), samples: tone(980, 0.06, { type: "sine", gain: 0.18 }) },
  )],
  ["pets-play.wav", mix(
    { offset: 0, samples: tone(520, 0.04, { type: "triangle", gain: 0.28 }) },
    { offset: Math.floor(44100 * 0.05), samples: tone(780, 0.06, { type: "sine", gain: 0.26 }) },
  )],
  ["pets-clean.wav", mix(
    { offset: 0, samples: tone(880, 0.03, { type: "sine", gain: 0.2 }) },
    { offset: Math.floor(44100 * 0.03), samples: tone(1100, 0.04, { type: "triangle", gain: 0.18 }) },
  )],
  ["pets-rest.wav", mix(
    { offset: 0, samples: tone(300, 0.08, { type: "sine", gain: 0.24 }) },
    { offset: Math.floor(44100 * 0.08), samples: tone(220, 0.1, { type: "sine", gain: 0.2 }) },
  )],
  ["pets-heal.wav", mix(
    { offset: 0, samples: tone(523, 0.06, { type: "sine", gain: 0.28 }) },
    { offset: Math.floor(44100 * 0.05), samples: tone(659, 0.08, { type: "triangle", gain: 0.26 }) },
  )],
  ["pets-need-low.wav", mix(
    { offset: 0, samples: tone(340, 0.06, { type: "triangle", gain: 0.2 }) },
    { offset: Math.floor(44100 * 0.07), samples: tone(280, 0.08, { type: "sine", gain: 0.16 }) },
  )],
  ["combat-stinger.wav", mix(
    { offset: 0, samples: tone(200, 0.08, { type: "sawtooth", gain: 0.16 }) },
    { offset: Math.floor(44100 * 0.06), samples: tone(400, 0.1, { type: "triangle", gain: 0.28 }) },
  )],
  ["event-stinger.wav", mix(
    { offset: 0, samples: tone(440, 0.08, { type: "triangle", gain: 0.28 }) },
    { offset: Math.floor(44100 * 0.07), samples: tone(554, 0.09, { type: "sine", gain: 0.26 }) },
  )],
  ["arena-start.wav", mix(
    { offset: 0, samples: tone(196, 0.1, { type: "triangle", gain: 0.28 }) },
    { offset: Math.floor(44100 * 0.09), samples: tone(294, 0.1, { type: "triangle", gain: 0.26 }) },
  )],
  ["world-npc-greet.wav", mix(
    { offset: 0, samples: tone(520, 0.05, { type: "sine", gain: 0.26 }) },
    { offset: Math.floor(44100 * 0.05), samples: tone(660, 0.07, { type: "triangle", gain: 0.24 }) },
  )],
  ["world-npc-work.wav", mix(
    { offset: 0, samples: tone(180, 0.05, { type: "square", gain: 0.12 }) },
    { offset: Math.floor(44100 * 0.05), samples: tone(140, 0.06, { type: "triangle", gain: 0.1 }) },
  )],
  ["weather-rain.wav", noiseBed(0.35, { gain: 0.1, filter: 0.08 })],
  ["weather-thunder.wav", mix(
    { offset: 0, samples: tone(60, 0.2, { type: "sawtooth", gain: 0.18 }) },
    { offset: Math.floor(44100 * 0.1), samples: tone(40, 0.35, { type: "sine", gain: 0.14 }) },
  )],
  ["weather-wind.wav", noiseBed(0.4, { gain: 0.07, filter: 0.015 })],
];

const regions = [
  "riftwild-commons",
  "ember-crater",
  "moonwater-coast",
  "elderwood-forest",
  "stormspire-peaks",
  "stoneheart-canyon",
  "frostveil-basin",
  "radiant-citadel",
  "void-hollow",
  "alloy-ruins",
  "spirit-marsh",
  "celestial-rift",
  "menu",
];

for (const [name, samples] of clips) {
  writeWav(path.join(sfxDir, name), samples);
  console.log("wrote", name);
}

for (const region of regions) {
  const bed = mix(
    { offset: 0, samples: tone(110 + (region.length % 7) * 8, 1.2, { type: "sine", gain: 0.08 }) },
    { offset: 0, samples: noiseBed(1.2, { gain: 0.04, filter: 0.03 }) },
  );
  writeWav(path.join(ambientDir, `${region}.wav`), bed);
  writeWav(path.join(assetsDir, "ambient", `${region}.wav`), bed);
  console.log("ambient", region);
}

// Mirror new sfx into assets/audio for clear structure
for (const [name] of clips) {
  const src = path.join(sfxDir, name);
  const dest = path.join(assetsDir, "sfx", name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

console.log("done");
