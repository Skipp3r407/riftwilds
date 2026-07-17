import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export type OptimizeOptions = {
  /** Max edge length; preserves aspect. */
  maxEdge?: number;
  /** PNG compression effort 0–10. */
  effort?: number;
  /** Convert to webp sibling. */
  writeWebp?: boolean;
  webpQuality?: number;
};

export type OptimizeResult = {
  input: string;
  output: string;
  beforeBytes: number;
  afterBytes: number;
  width: number;
  height: number;
  webpPath?: string;
};

/**
 * Lossless-leaning PNG recompress + optional downscale. Safe for game masters.
 */
export async function optimizePng(
  absolutePath: string,
  opts: OptimizeOptions = {},
): Promise<OptimizeResult> {
  const maxEdge = opts.maxEdge ?? 2048;
  const effort = opts.effort ?? 8;
  const before = await fs.readFile(absolutePath);
  const beforeBytes = before.length;

  let pipeline = sharp(before).rotate();
  const meta = await pipeline.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w > maxEdge || h > maxEdge) {
    pipeline = sharp(before)
      .rotate()
      .resize({
        width: w >= h ? maxEdge : undefined,
        height: h > w ? maxEdge : undefined,
        fit: "inside",
        withoutEnlargement: true,
      });
  }

  const outBuf = await pipeline.png({ compressionLevel: 9, effort, adaptiveFiltering: true }).toBuffer();
  await fs.writeFile(absolutePath, outBuf);

  let webpPath: string | undefined;
  if (opts.writeWebp) {
    webpPath = absolutePath.replace(/\.png$/i, ".webp");
    const webp = await sharp(outBuf)
      .webp({ quality: opts.webpQuality ?? 82 })
      .toBuffer();
    await fs.writeFile(webpPath, webp);
  }

  const afterMeta = await sharp(outBuf).metadata();
  return {
    input: absolutePath,
    output: absolutePath,
    beforeBytes,
    afterBytes: outBuf.length,
    width: afterMeta.width ?? w,
    height: afterMeta.height ?? h,
    webpPath,
  };
}

export async function optimizeTree(
  dir: string,
  opts: OptimizeOptions = {},
): Promise<OptimizeResult[]> {
  const results: OptimizeResult[] = [];
  async function walk(d: string) {
    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) await walk(p);
      else if (ent.isFile() && /\.png$/i.test(ent.name)) {
        results.push(await optimizePng(p, opts));
      }
    }
  }
  await walk(dir);
  return results;
}
