/**
 * Detect white mats / baked checkerboard transparency in PNG UI thumbs.
 * Usage: node scripts/assets/detect-mattes.mjs [dir...]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

function analyze(filePath) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const { width: w, height: h, data } = png;
  let opaque = 0;
  let transparent = 0;
  let nearWhite = 0;
  let checkerPairs = 0;
  let checkerSamples = 0;

  const corners = [
    [2, 2],
    [w - 3, 2],
    [2, h - 3],
    [w - 3, h - 3],
  ];
  const cornerColors = corners.map(([x, y]) => {
    const i = (y * w + x) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
  });

  const step = Math.max(4, Math.floor(Math.min(w, h) / 32));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 16) {
        transparent++;
        continue;
      }
      opaque++;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      if (lum > 230 && chroma < 25) nearWhite++;

      const x2 = Math.min(w - 1, x + step);
      const y2 = Math.min(h - 1, y + step);
      for (const j of [(y * w + x2) * 4, (y2 * w + x) * 4]) {
        const r2 = data[j];
        const g2 = data[j + 1];
        const b2 = data[j + 2];
        const a2 = data[j + 3];
        if (a2 < 16) continue;
        const lum2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
        const c2 = Math.max(r2, g2, b2) - Math.min(r2, g2, b2);
        checkerSamples++;
        if (
          chroma < 20 &&
          c2 < 20 &&
          Math.abs(lum - lum2) > 40 &&
          Math.min(lum, lum2) > 100 &&
          Math.max(lum, lum2) > 180
        ) {
          checkerPairs++;
        }
      }
    }
  }

  const samples = opaque + transparent;
  const whitePct = opaque ? (nearWhite / opaque) * 100 : 0;
  const checkerPct = checkerSamples ? (checkerPairs / checkerSamples) * 100 : 0;
  const cornerWhite = cornerColors.every(
    (c) =>
      c.a > 200 &&
      0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b > 220,
  );
  const cornerOpaque = cornerColors.every((c) => c.a > 200);
  const cornerLum =
    cornerColors.reduce(
      (s, c) => s + (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b),
      0,
    ) / 4;
  const transparentPct = samples ? (transparent / samples) * 100 : 0;

  const flags = [];
  if (cornerWhite) flags.push("CORNER_WHITE");
  if (whitePct > 15) flags.push("HIGH_WHITE");
  if (checkerPct > 8) flags.push("CHECKER");
  if (cornerOpaque && transparentPct < 2) flags.push("NO_ALPHA");

  return {
    w,
    h,
    transparentPct: transparentPct.toFixed(1),
    whitePct: whitePct.toFixed(1),
    checkerPct: checkerPct.toFixed(1),
    cornerLum: cornerLum.toFixed(0),
    flags,
  };
}

function walkPngs(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkPngs(p));
    else if (ent.name.endsWith(".png")) out.push(p);
  }
  return out;
}

const args = process.argv.slice(2);
const dirs =
  args.length > 0
    ? args.map((d) => path.resolve(root, d))
    : [
        "public/assets/ui/guilds",
        "public/assets/ui/arena",
        "public/assets/ui/shop",
        "public/assets/ui/homestead",
        "public/assets/ui/features",
        "public/assets/ui/economy",
        "public/assets/ui/titles",
        "public/assets/brand",
      ].map((d) => path.resolve(root, d));

const flagged = [];
for (const dir of dirs) {
  console.log("\n==", path.relative(root, dir), "==");
  const files = walkPngs(dir).sort();
  for (const f of files) {
    const r = analyze(f);
    const rel = path.relative(root, f);
    const mark = r.flags.length ? " ***" : "";
    console.log(
      path.basename(f),
      `t=${r.transparentPct}% w=${r.whitePct}% chk=${r.checkerPct}% cornerLum=${r.cornerLum}`,
      r.flags.join(",") || "ok",
      mark,
    );
    if (r.flags.includes("CHECKER") || r.flags.includes("CORNER_WHITE") || r.flags.includes("HIGH_WHITE")) {
      flagged.push(rel);
    }
  }
}

console.log("\nFLAGGED:", flagged.length);
for (const f of flagged) console.log(" -", f);
