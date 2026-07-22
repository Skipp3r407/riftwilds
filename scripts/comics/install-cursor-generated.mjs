/**
 * Install Cursor GenerateImage PNGs into issue raw-art + plate slots.
 *
 * Usage:
 *   node scripts/comics/install-cursor-generated.mjs the-first-rift 1 --pages=5-12
 *   node scripts/comics/install-cursor-generated.mjs the-first-rift 1 --pages=5,6,7
 *
 * Expects files named:
 *   ~/.cursor/projects/.../assets/issue00N-page-00M.png
 * or:
 *   artifacts/comics/generated/<slug>/page-00M.png
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const W = 1200;
const H = 1600;

const slug = process.argv[2];
const issueNum = Number(process.argv[3]);
const pagesArg = process.argv.find((a) => a.startsWith("--pages="));

if (!slug || !issueNum || !pagesArg) {
  console.error(
    "Usage: node scripts/comics/install-cursor-generated.mjs <slug> <issueNum> --pages=5-12",
  );
  process.exit(1);
}

function parsePages(spec) {
  const set = [];
  for (const part of spec.split("=")[1].split(",")) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      for (let i = a; i <= b; i++) set.push(i);
    } else set.push(Number(part));
  }
  return set;
}

const pages = parsePages(pagesArg);
const issuePad = String(issueNum).padStart(3, "0");
const issueDir = path.join(ROOT, "content/comics", slug, `issue-${issuePad}`);
const rawDir = path.join(issueDir, "generated/raw-art");
const stageDir = path.join(ROOT, "artifacts/comics/generated", slug);
const plateDir = path.join(ROOT, "public/assets/comics/pages", slug);
const cursorAssets = path.join(
  os.homedir(),
  ".cursor/projects/c-Users-Skipp3r407-Desktop-Websites-egg-meme-project/assets",
);

fs.mkdirSync(rawDir, { recursive: true });
fs.mkdirSync(stageDir, { recursive: true });
fs.mkdirSync(plateDir, { recursive: true });

function findSource(pageNum) {
  const id3 = String(pageNum).padStart(3, "0");
  const id2 = String(pageNum).padStart(2, "0");
  const candidates = [
    path.join(cursorAssets, `issue${issuePad}-page-${id3}.png`),
    path.join(cursorAssets, `issue${issuePad}-page-${id2}.png`),
    path.join(stageDir, `page-${id3}.png`),
    path.join(stageDir, `page-${id2}.png`),
    path.join(cursorAssets, `${slug}-page-${id3}.png`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

let ok = 0;
for (const n of pages) {
  const src = findSource(n);
  if (!src) {
    console.error(`missing source for page ${n}`);
    continue;
  }
  const id3 = String(n).padStart(3, "0");
  const id2 = String(n).padStart(2, "0");
  const stagePng = path.join(stageDir, `page-${id3}.png`);
  fs.copyFileSync(src, stagePng);
  await sharp(src)
    .rotate()
    .resize(W, H, { fit: "cover", position: "centre" })
    .webp({ quality: 90 })
    .toFile(path.join(rawDir, `page-${id3}.webp`));
  await sharp(src)
    .rotate()
    .resize(W, H, { fit: "cover", position: "centre" })
    .webp({ quality: 88 })
    .toFile(path.join(plateDir, `page-${id2}.webp`));
  console.log(`ok p${id3} ← ${path.basename(src)}`);
  ok += 1;
}
console.log(`installed ${ok}/${pages.length} for ${slug} issue-${issuePad}`);
