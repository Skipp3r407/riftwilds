import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import path from "path";
import sharp from "sharp";
import { PROCESSED_DIR, assertNotSourceWrite } from "./lib";

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

async function main() {
  const files = walk(PROCESSED_DIR);
  if (!files.length) {
    console.log("No processed PNGs for thumbnails.");
    return;
  }
  for (const file of files) {
    const dir = path.dirname(file);
    const base = path.basename(file, ".png");
    const thumbPng = path.join(dir, "thumbs", `${base}-thumb.png`);
    const thumbWebp = path.join(dir, "thumbs", `${base}-thumb.webp`);
    assertNotSourceWrite(thumbPng);
    mkdirSync(path.dirname(thumbPng), { recursive: true });
    await sharp(file).resize(256, 256, { fit: "inside" }).png().toFile(thumbPng);
    await sharp(file).resize(256, 256, { fit: "inside" }).webp({ quality: 82 }).toFile(thumbWebp);
    console.log("Thumbnails", base);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
