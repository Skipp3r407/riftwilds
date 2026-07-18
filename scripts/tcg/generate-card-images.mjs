/**
 * Composite Riftwilds TCG full-art card faces from existing creature/item art.
 *
 * Local only (sharp) — no Grok/XAI.
 * Layout: full-bleed source art + translucent overlays (name, RE cost, type line,
 * rules, ATK/HP). Original Riftwilds navy/cyan/amber styling — not third-party TCG IP.
 *
 * Usage:
 *   npm run tcg:generate:card-images
 *   node scripts/tcg/generate-card-images.mjs [--limit N] [--only id1,id2] [--force]
 *
 * Out:
 *   public/assets/tcg/cards/{cardId}.webp
 *   src/content/tcg/data/cardImages.json
 *   Patches art.cardImagePath on cards that were generated
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ROOT } from "./content-sources.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const OUT_DIR = path.join(ROOT, "public/assets/tcg/cards");
const MANIFEST_PATH = path.join(ROOT, "src/content/tcg/data/cardImages.json");

/** Portrait card ratio ~2.5×3.5 */
const W = 500;
const H = 700;
const CONCURRENCY = 6;

const RARITY_ACCENT = {
  common: "#a07850",
  uncommon: "#3de7ff",
  rare: "#3de7ff",
  epic: "#ffb84d",
  legendary: "#66e0ff",
  mythic: "#d4a0ff",
  founder: "#ffe566",
  seasonal: "#ffc070",
  holiday: "#ffc070",
  animated: "#3de7ff",
  foil: "#e8d5b0",
  signed: "#ffe566",
  collector: "#ffb84d",
};

const ELEMENT_WASH = {
  fire: "#3a1810",
  water: "#0c2440",
  nature: "#102818",
  earth: "#241c10",
  storm: "#141e38",
  crystal: "#182438",
  shadow: "#180c24",
  light: "#2a2414",
  spirit: "#142028",
  arcane: "#1c1030",
  poison: "#142018",
  metal: "#1a2024",
  celestial: "#101830",
  void: "#0c0818",
  neutral: "#121820",
};

const ELEMENT_LABEL = {
  fire: "EMBER",
  water: "TIDE",
  nature: "GROVE",
  earth: "STONE",
  storm: "STORM",
  crystal: "FROST",
  shadow: "VOID",
  light: "RADIANT",
  spirit: "SPIRIT",
  arcane: "SPIRIT",
  poison: "GROVE",
  metal: "ALLOY",
  celestial: "RADIANT",
  void: "VOID",
  neutral: "SPIRIT",
};

function parseArgs(argv) {
  const out = { limit: 0, only: null, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") out.force = true;
    else if (a === "--limit") out.limit = Number(argv[++i]) || 0;
    else if (a === "--only") {
      out.only = new Set(
        String(argv[++i] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }
  return out;
}

function escapeXml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, maxChars, maxLines) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length >= maxLines) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (words.join(" ").length > lines.join(" ").length) {
    const last = lines[lines.length - 1] || "";
    lines[lines.length - 1] = `${last.replace(/\s+\S*$/, "")}…`.replace(/^…$/, "…");
  }
  return lines;
}

function publicPathToDisk(rel) {
  if (!rel) return null;
  const clean = rel.startsWith("/") ? rel.slice(1) : rel;
  return path.join(ROOT, "public", clean);
}

/** Prefer full pet masters over thumbs when available. */
function resolveSourceArt(assetPath, riftlingSlug) {
  const candidates = [];
  if (riftlingSlug) {
    candidates.push(
      `/assets/pets/${riftlingSlug}.png`,
      `/assets/pets/${riftlingSlug}.webp`,
      `/assets/pets/thumbs/${riftlingSlug}.webp`,
      `/assets/pets/thumbs/${riftlingSlug}.png`,
    );
  }
  if (assetPath) {
    const m = assetPath.match(/\/assets\/pets\/thumbs\/([a-z0-9-]+)\.(webp|png|svg)$/i);
    if (m) {
      const slug = m[1];
      candidates.push(
        `/assets/pets/${slug}.png`,
        `/assets/pets/${slug}.webp`,
        assetPath,
      );
    } else {
      candidates.push(assetPath);
    }
  }
  for (const rel of candidates) {
    const disk = publicPathToDisk(rel);
    if (disk && fs.existsSync(disk)) return { rel, disk };
  }
  return null;
}

function typeLabel(type) {
  if (
    type === "creature" ||
    type === "companion" ||
    type === "legendary" ||
    type === "token" ||
    type === "hero"
  ) {
    return "UNIT";
  }
  if (type === "weather" || type === "location") return "AURA";
  return "SPELL";
}

/**
 * Semi-transparent HUD over full-bleed art (Riftwilds navy/cyan/amber).
 * Art shows through every panel — no opaque frames.
 */
function overlaySvg(card, accent) {
  const name = escapeXml(card.localization?.name || card.id);
  const rules = wrapText(
    card.localization?.rulesText || card.localization?.flavorText || "",
    36,
    4,
  );
  const type = typeLabel(card.type);
  const element = ELEMENT_LABEL[card.element] || String(card.element || "").toUpperCase();
  const rarity = String(card.rarity || "common").toUpperCase();
  const cost = Number.isFinite(card.energyCost) ? card.energyCost : 0;
  const atk = card.attack == null ? "—" : String(card.attack);
  const hp = card.health == null ? "—" : String(card.health);
  const showCombat = card.attack != null || card.health != null;
  const power = String(card.attack ?? card.energyCost ?? 1);

  const typeY = 430;
  const rulesTop = 462;
  const rulesH = 148;
  const ruleLines = rules
    .map(
      (line, i) =>
        `<text x="28" y="${rulesTop + 28 + i * 22}" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="15">${escapeXml(line)}</text>`,
    )
    .join("\n");

  const statsBlock = showCombat
    ? `<g>
        <rect x="352" y="618" width="124" height="44" rx="10" fill="#0a1220" fill-opacity="0.78" stroke="${accent}" stroke-width="1.5"/>
        <text x="414" y="647" text-anchor="middle" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700">${escapeXml(atk)}/${escapeXml(hp)}</text>
      </g>`
    : `<g>
        <rect x="352" y="618" width="124" height="44" rx="10" fill="#0a1220" fill-opacity="0.78" stroke="${accent}" stroke-width="1.5"/>
        <text x="414" y="636" text-anchor="middle" fill="${accent}" font-family="Georgia, 'Times New Roman', serif" font-size="10" letter-spacing="1">POWER</text>
        <text x="414" y="654" text-anchor="middle" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="700">${escapeXml(power)}</text>
      </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#061018" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#061018" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="botFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#061018" stop-opacity="0"/>
      <stop offset="35%" stop-color="#061018" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#061018" stop-opacity="0.78"/>
    </linearGradient>
    <radialGradient id="reGem" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#ffe9b0"/>
      <stop offset="55%" stop-color="#ffb84d"/>
      <stop offset="100%" stop-color="#8a5a18"/>
    </radialGradient>
  </defs>

  <!-- readability washes (art still visible) -->
  <rect width="${W}" height="110" fill="url(#topFade)"/>
  <rect y="360" width="${W}" height="340" fill="url(#botFade)"/>

  <!-- subtle rarity edge -->
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="18" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.55"/>
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="14" fill="none" stroke="#ffb84d" stroke-width="0.75" opacity="0.22"/>

  <!-- name (left) -->
  <text x="22" y="42" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="700">${name}</text>

  <!-- Rift Energy cost (right) -->
  <circle cx="458" cy="36" r="24" fill="url(#reGem)" stroke="#3a2810" stroke-width="2"/>
  <circle cx="458" cy="36" r="24" fill="none" stroke="#3de7ff" stroke-width="1" opacity="0.35"/>
  <text x="458" y="44" text-anchor="middle" fill="#1a1208" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700">${cost}</text>

  <!-- type line + rarity pip -->
  <rect x="16" y="${typeY}" width="${W - 32}" height="28" rx="4" fill="#0a1220" fill-opacity="0.55" stroke="${accent}" stroke-width="1" stroke-opacity="0.65"/>
  <line x1="16" y1="${typeY}" x2="${W - 16}" y2="${typeY}" stroke="#ffb84d" stroke-width="1.2" opacity="0.55"/>
  <line x1="16" y1="${typeY + 28}" x2="${W - 16}" y2="${typeY + 28}" stroke="#ffb84d" stroke-width="1.2" opacity="0.55"/>
  <text x="28" y="${typeY + 19}" fill="#e8f7ff" font-family="Georgia, 'Times New Roman', serif" font-size="13" letter-spacing="0.8">${escapeXml(`${type} · ${element}`)}</text>
  <circle cx="${W - 34}" cy="${typeY + 14}" r="7" fill="${accent}" stroke="#0a1220" stroke-width="1.5"/>
  <title>${escapeXml(rarity)}</title>
  <text x="${W - 34}" y="${typeY + 18}" text-anchor="middle" fill="#0a1220" font-family="Georgia, 'Times New Roman', serif" font-size="8" font-weight="700">${escapeXml(rarity.slice(0, 1))}</text>

  <!-- rules box -->
  <rect x="16" y="${rulesTop}" width="${W - 32}" height="${rulesH}" rx="8" fill="#0a1220" fill-opacity="0.58" stroke="${accent}" stroke-width="1" stroke-opacity="0.4"/>
  ${ruleLines}

  ${statsBlock}

  <text x="22" y="${H - 14}" fill="#c8d0d8" font-family="Georgia, 'Times New Roman', serif" font-size="10" opacity="0.7">${escapeXml(rarity)} · Riftwilds</text>
</svg>`;
}

async function roundedCornerMask() {
  const r = 22;
  const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" rx="${r}" ry="${r}" fill="#fff"/>
</svg>`);
  return sharp(svg).png().toBuffer();
}

async function compositeCard(card, sourceDisk, outPath) {
  const accent = RARITY_ACCENT[card.rarity] || RARITY_ACCENT.common;
  const wash = ELEMENT_WASH[card.element] || ELEMENT_WASH.neutral;

  // Full-bleed art: cover the whole card face (same approach as other game composites).
  const artBuf = await sharp(sourceDisk)
    .resize(W, H, {
      fit: "cover",
      position: "centre",
    })
    .png()
    .toBuffer();

  // Soft elemental tint under transparent PNGs / sparse icons
  const base = await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: hexToRgba(wash, 1),
    },
  })
    .png()
    .toBuffer();

  // Name, cost, type, rules, stats are rasterized into pixels here — not DOM overlays.
  const overlay = await sharp(Buffer.from(overlaySvg(card, accent))).png().toBuffer();
  const mask = await roundedCornerMask();

  const flat = await sharp(base)
    .composite([
      { input: artBuf, top: 0, left: 0 },
      { input: overlay, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  await sharp(flat)
    .composite([{ input: mask, blend: "dest-in" }])
    .webp({ quality: 88, alphaQuality: 90 })
    .toFile(outPath);
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    alpha,
  };
}

async function mapPool(items, concurrency, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const typePriority = (t) => {
    if (t === "creature" || t === "legendary" || t === "companion") return 0;
    if (t === "hero" || t === "token") return 1;
    if (t === "spell" || t === "equipment") return 2;
    return 3;
  };
  let eligible = cards
    .filter((c) => c.art?.assetPath || c.riftlingSlug)
    .sort((a, b) => typePriority(a.type) - typePriority(b.type) || a.collectorNumber - b.collectorNumber);
  if (args.only) eligible = eligible.filter((c) => args.only.has(c.id));
  if (args.limit > 0) eligible = eligible.slice(0, args.limit);

  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : { version: 1, generatedAt: null, cards: {} };

  let generated = 0;
  let skipped = 0;
  let missingSource = 0;
  let failed = 0;
  const errors = [];

  await mapPool(eligible, CONCURRENCY, async (card) => {
    const outRel = `/assets/tcg/cards/${card.id}.webp`;
    const outPath = path.join(OUT_DIR, `${card.id}.webp`);
    if (!args.force && fs.existsSync(outPath) && card.art?.cardImagePath === outRel) {
      skipped++;
      manifest.cards[card.id] = outRel;
      return;
    }

    const source = resolveSourceArt(card.art?.assetPath, card.riftlingSlug);
    if (!source) {
      missingSource++;
      return;
    }

    try {
      await compositeCard(card, source.disk, outPath);
      card.art = { ...card.art, cardImagePath: outRel };
      manifest.cards[card.id] = outRel;
      generated++;
    } catch (e) {
      failed++;
      errors.push(`${card.id}: ${e?.message || e}`);
    }
  });

  manifest.version = 2;
  manifest.layout = "full-art";
  manifest.generatedAt = new Date().toISOString();
  manifest.count = Object.keys(manifest.cards).length;
  manifest.outputDir = "public/assets/tcg/cards";
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  let patched = 0;
  for (const card of cards) {
    const p = manifest.cards[card.id];
    if (!p) continue;
    if (card.art?.cardImagePath !== p) {
      card.art = { ...(card.art || {}), cardImagePath: p };
      patched++;
    } else if (!card.art.cardImagePath) {
      card.art.cardImagePath = p;
      patched++;
    }
  }
  fs.writeFileSync(CARDS_PATH, `${JSON.stringify(cards, null, 2)}\n`, "utf8");

  const summary = {
    layout: "full-art",
    eligible: eligible.length,
    generated,
    skippedExisting: skipped,
    missingSource,
    failed,
    patchedCardImagePath: patched,
    totalWithCardImage: Object.keys(manifest.cards).length,
    out: "public/assets/tcg/cards/{cardId}.webp",
    samples: [
      "/assets/tcg/cards/rotr-c-ashwing.webp",
      "/assets/tcg/cards/rotr-c-cindercub.webp",
      "/assets/tcg/cards/rotr-s-item-emberheart-elixir.webp",
    ],
    manifest: "src/content/tcg/data/cardImages.json",
    errors: errors.slice(0, 12),
  };
  console.log(JSON.stringify(summary, null, 2));
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
