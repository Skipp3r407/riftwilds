/**
 * Key out near-solid dark (or light) backgrounds on title wordmarks → true RGBA.
 * Usage: node scripts/assets/mask-transparent.mjs [dir]
 * Default dir: public/assets/ui/titles
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const targetDir = path.resolve(
  root,
  process.argv[2] ?? "public/assets/ui/titles",
);

function sampleCorners(data, w, h) {
  const pts = [
    [2, 2],
    [w - 3, 2],
    [2, h - 3],
    [w - 3, h - 3],
    [Math.floor(w / 2), 2],
    [Math.floor(w / 2), h - 3],
  ];
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (const [x, y] of pts) {
    const i = (y * w + x) * 4;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n++;
  }
  return { r: r / n, g: g / n, b: b / n };
}

function dist(r, g, b, bg) {
  const dr = r - bg.r;
  const dg = g - bg.g;
  const db = b - bg.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function processFile(filePath) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const { width: w, height: h, data } = png;
  const bg = sampleCorners(data, w, h);
  const bgLum = 0.2126 * bg.r + 0.7152 * bg.g + 0.0722 * bg.b;

  // Dark UI plates vs accidental white plates
  const soft = bgLum < 80 ? 38 : 45;
  const hard = bgLum < 80 ? 22 : 28;

  let transparent = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) {
      transparent++;
      continue;
    }
    const d = dist(r, g, b, bg);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Keep bright / saturated letter pixels even if near bg hue
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    if (chroma > 40 || (bgLum < 80 && lum > 90)) {
      continue;
    }
    if (d <= hard) {
      data[i + 3] = 0;
      transparent++;
    } else if (d <= soft) {
      const t = (d - hard) / (soft - hard);
      data[i + 3] = Math.round(a * t);
      if (data[i + 3] < 8) {
        data[i + 3] = 0;
        transparent++;
      }
    }
  }

  const out = PNG.sync.write(png);
  fs.writeFileSync(filePath, out);
  const pct = ((transparent / (w * h)) * 100).toFixed(1);
  return { w, h, pct };
}

function main() {
  if (!fs.existsSync(targetDir)) {
    console.error("Missing dir:", targetDir);
    process.exit(1);
  }
  const files = fs
    .readdirSync(targetDir)
    .filter((f) => f.endsWith(".png"))
    .sort();
  console.log(`Masking ${files.length} PNGs in ${targetDir}`);
  for (const f of files) {
    const p = path.join(targetDir, f);
    try {
      const { w, h, pct } = processFile(p);
      console.log(`ok ${f} (${w}x${h}) transparent≈${pct}%`);
    } catch (e) {
      console.error(`FAIL ${f}:`, e.message ?? e);
    }
  }
}

main();
