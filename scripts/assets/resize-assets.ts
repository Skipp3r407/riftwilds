import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import path from "path";
import sharp from "sharp";
import { SOURCE_DIR, PROCESSED_DIR, assertNotSourceWrite, BATTLE } from "./lib";

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.toLowerCase().endsWith(".png")) out.push(full);
  }
  return out;
}

async function fitToCanvas(
  input: string,
  outPath: string,
  width: number,
  height: number,
  padding: number,
): Promise<void> {
  assertNotSourceWrite(outPath);
  mkdirSync(path.dirname(outPath), { recursive: true });

  const trimmed = await sharp(input).trim({ threshold: 1 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const maxW = width - padding * 2;
  const maxH = height - padding * 2;
  const scale = Math.min(maxW / (meta.width ?? 1), maxH / (meta.height ?? 1), 1);
  const tw = Math.max(1, Math.round((meta.width ?? 1) * scale));
  const th = Math.max(1, Math.round((meta.height ?? 1) * scale));

  const resized = await sharp(trimmed).resize(tw, th, { fit: "inside" }).png().toBuffer();
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: resized,
        left: Math.floor((width - tw) / 2),
        top: Math.floor(height - padding - th), // feet toward baseline
      },
    ])
    .png()
    .toFile(outPath);
}

async function main() {
  const files = walk(SOURCE_DIR);
  if (!files.length) {
    console.log("No source PNGs to resize.");
    return;
  }
  for (const file of files) {
    const rel = path.relative(SOURCE_DIR, file);
    const out = path.join(PROCESSED_DIR, rel);
    const base = path.basename(file).toLowerCase();
    if (base.includes("profile")) {
      await fitToCanvas(file, out, 2048, 2048, 80);
    } else if (base.includes("battle")) {
      await fitToCanvas(file, out, BATTLE.frameWidth, BATTLE.frameHeight, BATTLE.padding);
    } else if (base.includes("icon")) {
      await fitToCanvas(file, out, 256, 256, 16);
    } else {
      await fitToCanvas(file, out, 1024, 1024, 40);
    }
    console.log("Processed", rel);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
