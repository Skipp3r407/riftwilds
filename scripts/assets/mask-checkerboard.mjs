/**
 * Remove baked checkerboard / light matte backgrounds → true RGBA.
 * Usage: node scripts/assets/mask-checkerboard.mjs <file-or-dir> [...]
 *
 * 1) Learn light + dark checker cell colors from border (or classic white/gray pair).
 * 2) Flood-fill from borders through matching pixels.
 * 3) Global color-key remaining enclosed checker cells (low-chroma light grays).
 * 4) Soft-edge feather on near-bg fringe.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

function lum(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function chroma(r, g, b) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function dist3(r, g, b, c) {
  const dr = r - c.r;
  const dg = g - c.g;
  const db = b - c.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function sampleBorder(data, w, h) {
  const samples = [];
  const push = (x, y) => {
    const i = (y * w + x) * 4;
    if (data[i + 3] < 8) return; // already transparent — skip
    samples.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
      a: data[i + 3],
      L: lum(data[i], data[i + 1], data[i + 2]),
      C: chroma(data[i], data[i + 1], data[i + 2]),
    });
  };
  for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 64))) {
    push(x, 1);
    push(x, h - 2);
  }
  for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 64))) {
    push(1, y);
    push(w - 2, y);
  }
  return samples.filter((s) => s.a > 200 && s.C < 40 && s.L > 90);
}

/** Also hunt interior for classic checker pair when borders are already cleared. */
function sampleInteriorChecker(data, w, h) {
  const samples = [];
  const step = Math.max(4, Math.floor(Math.min(w, h) / 48));
  for (let y = step; y < h - step; y += step) {
    for (let x = step; x < w - step; x += step) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 200) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const L = lum(r, g, b);
      const C = chroma(r, g, b);
      if (C > 22 || L < 150) continue;
      // look for alternating neighbor
      const i2 = (y * w + Math.min(w - 1, x + step)) * 4;
      if (data[i2 + 3] < 200) continue;
      const L2 = lum(data[i2], data[i2 + 1], data[i2 + 2]);
      const C2 = chroma(data[i2], data[i2 + 1], data[i2 + 2]);
      if (C2 > 22) continue;
      if (Math.abs(L - L2) > 35 && Math.min(L, L2) > 140) {
        samples.push({ r, g, b, a: data[i + 3], L, C });
        samples.push({
          r: data[i2],
          g: data[i2 + 1],
          b: data[i2 + 2],
          a: data[i2 + 3],
          L: L2,
          C: C2,
        });
      }
    }
  }
  return samples;
}

function clusterTwo(samples) {
  if (samples.length < 6) {
    // fallback classic Photoshop checker
    return {
      mode: "checker",
      colors: [
        { r: 255, g: 255, b: 255, L: 255 },
        { r: 204, g: 204, b: 204, L: 204 },
      ],
    };
  }
  let c1 = samples.reduce((a, s) => (s.L > a.L ? s : a), samples[0]);
  let c2 = samples.reduce((a, s) => (s.L < a.L ? s : a), samples[0]);
  if (Math.abs(c1.L - c2.L) < 20) {
    const avg = samples.reduce(
      (a, s) => ({ r: a.r + s.r, g: a.g + s.g, b: a.b + s.b, n: a.n + 1 }),
      { r: 0, g: 0, b: 0, n: 0 },
    );
    return {
      mode: "matte",
      colors: [
        {
          r: avg.r / avg.n,
          g: avg.g / avg.n,
          b: avg.b / avg.n,
          L: lum(avg.r / avg.n, avg.g / avg.n, avg.b / avg.n),
        },
      ],
    };
  }
  for (let iter = 0; iter < 10; iter++) {
    const g1 = [];
    const g2 = [];
    for (const s of samples) {
      if (Math.abs(s.L - c1.L) <= Math.abs(s.L - c2.L)) g1.push(s);
      else g2.push(s);
    }
    if (!g1.length || !g2.length) break;
    const mean = (g) => ({
      r: g.reduce((a, s) => a + s.r, 0) / g.length,
      g: g.reduce((a, s) => a + s.g, 0) / g.length,
      b: g.reduce((a, s) => a + s.b, 0) / g.length,
      L: g.reduce((a, s) => a + s.L, 0) / g.length,
    });
    c1 = mean(g1);
    c2 = mean(g2);
  }
  return { mode: "checker", colors: [c1, c2] };
}

function matchBg(r, g, b, a, model, hard) {
  if (a < 8) return true;
  const C = chroma(r, g, b);
  if (C > 38) return false;
  const L = lum(r, g, b);
  if (L < 130) return false;
  for (const c of model.colors) {
    if (dist3(r, g, b, c) <= hard) return true;
  }
  // near-white always bg for these UI thumbs
  if (L > 238 && C < 18) return true;
  // mid light-gray typical of checker dark cell
  if (L > 170 && L < 230 && C < 16) {
    // only if close to a learned color OR classic gray band
    for (const c of model.colors) {
      if (dist3(r, g, b, c) <= hard + 12) return true;
    }
    if (model.mode === "checker") return true;
  }
  return false;
}

function processFile(filePath) {
  const buf = fs.readFileSync(filePath);
  const png = PNG.sync.read(buf);
  const { width: w, height: h, data } = png;

  let samples = sampleBorder(data, w, h);
  if (samples.length < 8) {
    samples = [...samples, ...sampleInteriorChecker(data, w, h)];
  }
  const model = clusterTwo(samples);
  const hard = model.mode === "checker" ? 48 : 40;
  const soft = hard + 18;

  const mark = new Uint8Array(w * h);
  const stack = [];
  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (mark[idx]) return;
    const i = idx * 4;
    if (!matchBg(data[i], data[i + 1], data[i + 2], data[i + 3], model, hard)) {
      return;
    }
    mark[idx] = 1;
    stack.push(idx);
  };

  for (let x = 0; x < w; x++) {
    tryPush(x, 0);
    tryPush(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryPush(0, y);
    tryPush(w - 1, y);
  }
  while (stack.length) {
    const idx = stack.pop();
    const x = idx % w;
    const y = (idx / w) | 0;
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }

  // Global color-key: enclosed checker cells (not reachable from border)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (mark[idx]) continue;
      const i = idx * 4;
      if (matchBg(data[i], data[i + 1], data[i + 2], data[i + 3], model, hard)) {
        mark[idx] = 1;
      }
    }
  }

  let cleared = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const i = idx * 4;
      if (mark[idx]) {
        data[i + 3] = 0;
        cleared++;
        continue;
      }
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a === 0) continue;
      if (chroma(r, g, b) > 45) continue;
      let minD = Infinity;
      for (const c of model.colors) {
        minD = Math.min(minD, dist3(r, g, b, c));
      }
      if (minD <= soft && lum(r, g, b) > 150) {
        // feather only if near cleared neighbor
        let bgN = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            if (mark[ny * w + nx] || data[(ny * w + nx) * 4 + 3] < 16) bgN++;
          }
        }
        if (bgN >= 3) {
          const t = (minD - hard) / (soft - hard);
          data[i + 3] = Math.round(a * Math.max(0, Math.min(1, t)));
          if (data[i + 3] < 12) {
            data[i + 3] = 0;
            cleared++;
          }
        }
      }
    }
  }

  fs.writeFileSync(filePath, PNG.sync.write(png));
  const pct = ((cleared / (w * h)) * 100).toFixed(1);
  return {
    mode: model.mode,
    w,
    h,
    pct,
    colors: model.colors.map(
      (c) => `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`,
    ),
  };
}

function collectPngs(target) {
  const p = path.resolve(root, target);
  if (!fs.existsSync(p)) return [];
  const st = fs.statSync(p);
  if (st.isFile() && p.endsWith(".png")) return [p];
  if (!st.isDirectory()) return [];
  return fs
    .readdirSync(p)
    .filter((f) => f.endsWith(".png"))
    .map((f) => path.join(p, f));
}

const targets = process.argv.slice(2);
if (!targets.length) {
  console.error(
    "Usage: node scripts/assets/mask-checkerboard.mjs <file-or-dir> [...]",
  );
  process.exit(1);
}

const files = targets.flatMap(collectPngs);
console.log(`Masking checkerboard/matte on ${files.length} PNG(s)`);
for (const f of files) {
  try {
    const r = processFile(f);
    console.log(
      "ok",
      path.relative(root, f),
      `(${r.w}x${r.h}) mode=${r.mode} cleared≈${r.pct}%`,
      r.colors.join(" / "),
    );
  } catch (e) {
    console.error("FAIL", path.relative(root, f), e.message ?? e);
  }
}
