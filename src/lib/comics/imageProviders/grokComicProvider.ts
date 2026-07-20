/**
 * Grok / xAI image provider for comic plates (text-free art stage).
 * Falls back to cursor-local / openai via env when XAI key missing.
 *
 * Env:
 *   XAI_API_KEY
 *   XAI_IMAGE_MODEL (default: grok-imagine-image)
 *   COMIC_IMAGE_PROVIDER = grok | openai | cursor-local | none
 */

import fs from "node:fs";
import path from "node:path";

export type ComicImageProviderId = "grok" | "openai" | "cursor-local" | "none";

export type ComicArtRequest = {
  id: string;
  prompt: string;
  /** Absolute or project-relative output path for PNG */
  outputPath: string;
  aspectRatio?: "3:4" | "1:1" | "16:9";
};

export type ComicArtResult = {
  id: string;
  ok: boolean;
  provider: ComicImageProviderId;
  outputPath: string;
  status: "generated" | "pending_manual" | "skipped" | "failed";
  message?: string;
  bytes?: number;
};

const NO_TEXT_SUFFIX =
  " CRITICAL: Do not paint any dialogue, captions, speech balloons, SFX lettering, logos, watermarks, page numbers, or UI chrome. Leave natural negative space for lettering pass.";

export function resolveComicImageProvider(): ComicImageProviderId {
  const raw = (process.env.COMIC_IMAGE_PROVIDER || process.env.IMAGE_PROVIDER || "cursor-local")
    .toLowerCase()
    .trim();
  if (raw === "grok" || raw === "openai" || raw === "cursor-local" || raw === "none") return raw;
  if (raw === "xai") return "grok";
  return "cursor-local";
}

function getXaiKey(): string | undefined {
  return process.env.XAI_API_KEY || process.env.IMAGE_API_KEY || undefined;
}

function getOpenAiKey(): string | undefined {
  return process.env.OPENAI_API_KEY || process.env.IMAGE_API_KEY || undefined;
}

async function generateGrok(req: ComicArtRequest): Promise<ComicArtResult> {
  const key = getXaiKey();
  if (!key) {
    return {
      id: req.id,
      ok: false,
      provider: "grok",
      outputPath: req.outputPath,
      status: "pending_manual",
      message: "XAI_API_KEY missing — write prompt job for Cursor GenerateImage",
    };
  }

  const model = process.env.XAI_IMAGE_MODEL || "grok-imagine-image";
  const prompt = req.prompt + NO_TEXT_SUFFIX;

  try {
    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        response_format: "b64_json",
      }),
    });
    if (!res.ok) {
      return {
        id: req.id,
        ok: false,
        provider: "grok",
        outputPath: req.outputPath,
        status: "failed",
        message: `xAI ${res.status}: ${await res.text()}`,
      };
    }
    const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    let buf: Buffer | null = null;
    if (b64) buf = Buffer.from(b64, "base64");
    else if (json.data?.[0]?.url) {
      const img = await fetch(json.data[0].url);
      buf = Buffer.from(await img.arrayBuffer());
    }
    if (!buf) {
      return {
        id: req.id,
        ok: false,
        provider: "grok",
        outputPath: req.outputPath,
        status: "failed",
        message: "No image payload",
      };
    }
    fs.mkdirSync(path.dirname(req.outputPath), { recursive: true });
    fs.writeFileSync(req.outputPath, buf);
    return {
      id: req.id,
      ok: true,
      provider: "grok",
      outputPath: req.outputPath,
      status: "generated",
      bytes: buf.length,
    };
  } catch (err) {
    return {
      id: req.id,
      ok: false,
      provider: "grok",
      outputPath: req.outputPath,
      status: "failed",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

async function generateOpenAi(req: ComicArtRequest): Promise<ComicArtResult> {
  const key = getOpenAiKey();
  if (!key) {
    return {
      id: req.id,
      ok: false,
      provider: "openai",
      outputPath: req.outputPath,
      status: "pending_manual",
      message: "OPENAI_API_KEY missing",
    };
  }
  const size = req.aspectRatio === "16:9" ? "1792x1024" : "1024x1792";
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.IMAGE_MODEL || "dall-e-3",
      prompt: req.prompt + NO_TEXT_SUFFIX,
      n: 1,
      size,
      response_format: "b64_json",
    }),
  });
  if (!res.ok) {
    return {
      id: req.id,
      ok: false,
      provider: "openai",
      outputPath: req.outputPath,
      status: "failed",
      message: await res.text(),
    };
  }
  const json = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    return {
      id: req.id,
      ok: false,
      provider: "openai",
      outputPath: req.outputPath,
      status: "failed",
      message: "No b64",
    };
  }
  const buf = Buffer.from(b64, "base64");
  fs.mkdirSync(path.dirname(req.outputPath), { recursive: true });
  fs.writeFileSync(req.outputPath, buf);
  return {
    id: req.id,
    ok: true,
    provider: "openai",
    outputPath: req.outputPath,
    status: "generated",
    bytes: buf.length,
  };
}

function writeCursorLocalJob(req: ComicArtRequest, projectRoot: string): ComicArtResult {
  const dir = path.join(projectRoot, "artifacts/comics/issue-001/cursor-jobs");
  fs.mkdirSync(dir, { recursive: true });
  const jobPath = path.join(dir, `${req.id}.json`);
  fs.writeFileSync(
    jobPath,
    JSON.stringify(
      {
        id: req.id,
        prompt: req.prompt + NO_TEXT_SUFFIX,
        outputPath: req.outputPath,
        aspectRatio: req.aspectRatio ?? "3:4",
        instructions: "Use Cursor GenerateImage, save PNG to outputPath (text-free art only).",
      },
      null,
      2,
    ),
    "utf8",
  );
  return {
    id: req.id,
    ok: false,
    provider: "cursor-local",
    outputPath: req.outputPath,
    status: "pending_manual",
    message: `Job written: ${jobPath}`,
  };
}

export async function generateComicArt(
  req: ComicArtRequest,
  projectRoot = process.cwd(),
): Promise<ComicArtResult> {
  const provider = resolveComicImageProvider();
  if (provider === "none") {
    return {
      id: req.id,
      ok: false,
      provider,
      outputPath: req.outputPath,
      status: "skipped",
      message: "COMIC_IMAGE_PROVIDER=none",
    };
  }
  if (provider === "grok") {
    const r = await generateGrok(req);
    if (r.status === "pending_manual") return writeCursorLocalJob(req, projectRoot);
    return r;
  }
  if (provider === "openai") return generateOpenAi(req);
  return writeCursorLocalJob(req, projectRoot);
}
