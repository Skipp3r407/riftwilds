/**
 * High-level generation orchestration.
 * cursor-local: writes batch job specs for Cursor GenerateImage; optional API providers when keyed.
 */

import fs from "node:fs";
import path from "node:path";
import {
  RIFTWILDS_STYLE_SUFFIX,
  getImageApiKey,
  resolveImageProviderId,
  type GenerateImageRequest,
  type GenerateImageResult,
  type ImageProviderId,
} from "@/lib/assets/image-provider";
import {
  buildExpectedAssets,
  filterByCategory,
  missingAssets,
  type AssetCategory,
  type AssetRecord,
  writeManifestFiles,
} from "@/lib/assets/asset-manifest";

export type GenerateBatchOptions = {
  projectRoot: string;
  category?: AssetCategory | "all";
  /** Only priority <= this (1 = highest). */
  maxPriority?: number;
  limit?: number;
  dryRun?: boolean;
  /** Force rewrite job specs even if file exists. */
  force?: boolean;
};

export type BatchJobSpec = {
  id: string;
  prompt: string;
  outputRelPath: string;
  aspectRatio?: GenerateImageRequest["aspectRatio"];
  maskTransparent?: boolean;
  category: string;
  priority: number;
  instructions: string;
};

function projectRootDefault(): string {
  return process.cwd();
}

export function buildPromptForAsset(rec: AssetRecord): string {
  const base = rec.promptHint ?? `${rec.label}, Riftwilds game asset`;
  return `${base} ${RIFTWILDS_STYLE_SUFFIX}`;
}

export function aspectForCategory(category: AssetCategory): GenerateImageRequest["aspectRatio"] {
  if (category === "worlds" || category === "regions") return "16:9";
  if (category === "buildings" || category === "bosses") return "4:3";
  if (category === "ui" || category === "eggs" || category === "items") return "1:1";
  return "1:1";
}

export function collectGenerationJobs(opts: GenerateBatchOptions): BatchJobSpec[] {
  const root = opts.projectRoot || projectRootDefault();
  const all = buildExpectedAssets(root);
  let list = filterByCategory(all, opts.category ?? "all");
  if (!opts.force) list = missingAssets(list);
  if (opts.maxPriority != null) list = list.filter((a) => a.priority <= opts.maxPriority!);
  list = list.sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  if (opts.limit != null) list = list.slice(0, opts.limit);

  return list.map((rec) => ({
    id: rec.id,
    prompt: buildPromptForAsset(rec),
    outputRelPath: rec.publicPath.replace(/^\//, ""),
    aspectRatio: aspectForCategory(rec.category),
    maskTransparent: ["ui", "eggs", "items", "npcs", "pets"].includes(rec.category),
    category: rec.category,
    priority: rec.priority,
    instructions:
      "Use Cursor GenerateImage with this prompt, then copy/mask the PNG into outputRelPath under public/.",
  }));
}

/**
 * Write a JSONL + markdown batch for cursor-local workflow.
 * Does not call external APIs; marks honesty about pending_manual.
 */
export function writeCursorLocalBatch(
  jobs: BatchJobSpec[],
  projectRoot: string,
): { jobsPath: string; mdPath: string; count: number } {
  const dir = path.join(projectRoot, "artifacts/assets/batches");
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jobsPath = path.join(dir, `cursor-local-${stamp}.jsonl`);
  const mdPath = path.join(dir, `cursor-local-${stamp}.md`);
  const latestJsonl = path.join(dir, "latest-cursor-local.jsonl");
  const latestMd = path.join(dir, "latest-cursor-local.md");

  const lines = jobs.map((j) => JSON.stringify(j));
  fs.writeFileSync(jobsPath, lines.join("\n") + (lines.length ? "\n" : ""), "utf8");
  fs.writeFileSync(latestJsonl, lines.join("\n") + (lines.length ? "\n" : ""), "utf8");

  const md = [
    `# Cursor-local image batch (${jobs.length} jobs)`,
    ``,
    `Provider: cursor-local. Generate each asset with Cursor **GenerateImage**, then place at the listed path.`,
    `Run \`npm run assets:mask\` on icon/portrait folders after copy. Then \`npm run assets:scan\`.`,
    ``,
    ...jobs.map(
      (j, i) =>
        `## ${i + 1}. \`${j.id}\`\n\n- **Out:** \`public/${j.outputRelPath}\`\n- **Aspect:** ${j.aspectRatio ?? "1:1"}\n- **Mask:** ${j.maskTransparent ? "yes" : "no"}\n\n\`\`\`\n${j.prompt}\n\`\`\`\n`,
    ),
  ].join("\n");
  fs.writeFileSync(mdPath, md, "utf8");
  fs.writeFileSync(latestMd, md, "utf8");

  return { jobsPath, mdPath, count: jobs.length };
}

async function generateViaOpenAI(req: GenerateImageRequest): Promise<GenerateImageResult> {
  const key = getImageApiKey();
  if (!key) {
    return {
      id: req.id,
      ok: false,
      provider: "openai",
      outputRelPath: req.outputRelPath,
      status: "failed",
      message: "IMAGE_API_KEY / OPENAI_API_KEY not set",
    };
  }

  // Optional live path — kept minimal; prefer cursor-local for this repo.
  const size =
    req.aspectRatio === "16:9" ? "1792x1024" : req.aspectRatio === "9:16" ? "1024x1792" : "1024x1024";
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.IMAGE_MODEL ?? "dall-e-3",
      prompt: req.prompt,
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
      outputRelPath: req.outputRelPath,
      status: "failed",
      message: `OpenAI ${res.status}: ${await res.text()}`,
    };
  }
  const json = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) {
    return {
      id: req.id,
      ok: false,
      provider: "openai",
      outputRelPath: req.outputRelPath,
      status: "failed",
      message: "No image data in response",
    };
  }
  const abs = path.join(process.cwd(), "public", req.outputRelPath.replace(/^public\//, ""));
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const buf = Buffer.from(b64, "base64");
  fs.writeFileSync(abs, buf);
  return {
    id: req.id,
    ok: true,
    provider: "openai",
    outputRelPath: req.outputRelPath,
    absolutePath: abs,
    status: "generated",
    bytes: buf.length,
  };
}

export async function runGenerateBatch(
  opts: GenerateBatchOptions,
): Promise<{
  provider: ImageProviderId;
  jobs: BatchJobSpec[];
  results: GenerateImageResult[];
  batchPaths?: { jobsPath: string; mdPath: string };
}> {
  const root = opts.projectRoot || projectRootDefault();
  const provider = resolveImageProviderId();
  const jobs = collectGenerationJobs(opts);
  const results: GenerateImageResult[] = [];

  if (provider === "none" || opts.dryRun) {
    for (const j of jobs) {
      results.push({
        id: j.id,
        ok: false,
        provider,
        outputRelPath: j.outputRelPath,
        status: "skipped",
        message: opts.dryRun ? "dry-run" : "IMAGE_PROVIDER=none",
      });
    }
    return { provider, jobs, results };
  }

  if (provider === "cursor-local" || provider === "replicate") {
    // Replicate without a dedicated client: fall back to documenting jobs (honest).
    if (provider === "replicate" && !getImageApiKey()) {
      const batchPaths = writeCursorLocalBatch(jobs, root);
      for (const j of jobs) {
        results.push({
          id: j.id,
          ok: false,
          provider: "replicate",
          outputRelPath: j.outputRelPath,
          status: "pending_manual",
          message: "REPLICATE_API_TOKEN missing — wrote cursor-local batch instead",
        });
      }
      writeManifestFiles(root);
      return { provider, jobs, results, batchPaths };
    }
    const batchPaths = writeCursorLocalBatch(jobs, root);
    for (const j of jobs) {
      results.push({
        id: j.id,
        ok: false,
        provider: "cursor-local",
        outputRelPath: j.outputRelPath,
        status: "pending_manual",
        message: "Awaiting Cursor GenerateImage placement into public/",
      });
    }
    writeManifestFiles(root);
    return { provider, jobs, results, batchPaths };
  }

  if (provider === "openai") {
    for (const j of jobs) {
      if (opts.dryRun) break;
      const r = await generateViaOpenAI({
        id: j.id,
        prompt: j.prompt,
        outputRelPath: j.outputRelPath,
        aspectRatio: j.aspectRatio,
        maskTransparent: j.maskTransparent,
      });
      results.push(r);
    }
    writeManifestFiles(root);
    return { provider, jobs, results };
  }

  return { provider, jobs, results };
}

export function installCopiedAsset(
  projectRoot: string,
  sourceAbsolute: string,
  publicRelPath: string,
): string {
  const dest = path.join(projectRoot, "public", publicRelPath.replace(/^\//, "").replace(/^public\//, ""));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(sourceAbsolute, dest);
  return dest;
}
