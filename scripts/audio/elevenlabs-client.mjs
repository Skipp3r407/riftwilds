/**
 * Shared ElevenLabs TTS helper for asset scripts (comics + commercials).
 * Never logs API keys. Callers own caching / file layout.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "../..");

/** Warm storytelling default (Rachel). Override with ELEVENLABS_VOICE_ID. */
export const DEFAULT_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
export const DEFAULT_ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";

export function loadDotEnv(root = REPO_ROOT) {
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

export function getElevenLabsConfig() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim() || "";
  return {
    apiKey,
    voiceId: process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_ELEVENLABS_VOICE_ID,
    modelId: process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_ELEVENLABS_MODEL_ID,
    hasKey: Boolean(apiKey),
  };
}

/**
 * Synthesize text → MPEG bytes via ElevenLabs.
 * @returns {Promise<Buffer>}
 */
export async function synthesizeElevenLabsMp3(text, opts = {}) {
  const cfg = getElevenLabsConfig();
  const apiKey = opts.apiKey ?? cfg.apiKey;
  const voiceId = opts.voiceId ?? cfg.voiceId;
  const modelId = opts.modelId ?? cfg.modelId;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY missing");
  }
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    throw new Error("Empty TTS text");
  }

  const body = {
    text: trimmed,
    model_id: modelId,
    voice_settings: {
      stability: Number(process.env.ELEVENLABS_STABILITY ?? 0.5),
      similarity_boost: Number(process.env.ELEVENLABS_SIMILARITY ?? 0.75),
      style: Number(process.env.ELEVENLABS_STYLE ?? 0.35),
      use_speaker_boost: true,
    },
  };

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS ${res.status}: ${errText.slice(0, 240)}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) {
    throw new Error("ElevenLabs TTS returned empty audio");
  }
  return buf;
}

export async function writeElevenLabsMp3(text, outPath, opts = {}) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const buf = await synthesizeElevenLabsMp3(text, opts);
  fs.writeFileSync(outPath, buf);
  return { path: outPath, bytes: buf.length };
}
