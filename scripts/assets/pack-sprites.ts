import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import path from "path";
import sharp from "sharp";
import { PROCESSED_DIR, SHEETS_DIR, assertNotSourceWrite, BATTLE } from "./lib";

/**
 * Packs sequentially named frames:
 * creature-{slug}-battle-idle-00.png … into a horizontal/grid sheet.
 */
async function packFolder(frameDir: string, outSheet: string, frameW: number, frameH: number, columns = 8) {
  const frames = readdirSync(frameDir)
    .filter((f) => f.endsWith(".png"))
    .sort();
  if (!frames.length) return;

  const rows = Math.ceil(frames.length / columns);
  const width = columns * frameW;
  const height = rows * frameH;
  assertNotSourceWrite(outSheet);
  mkdirSync(path.dirname(outSheet), { recursive: true });

  const composites = [];
  for (let i = 0; i < frames.length; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const buf = await sharp(path.join(frameDir, frames[i]!))
      .resize(frameW, frameH, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    composites.push({ input: buf, left: col * frameW, top: row * frameH });
  }

  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png()
    .toFile(outSheet);

  console.log(`Packed ${frames.length} frames → ${outSheet}`);
}

function listAnimDirs(base: string): string[] {
  if (!existsSync(base)) return [];
  return readdirSync(base)
    .map((n) => path.join(base, n))
    .filter((p) => statSync(p).isDirectory());
}

async function main() {
  const battleRoot = path.join(PROCESSED_DIR, "battle-frames");
  for (const speciesDir of listAnimDirs(battleRoot)) {
    const slug = path.basename(speciesDir);
    for (const animDir of listAnimDirs(speciesDir)) {
      const anim = path.basename(animDir);
      const out = path.join(SHEETS_DIR, `creature-${slug}-battle-${anim}-sheet.png`);
      await packFolder(animDir, out, BATTLE.frameWidth, BATTLE.frameHeight);
    }
  }
  if (!existsSync(battleRoot)) {
    console.log("No processed/battle-frames yet — pack skipped.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
