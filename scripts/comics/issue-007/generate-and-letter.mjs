/**
 * Stage 1 + 2 for The Traitor's Gate Issue #7:
 *   - Generate text-free art (Grok if XAI_API_KEY, else procedural plate)
 *   - Programmatic lettering with private comic font
 *   - Flatten to public reader path + content generated/
 *
 *   node scripts/comics/issue-007/generate-and-letter.mjs
 *   node scripts/comics/issue-007/generate-and-letter.mjs --pages=1-5
 *   node scripts/comics/issue-007/generate-and-letter.mjs --letter-only
 *   node scripts/comics/issue-007/generate-and-letter.mjs --force
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
try {
  require("dotenv").config();
} catch {
  /* optional */
}

const ROOT = path.resolve(import.meta.dirname, "../../..");
const ISSUE = path.join(ROOT, "content/comics/the-traitors-gate/issue-007");
const PUBLIC_PAGES = path.join(ROOT, "public/assets/comics/the-traitors-gate/issue-007/pages");
const PUBLIC_COVERS = path.join(ROOT, "public/assets/comics/covers");
const RAW = path.join(ISSUE, "generated/raw-art");
const LETTERED = path.join(ISSUE, "generated/lettered-pages");
const THUMBS = path.join(ISSUE, "generated/thumbnails");
const FONT_DIR = path.join(ROOT, "assets/fonts/comics");
const FONT_FILE = path.join(FONT_DIR, "ComicNeue-Bold.ttf");
const STATUS_FILE = path.join(ISSUE, "reports/GENERATION_STATUS.json");

const W = 1200;
const H = 1600;
const force = process.argv.includes("--force");
const letterOnly = process.argv.includes("--letter-only");
const pagesArg = process.argv.find((a) => a.startsWith("--pages="));

function parsePages(arg) {
  if (!arg) return null;
  const spec = arg.split("=")[1];
  const set = new Set();
  for (const part of spec.split(",")) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      for (let i = a; i <= b; i++) set.add(i);
    } else set.add(Number(part));
  }
  return set;
}
const pageFilter = parsePages(pagesArg);

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapWords(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function fontFaceCss() {
  if (!fs.existsSync(FONT_FILE)) return "";
  const b64 = fs.readFileSync(FONT_FILE).toString("base64");
  return `@font-face { font-family: 'RiftComic'; src: url('data:font/ttf;base64,${b64}') format('truetype'); }`;
}

const FONT = fs.existsSync(FONT_FILE) ? "RiftComic, Georgia, serif" : "Georgia, 'Times New Roman', serif";

function atmosColors(atmosphere) {
  const map = {
    dawn: { a: "#2a3a28", b: "#c4a882", c: "#3de7ff", d: "#ffb84d" },
    day: { a: "#2f5a3a", b: "#5aad62", c: "#3de7ff", d: "#ffe566" },
    dusk: { a: "#3a2820", b: "#8b5a3c", c: "#ffb84d", d: "#3de7ff" },
    night: { a: "#0a1830", b: "#1a2840", c: "#3de7ff", d: "#ffc070" },
    rift: { a: "#121a28", b: "#2a2118", c: "#66e0ff", d: "#ffb84d" },
    storm: { a: "#1a2438", b: "#3d4a60", c: "#b8d4ff", d: "#ffb84d" },
    ruin: { a: "#2a2118", b: "#5c3d2e", c: "#c4a882", d: "#3de7ff" },
    festival: { a: "#1a2030", b: "#3a2820", c: "#ffb84d", d: "#3de7ff" },
  };
  return map[atmosphere] || map.dusk;
}

function proceduralPlate(page) {
  const c = atmosColors(page.atmosphere);
  const panels = page.panels || [];
  const n = Math.max(1, panels.length);
  let panelRects = "";
  if (n === 1) {
    panelRects = `<rect x="36" y="36" width="${W - 72}" height="${H - 72}" rx="8" fill="${c.b}" opacity="0.35" stroke="${c.c}" stroke-width="4"/>`;
  } else if (n === 2) {
    panelRects = `
      <rect x="36" y="36" width="${W / 2 - 48}" height="${H - 72}" rx="6" fill="${c.b}" opacity="0.35" stroke="#1a1510" stroke-width="5"/>
      <rect x="${W / 2 + 12}" y="36" width="${W / 2 - 48}" height="${H - 72}" rx="6" fill="${c.a}" opacity="0.45" stroke="#1a1510" stroke-width="5"/>`;
  } else if (n === 3) {
    const ph = (H - 96) / 3;
    panelRects = [0, 1, 2]
      .map(
        (i) =>
          `<rect x="36" y="${36 + i * (ph + 12)}" width="${W - 72}" height="${ph}" rx="6" fill="${i % 2 ? c.b : c.a}" opacity="0.4" stroke="#1a1510" stroke-width="5"/>`,
      )
      .join("");
  } else {
    const cols = 2;
    const rows = Math.ceil(n / cols);
    const pw = (W - 84) / cols;
    const ph = (H - 84) / rows;
    panelRects = panels
      .map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return `<rect x="${36 + col * (pw + 12)}" y="${36 + row * (ph + 12)}" width="${pw}" height="${ph}" rx="6" fill="${c.b}" opacity="0.38" stroke="#1a1510" stroke-width="4"/>`;
      })
      .join("");
  }

  // Silhouette figures + egg/rift motifs (no text)
  const motifs = `
    <ellipse cx="${W * 0.5}" cy="${H * 0.42}" rx="120" ry="220" fill="${c.c}" opacity="0.22"/>
    <ellipse cx="${W * 0.5}" cy="${H * 0.42}" rx="40" ry="180" fill="${c.c}" opacity="0.45"/>
    <ellipse cx="${W * 0.38}" cy="${H * 0.72}" rx="28" ry="55" fill="#e8d5b0" opacity="0.85"/>
    <ellipse cx="${W * 0.52}" cy="${H * 0.78}" rx="40" ry="22" fill="#5aad62" opacity="0.8"/>
    <ellipse cx="${W * 0.62}" cy="${H * 0.76}" rx="26" ry="18" fill="#7ac98c" opacity="0.75"/>
    <ellipse cx="${W * 0.45}" cy="${H * 0.68}" rx="14" ry="18" fill="#f5ead2" opacity="0.9"/>
    <circle cx="${W * 0.7}" cy="${H * 0.28}" r="18" fill="${c.d}" opacity="0.55"/>
  `;

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c.a}"/>
      <stop offset="100%" stop-color="${c.b}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${panelRects}
  ${motifs}
  <!-- balloon-safe empty corners -->
  <rect x="40" y="48" width="420" height="100" rx="8" fill="rgba(20,14,10,0.12)"/>
  <rect x="${W - 460}" y="${H - 160}" width="420" height="90" rx="8" fill="rgba(20,14,10,0.1)"/>
</svg>`);
}

async function callGrok(prompt, negativePrompt) {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  const model = process.env.XAI_IMAGE_MODEL || "grok-imagine-image";
  const full = `${prompt} Avoid: ${negativePrompt || "readable text, logos, watermarks"}`;
  const res = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: full,
      n: 1,
      aspect_ratio: "3:4",
      response_format: "b64_json",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Grok ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No b64_json");
  return Buffer.from(b64, "base64");
}

function balloonPath(kind, x, y, bw, bh, tail) {
  const left = x - bw / 2;
  const top = y - bh / 2;
  const r = kind === "thought" || kind === "telepathy" ? Math.min(28, bh / 2) : 18;
  let tailSvg = "";
  const cx = x;
  const midY = y;
  if (!["narration", "caption", "sfx", "magic"].includes(kind)) {
    const tw = 16;
    const th = 18;
    if (tail?.startsWith("up")) {
      tailSvg = `<polygon points="${cx - tw},${top + 4} ${cx + tw},${top + 4} ${cx},${top - th}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    } else if (tail === "left") {
      tailSvg = `<polygon points="${left + 4},${midY - tw} ${left + 4},${midY + tw} ${left - th},${midY}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    } else if (tail === "right") {
      tailSvg = `<polygon points="${left + bw - 4},${midY - tw} ${left + bw - 4},${midY + tw} ${left + bw + th},${midY}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    } else {
      tailSvg = `<polygon points="${cx - tw},${top + bh - 4} ${cx + tw},${top + bh - 4} ${cx},${top + bh + th}" fill="rgba(255,252,245,0.96)" stroke="rgba(42,33,24,0.45)" stroke-width="2"/>`;
    }
  }
  return { left, top, r, tailSvg };
}

function renderBubbleSvg(b) {
  const kind = b.kind;
  const maxW = Math.round((W * (b.maxWidthPct || 34)) / 100);
  const cx = Math.round(((b.x ?? 50) / 100) * W);
  const cy = Math.round(((b.y ?? 50) / 100) * H);

  if (kind === "sfx") {
    const lines = wrapWords(String(b.text).toUpperCase(), 18);
    const fontSize = 40;
    const lineH = 46;
    const blockH = lines.length * lineH;
    const startY = cy - blockH / 2 + fontSize;
    const tspans = lines
      .map((line, i) => `<tspan x="${cx}" y="${startY + i * lineH}" text-anchor="middle">${escapeXml(line)}</tspan>`)
      .join("");
    return `<text font-family="${FONT}" font-size="${fontSize}" font-weight="700" fill="#ffb84d" stroke="rgba(20,14,10,0.75)" stroke-width="3" paint-order="stroke" letter-spacing="0.1em">${tspans}</text>`;
  }

  if (kind === "narration" || kind === "caption") {
    const lines = wrapWords(b.text, kind === "caption" ? 36 : 42);
    const fontSize = kind === "caption" ? 22 : 23;
    const lineH = fontSize + 8;
    const padX = 20;
    const padY = 14;
    const bw = Math.min(maxW, 640);
    const bh = padY * 2 + lines.length * lineH;
    const left = Math.max(24, Math.min(W - bw - 24, cx - bw / 2));
    const top = Math.max(24, Math.min(H - bh - 48, cy - bh / 2));
    const tspans = lines
      .map((line, i) => `<tspan x="${left + padX}" y="${top + padY + fontSize + i * lineH}">${escapeXml(line)}</tspan>`)
      .join("");
    return `
      <rect x="${left}" y="${top}" width="${bw}" height="${bh}" rx="4" ry="4"
            fill="rgba(20,14,10,0.88)" stroke="rgba(232,213,176,0.5)" stroke-width="2"/>
      <text font-family="${FONT}" font-size="${fontSize}" fill="#f5ead2"
            font-style="${kind === "narration" ? "italic" : "normal"}" font-weight="${kind === "caption" ? "700" : "400"}">${tspans}</text>`;
  }

  const speaker = b.speaker ? String(b.speaker).toUpperCase() : "";
  const bodyLines = wrapWords(b.text, 26);
  const fontSize = kind === "shout" ? 23 : 21;
  const lineH = fontSize + 7;
  const padX = 18;
  const padY = 12;
  const speakerH = speaker ? 16 : 0;
  const bw = Math.min(maxW, 400);
  const bh = padY * 2 + speakerH + bodyLines.length * lineH;
  const { left, top, r, tailSvg } = balloonPath(kind, cx, cy, bw, bh, b.tail);
  const fill =
    kind === "shout"
      ? "rgba(255,236,200,0.96)"
      : kind === "creature"
        ? "rgba(236,252,240,0.95)"
        : kind === "magic"
          ? "rgba(18,40,28,0.9)"
          : kind === "telepathy"
            ? "rgba(230,240,255,0.95)"
            : "rgba(255,252,245,0.96)";
  const stroke =
    kind === "thought" || kind === "telepathy" || kind === "whisper"
      ? "rgba(42,33,24,0.4)"
      : "rgba(42,33,24,0.5)";
  const dash =
    kind === "thought" || kind === "telepathy"
      ? `stroke-dasharray="6 4"`
      : kind === "creature"
        ? `stroke-dasharray="3 3"`
        : "";
  const textFill = kind === "magic" ? "#d8ffe8" : "#2a2118";
  let yCursor = top + padY + (speaker ? 13 : fontSize);
  const parts = [];
  if (speaker) {
    parts.push(
      `<text x="${left + padX}" y="${yCursor}" font-family="${FONT}" font-size="12" fill="#8b5a3c" letter-spacing="0.1em">${escapeXml(speaker)}</text>`,
    );
    yCursor += 16;
  }
  bodyLines.forEach((line, i) => {
    parts.push(
      `<text x="${left + padX}" y="${yCursor + i * lineH}" font-family="${FONT}" font-size="${fontSize}" fill="${textFill}" font-weight="${kind === "shout" ? "700" : "400"}" font-style="${kind === "whisper" ? "italic" : "normal"}">${escapeXml(line)}</text>`,
    );
  });
  return `${tailSvg}<rect x="${left}" y="${top}" width="${bw}" height="${bh}" rx="${r}" ry="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" ${dash}/>${parts.join("")}`;
}

function collectBubbles(page) {
  const bubbles = [];
  for (const p of page.panels || []) {
    for (const b of p.bubbles || []) bubbles.push(b);
  }
  return bubbles.sort((a, b) => (a.readOrder ?? 0) - (b.readOrder ?? 0));
}

function renderOverlay(page) {
  const parts = [`<style>${fontFaceCss()}</style>`];
  // page number
  parts.push(
    `<text x="${W - 48}" y="${H - 28}" font-family="${FONT}" font-size="16" fill="rgba(245,234,210,0.75)" text-anchor="end">${page.pageNumber}</text>`,
  );
  for (const b of collectBubbles(page)) {
    if (!b.text?.trim()) continue;
    parts.push(renderBubbleSvg(b));
  }
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${parts.join("\n")}
</svg>`);
}

async function ensureFont() {
  if (fs.existsSync(FONT_FILE)) return true;
  fs.mkdirSync(FONT_DIR, { recursive: true });
  // Comic Neue Bold — SIL OFL (not served from /public)
  const url =
    "https://github.com/google/fonts/raw/main/ofl/comicneue/ComicNeue-Bold.ttf";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(FONT_FILE, buf);
    console.log("Downloaded Comic Neue Bold → assets/fonts/comics/ (private)");
    return true;
  } catch (e) {
    console.warn("Font download failed — falling back to Georgia:", e.message);
    return false;
  }
}

function loadPages() {
  const dir = path.join(ISSUE, "pages");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

async function main() {
  await ensureFont();
  fs.mkdirSync(RAW, { recursive: true });
  fs.mkdirSync(LETTERED, { recursive: true });
  fs.mkdirSync(THUMBS, { recursive: true });
  fs.mkdirSync(PUBLIC_PAGES, { recursive: true });

  const pages = loadPages();
  const status = {
    updatedAt: new Date().toISOString(),
    grokConfigured: Boolean(process.env.XAI_API_KEY),
    font: fs.existsSync(FONT_FILE) ? "ComicNeue-Bold" : "Georgia-fallback",
    pages: {},
  };

  let artOk = 0;
  let letterOk = 0;
  let grokOk = 0;
  let proceduralOk = 0;
  let errors = 0;

  for (const page of pages) {
    if (pageFilter && !pageFilter.has(page.pageNumber)) continue;
    const id = String(page.pageNumber).padStart(3, "0");
    const rawPath = path.join(RAW, `page-${id}.webp`);
    const letteredPath = path.join(LETTERED, `page-${id}.webp`);
    const publicPath = path.join(PUBLIC_PAGES, `page-${id}.webp`);
    const thumbPath = path.join(THUMBS, `page-${id}.webp`);

    const entry = {
      pageNumber: page.pageNumber,
      role: page.bookRole,
      title: page.title,
      artEngine: null,
      artStatus: "pending",
      letteringStatus: "pending",
      publicPath: path.relative(ROOT, publicPath).replace(/\\/g, "/"),
      error: null,
    };

    try {
      if (!letterOnly) {
        if (!force && fs.existsSync(rawPath)) {
          entry.artStatus = "cached";
          entry.artEngine = "cached";
        } else {
          let buf = null;
          if (process.env.XAI_API_KEY) {
            try {
              buf = await callGrok(page.grokPrompt, page.negativePrompt);
              entry.artEngine = "grok";
              grokOk++;
              await new Promise((r) => setTimeout(r, Number(process.env.COMIC_GROK_DELAY_MS || 1200)));
            } catch (e) {
              console.warn(`Grok failed p${page.pageNumber}: ${e.message} — procedural fallback`);
              entry.error = String(e.message);
            }
          }
          if (!buf) {
            buf = await sharp(proceduralPlate(page)).png().toBuffer();
            entry.artEngine = "procedural";
            proceduralOk++;
          }
          await sharp(buf).resize(W, H, { fit: "cover" }).webp({ quality: 88 }).toFile(rawPath);
          entry.artStatus = "ok";
          artOk++;
        }
      } else if (!fs.existsSync(rawPath)) {
        // letter-only needs a base — synthesize
        await sharp(proceduralPlate(page)).resize(W, H).webp({ quality: 88 }).toFile(rawPath);
        entry.artEngine = "procedural";
        entry.artStatus = "ok";
        proceduralOk++;
      }

      if (!force && fs.existsSync(letteredPath) && !letterOnly) {
        // still refresh public if missing
      }
      const base = await sharp(rawPath).resize(W, H, { fit: "cover" }).png().toBuffer();
      const overlay = renderOverlay(page);
      await sharp(base)
        .composite([{ input: overlay, top: 0, left: 0 }])
        .webp({ quality: 90 })
        .toFile(letteredPath);
      fs.copyFileSync(letteredPath, publicPath);
      await sharp(letteredPath).resize(240, 320, { fit: "cover" }).webp({ quality: 75 }).toFile(thumbPath);

      if (page.bookRole === "front-cover") {
        fs.mkdirSync(PUBLIC_COVERS, { recursive: true });
        fs.mkdirSync(path.join(ISSUE, "generated/covers"), { recursive: true });
        fs.copyFileSync(letteredPath, path.join(PUBLIC_COVERS, "07-the-traitors-gate.webp"));
        await sharp(letteredPath).png().toFile(path.join(PUBLIC_COVERS, "07-the-traitors-gate.png"));
        fs.copyFileSync(letteredPath, path.join(ISSUE, "generated/covers/front-cover.webp"));
      }

      entry.letteringStatus = "ok";
      letterOk++;
      page.generationStatus = entry.artStatus;
      page.letteringStatus = "ok";
      fs.writeFileSync(
        path.join(ISSUE, "pages", `page-${id}.json`),
        JSON.stringify(page, null, 2),
      );
    } catch (e) {
      entry.error = e.message;
      errors++;
      console.error(`Page ${page.pageNumber} failed:`, e.message);
    }
    status.pages[page.pageNumber] = entry;
    if (page.pageNumber % 5 === 0) console.log(`… through page ${page.pageNumber}`);
  }

  status.summary = {
    artOk,
    letterOk,
    grokOk,
    proceduralOk,
    errors,
    resume:
      "node scripts/comics/issue-007/generate-and-letter.mjs --force --pages=1-10",
    grokResume:
      "set XAI_API_KEY=... && node scripts/comics/issue-007/generate-and-letter.mjs --force",
  };
  fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
  console.log(JSON.stringify(status.summary, null, 2));
  console.log(`Status → ${STATUS_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
