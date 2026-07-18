/**
 * Flood-fill near-black AND near-white backgrounds on PNGs → true RGBA.
 * Safer than global chroma-key: only removes background connected to image borders,
 * so dark clothing / boots / white flower petals (not border-connected) stay opaque.
 *
 * Usage:
 *   node scripts/assets/mask-npc-black.mjs [dirOrFile...]
 *   node scripts/assets/mask-npc-black.mjs --all-png public/assets/game/props
 *
 * Default (no args): public/assets/npcs/riftwild-commons
 *
 * Without --all-png, directories collect sprite.png, full-body.png, portrait.png,
 * thumbnail.png, dialogue-portrait.png, overworld-sheet.png.
 * With --all-png (or when every path is a .png file), every .png is processed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const TARGET_NAMES = new Set([
  "sprite.png",
  "full-body.png",
  "portrait.png",
  "thumbnail.png",
  "dialogue-portrait.png",
  "overworld-sheet.png",
]);

const HARD_LUM = 28;
const SOFT_LUM = 52;
const MAX_CHROMA = 28;

/** Near-white studio / plate mattes (props often sit on ~228–255 gray). */
const WHITE_HARD_LUM = 222;
const WHITE_SOFT_LUM = 198;
const WHITE_MAX_CHROMA = 28;

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function chroma(r, g, b) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function isNearBlack(r, g, b) {
  const L = lum(r, g, b);
  const C = chroma(r, g, b);
  return L <= SOFT_LUM && C <= MAX_CHROMA;
}

function isNearWhite(r, g, b) {
  const L = lum(r, g, b);
  const C = chroma(r, g, b);
  return L >= WHITE_SOFT_LUM && C <= WHITE_MAX_CHROMA;
}

function isBgCandidate(r, g, b, a) {
  if (a < 8) return true;
  if (isNearBlack(r, g, b)) return true;
  if (isNearWhite(r, g, b)) return true;
  return false;
}

function processFile(filePath) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const { width: w, height: h, data } = png;
  const n = w * h;
  const mark = new Uint8Array(n); // 1 = flood bg

  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (mark[idx]) return;
    const i = idx * 4;
    if (!isBgCandidate(data[i], data[i + 1], data[i + 2], data[i + 3])) return;
    mark[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % w;
    const y = (idx / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  let transparent = 0;
  for (let idx = 0; idx < n; idx++) {
    const i = idx * 4;
    if (!mark[idx]) {
      if (data[i + 3] === 0) transparent++;
      continue;
    }
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    const L = lum(r, g, b);
    const C = chroma(r, g, b);
    if (
      a < 8 ||
      (L <= HARD_LUM && C <= MAX_CHROMA) ||
      (L >= WHITE_HARD_LUM && C <= WHITE_MAX_CHROMA)
    ) {
      data[i + 3] = 0;
      transparent++;
      continue;
    }
    // Soft edge feather for anti-aliased black/white fringe
    let t = 1;
    if (L <= SOFT_LUM && C <= MAX_CHROMA) {
      t = (L - HARD_LUM) / (SOFT_LUM - HARD_LUM);
    } else if (L >= WHITE_SOFT_LUM && C <= WHITE_MAX_CHROMA) {
      t = (WHITE_HARD_LUM + 8 - L) / (WHITE_HARD_LUM + 8 - WHITE_SOFT_LUM);
    }
    const alpha = Math.round(a * Math.max(0, Math.min(1, t)));
    data[i + 3] = alpha < 10 ? 0 : alpha;
    if (data[i + 3] === 0) transparent++;
  }

  // Second pass: kill near-black / near-white fringe pixels that still touch transparency
  const nextA = new Uint8Array(n);
  for (let idx = 0; idx < n; idx++) nextA[idx] = data[idx * 4 + 3];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const i = idx * 4;
      const a = data[i + 3];
      if (a < 16) continue;
      const L = lum(data[i], data[i + 1], data[i + 2]);
      const C = chroma(data[i], data[i + 1], data[i + 2]);
      const fringeBlack = L <= 40 && C <= 22;
      const fringeWhite = L >= 205 && C <= 24;
      if (!(fringeBlack || fringeWhite)) continue;
      let touchT = false;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        if (data[((y + dy) * w + (x + dx)) * 4 + 3] < 16) {
          touchT = true;
          break;
        }
      }
      if (touchT) {
        nextA[idx] = 0;
        transparent++;
      }
    }
  }
  for (let idx = 0; idx < n; idx++) data[idx * 4 + 3] = nextA[idx];

  // Third pass: drop tiny near-white speckles (islands) that only touch transparency.
  // Keeps large light subjects (banners, daisy petals) intact.
  const visited = new Uint8Array(n);
  const MAX_ISLAND = 48;
  for (let start = 0; start < n; start++) {
    if (visited[start] || data[start * 4 + 3] < 16) continue;
    const i0 = start * 4;
    if (!isNearWhite(data[i0], data[i0 + 1], data[i0 + 2])) continue;
    const stack = [start];
    const comp = [];
    visited[start] = 1;
    let touchesSubject = false;
    while (stack.length) {
      const idx = stack.pop();
      comp.push(idx);
      const x = idx % w;
      const y = (idx / w) | 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const nidx = yy * w + xx;
        const ni = nidx * 4;
        const na = data[ni + 3];
        if (na < 16) continue;
        if (isNearWhite(data[ni], data[ni + 1], data[ni + 2])) {
          if (!visited[nidx]) {
            visited[nidx] = 1;
            stack.push(nidx);
          }
        } else {
          touchesSubject = true;
        }
      }
    }
    if (!touchesSubject && comp.length > 0 && comp.length <= MAX_ISLAND) {
      for (const idx of comp) {
        data[idx * 4 + 3] = 0;
        transparent++;
      }
    }
  }

  fs.writeFileSync(filePath, PNG.sync.write(png));
  const pct = ((transparent / n) * 100).toFixed(1);
  return { w, h, pct };
}

function collectFiles(input, allPng) {
  const abs = path.resolve(root, input);
  if (!fs.existsSync(abs)) return [];
  const st = fs.statSync(abs);
  if (st.isFile() && abs.endsWith(".png")) return [abs];
  if (!st.isDirectory()) return [];
  const out = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const s = fs.statSync(p);
      if (s.isDirectory()) walk(p);
      else if (name.endsWith(".png") && (allPng || TARGET_NAMES.has(name))) {
        out.push(p);
      }
    }
  };
  walk(abs);
  return out.sort();
}

function main() {
  const raw = process.argv.slice(2);
  const allPng = raw.includes("--all-png");
  const inputs = raw.filter((a) => a !== "--all-png");
  const roots = inputs.length
    ? inputs
    : ["public/assets/npcs/riftwild-commons"];
  const files = roots.flatMap((r) => collectFiles(r, allPng));
  if (!files.length) {
    console.error("No PNG targets found in", roots.join(", "));
    process.exit(1);
  }
  console.log(`Masking ${files.length} PNGs (white+black flood-fill)…`);
  let ok = 0;
  for (const f of files) {
    try {
      const { w, h, pct } = processFile(f);
      console.log(`ok ${path.relative(root, f)} (${w}x${h}) transparent≈${pct}%`);
      ok++;
    } catch (e) {
      console.error(`FAIL ${f}:`, e.message ?? e);
    }
  }
  console.log(`Done ${ok}/${files.length}`);
}

main();
