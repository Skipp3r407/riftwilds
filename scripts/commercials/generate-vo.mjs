/**
 * Riftwilds commercial VO — cinematic narrator.
 *
 * Engine priority:
 *   1. OPENAI_API_KEY          → OpenAI TTS (onyx / deep narrative)
 *   2. ELEVENLABS_API_KEY      → ElevenLabs (ELEVENLABS_VOICE_ID optional)
 *   3. edge-tts (Python)       → Microsoft neural voices (free, no key)
 *   4. Windows SAPI fallback   → Microsoft David, slow trailer rate
 *
 * Usage: node scripts/commercials/generate-vo.mjs
 * Env:   COMMERCIAL_TTS=openai|elevenlabs|edge|sapi  (force engine)
 *        EDGE_TTS_VOICE=en-US-ChristopherNeural
 *        OPENAI_TTS_VOICE=onyx
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const audioOut = path.join(root, "public/assets/commercials/audio");
const tmp = path.join(root, "artifacts/commercials/tmp/vo");
fs.mkdirSync(audioOut, { recursive: true });
fs.mkdirSync(tmp, { recursive: true });

function loadDotEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadDotEnv();

function resolveBin(name, envKey, fallbacks) {
  if (process.env[envKey] && fs.existsSync(process.env[envKey])) return process.env[envKey];
  const which = spawnSync(process.platform === "win32" ? "where.exe" : "which", [name], {
    encoding: "utf8",
  });
  if (which.status === 0) {
    const first = String(which.stdout)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find(Boolean);
    if (first && fs.existsSync(first)) return first;
  }
  for (const f of fallbacks) if (fs.existsSync(f)) return f;
  throw new Error(`${name} not found`);
}

const FFMPEG = resolveBin("ffmpeg", "FFMPEG_PATH", [
  "C:\\Program Files\\Jellyfin\\Server\\ffmpeg.exe",
]);
const FFPROBE = resolveBin("ffprobe", "FFPROBE_PATH", [
  "C:\\Program Files\\Jellyfin\\Server\\ffprobe.exe",
  path.join(path.dirname(FFMPEG), "ffprobe.exe"),
]);

function ff(...args) {
  const r = spawnSync(FFMPEG, ["-y", ...args], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.error(r.stderr?.slice(-1500));
    throw new Error(`ffmpeg failed: ${args.slice(0, 4).join(" ")}`);
  }
}

function probeDuration(file) {
  const r = spawnSync(
    FFPROBE,
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  return Number.parseFloat(String(r.stdout).trim()) || 1.2;
}

function silence(outPath, seconds) {
  const t = Math.max(0.05, seconds);
  ff("-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", String(t), "-c:a", "pcm_s16le", outPath);
}

function toWav(input, wavPath) {
  ff("-i", input, "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", wavPath);
}

function hasPythonEdgeTts() {
  const r = spawnSync("python", ["-c", "import edge_tts; print('ok')"], { encoding: "utf8" });
  return r.status === 0 && String(r.stdout).includes("ok");
}

function speakOpenAI(text, wavPath) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const voice = process.env.OPENAI_TTS_VOICE || "onyx";
  const model = process.env.OPENAI_TTS_MODEL || "tts-1-hd";
  const mp3 = wavPath.replace(/\.wav$/i, ".mp3");
  const body = JSON.stringify({
    model,
    voice,
    input: text,
    response_format: "mp3",
  });
  const r = spawnSync(
    "curl",
    [
      "-sS",
      "-X",
      "POST",
      "https://api.openai.com/v1/audio/speech",
      "-H",
      `Authorization: Bearer ${key}`,
      "-H",
      "Content-Type: application/json",
      "-d",
      body,
      "-o",
      mp3,
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  if (r.status !== 0 || !fs.existsSync(mp3) || fs.statSync(mp3).size < 200) {
    throw new Error(`OpenAI TTS failed: ${r.stderr || r.stdout || "empty"}`);
  }
  toWav(mp3, wavPath);
}

function speakElevenLabs(text, wavPath) {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) throw new Error("ELEVENLABS_API_KEY missing");
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel; override for deep male
  const mp3 = wavPath.replace(/\.wav$/i, ".mp3");
  const body = JSON.stringify({
    text,
    model_id: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.45,
      similarity_boost: 0.75,
      style: 0.35,
      use_speaker_boost: true,
    },
  });
  const r = spawnSync(
    "curl",
    [
      "-sS",
      "-X",
      "POST",
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      "-H",
      `xi-api-key: ${key}`,
      "-H",
      "Content-Type: application/json",
      "-H",
      "Accept: audio/mpeg",
      "-d",
      body,
      "-o",
      mp3,
    ],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  );
  if (r.status !== 0 || !fs.existsSync(mp3) || fs.statSync(mp3).size < 200) {
    throw new Error(`ElevenLabs TTS failed: ${r.stderr || r.stdout || "empty"}`);
  }
  toWav(mp3, wavPath);
}

function speakEdge(text, wavPath) {
  const voice = process.env.EDGE_TTS_VOICE || "en-US-ChristopherNeural";
  const rate = process.env.EDGE_TTS_RATE || "-12%";
  const pitch = process.env.EDGE_TTS_PITCH || "-2Hz";
  const mp3 = wavPath.replace(/\.wav$/i, ".mp3");
  const py = `
import asyncio, edge_tts
async def main():
    c = edge_tts.Communicate(${JSON.stringify(text)}, voice=${JSON.stringify(voice)}, rate=${JSON.stringify(rate)}, pitch=${JSON.stringify(pitch)})
    await c.save(${JSON.stringify(mp3)})
asyncio.run(main())
`.trim();
  const r = spawnSync("python", ["-c", py], {
    encoding: "utf8",
    maxBuffer: 5 * 1024 * 1024,
  });
  if (r.status !== 0 || !fs.existsSync(mp3)) {
    console.error(r.stderr || r.stdout);
    throw new Error(`edge-tts failed: ${text.slice(0, 40)}`);
  }
  toWav(mp3, wavPath);
}

/** Windows SAPI — prefer David (male), slow trailer rate, slightly lower pitch via SSML. */
function speakSapi(text, wavPath) {
  const rate = Number.parseInt(process.env.SAPI_RATE || "-3", 10);
  const ps = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = @($synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo })
$pick = $voices | Where-Object { $_.Name -match 'David|Mark|George|Guy' } | Select-Object -First 1
if (-not $pick) { $pick = $voices | Where-Object { $_.Gender -eq 'Male' } | Select-Object -First 1 }
if (-not $pick) { $pick = $voices | Select-Object -First 1 }
if ($pick) { [void]$synth.SelectVoice($pick.Name) }
$synth.Rate = ${Number.isFinite(rate) ? rate : -3}
$synth.Volume = 100
$synth.SetOutputToWaveFile(${JSON.stringify(wavPath)})
$ssml = @"
<speak version='1.0' xml:lang='en-US'>
  <prosody pitch='-2st' rate='slow'>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</prosody>
</speak>
"@
try { $synth.SpeakSsml($ssml) } catch { $synth.Speak(${JSON.stringify(text)}) }
$synth.Dispose()
Write-Output $pick.Name
`.trim();
  const r = spawnSync(
    "powershell",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps],
    { encoding: "utf8", maxBuffer: 5 * 1024 * 1024 },
  );
  if (r.status !== 0 || !fs.existsSync(wavPath)) {
    console.error(r.stderr || r.stdout);
    throw new Error(`SAPI speak failed: ${text.slice(0, 40)}`);
  }
  return String(r.stdout || "").trim();
}

function pickEngine() {
  const forced = (process.env.COMMERCIAL_TTS || "").toLowerCase().trim();
  if (forced === "openai" || forced === "elevenlabs" || forced === "edge" || forced === "sapi") {
    return forced;
  }
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  if (process.env.ELEVENLABS_API_KEY?.trim()) return "elevenlabs";
  if (hasPythonEdgeTts()) return "edge";
  return "sapi";
}

function speakLine(engine, text, wavPath) {
  if (engine === "openai") return speakOpenAI(text, wavPath);
  if (engine === "elevenlabs") return speakElevenLabs(text, wavPath);
  if (engine === "edge") return speakEdge(text, wavPath);
  return speakSapi(text, wavPath);
}

const scripts = {
  "60s": {
    file: "riftwilds-commercial-60s-16x9-vo",
    duration: 60,
    lines: [
      { t: 0, d: 7, text: "Across floating islands... a world still breathing." },
      { t: 7, d: 5, text: "In the Hatchery, a Rift egg waits for a Keeper." },
      { t: 12, d: 6, text: "Crack the shell. Meet your Riftling." },
      {
        t: 18,
        d: 6,
        text: "Step into the Live World - explore regions, meet others, find your path.",
      },
      { t: 24, d: 5, text: "Talk to NPCs. Accept quests. Follow the trail." },
      { t: 29, d: 5, text: "Train in battles. Test your bond." },
      { t: 34, d: 4, text: "Craft gear. Shape what you need." },
      { t: 38, d: 4, text: "Make a home. Rest with your companion." },
      { t: 42, d: 5, text: "Join guilds. Celebrate events together." },
      { t: 47, d: 5, text: "Trade in the player economy - build your own loop." },
      {
        t: 52,
        d: 8,
        text: "Riftwilds. A browser fantasy multiplayer game. Play the alpha. Enter the Live World.",
      },
    ],
  },
  "30s": {
    file: "riftwilds-commercial-30s-9x16-vo",
    duration: 30,
    lines: [
      { t: 0, d: 5, text: "A fractured world. A living companion." },
      { t: 5, d: 5, text: "Hatch your Riftling." },
      { t: 10, d: 5, text: "Explore the Live World." },
      { t: 15, d: 5, text: "Battle. Craft. Belong." },
      { t: 20, d: 5, text: "Guilds. Events. Your story." },
      { t: 25, d: 5, text: "Riftwilds - play the alpha. Enter the Live World." },
    ],
  },
  "15s": {
    file: "riftwilds-commercial-15s-9x16-teaser-vo",
    duration: 15,
    lines: [
      { t: 0, d: 4, text: "The Riftwilds are waking." },
      { t: 4, d: 4, text: "Hatch a Riftling." },
      { t: 8, d: 3.5, text: "Enter the Live World." },
      { t: 11.5, d: 3.5, text: "Play the alpha - in your browser." },
    ],
  },
  "25s": {
    file: "riftwilds-commercial-25s-1x1-vo",
    duration: 25,
    lines: [
      { t: 0, d: 5, text: "Meet your Riftling." },
      { t: 5, d: 5, text: "Hatch. Bond. Begin." },
      { t: 10, d: 5, text: "Battle with heart." },
      { t: 15, d: 5, text: "Explore the Live World." },
      { t: 20, d: 5, text: "Riftwilds - play the closed alpha." },
    ],
  },
};

const engine = pickEngine();
const engineDetail =
  engine === "edge"
    ? `${engine} (${process.env.EDGE_TTS_VOICE || "en-US-ChristopherNeural"} @ ${process.env.EDGE_TTS_RATE || "-12%"})`
    : engine === "openai"
      ? `${engine} (${process.env.OPENAI_TTS_VOICE || "onyx"})`
      : engine === "elevenlabs"
        ? `${engine} (${process.env.ELEVENLABS_VOICE_ID || "default"})`
        : `${engine} (Microsoft David / male, rate -3)`;

console.log(`VO engine: ${engineDetail}`);
fs.writeFileSync(
  path.join(audioOut, "VO_ENGINE.json"),
  JSON.stringify(
    {
      engine,
      detail: engineDetail,
      generatedAt: new Date().toISOString(),
      tip: "Set OPENAI_API_KEY or ELEVENLABS_API_KEY for premium cloud TTS, then re-run npm run commercials:vo",
    },
    null,
    2,
  ),
  "utf8",
);

for (const [key, spec] of Object.entries(scripts)) {
  console.log(`Generating VO for ${key}...`);
  const parts = [];
  let cursor = 0;
  let i = 0;

  for (const line of spec.lines) {
    if (line.t > cursor + 0.05) {
      const sil = path.join(tmp, `${key}-sil-${String(i).padStart(2, "0")}.wav`);
      silence(sil, line.t - cursor);
      parts.push(sil);
      cursor = line.t;
    }
    const wav = path.join(tmp, `${key}-line-${String(i).padStart(2, "0")}.wav`);
    speakLine(engine, line.text, wav);
    // Light polish: gentle high-pass (kill rumble) + soft limiter for trailer clarity
    const polished = path.join(tmp, `${key}-line-${String(i).padStart(2, "0")}-fx.wav`);
    ff(
      "-i",
      wav,
      "-af",
      "highpass=f=80,acompressor=threshold=-18dB:ratio=2.5:attack=20:release=200:makeup=2,alimiter=limit=0.95",
      "-c:a",
      "pcm_s16le",
      polished,
    );
    parts.push(polished);
    const spoken = probeDuration(polished);
    cursor += spoken;
    const windowEnd = line.t + line.d;
    if (cursor < windowEnd - 0.08) {
      const pad = path.join(tmp, `${key}-pad-${String(i).padStart(2, "0")}.wav`);
      silence(pad, windowEnd - cursor);
      parts.push(pad);
      cursor = windowEnd;
    } else if (cursor > windowEnd + 0.35) {
      // Line overran caption window — gently speed just enough to fit (max 8%)
      const target = Math.max(0.5, line.d - 0.15);
      if (spoken > target) {
        const ratio = Math.min(1.08, spoken / target);
        const fitted = path.join(tmp, `${key}-line-${String(i).padStart(2, "0")}-fit.wav`);
        ff(
          "-i",
          polished,
          "-af",
          `atempo=${ratio.toFixed(4)}`,
          "-c:a",
          "pcm_s16le",
          fitted,
        );
        parts[parts.length - 1] = fitted;
        cursor = line.t + probeDuration(fitted);
        if (cursor < windowEnd - 0.08) {
          const pad = path.join(tmp, `${key}-pad-${String(i).padStart(2, "0")}.wav`);
          silence(pad, windowEnd - cursor);
          parts.push(pad);
          cursor = windowEnd;
        }
      }
    }
    i++;
  }

  if (cursor < spec.duration) {
    const end = path.join(tmp, `${key}-end.wav`);
    silence(end, spec.duration - cursor);
    parts.push(end);
  }

  const listPath = path.join(tmp, `concat-${key}.txt`);
  fs.writeFileSync(
    listPath,
    parts.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"),
    "utf8",
  );

  const wavOut = path.join(audioOut, `${spec.file}.wav`);
  const m4aOut = path.join(audioOut, `${spec.file}.m4a`);
  ff("-f", "concat", "-safe", "0", "-i", listPath, "-c:a", "pcm_s16le", wavOut);
  ff("-i", wavOut, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "1", m4aOut);
  console.log(`  -> ${m4aOut} (${probeDuration(m4aOut).toFixed(1)}s)`);
}

console.log(`VO generation complete (engine=${engine}).`);
