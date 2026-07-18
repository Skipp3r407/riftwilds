/**
 * Composite Riftwilds TCG card faces from existing creature/item art.
 *
 * Local only (sharp) — no Grok/XAI.
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

const W = 480;
const H = 672;
const ART = { x: 36, y: 72, w: 408, h: 320 };
const CONCURRENCY = 6;

const RARITY_ACCENT = {
  common: "#8b5a3c",
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

const ELEMENT_BG = {
  fire: ["#2a1210", "#4a2218"],
  water: ["#0c1a2a", "#16344a"],
  nature: ["#0e1c12", "#1a3420"],
  earth: ["#1a1610", "#32281c"],
  storm: ["#101828", "#1c2840"],
  crystal: ["#141828", "#243048"],
  shadow: ["#100818", "#241028"],
  light: ["#1c1810", "#3a3020"],
  spirit: ["#121820", "#243038"],
  arcane: ["#181028", "#2c1840"],
  poison: ["#101810", "#223018"],
  metal: ["#141618", "#2a3034"],
  celestial: ["#101428", "#1c2448"],
  void: ["#0a0814", "#1a1028"],
  neutral: ["#12161c", "#222830"],
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
  if (type === "creature" || type === "companion" || type === "legendary" || type === "token" || type === "hero") {
    return "UNIT";
  }
  if (type === "weather" || type === "location") return "AURA";
  return "SPELL";
}

function frameSvg(card, accent) {
  const name = escapeXml(card.localization?.name || card.id);
  const rules = wrapText(card.localization?.rulesText || card.localization?.flavorText || "", 34, 4);
  const type = typeLabel(card.type);
  const element = ELEMENT_LABEL[card.element] || String(card.element || "").toUpperCase();
  const rarity = String(card.rarity || "common").toUpperCase();
  const cost = Number.isFinite(card.energyCost) ? card.energyCost : 0;
  const atk = card.attack == null ? "—" : String(card.attack);
  const hp = card.health == null ? "—" : String(card.health);
  const showCombat = card.attack != null || card.health != null;
  const [c0, c1] = ELEMENT_BG[card.element] || ELEMENT_BG.neutral;
  const rulesY = 470;
  const ruleLines = rules
    .map(
      (line, i) =>
        `<text x="48" y="${rulesY + i * 22}" fill="#e8e0d4" font-family="Georgia, 'Times New Roman', serif" font-size="15">${escapeXml(line)}</text>`,
    )
    .join("\n");

  // Frame chrome only — art window stays transparent so creature art shows through.
  const ax = ART.x;
  const ay = ART.y;
  const aw = ART.w;
  const ah = ART.h;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="plate" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1a1410" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#0e1218" stop-opacity="0.92"/>
    </linearGradient>
    <radialGradient id="gem" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffe9b0"/>
      <stop offset="55%" stop-color="#ffb84d"/>
      <stop offset="100%" stop-color="#8a5a18"/>
    </radialGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c0}" stop-opacity="0.96"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0.98"/>
    </linearGradient>
  </defs>

  <!-- body panels around the art cutout (even-odd) -->
  <path fill="url(#panel)" fill-rule="evenodd" d="
    M 22 22
    h ${W - 44}
    a 16 16 0 0 1 16 16
    v ${H - 76}
    a 16 16 0 0 1 -16 16
    h -${W - 44}
    a 16 16 0 0 1 -16 -16
    v -${H - 76}
    a 16 16 0 0 1 16 -16
    Z
    M ${ax} ${ay}
    h ${aw}
    v ${ah}
    h -${aw}
    Z
  "/>

  <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="16" fill="none" stroke="${accent}" stroke-width="3" opacity="0.95"/>
  <rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="12" fill="none" stroke="${accent}" stroke-width="1" opacity="0.35"/>

  <!-- art window chrome (stroke only) -->
  <rect x="${ax - 4}" y="${ay - 4}" width="${aw + 8}" height="${ah + 8}" rx="10" fill="none" stroke="${accent}" stroke-width="2" opacity="0.95"/>

  <!-- name plate -->
  <rect x="28" y="28" width="360" height="36" rx="8" fill="url(#plate)" stroke="${accent}" stroke-width="1.2" opacity="0.95"/>
  <text x="40" y="52" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="700">${name}</text>

  <!-- energy cost gem -->
  <circle cx="430" cy="46" r="22" fill="url(#gem)" stroke="#3a2810" stroke-width="2"/>
  <text x="430" y="53" text-anchor="middle" fill="#1a1208" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="700">${cost}</text>

  <!-- meta strip -->
  <rect x="28" y="404" width="424" height="28" rx="6" fill="#0c1018" opacity="0.88"/>
  <text x="40" y="423" fill="${accent}" font-family="Georgia, 'Times New Roman', serif" font-size="12" letter-spacing="1.2">${escapeXml(`${type} · ${element} · ${rarity}`)}</text>

  <!-- rules panel -->
  <rect x="28" y="442" width="424" height="120" rx="10" fill="#0a1018" opacity="0.82" stroke="${accent}" stroke-width="1" stroke-opacity="0.35"/>
  ${ruleLines}

  ${
    showCombat
      ? `<g>
    <rect x="36" y="580" width="88" height="52" rx="10" fill="#1a1010" stroke="#e07050" stroke-width="1.5"/>
    <text x="80" y="602" text-anchor="middle" fill="#ffb8a0" font-family="Georgia, 'Times New Roman', serif" font-size="11">ATK</text>
    <text x="80" y="622" text-anchor="middle" fill="#fff4ec" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700">${escapeXml(atk)}</text>
    <rect x="356" y="580" width="88" height="52" rx="10" fill="#101a14" stroke="#50c888" stroke-width="1.5"/>
    <text x="400" y="602" text-anchor="middle" fill="#a8f0c8" font-family="Georgia, 'Times New Roman', serif" font-size="11">HP</text>
    <text x="400" y="622" text-anchor="middle" fill="#f0fff6" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700">${escapeXml(hp)}</text>
  </g>`
      : `<g>
    <rect x="36" y="580" width="140" height="52" rx="10" fill="#101820" stroke="${accent}" stroke-width="1.5"/>
    <text x="106" y="602" text-anchor="middle" fill="${accent}" font-family="Georgia, 'Times New Roman', serif" font-size="11">POWER</text>
    <text x="106" y="622" text-anchor="middle" fill="#f4efe6" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700">${escapeXml(String(card.attack ?? card.energyCost ?? 1))}</text>
  </g>`
  }

  <text x="240" y="650" text-anchor="middle" fill="#b7aea0" font-family="Georgia, 'Times New Roman', serif" font-size="11" opacity="0.75">Riftwilds · ${escapeXml(card.setId || "rise-of-the-rift")}</text>
</svg>`;
}

async function compositeCard(card, sourceDisk, outPath) {
  const accent = RARITY_ACCENT[card.rarity] || RARITY_ACCENT.common;
  const [c0, c1] = ELEMENT_BG[card.element] || ELEMENT_BG.neutral;

  // Soft elemental wash (visible through art cutout + behind transparent PNG pets)
  const wash = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="100%" stop-color="${c1}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="22" fill="url(#g)"/>
</svg>`);

  const artBuf = await sharp(sourceDisk)
    .resize(ART.w, ART.h, {
      fit: "contain",
      position: "centre",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const overlay = Buffer.from(frameSvg(card, accent));

  await sharp(wash)
    .png()
    .composite([
      { input: artBuf, top: ART.y, left: ART.x },
      { input: await sharp(overlay).png().toBuffer(), top: 0, left: 0 },
    ])
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(outPath);
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

  let eligible = cards.filter((c) => c.art?.assetPath || c.riftlingSlug);
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

  manifest.version = 1;
  manifest.generatedAt = new Date().toISOString();
  manifest.count = Object.keys(manifest.cards).length;
  manifest.outputDir = "public/assets/tcg/cards";
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  // Persist cardImagePath onto cards that have composites (keeps UI/data in sync).
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
    eligible: eligible.length,
    generated,
    skippedExisting: skipped,
    missingSource,
    failed,
    patchedCardImagePath: patched,
    totalWithCardImage: Object.keys(manifest.cards).length,
    out: "public/assets/tcg/cards/{cardId}.webp",
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
