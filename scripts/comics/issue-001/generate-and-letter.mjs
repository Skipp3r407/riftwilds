/**
 * Stage 1 + 2 for The First Rift Issue #1:
 *   - Generate text-free art (Grok if XAI_API_KEY, else procedural plate)
 *   - Programmatic lettering with private comic font
 *   - Flatten to public reader path + content generated/
 *
 *   node scripts/comics/issue-001/generate-and-letter.mjs
 *   node scripts/comics/issue-001/generate-and-letter.mjs --pages=1-5
 *   node scripts/comics/issue-001/generate-and-letter.mjs --letter-only
 *   node scripts/comics/issue-001/generate-and-letter.mjs --force
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
const ISSUE = path.join(ROOT, "content/comics/the-first-rift/issue-001");
const PUBLIC_PAGES = path.join(ROOT, "public/assets/comics/the-first-rift/issue-001/pages");
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

function balloonFill(kind) {
  if (kind === "shout") return "rgba(255,236,200,0.97)";
  if (kind === "creature") return "rgba(236,252,240,0.96)";
  if (kind === "magic") return "rgba(18,40,28,0.92)";
  if (kind === "telepathy") return "rgba(230,240,255,0.96)";
  return "rgba(255,252,245,0.97)";
}

function balloonStroke(kind) {
  if (kind === "thought" || kind === "telepathy" || kind === "whisper") return "rgba(42,33,24,0.42)";
  if (kind === "shout") return "rgba(90,40,10,0.7)";
  return "rgba(42,33,24,0.55)";
}

/** Classic Western comic balloon: oval/cloud body + directional tail. No speaker-name UI chips. */
function renderSpeechBalloon(kind, cx, cy, bw, bh, tail, textParts) {
  const fill = balloonFill(kind);
  const stroke = balloonStroke(kind);
  const isThought = kind === "thought" || kind === "telepathy";
  const isShout = kind === "shout";
  const rx = Math.max(22, bw * 0.42);
  const ry = Math.max(18, bh * 0.48);
  const left = cx - bw / 2;
  const top = cy - bh / 2;

  let body;
  if (isThought) {
    body = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-dasharray="7 5"/>
      <circle cx="${cx - rx * 0.55}" cy="${cy + ry * 0.95}" r="10" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="${cx - rx * 0.72}" cy="${cy + ry * 1.25}" r="6" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>`;
  } else if (isShout) {
    // jagged burst outline via slightly oversized rounded rect + thick stroke
    body = `<rect x="${left}" y="${top}" width="${bw}" height="${bh}" rx="10" ry="10" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>`;
  } else {
    body = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="2.8"/>`;
  }

  let tailSvg = "";
  if (!isThought) {
    const tip = 28;
    const base = 14;
    if (tail?.startsWith("up")) {
      tailSvg = `<polygon points="${cx - base},${top + 8} ${cx + base},${top + 8} ${cx},${top - tip}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    } else if (tail === "left") {
      tailSvg = `<polygon points="${left + 8},${cy - base} ${left + 8},${cy + base} ${left - tip},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    } else if (tail === "right") {
      tailSvg = `<polygon points="${left + bw - 8},${cy - base} ${left + bw - 8},${cy + base} ${left + bw + tip},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    } else if (tail === "down-left") {
      tailSvg = `<polygon points="${cx - 8},${top + bh - 6} ${cx + 10},${top + bh - 10} ${cx - tip},${top + bh + tip}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    } else if (tail === "down-right") {
      tailSvg = `<polygon points="${cx - 10},${top + bh - 10} ${cx + 8},${top + bh - 6} ${cx + tip},${top + bh + tip}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    } else {
      // down / default — point toward character mouth below balloon
      tailSvg = `<polygon points="${cx - base},${top + bh - 6} ${cx + base},${top + bh - 6} ${cx},${top + bh + tip}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
    }
  }

  return `${tailSvg}${body}${textParts}`;
}

function renderBubbleSvg(b) {
  const kind = b.kind;
  const maxW = Math.round((W * (b.maxWidthPct || 34)) / 100);
  const cx = Math.round(((b.x ?? 50) / 100) * W);
  const cy = Math.round(((b.y ?? 50) / 100) * H);

  if (kind === "sfx") {
    const lines = wrapWords(String(b.text).toUpperCase(), 14);
    const fontSize = 48;
    const lineH = 52;
    const blockH = lines.length * lineH;
    const startY = cy - blockH / 2 + fontSize;
    const tspans = lines
      .map((line, i) => `<tspan x="${cx}" y="${startY + i * lineH}" text-anchor="middle">${escapeXml(line)}</tspan>`)
      .join("");
    return `<text font-family="${FONT}" font-size="${fontSize}" font-weight="700" fill="#ffb84d" stroke="rgba(20,14,10,0.8)" stroke-width="4" paint-order="stroke" letter-spacing="0.14em" transform="rotate(-6 ${cx} ${cy})">${tspans}</text>`;
  }

  if (kind === "narration" || kind === "caption") {
    const lines = wrapWords(b.text, kind === "caption" ? 34 : 40);
    const fontSize = kind === "caption" ? 21 : 22;
    const lineH = fontSize + 8;
    const padX = 18;
    const padY = 12;
    const bw = Math.min(maxW, kind === "caption" ? 560 : 640);
    const bh = padY * 2 + lines.length * lineH;
    const left = Math.max(24, Math.min(W - bw - 24, cx - bw / 2));
    const top = Math.max(24, Math.min(H - bh - 48, cy - bh / 2));
    const tspans = lines
      .map((line, i) => `<tspan x="${left + padX}" y="${top + padY + fontSize + i * lineH}">${escapeXml(line)}</tspan>`)
      .join("");
    return `
      <rect x="${left}" y="${top}" width="${bw}" height="${bh}" rx="2" ry="2"
            fill="rgba(12,10,8,0.9)" stroke="rgba(232,213,176,0.55)" stroke-width="2"/>
      <text font-family="${FONT}" font-size="${fontSize}" fill="#f5ead2"
            font-style="${kind === "narration" ? "italic" : "normal"}" font-weight="${kind === "caption" ? "700" : "400"}"
            letter-spacing="${kind === "caption" ? "0.04em" : "0"}">${tspans}</text>`;
  }

  // No speaker-name chips — Western comics rely on balloon tails + art for speaker ID
  const bodyLines = wrapWords(b.text, kind === "shout" ? 22 : 24);
  const fontSize = kind === "shout" ? 23 : 20;
  const lineH = fontSize + 6;
  const padX = 22;
  const padY = 16;
  const bw = Math.min(Math.max(maxW * 0.85, 160), 380);
  const bh = Math.max(padY * 2 + bodyLines.length * lineH, 56);
  const textFill = kind === "magic" ? "#d8ffe8" : "#2a2118";
  const textStartY = cy - bh / 2 + padY + fontSize;
  const tspans = bodyLines
    .map(
      (line, i) =>
        `<tspan x="${cx}" y="${textStartY + i * lineH}" text-anchor="middle">${escapeXml(line)}</tspan>`,
    )
    .join("");
  const textParts = `<text font-family="${FONT}" font-size="${fontSize}" fill="${textFill}" font-weight="${kind === "shout" ? "700" : "400"}" font-style="${kind === "whisper" ? "italic" : "normal"}">${tspans}</text>`;
  return renderSpeechBalloon(kind, cx, cy, bw, bh, b.tail, textParts);
}

function collectBubbles(page) {
  const bubbles = [];
  for (const p of page.panels || []) {
    for (const b of p.bubbles || []) bubbles.push(b);
    for (const b of p.lines || []) bubbles.push(b);
  }
  if (!bubbles.length) {
    for (const b of page.dialogue || []) bubbles.push(b);
    for (const b of page.captions || []) bubbles.push(b);
    for (const b of page.soundEffects || []) bubbles.push(b);
  }
  return bubbles
    .filter((b) => b?.text?.trim())
    .sort((a, b) => (a.readOrder ?? 0) - (b.readOrder ?? 0));
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
      role: page.bookRole || page.role,
      title: page.title,
      artEngine: null,
      artStatus: "pending",
      letteringStatus: "pending",
      publicPath: path.relative(ROOT, publicPath).replace(/\\/g, "/"),
      error: null,
    };

    const artPrompt =
      page.grokPrompt ||
      page.artPrompt ||
      `Original Riftwilds fantasy comic page, ${page.layout || "narrative"} layout, beat: ${page.beat || page.title || ""}. NO readable text.`;
    const neg =
      page.negativePrompt ||
      "readable text, logos, watermarks, UI overlays, credit labels, floating card insets, collage lore plates, speech balloons painted in art";

    try {
      if (!letterOnly) {
        if (!force && fs.existsSync(rawPath)) {
          entry.artStatus = "cached";
          entry.artEngine = "cached";
        } else {
          let buf = null;
          if (process.env.XAI_API_KEY) {
            try {
              buf = await callGrok(artPrompt, neg);
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

      const base = await sharp(rawPath).resize(W, H, { fit: "cover" }).png().toBuffer();
      const overlay = renderOverlay(page);
      await sharp(base)
        .composite([{ input: overlay, top: 0, left: 0 }])
        .webp({ quality: 90 })
        .toFile(letteredPath);
      fs.copyFileSync(letteredPath, publicPath);
      await sharp(letteredPath).resize(240, 320, { fit: "cover" }).webp({ quality: 75 }).toFile(thumbPath);

      if ((page.bookRole || page.role) === "front-cover") {
        const coverDest = path.join(PUBLIC_COVERS, "the-first-rift.webp");
        fs.mkdirSync(PUBLIC_COVERS, { recursive: true });
        fs.copyFileSync(letteredPath, coverDest);
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
      "node scripts/comics/issue-001/generate-and-letter.mjs --force --pages=1-10",
    grokResume:
      "set XAI_API_KEY=... && node scripts/comics/issue-001/generate-and-letter.mjs --force",
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
