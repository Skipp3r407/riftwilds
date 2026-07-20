/**
 * Install a generated PNG/WebP/JPG into the comic page plate slot.
 *
 * Usage:
 *   node scripts/comics/install-illustrated-page.mjs <slug> <pageNumber> <sourceImage>
 *   node scripts/comics/install-illustrated-page.mjs the-first-rift 9 ./tmp/page.png
 *   node scripts/comics/install-illustrated-page.mjs the-first-rift --from-dir ./generated/the-first-rift
 *
 * --from-dir expects files named page-01.png / page-01.webp / 01.png etc.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const W = 1200;
const H = 1600;

function platePath(slug, pageNumber) {
  return path.join(
    ROOT,
    "public/assets/comics/pages",
    slug,
    `page-${String(pageNumber).padStart(2, "0")}.webp`,
  );
}

async function installOne(slug, pageNumber, source) {
  const absSource = path.resolve(source);
  if (!fs.existsSync(absSource)) {
    throw new Error(`Missing source: ${absSource}`);
  }
  const dest = platePath(slug, pageNumber);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(absSource)
    .rotate()
    .resize(W, H, { fit: "cover", position: "centre" })
    .webp({ quality: 88 })
    .toFile(dest);
  const st = fs.statSync(dest);
  console.log(`ok ${slug} p${String(pageNumber).padStart(2, "0")} → ${dest} (${st.size} bytes)`);
  return dest;
}

function resolvePageFile(dir, pageNumber) {
  const n = String(pageNumber).padStart(2, "0");
  const candidates = [
    `page-${n}.png`,
    `page-${n}.webp`,
    `page-${n}.jpg`,
    `page-${n}.jpeg`,
    `${n}.png`,
    `${n}.webp`,
    `p${n}.png`,
  ];
  for (const name of candidates) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      "Usage: node scripts/comics/install-illustrated-page.mjs <slug> <pageNumber> <source>\n" +
        "   or: node scripts/comics/install-illustrated-page.mjs <slug> --from-dir <dir>",
    );
    process.exit(1);
  }
  const slug = args[0];
  if (args[1] === "--from-dir") {
    const dir = path.resolve(args[2]);
    let n = 0;
    for (let i = 1; i <= 40; i++) {
      const src = resolvePageFile(dir, i);
      if (!src) continue;
      await installOne(slug, i, src);
      n += 1;
    }
    console.log(`done — installed ${n} pages for ${slug}`);
    return;
  }
  const pageNumber = Number(args[1]);
  const source = args[2];
  if (!pageNumber || !source) {
    console.error("Need pageNumber and source path");
    process.exit(1);
  }
  await installOne(slug, pageNumber, source);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
