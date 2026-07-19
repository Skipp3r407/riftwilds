/**
 * Generate handcrafted original WAV SFX + ambient beds for Riftwilds.
 * Layered tones, whooshes, paper, impacts — not single-tone beeps.
 * Writes runtime paths under public/sounds/ and ADD layout under public/audio/.
 *
 * Usage: node scripts/assets/generate-audio-sfx.mjs
 *        npm run assets:audio
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const SR = 44100;

function writeWav(filePath, samples, sampleRate = SR, channels = 1) {
  const bitsPerSample = 16;
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const frameCount = Math.floor(samples.length / channels);
  const dataSize = frameCount * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < frameCount * channels; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

function tone(freq, dur, { type = "sine", gain = 0.3, sampleRate = SR, attack = 0.008, curve = 3.2 } = {}) {
  const n = Math.floor(sampleRate * dur);
  const out = new Float32Array(n);
  const atk = Math.max(1, Math.floor(sampleRate * attack));
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const envA = Math.min(1, i / atk);
    const envD = Math.exp((-curve * t) / Math.max(0.001, dur));
    const env = envA * envD;
    let v = 0;
    const ph = 2 * Math.PI * freq * t;
    if (type === "sine") v = Math.sin(ph);
    else if (type === "triangle") v = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
    else if (type === "square") v = Math.sin(ph) > 0 ? 0.7 : -0.7;
    else if (type === "sawtooth") v = 2 * ((freq * t) % 1) - 1;
    if (type === "sine" || type === "triangle") {
      v = v * 0.82 + Math.sin(ph * 2) * 0.14 + Math.sin(ph * 3) * 0.04;
    }
    out[i] = v * gain * env;
  }
  return out;
}

function noiseWhoosh(dur, { gain = 0.1, centerHz = 1800, q = 0.02, sampleRate = SR } = {}) {
  const n = Math.floor(sampleRate * dur);
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const x = Math.random() * 2 - 1;
    y = y + q * (x - y);
    const sweep = centerHz * (0.7 + t * 0.9);
    const ring = Math.sin(2 * Math.PI * (sweep / sampleRate) * i) * 0.35;
    const env = Math.sin(Math.PI * t) ** 1.35;
    out[i] = (y * 0.75 + ring * y) * gain * env;
  }
  return out;
}

function paperRustle(dur, { gain = 0.08, sampleRate = SR } = {}) {
  const n = Math.floor(sampleRate * dur);
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const x = Math.random() * 2 - 1;
    y = y * 0.86 + x * 0.14;
    const env = Math.sin(Math.PI * Math.min(1, t * 1.4)) * Math.exp(-2.2 * t);
    out[i] = y * gain * env;
  }
  return out;
}

function crackle(dur, { gain = 0.1, density = 0.08, sampleRate = SR } = {}) {
  const n = Math.floor(sampleRate * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (Math.random() < density) {
      const burst = (Math.random() * 2 - 1) * gain;
      const len = 20 + Math.floor(Math.random() * 40);
      for (let j = 0; j < len && i + j < n; j++) {
        out[i + j] += burst * Math.exp(-j / 12);
      }
    }
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
  if (peak > 0.95) {
    const s = 0.95 / peak;
    for (let i = 0; i < out.length; i++) out[i] *= s;
  }
  return out;
}

function durationOf(samples) {
  return +(samples.length / SR).toFixed(3);
}

function magicalClick(base = 880) {
  return mix(
    { offset: 0, samples: tone(base, 0.045, { type: "sine", gain: 0.32, curve: 5 }) },
    { offset: Math.floor(SR * 0.008), samples: tone(base * 2, 0.035, { type: "sine", gain: 0.1, curve: 6 }) },
    { offset: 0, samples: noiseWhoosh(0.04, { gain: 0.05, centerHz: base * 2.2, q: 0.04 }) },
  );
}

function softChime(freqs, step = 0.055) {
  return mix(
    ...freqs.map((f, i) => ({
      offset: Math.floor(SR * step * i),
      samples: tone(f, 0.11 + i * 0.02, { type: i % 2 ? "triangle" : "sine", gain: 0.28 - i * 0.03 }),
    })),
    { offset: 0, samples: noiseWhoosh(0.12, { gain: 0.04, centerHz: 2200, q: 0.025 }) },
  );
}

function impactThud(low = 140) {
  return mix(
    { offset: 0, samples: tone(low, 0.09, { type: "sine", gain: 0.34, curve: 4 }) },
    { offset: Math.floor(SR * 0.01), samples: tone(low * 0.55, 0.12, { type: "triangle", gain: 0.18, curve: 3 }) },
    { offset: 0, samples: noiseWhoosh(0.08, { gain: 0.08, centerHz: 500, q: 0.06 }) },
  );
}

function whooshRise(start = 220, end = 880) {
  const mid = (start + end) / 2;
  return mix(
    { offset: 0, samples: tone(start, 0.08, { type: "triangle", gain: 0.2 }) },
    { offset: Math.floor(SR * 0.05), samples: tone(mid, 0.09, { type: "sine", gain: 0.24 }) },
    { offset: Math.floor(SR * 0.1), samples: tone(end, 0.12, { type: "sine", gain: 0.22 }) },
    { offset: 0, samples: noiseWhoosh(0.22, { gain: 0.09, centerHz: 1400, q: 0.03 }) },
  );
}

function grandFanfare(freqs) {
  return mix(
    ...freqs.map((f, i) => ({
      offset: Math.floor(SR * (0.08 * i)),
      samples: tone(f, 0.18 + i * 0.03, { type: i % 2 ? "triangle" : "sine", gain: 0.26 - i * 0.02 }),
    })),
    { offset: 0, samples: noiseWhoosh(0.35, { gain: 0.07, centerHz: 900, q: 0.02 }) },
    { offset: Math.floor(SR * 0.05), samples: whooshRise(freqs[0] * 0.5, freqs[freqs.length - 1]) },
  );
}

function elementCue(kind) {
  switch (kind) {
    case "fire":
      return mix(
        { offset: 0, samples: noiseWhoosh(0.28, { gain: 0.12, centerHz: 600, q: 0.05 }) },
        { offset: 0, samples: crackle(0.28, { gain: 0.08, density: 0.12 }) },
        { offset: Math.floor(SR * 0.04), samples: tone(180, 0.16, { type: "sawtooth", gain: 0.1 }) },
      );
    case "water":
      return mix(
        { offset: 0, samples: noiseWhoosh(0.32, { gain: 0.11, centerHz: 1400, q: 0.03 }) },
        { offset: 0, samples: tone(280, 0.2, { type: "sine", gain: 0.18 }) },
        { offset: Math.floor(SR * 0.08), samples: tone(420, 0.18, { type: "triangle", gain: 0.14 }) },
      );
    case "nature":
      return mix(
        { offset: 0, samples: softChime([330, 495, 660], 0.05) },
        { offset: 0, samples: paperRustle(0.2, { gain: 0.06 }) },
      );
    case "storm":
      return mix(
        { offset: 0, samples: crackle(0.2, { gain: 0.12, density: 0.2 }) },
        { offset: Math.floor(SR * 0.05), samples: impactThud(90) },
        { offset: 0, samples: noiseWhoosh(0.3, { gain: 0.1, centerHz: 2200, q: 0.04 }) },
      );
    case "void":
      return mix(
        { offset: 0, samples: tone(55, 0.35, { type: "sine", gain: 0.28, curve: 1.2, attack: 0.05 }) },
        { offset: 0, samples: noiseWhoosh(0.4, { gain: 0.08, centerHz: 300, q: 0.02 }) },
        { offset: Math.floor(SR * 0.1), samples: tone(82, 0.28, { type: "triangle", gain: 0.14 }) },
      );
    case "light":
      return mix(
        { offset: 0, samples: softChime([880, 1320, 1760], 0.04) },
        { offset: 0, samples: noiseWhoosh(0.25, { gain: 0.06, centerHz: 3200, q: 0.03 }) },
      );
    default:
      return magicalClick(600);
  }
}

function ambientBed(seed, mood = "open") {
  const dur = 2.4;
  const base = 70 + (seed % 11) * 7;
  const parts = [
    { offset: 0, samples: noiseWhoosh(dur, { gain: 0.045, centerHz: 500 + seed * 35, q: 0.012 }) },
    {
      offset: 0,
      samples: tone(base, dur, { type: "sine", gain: mood === "menu" ? 0.01 : 0.04, curve: 0.35, attack: 0.25 }),
    },
  ];
  if (mood === "forest") {
    parts.push({ offset: Math.floor(SR * 0.2), samples: softChime([523, 659], 0.4) });
  }
  if (mood === "volcano") {
    parts.push({ offset: 0, samples: tone(45, dur, { type: "triangle", gain: 0.035, curve: 0.3, attack: 0.3 }) });
  }
  if (mood === "ice") {
    parts.push({ offset: 0, samples: noiseWhoosh(dur, { gain: 0.04, centerHz: 2800, q: 0.02 }) });
  }
  if (mood === "ocean") {
    parts.push({ offset: 0, samples: noiseWhoosh(dur, { gain: 0.07, centerHz: 900, q: 0.018 }) });
  }
  if (mood === "temple") {
    parts.push({ offset: 0, samples: tone(base * 1.5, dur, { type: "sine", gain: 0.03, curve: 0.4, attack: 0.3 }) });
  }
  if (mood === "desert") {
    parts.push({ offset: 0, samples: noiseWhoosh(dur, { gain: 0.05, centerHz: 700, q: 0.015 }) });
  }
  return mix(...parts);
}

const sfxDir = path.join(root, "public/sounds/sfx");
const ambientDir = path.join(root, "public/sounds/ambient");
const audioRoot = path.join(root, "public/audio");
const assetsDir = path.join(root, "public/assets/audio");

/** [filename, samples, packageFolder, category, description, volume, looping, priority] */
const clips = [
  ["ui-click.wav", magicalClick(920), "ui", "ui", "Soft magical UI tap", 0.35, false, "normal"],
  ["ui-hover.wav", magicalClick(1280), "ui", "ui", "Light hover sparkle", 0.22, false, "low"],
  ["ui-success.wav", softChime([523, 784], 0.05), "ui", "ui", "Confirm success", 0.5, false, "normal"],
  ["ui-nav.wav", magicalClick(720), "ui", "ui", "Navigation tick", 0.28, false, "normal"],
  ["ui-modal-open.wav", softChime([420, 640], 0.04), "ui", "ui", "Modal rise", 0.45, false, "normal"],
  ["ui-modal-close.wav", softChime([560, 360], 0.04), "ui", "ui", "Modal settle", 0.4, false, "normal"],
  ["ui-error.wav", mix(
    { offset: 0, samples: tone(220, 0.1, { type: "triangle", gain: 0.22 }) },
    { offset: Math.floor(SR * 0.08), samples: tone(160, 0.12, { type: "sine", gain: 0.18 }) },
    { offset: 0, samples: noiseWhoosh(0.14, { gain: 0.05, centerHz: 400, q: 0.05 }) },
  ), "ui", "ui", "Soft deny", 0.5, false, "normal"],
  ["ui-map-open.wav", softChime([380, 560], 0.04), "ui", "ui", "Map open", 0.4, false, "normal"],
  ["ui-map-close.wav", softChime([520, 320], 0.04), "ui", "ui", "Map close", 0.35, false, "normal"],
  ["ui-waypoint.wav", softChime([660, 990], 0.05), "ui", "ui", "Waypoint pin", 0.45, false, "normal"],
  ["ui-chat-open.wav", magicalClick(640), "ui", "ui", "Chat open", 0.3, false, "normal"],
  ["ui-chat-close.wav", magicalClick(480), "ui", "ui", "Chat close", 0.28, false, "normal"],
  ["ui-chat-send.wav", magicalClick(780), "ui", "ui", "Chat send", 0.32, false, "normal"],
  ["ui-notify.wav", softChime([880, 1175], 0.04), "events", "notifications", "Generic notify", 0.45, false, "normal"],

  ["login-enter.wav", mix(
    { offset: 0, samples: whooshRise(120, 360) },
    { offset: Math.floor(SR * 0.15), samples: softChime([196, 294, 392], 0.1) },
  ), "events", "events", "Login hall enter", 0.55, false, "high"],
  ["login-success.wav", softChime([523, 659, 784], 0.07), "events", "events", "Login success", 0.55, false, "normal"],
  ["cinematic-stinger.wav", grandFanfare([110, 220, 440, 880]), "events", "events", "Opening cinematic hit", 0.65, false, "critical"],
  ["cinematic-whoosh.wav", whooshRise(160, 720), "events", "events", "Rift transition", 0.5, false, "normal"],

  ["hatchery-claim.wav", softChime([392, 523, 659], 0.06), "sfx", "sfx", "Claim egg", 0.55, false, "normal"],
  ["hatchery-reveal.wav", softChime([523, 659, 784, 1046], 0.07), "sfx", "sfx", "Hatch reveal", 0.65, false, "high"],
  ["hatchery-idle.wav", mix(
    { offset: 0, samples: tone(480, 0.2, { type: "sine", gain: 0.12, curve: 2 }) },
    { offset: 0, samples: noiseWhoosh(0.35, { gain: 0.04, centerHz: 900, q: 0.02 }) },
  ), "sfx", "sfx", "Egg warmth idle", 0.2, false, "low"],
  ["hatchery-crack.wav", mix(
    { offset: 0, samples: crackle(0.18, { gain: 0.14, density: 0.25 }) },
    { offset: 0, samples: impactThud(200) },
  ), "sfx", "sfx", "Shell crack", 0.55, false, "normal"],
  ["hatchery-rarity-common.wav", softChime([392, 523], 0.07), "sfx", "sfx", "Common hatch", 0.5, false, "normal"],
  ["hatchery-rarity-uncommon.wav", softChime([440, 554, 659], 0.07), "sfx", "sfx", "Uncommon hatch", 0.55, false, "normal"],
  ["hatchery-rarity-rare.wav", softChime([494, 659, 784], 0.08), "sfx", "sfx", "Rare hatch", 0.6, false, "high"],
  ["hatchery-rarity-epic.wav", grandFanfare([523, 698, 880, 1046]), "sfx", "sfx", "Epic hatch", 0.65, false, "high"],
  ["hatchery-rarity-legendary.wav", grandFanfare([196, 392, 587, 784, 1175]), "sfx", "sfx", "Legendary hatch", 0.72, false, "critical"],

  ["pets-care.wav", softChime([600, 900], 0.04), "companions", "companions", "Care pet", 0.45, false, "normal"],
  ["pets-feed.wav", softChime([420, 560], 0.04), "companions", "companions", "Feed", 0.42, false, "normal"],
  ["pets-water.wav", softChime([700, 980], 0.03), "companions", "companions", "Water", 0.4, false, "normal"],
  ["pets-play.wav", softChime([520, 780, 1040], 0.05), "companions", "companions", "Play", 0.48, false, "normal"],
  ["pets-clean.wav", softChime([880, 1100], 0.03), "companions", "companions", "Clean", 0.4, false, "normal"],
  ["pets-rest.wav", softChime([300, 220], 0.08), "companions", "companions", "Rest", 0.35, false, "normal"],
  ["pets-heal.wav", softChime([523, 659], 0.05), "companions", "companions", "Heal", 0.5, false, "normal"],
  ["pets-need-low.wav", softChime([340, 280], 0.07), "companions", "companions", "Need low", 0.28, false, "low"],
  ["pets-equip.wav", softChime([340, 510], 0.03), "companions", "companions", "Equip", 0.45, false, "normal"],
  ["pets-evolve.wav", whooshRise(440, 880), "companions", "companions", "Evolve", 0.6, false, "high"],
  ["companion-idle.wav", magicalClick(720), "companions", "companions", "Idle chirp", 0.35, false, "low"],
  ["companion-happy.wav", softChime([660, 990], 0.05), "companions", "companions", "Happy", 0.5, false, "normal"],
  ["companion-angry.wav", mix(
    { offset: 0, samples: tone(220, 0.08, { type: "sawtooth", gain: 0.12 }) },
    { offset: Math.floor(SR * 0.05), samples: tone(160, 0.1, { type: "triangle", gain: 0.16 }) },
  ), "companions", "companions", "Angry", 0.48, false, "normal"],
  ["companion-attack.wav", impactThud(220), "companions", "companions", "Attack cry", 0.55, false, "normal"],
  ["companion-hurt.wav", softChime([400, 260], 0.05), "companions", "companions", "Hurt", 0.45, false, "normal"],

  ["quests-accept.wav", softChime([494, 740], 0.05), "events", "events", "Quest accept", 0.5, false, "normal"],
  ["quests-objective.wav", magicalClick(820), "events", "events", "Objective tick", 0.4, false, "normal"],
  ["quests-complete.wav", softChime([523, 659, 784], 0.07), "events", "events", "Quest complete", 0.6, false, "high"],

  ["combat-hit.wav", impactThud(180), "sfx", "sfx", "Combat hit", 0.5, false, "normal"],
  ["combat-ability.wav", whooshRise(300, 700), "sfx", "sfx", "Ability cast", 0.5, false, "normal"],
  ["combat-win.wav", softChime([523, 659, 784, 1046], 0.08), "sfx", "sfx", "Victory", 0.65, false, "critical"],
  ["combat-lose.wav", softChime([300, 220, 160], 0.1), "sfx", "sfx", "Defeat", 0.5, false, "critical"],
  ["combat-stinger.wav", whooshRise(200, 800), "sfx", "sfx", "Combat stinger", 0.6, false, "high"],
  ["event-stinger.wav", softChime([440, 554, 659], 0.07), "events", "events", "Event stinger", 0.55, false, "high"],

  ["boss-enter.wav", grandFanfare([70, 140, 210, 280]), "bosses", "bosses", "Boss enter", 0.7, false, "critical"],
  ["boss-phase.wav", mix(
    { offset: 0, samples: whooshRise(100, 400) },
    { offset: Math.floor(SR * 0.1), samples: impactThud(80) },
  ), "bosses", "bosses", "Boss phase", 0.65, false, "high"],
  ["boss-taunt.wav", mix(
    { offset: 0, samples: tone(160, 0.2, { type: "triangle", gain: 0.2 }) },
    { offset: Math.floor(SR * 0.1), samples: tone(120, 0.25, { type: "sine", gain: 0.16 }) },
  ), "bosses", "bosses", "Boss taunt VO slot", 0.6, false, "normal"],
  ["boss-defeat.wav", grandFanfare([330, 440, 554, 740]), "bosses", "bosses", "Boss defeat", 0.7, false, "critical"],

  ["arena-start.wav", softChime([196, 294, 392], 0.09), "arena", "arena", "Arena start", 0.55, false, "high"],
  ["arena-queue.wav", magicalClick(640), "arena", "arena", "Queue tick", 0.4, false, "normal"],
  ["arena-match-found.wav", softChime([392, 523, 784], 0.08), "arena", "arena", "Match found", 0.6, false, "high"],
  ["arena-crowd.wav", mix(
    { offset: 0, samples: noiseWhoosh(2.0, { gain: 0.06, centerHz: 800, q: 0.02 }) },
    { offset: 0, samples: tone(140, 2.0, { type: "triangle", gain: 0.03, curve: 0.4, attack: 0.3 }) },
  ), "arena", "arena", "Soft crowd bed", 0.25, true, "low"],
  ["tournament-start.wav", softChime([262, 330, 392], 0.1), "arena", "arena", "Tournament horn", 0.6, false, "high"],
  ["tournament-round.wav", softChime([440, 554], 0.06), "arena", "arena", "Round advance", 0.5, false, "normal"],
  ["tournament-victory.wav", grandFanfare([523, 659, 784, 1046]), "arena", "arena", "Cup victory", 0.68, false, "critical"],

  ["tcg-card-select.wav", magicalClick(740), "sfx", "sfx", "Card select", 0.32, false, "normal"],
  ["tcg-card-play.wav", mix(
    { offset: 0, samples: whooshRise(220, 880) },
    { offset: Math.floor(SR * 0.04), samples: paperRustle(0.1, { gain: 0.06 }) },
  ), "sfx", "sfx", "Card play", 0.55, false, "high"],
  ["tcg-card-draw.wav", mix(
    { offset: 0, samples: paperRustle(0.09, { gain: 0.1 }) },
    { offset: Math.floor(SR * 0.02), samples: magicalClick(520) },
  ), "sfx", "sfx", "Card draw", 0.38, false, "normal"],
  ["tcg-energy-gain.wav", softChime([740, 1110], 0.04), "sfx", "sfx", "Energy sparkle", 0.45, false, "low"],
  ["tcg-summon.wav", mix(
    { offset: 0, samples: whooshRise(220, 660) },
    { offset: Math.floor(SR * 0.08), samples: softChime([440, 660], 0.05) },
  ), "sfx", "sfx", "Summon swell", 0.58, false, "normal"],
  ["tcg-end-turn.wav", softChime([360, 240], 0.05), "sfx", "sfx", "End turn", 0.42, false, "normal"],
  ["tcg-attack.wav", impactThud(160), "sfx", "sfx", "Attack", 0.55, false, "high"],
  ["tcg-damage.wav", impactThud(120), "sfx", "sfx", "Damage", 0.5, false, "normal"],
  ["tcg-match-start.wav", softChime([196, 294, 392], 0.09), "sfx", "sfx", "Match start", 0.6, false, "high"],
  ["tcg-element-fire.wav", elementCue("fire"), "sfx", "sfx", "Fire affinity", 0.55, false, "normal"],
  ["tcg-element-water.wav", elementCue("water"), "sfx", "sfx", "Water affinity", 0.52, false, "normal"],
  ["tcg-element-nature.wav", elementCue("nature"), "sfx", "sfx", "Nature affinity", 0.5, false, "normal"],
  ["tcg-element-storm.wav", elementCue("storm"), "sfx", "sfx", "Storm affinity", 0.55, false, "normal"],
  ["tcg-element-void.wav", elementCue("void"), "sfx", "sfx", "Void affinity", 0.52, false, "normal"],
  ["tcg-element-light.wav", elementCue("light"), "sfx", "sfx", "Light affinity", 0.55, false, "normal"],

  ["deck-add.wav", magicalClick(660), "sfx", "sfx", "Deck add", 0.36, false, "normal"],
  ["deck-remove.wav", magicalClick(420), "sfx", "sfx", "Deck remove", 0.32, false, "normal"],
  ["deck-save.wav", softChime([523, 659, 784], 0.05), "sfx", "sfx", "Deck save", 0.5, false, "normal"],
  ["deck-error.wav", softChime([220, 170], 0.06), "sfx", "sfx", "Deck error", 0.42, false, "normal"],

  ["codex-page-turn.wav", mix(
    { offset: 0, samples: paperRustle(0.12, { gain: 0.12 }) },
    { offset: Math.floor(SR * 0.02), samples: tone(280, 0.05, { type: "triangle", gain: 0.12 }) },
  ), "sfx", "sfx", "Codex page", 0.4, false, "normal"],
  ["codex-discover.wav", softChime([392, 523, 784], 0.07), "sfx", "sfx", "Codex discover", 0.6, false, "high"],
  ["codex-inspect.wav", magicalClick(640), "sfx", "sfx", "Codex inspect", 0.35, false, "normal"],
  ["codex-reward.wav", softChime([587, 740, 987], 0.06), "sfx", "sfx", "Codex reward", 0.58, false, "high"],
  ["codex-locked.wav", softChime([180, 140], 0.05), "sfx", "sfx", "Codex locked", 0.3, false, "normal"],
  ["collection-open.wav", mix(
    { offset: 0, samples: paperRustle(0.15, { gain: 0.1 }) },
    { offset: Math.floor(SR * 0.04), samples: softChime([300, 450], 0.05) },
  ), "sfx", "sfx", "Binder open", 0.42, false, "normal"],
  ["collection-select.wav", magicalClick(700), "sfx", "sfx", "Collection select", 0.32, false, "normal"],

  ["shop-open.wav", softChime([360, 540], 0.06), "marketplace", "marketplace", "Shop curtain", 0.4, false, "normal"],
  ["shop-ok.wav", softChime([660, 880, 1320], 0.05), "marketplace", "marketplace", "Purchase OK", 0.55, false, "normal"],
  ["shop-fail.wav", softChime([240, 180], 0.07), "marketplace", "marketplace", "Purchase fail", 0.45, false, "normal"],
  ["marketplace-list.wav", softChime([520, 780], 0.05), "marketplace", "marketplace", "Listing created", 0.45, false, "normal"],
  ["marketplace-bid.wav", magicalClick(600), "marketplace", "marketplace", "Bid placed", 0.45, false, "normal"],
  ["marketplace-sol-transfer.wav", mix(
    { offset: 0, samples: softChime([440, 660, 880], 0.05) },
    { offset: 0, samples: whooshRise(300, 900) },
  ), "marketplace", "marketplace", "SOL transfer cosmetic only", 0.5, false, "normal"],

  ["guild-open.wav", softChime([196, 294], 0.1), "guild", "guild", "Guild hall", 0.45, false, "normal"],
  ["guild-invite.wav", softChime([700, 1050], 0.05), "guild", "guild", "Guild invite", 0.5, false, "normal"],
  ["guild-join.wav", softChime([392, 523, 659], 0.07), "guild", "guild", "Guild join", 0.55, false, "high"],

  ["housing-enter.wav", mix(
    { offset: 0, samples: tone(220, 0.15, { type: "sine", gain: 0.18 }) },
    { offset: Math.floor(SR * 0.08), samples: softChime([330], 0.08) },
    { offset: 0, samples: paperRustle(0.12, { gain: 0.05 }) },
  ), "housing", "housing", "Home enter", 0.45, false, "normal"],
  ["housing-place.wav", impactThud(240), "housing", "housing", "Place furniture", 0.4, false, "normal"],
  ["housing-pickup.wav", magicalClick(360), "housing", "housing", "Pickup furniture", 0.38, false, "normal"],

  ["notify-toast.wav", magicalClick(980), "events", "notifications", "Toast", 0.42, false, "normal"],
  ["notify-achievement.wav", softChime([523, 659, 784], 0.07), "events", "notifications", "Achievement", 0.58, false, "high"],
  ["notify-friend.wav", softChime([640, 860], 0.05), "events", "notifications", "Friend ping", 0.48, false, "normal"],

  ["voice-narrator.wav", mix(
    { offset: 0, samples: tone(180, 0.4, { type: "sine", gain: 0.16, curve: 1.5, attack: 0.05 }) },
    { offset: Math.floor(SR * 0.12), samples: tone(220, 0.35, { type: "triangle", gain: 0.12 }) },
  ), "events", "voice", "Narrator bed slot", 0.65, false, "normal"],
  ["voice-announcer-ready.wav", softChime([200, 300], 0.08), "events", "voice", "Announcer ready", 0.6, false, "normal"],
  ["voice-announcer-victory.wav", softChime([262, 392, 523], 0.09), "events", "voice", "Announcer victory", 0.65, false, "high"],

  ["world-npc.wav", softChime([480, 560], 0.04), "world", "world", "NPC talk", 0.4, false, "normal"],
  ["world-npc-greet.wav", softChime([520, 660], 0.05), "world", "world", "NPC greet", 0.42, false, "normal"],
  ["world-npc-work.wav", impactThud(180), "world", "world", "NPC work", 0.35, false, "low"],
  ["world-portal.wav", whooshRise(200, 800), "world", "world", "Portal", 0.55, false, "high"],
  ["world-gather.wav", softChime([360, 540], 0.04), "world", "world", "Gather", 0.4, false, "normal"],
  ["world-loot.wav", softChime([880, 1320], 0.04), "world", "world", "Loot", 0.45, false, "normal"],

  ["rewards-claim.wav", softChime([587, 740, 987], 0.06), "events", "events", "Rewards claim", 0.6, false, "high"],
  ["rewards-chime.wav", magicalClick(980), "events", "events", "Rewards tick", 0.22, false, "low"],

  ["weather-rain.wav", noiseWhoosh(0.4, { gain: 0.1, centerHz: 2400, q: 0.08 }), "world", "world", "Rain cue", 0.25, false, "low"],
  ["weather-thunder.wav", impactThud(55), "world", "world", "Thunder", 0.4, false, "high"],
  ["weather-wind.wav", noiseWhoosh(0.45, { gain: 0.08, centerHz: 900, q: 0.02 }), "world", "world", "Wind", 0.22, false, "low"],
];

const regions = [
  ["riftwild-commons", "open"],
  ["ember-crater", "volcano"],
  ["moonwater-coast", "ocean"],
  ["elderwood-forest", "forest"],
  ["stormspire-peaks", "open"],
  ["stoneheart-canyon", "desert"],
  ["frostveil-basin", "ice"],
  ["radiant-citadel", "temple"],
  ["void-hollow", "open"],
  ["alloy-ruins", "open"],
  ["spirit-marsh", "forest"],
  ["celestial-rift", "temple"],
  ["menu", "menu"],
];

const biomeAliases = [
  ["forest", "elderwood-forest", "forest"],
  ["volcano", "ember-crater", "volcano"],
  ["ice", "frostveil-basin", "ice"],
  ["desert", "stoneheart-canyon", "desert"],
  ["temple", "radiant-citadel", "temple"],
  ["ocean", "moonwater-coast", "ocean"],
];

const catalogEntries = [];

for (const [name, samples, folder, category, description, volume, looping, priority] of clips) {
  const runtimePath = path.join(sfxDir, name);
  writeWav(runtimePath, samples);
  const pkg = path.join(audioRoot, folder, name);
  fs.mkdirSync(path.dirname(pkg), { recursive: true });
  fs.copyFileSync(runtimePath, pkg);
  const assetDest = path.join(assetsDir, "sfx", name);
  fs.mkdirSync(path.dirname(assetDest), { recursive: true });
  fs.copyFileSync(runtimePath, assetDest);
  catalogEntries.push({
    file: name,
    id: name.replace(/\.wav$/, "").replace(/-/g, "."),
    category,
    folder: `audio/${folder}`,
    runtime: `/sounds/sfx/${name}`,
    package: `/audio/${folder}/${name}`,
    durationSec: durationOf(samples),
    volume,
    looping,
    spatial3d: false,
    priority,
    compression: "wav",
    description,
  });
  console.log("wrote", name);
}

for (const [region, mood] of regions) {
  const bed = ambientBed(region.length * 13, mood);
  writeWav(path.join(ambientDir, `${region}.wav`), bed);
  writeWav(path.join(assetsDir, "ambient", `${region}.wav`), bed);
  writeWav(path.join(audioRoot, "world", `${region}.wav`), bed);
  catalogEntries.push({
    file: `${region}.wav`,
    id: `ambient.${region}`,
    category: "world",
    folder: "audio/world",
    runtime: `/sounds/ambient/${region}.wav`,
    package: `/audio/world/${region}.wav`,
    durationSec: durationOf(bed),
    volume: 0.22,
    looping: true,
    spatial3d: false,
    priority: "low",
    compression: "wav",
    description: `Regional ambient bed — ${mood}`,
  });
  console.log("ambient", region);
}

for (const [alias, source, mood] of biomeAliases) {
  const bed = ambientBed(alias.length * 17 + 3, mood);
  writeWav(path.join(audioRoot, "world", `biome-${alias}.wav`), bed);
  // Also mirror under sounds for direct biome hooks
  writeWav(path.join(ambientDir, `biome-${alias}.wav`), bed);
  catalogEntries.push({
    file: `biome-${alias}.wav`,
    id: `ambient.biome.${alias}`,
    category: "world",
    folder: "audio/world",
    runtime: `/sounds/ambient/biome-${alias}.wav`,
    package: `/audio/world/biome-${alias}.wav`,
    durationSec: durationOf(bed),
    volume: 0.22,
    looping: true,
    spatial3d: false,
    priority: "low",
    compression: "wav",
    description: `Biome alias bed (${alias} ← ${source})`,
  });
  console.log("biome", alias);
}

// Music folder stub readme (CC0 beds already in public/sounds/music)
const musicReadme = path.join(audioRoot, "music", "README.md");
fs.mkdirSync(path.dirname(musicReadme), { recursive: true });
fs.writeFileSync(
  musicReadme,
  `# Music beds\n\nRuntime CC0 playlist lives at \`/sounds/music/\`.\nAdaptive combat/boss **stems** are procedural (Web Audio) via \`music-stems.ts\`.\nTrue multi-stem OGG layers are Phase 2 — see ADD.\n`,
);

const manifest = {
  version: 3,
  generatedAt: new Date().toISOString(),
  license: "Original procedural synthesis — Riftwilds IP. No third-party game SFX.",
  runtimeRoot: "/sounds/sfx/",
  packageRoot: "/audio/",
  format: {
    primary: "wav (masters + short cues)",
    delivery: "Prefer OGG/MP3 for long music beds in production CDN",
    channels: "stereo-capable synthesis; cues shipped mono for size; spatial via StereoPanner/HRTF stubs",
    surround: "5.1/7.1 deferred — browser Web Audio stereo/HRTF path first",
  },
  folders: [
    "ui", "music", "sfx", "companions", "bosses", "world",
    "housing", "guild", "arena", "marketplace", "events",
  ],
  cueCount: catalogEntries.length,
  cues: catalogEntries,
};

fs.writeFileSync(path.join(assetsDir, "MANIFEST.json"), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(audioRoot, "MANIFEST.json"), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(root, "docs/audio/SFX_CATALOG.json"), JSON.stringify(manifest, null, 2));

console.log("manifest ok —", clips.length, "sfx,", regions.length, "ambient,", biomeAliases.length, "biomes");
console.log("done");
