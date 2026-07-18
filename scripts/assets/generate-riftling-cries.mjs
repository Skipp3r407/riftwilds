/**
 * Generate unique original Riftling signature cries (one WAV per launch species).
 *
 * Primary path: procedural synthesis (same family as generate-audio-sfx.mjs).
 * Default: procedural WAV synthesis (no API key).
 * Optional Grok/xAI TTS upgrade: set XAI_API_KEY and RIFTLING_CRIES_ENGINE=grok
 *   → uses xAI /v1/tts with non-speech creature onomatopoeia + speech tags.
 *   Falls back to procedural if TTS fails.
 *
 * Usage:
 *   node scripts/assets/generate-riftling-cries.mjs
 *   RIFTLING_CRIES_ENGINE=grok XAI_API_KEY=... node scripts/assets/generate-riftling-cries.mjs
 *
 * Outputs:
 *   public/assets/audio/riftlings/{slug}.wav
 *   public/sounds/sfx/riftlings/{slug}.wav  (runtime mirror)
 *   public/assets/audio/riftlings/MANIFEST.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const SAMPLE_RATE = 44100;

/** Keep in sync with LAUNCH_SPECIES in src/game/creatures/species-catalog.ts */
const SPECIES = [
  ["cindercub", "EMBER", "QUADRUPED", "Brave"],
  ["mossprig", "GROVE", "PLANT_BODIED", "Gentle"],
  ["bubbloon", "TIDE", "AQUATIC", "Playful"],
  ["voltkit", "STORM", "QUADRUPED", "Energetic"],
  ["pebblit", "STONE", "STONE_BODIED", "Calm"],
  ["wisplet", "SPIRIT", "SPIRIT_BODIED", "Curious"],
  ["frostnip", "FROST", "QUADRUPED", "Shy"],
  ["luminara", "RADIANT", "FLOATING", "Calm"],
  ["hollowshade", "VOID", "AMORPHOUS", "Independent"],
  ["gearling", "ALLOY", "MECHANICAL_ORGANIC", "Protective"],
  ["bramblefox", "GROVE", "QUADRUPED", "Mischievous"],
  ["coralurge", "TIDE", "AQUATIC", "Protective"],
  ["ashwing", "EMBER", "AVIAN", "Brave"],
  ["quartzhorn", "STONE", "QUADRUPED", "Protective"],
  ["staticat", "STORM", "QUADRUPED", "Curious"],
  ["glimmerp", "RADIANT", "INSECTOID", "Playful"],
  ["mistwraith", "VOID", "SPIRIT_BODIED", "Shy"],
  ["ironbloom", "ALLOY", "PLANT_BODIED", "Gentle"],
  ["riftpup", "SPIRIT", "QUADRUPED", "Social"],
  ["tidewisp", "TIDE", "FLOATING", "Sleepy"],
  ["embernewt", "EMBER", "SERPENTINE", "Curious"],
  ["groveowl", "GROVE", "AVIAN", "Calm"],
  ["stormmoth", "STORM", "INSECTOID", "Energetic"],
  ["stonegrub", "STONE", "INSECTOID", "Sleepy"],
  ["frostfin", "FROST", "AQUATIC", "Independent"],
  ["radiantkit", "RADIANT", "BIPED", "Social"],
  ["voidling", "VOID", "FLOATING", "Mischievous"],
  ["cogpup", "ALLOY", "QUADRUPED", "Protective"],
  ["lanternjay", "SPIRIT", "AVIAN", "Curious"],
  ["craterhorn", "EMBER", "QUADRUPED", "Protective"],
  ["moonray", "TIDE", "AQUATIC", "Gentle"],
  ["rootling", "GROVE", "PLANT_BODIED", "Shy"],
  ["spirekite", "STORM", "AVIAN", "Brave"],
  ["canyonbeetle", "STONE", "INSECTOID", "Calm"],
  ["snowpuff", "FROST", "AMORPHOUS", "Playful"],
  ["citadelmoth", "RADIANT", "INSECTOID", "Calm"],
  ["riftslug", "VOID", "SERPENTINE", "Sleepy"],
  ["scrapfinch", "ALLOY", "AVIAN", "Mischievous"],
  ["marshloom", "SPIRIT", "PLANT_BODIED", "Gentle"],
  ["commonspark", "STORM", "FLOATING", "Energetic"],
  ["hearthstone", "STONE", "STONE_BODIED", "Protective"],
  ["tideotter", "TIDE", "QUADRUPED", "Social"],
  ["emberfox", "EMBER", "QUADRUPED", "Mischievous"],
  ["elderfern", "GROVE", "PLANT_BODIED", "Calm"],
  ["peakibex", "STORM", "QUADRUPED", "Brave"],
  ["fossilhound", "STONE", "QUADRUPED", "Protective"],
  ["veilhare", "FROST", "QUADRUPED", "Shy"],
  ["auralynx", "RADIANT", "QUADRUPED", "Independent"],
  ["hollowmoth", "VOID", "INSECTOID", "Curious"],
  ["celestora", "RADIANT", "FLOATING", "Calm"],
  ["slagpup", "EMBER", "QUADRUPED", "Brave"],
  ["pyrespore", "EMBER", "PLANT_BODIED", "Curious"],
  ["cinderquill", "EMBER", "AVIAN", "Independent"],
  ["lavaling", "EMBER", "AMORPHOUS", "Playful"],
  ["furnacebeetle", "EMBER", "INSECTOID", "Protective"],
  ["brinepaw", "TIDE", "QUADRUPED", "Social"],
  ["kelpwisp", "TIDE", "FLOATING", "Gentle"],
  ["sprayfin", "TIDE", "AQUATIC", "Energetic"],
  ["pearlurk", "TIDE", "AQUATIC", "Shy"],
  ["tidequill", "TIDE", "AVIAN", "Curious"],
  ["fernfox", "GROVE", "QUADRUPED", "Mischievous"],
  ["saplingo", "GROVE", "BIPED", "Gentle"],
  ["vinepup", "GROVE", "QUADRUPED", "Playful"],
  ["thornling", "GROVE", "PLANT_BODIED", "Protective"],
  ["mossdrake", "GROVE", "SERPENTINE", "Calm"],
  ["galekit", "STORM", "QUADRUPED", "Energetic"],
  ["cloudleaper", "STORM", "BIPED", "Brave"],
  ["sparkmoth", "STORM", "INSECTOID", "Curious"],
  ["windrift", "STORM", "FLOATING", "Independent"],
  ["thunderpaw", "STORM", "QUADRUPED", "Brave"],
  ["shalehorn", "STONE", "QUADRUPED", "Protective"],
  ["gritling", "STONE", "STONE_BODIED", "Sleepy"],
  ["basaltpup", "STONE", "QUADRUPED", "Calm"],
  ["crystowl", "STONE", "AVIAN", "Independent"],
  ["rubblefin", "STONE", "AQUATIC", "Curious"],
  ["glazehare", "FROST", "QUADRUPED", "Shy"],
  ["rimewing", "FROST", "AVIAN", "Calm"],
  ["iciclepup", "FROST", "QUADRUPED", "Playful"],
  ["snowglyph", "FROST", "SPIRIT_BODIED", "Curious"],
  ["frostbloom", "FROST", "PLANT_BODIED", "Gentle"],
  ["dawnkit", "RADIANT", "QUADRUPED", "Social"],
  ["prismoth", "RADIANT", "INSECTOID", "Playful"],
  ["solfinch", "RADIANT", "AVIAN", "Energetic"],
  ["gleamhare", "RADIANT", "QUADRUPED", "Mischievous"],
  ["lightspire", "RADIANT", "FLOATING", "Calm"],
  ["umbralisk", "VOID", "SERPENTINE", "Independent"],
  ["duskling", "VOID", "FLOATING", "Shy"],
  ["nullpaw", "VOID", "QUADRUPED", "Curious"],
  ["echofig", "VOID", "PLANT_BODIED", "Sleepy"],
  ["shadowmire", "VOID", "AMORPHOUS", "Protective"],
  ["boltgear", "ALLOY", "MECHANICAL_ORGANIC", "Energetic"],
  ["scrapowl", "ALLOY", "AVIAN", "Curious"],
  ["copperfin", "ALLOY", "AQUATIC", "Calm"],
  ["wirefox", "ALLOY", "QUADRUPED", "Mischievous"],
  ["chronobeetle", "ALLOY", "INSECTOID", "Protective"],
  ["ghostbloom", "SPIRIT", "PLANT_BODIED", "Gentle"],
  ["dreamhare", "SPIRIT", "QUADRUPED", "Sleepy"],
  ["wispdeer", "SPIRIT", "QUADRUPED", "Shy"],
  ["soulmoth", "SPIRIT", "INSECTOID", "Curious"],
  ["starveil", "SPIRIT", "FLOATING", "Calm"],
];

const AFFINITY = {
  EMBER: { base: 220, span: 90, noise: 0.18, filter: 0.06, vib: 18, types: ["sawtooth", "triangle"] },
  TIDE: { base: 480, span: 160, noise: 0.1, filter: 0.04, vib: 7, types: ["sine", "triangle"] },
  GROVE: { base: 340, span: 110, noise: 0.07, filter: 0.03, vib: 5, types: ["triangle", "sine"] },
  STORM: { base: 520, span: 200, noise: 0.14, filter: 0.09, vib: 28, types: ["square", "triangle"] },
  STONE: { base: 140, span: 60, noise: 0.05, filter: 0.02, vib: 3, types: ["sine", "triangle"] },
  FROST: { base: 620, span: 180, noise: 0.08, filter: 0.05, vib: 9, types: ["sine", "triangle"] },
  RADIANT: { base: 700, span: 140, noise: 0.04, filter: 0.03, vib: 11, types: ["sine", "triangle"] },
  VOID: { base: 90, span: 70, noise: 0.16, filter: 0.05, vib: 4, types: ["sine", "sawtooth"] },
  ALLOY: { base: 380, span: 120, noise: 0.09, filter: 0.07, vib: 22, types: ["square", "triangle"] },
  SPIRIT: { base: 440, span: 130, noise: 0.06, filter: 0.035, vib: 6, types: ["sine", "triangle"] },
};

const TEMPER = {
  Brave: 1.08,
  Gentle: 0.9,
  Playful: 1.12,
  Energetic: 1.18,
  Calm: 0.88,
  Curious: 1.05,
  Shy: 0.82,
  Independent: 0.95,
  Protective: 0.92,
  Mischievous: 1.15,
  Social: 1.06,
  Sleepy: 0.78,
};

const BODY = {
  QUADRUPED: 0,
  BIPED: 12,
  SERPENTINE: -40,
  FLOATING: 55,
  AVIAN: 90,
  AQUATIC: -15,
  INSECTOID: 120,
  STONE_BODIED: -55,
  PLANT_BODIED: -10,
  SPIRIT_BODIED: 40,
  MECHANICAL_ORGANIC: 25,
  AMORPHOUS: -25,
};

function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function writeWav(filePath, samples, sampleRate = SAMPLE_RATE) {
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

function osc(type, freq, t) {
  const ph = 2 * Math.PI * freq * t;
  if (type === "sine") return Math.sin(ph);
  if (type === "triangle") return 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
  if (type === "square") return Math.sin(ph) > 0 ? 0.7 : -0.7;
  if (type === "sawtooth") return 2 * ((freq * t) % 1) - 1;
  return Math.sin(ph);
}

function resynthesizeDeterministic(slug, affinity, bodyType, temperament) {
  const seed = hashSeed(`riftling-cry:${slug}`);
  const rand = mulberry32(seed);
  const aff = AFFINITY[affinity] ?? AFFINITY.SPIRIT;
  const temperMul = TEMPER[temperament] ?? 1;
  const bodyBias = BODY[bodyType] ?? 0;

  const r0 = rand();
  const r1 = rand();
  const r2 = rand();
  const r3 = rand();
  const r4 = rand();
  const r5 = rand();
  const r6 = rand();
  const r7 = rand();
  const r8 = rand();
  const r9 = rand();

  const baseHz = (aff.base + bodyBias + r0 * aff.span) * temperMul;
  const typeA = aff.types[Math.floor(r1 * aff.types.length)];
  const typeB = aff.types[Math.floor(r2 * aff.types.length)];
  const chirps = 2 + Math.floor(r3 * 3);
  const dur = 0.28 + r4 * 0.28;
  const vibRate = 6 + r5 * 4;
  const formant = 1.4 + r6 * 0.5;
  const sub = 0.5 + r7 * 0.2;
  const flutterAt = 0.35 + (seed % 40) / 100;
  const contourCycles = 1.5 + (seed % 5);
  const n = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(n);

  let noiseY = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / dur;
    const chirpPos = progress * chirps;
    const chirpIdx = Math.floor(chirpPos);
    const local = chirpPos - chirpIdx;
    const chirpEnv = Math.sin(Math.PI * Math.min(1, Math.max(0, local)));
    const overall = Math.sin(Math.PI * progress) * (0.55 + 0.45 * chirpEnv);

    const contour =
      1 +
      0.18 * Math.sin(progress * Math.PI * contourCycles) +
      0.08 * Math.sin(progress * Math.PI * 6 + chirpIdx) +
      (chirpIdx % 2 === 0 ? 0.12 : -0.08) * local;

    const vib = 1 + (aff.vib / Math.max(80, baseHz)) * Math.sin(2 * Math.PI * vibRate * t);
    const f1 = baseHz * contour * vib;
    const f2 = f1 * formant;
    const f3 = f1 * sub;

    let v =
      osc(typeA, f1, t) * 0.55 +
      osc(typeB, f2, t) * 0.28 +
      osc("sine", f3, t) * 0.17;

    // Stable noise from index + seed (not Math.random)
    const nx = Math.sin(i * 12.9898 + seed * 0.001) * 43758.5453;
    const noiseSample = nx - Math.floor(nx);
    const x = noiseSample * 2 - 1;
    noiseY = noiseY + aff.filter * (x - noiseY);
    v += noiseY * aff.noise * (0.4 + 0.6 * chirpEnv);

    if (Math.abs(progress - flutterAt) < 0.012) {
      v += (r8 * 2 - 1) * 0.35 * (1 - Math.abs(progress - flutterAt) / 0.012);
    }

    // Soft attack / release
    const fade = Math.min(1, i / (SAMPLE_RATE * 0.012)) * Math.min(1, (n - i) / (SAMPLE_RATE * 0.04));
    out[i] = v * overall * fade * (0.38 + r9 * 0.08);
  }

  // Peak normalize
  let peak = 0;
  for (let i = 0; i < out.length; i++) peak = Math.max(peak, Math.abs(out[i]));
  if (peak > 0.001) {
    const g = 0.9 / peak;
    for (let i = 0; i < out.length; i++) out[i] *= g;
  }
  return out;
}

function grokPrompt(slug, affinity, temperament) {
  const flavor = {
    EMBER: "warm crackling ember chirp, soft fire-pop accents, not human speech",
    TIDE: "bubbly tide chirp, wet glassy notes, not human speech",
    GROVE: "leafy wooden trill, mossy soft peep, not human speech",
    STORM: "sparkly static chirp, short thunder-tick, not human speech",
    STONE: "gravelly pebble chirp, deep mineral click, not human speech",
    FROST: "crystalline cold peep, icy glass chime, not human speech",
    RADIANT: "bright prism chime, soft light peep, not human speech",
    VOID: "hollow echo whisper-chirp, distant rift hum, not human speech",
    ALLOY: "tiny gear tick chirp, copper spring peep, not human speech",
    SPIRIT: "lantern-soft spirit hum-peep, misty chime, not human speech",
  }[affinity] ?? "soft fantasy creature chirp, not human speech";

  return `[soft][short] ${flavor}. Tiny original creature call for ${slug}, ${temperament.toLowerCase()} mood. No words. No Pokémon.`;
}

async function tryGrokTts(text, outPath) {
  const key = process.env.XAI_API_KEY;
  if (!key) return false;
  const voices = ["eve", "ara", "rex", "sal", "leo"];
  const voice = voices[hashSeed(text) % voices.length];
  try {
    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_id: voice,
        language: "en",
        speed: 1.15,
        output_format: { codec: "wav", sample_rate: 44100 },
      }),
    });
    if (!res.ok) {
      console.warn(`Grok TTS ${res.status} for ${path.basename(outPath)}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buf);
    return true;
  } catch (err) {
    console.warn("Grok TTS error:", err?.message ?? err);
    return false;
  }
}

async function main() {
  const enginePref = (process.env.RIFTLING_CRIES_ENGINE || "procedural").toLowerCase();
  const wantGrok = enginePref === "grok" || enginePref === "xai";
  const assetsDir = path.join(root, "public/assets/audio/riftlings");
  const soundsDir = path.join(root, "public/sounds/sfx/riftlings");
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.mkdirSync(soundsDir, { recursive: true });

  if (wantGrok && !process.env.XAI_API_KEY) {
    console.warn("RIFTLING_CRIES_ENGINE=grok but XAI_API_KEY missing — using procedural.");
  }

  const entries = [];
  let grokOk = 0;
  let proceduralOk = 0;

  for (const [slug, affinity, bodyType, temperament] of SPECIES) {
    const dest = path.join(assetsDir, `${slug}.wav`);
    let engine = "procedural";

    if (wantGrok && process.env.XAI_API_KEY) {
      const ok = await tryGrokTts(grokPrompt(slug, affinity, temperament), dest);
      if (ok) {
        engine = "grok-tts";
        grokOk++;
      }
    }

    if (engine === "procedural") {
      const samples = resynthesizeDeterministic(slug, affinity, bodyType, temperament);
      writeWav(dest, samples);
      proceduralOk++;
    }

    const mirror = path.join(soundsDir, `${slug}.wav`);
    fs.copyFileSync(dest, mirror);

    entries.push({
      slug,
      affinity,
      bodyType,
      temperament,
      path: `/assets/audio/riftlings/${slug}.wav`,
      runtimePath: `/sounds/sfx/riftlings/${slug}.wav`,
      engine,
    });
    console.log(`wrote ${slug}.wav (${engine})`);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    count: entries.length,
    engines: { procedural: proceduralOk, grokTts: grokOk },
    note:
      "Original Riftling SFX. Procedural synthesis is the default (no API key). Optional Grok TTS via RIFTLING_CRIES_ENGINE=grok is a paid upgrade only. Creature SFX only — do not mix into commercial music beds.",
    species: entries,
  };
  fs.writeFileSync(path.join(assetsDir, "MANIFEST.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nDone: ${entries.length} cries → ${assetsDir}`);
  console.log(`engines: procedural=${proceduralOk} grok-tts=${grokOk}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
