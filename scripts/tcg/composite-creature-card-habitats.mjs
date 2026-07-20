/**
 * Composite Codex habitat plates behind creature subjects for TCG clean art.
 *
 * Writes (overwrites) dedicated card paths:
 *   /public/assets/cards/{expansion}/{slug}/art.webp
 *   /public/assets/cards/{expansion}/{slug}/thumb.webp
 *
 * Does NOT bake ATK/HP. MasterCardTemplate overlays stay data-driven.
 *
 * Usage:
 *   node scripts/tcg/composite-creature-card-habitats.mjs
 *   node scripts/tcg/composite-creature-card-habitats.mjs --slug commonspark
 *   node scripts/tcg/composite-creature-card-habitats.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./content-sources.mjs";

const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const PUBLIC = path.join(ROOT, "public");
const HABITAT_DIR = path.join(PUBLIC, "assets/habitats");
const MAP_DIR = path.join(PUBLIC, "assets/maps/regions");
const PETS_DIR = path.join(PUBLIC, "assets/pets");
const THUMBS_DIR = path.join(PETS_DIR, "thumbs");

/** Portrait plate sized for MasterCardTemplate art well (object-fit: cover). */
const W = 768;
const H = 960;

const ELEMENT_TO_REGION = {
  fire: "ember-crater",
  water: "moonwater-coast",
  nature: "elderwood-forest",
  poison: "elderwood-forest",
  earth: "stoneheart-canyon",
  storm: "stormspire-peaks",
  crystal: "frostveil-basin",
  light: "radiant-citadel",
  celestial: "celestial-rift",
  shadow: "void-hollow",
  void: "void-hollow",
  metal: "alloy-ruins",
  spirit: "spirit-marsh",
  arcane: "celestial-rift",
  neutral: "riftwild-commons",
};

function parseArgs(argv) {
  const out = { slug: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--slug") out.slug = argv[++i] || null;
  }
  return out;
}

function expansionFor(card) {
  return String(card.expansionId || card.setId || "rise-of-the-rift")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
}

function resolveHabitat(regionId) {
  const habitat = path.join(HABITAT_DIR, `${regionId}.webp`);
  if (fs.existsSync(habitat)) return { abs: habitat, kind: "habitat", regionId };
  const map = path.join(MAP_DIR, `${regionId}.png`);
  if (fs.existsSync(map)) return { abs: map, kind: "map", regionId };
  return null;
}

function resolveSubject(slug) {
  const master = path.join(PETS_DIR, `${slug}.png`);
  if (fs.existsSync(master)) return { abs: master, kind: "portrait" };
  const thumb = path.join(THUMBS_DIR, `${slug}.webp`);
  if (fs.existsSync(thumb)) return { abs: thumb, kind: "thumb" };
  return null;
}

function vignetteSvg(width, height) {
  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="v" cx="50%" cy="42%" r="78%">
      <stop offset="0%" stop-color="#000" stop-opacity="0.10"/>
      <stop offset="70%" stop-color="#000" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.72"/>
    </radialGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#v)"/>
  <rect width="${width}" height="${height}" fill="url(#b)"/>
</svg>`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Write via temp + rename so Windows locks on existing art.webp are less fatal. */
async function writeBufferSafe(destAbs, buf, attempts = 6) {
  const dir = path.dirname(destAbs);
  const tmp = path.join(
    dir,
    `.${path.basename(destAbs)}.${process.pid}.${Date.now()}.tmp`,
  );
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      fs.writeFileSync(tmp, buf);
      try {
        if (fs.existsSync(destAbs)) fs.unlinkSync(destAbs);
      } catch {
        // ignore — rename may still replace on some platforms
      }
      fs.renameSync(tmp, destAbs);
      return;
    } catch (err) {
      lastErr = err;
      try {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      } catch {
        /* ignore */
      }
      await sleep(80 * (i + 1));
    }
  }
  throw lastErr;
}

async function compositeSpecies({ slug, regionId, expansion }) {
  const habitat = resolveHabitat(regionId);
  if (!habitat) {
    return { ok: false, reason: `no habitat/map for region ${regionId}` };
  }
  const subject = resolveSubject(slug);
  if (!subject) {
    return { ok: false, reason: `no pet art for ${slug}` };
  }

  const destDir = path.join(PUBLIC, "assets/cards", expansion, slug);
  const artAbs = path.join(destDir, "art.webp");
  const thumbAbs = path.join(destDir, "thumb.webp");

  const bg = await sharp(habitat.abs)
    .resize(W, H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 0.92, saturation: 1.02 })
    .png()
    .toBuffer();

  const vignette = await sharp(vignetteSvg(W, H)).png().toBuffer();

  const subjectPadX = Math.floor(W * 0.08);
  const subjectPadTop = Math.floor(H * 0.1);
  const subjectPadBottom = Math.floor(H * 0.14);
  const subjectW = W - subjectPadX * 2;
  const subjectH = H - subjectPadTop - subjectPadBottom;

  const creature = await sharp(subject.abs)
    .ensureAlpha()
    .resize(subjectW, subjectH, {
      fit: "contain",
      position: "centre",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const composed = await sharp(bg)
    .composite([
      { input: vignette, top: 0, left: 0 },
      { input: creature, top: subjectPadTop, left: subjectPadX },
    ])
    .webp({ quality: 88, alphaQuality: 90, effort: 4 })
    .toBuffer();

  fs.mkdirSync(destDir, { recursive: true });
  await writeBufferSafe(artAbs, composed);
  // Binder thumb: slightly tighter crop, still habitat+subject.
  const thumbBuf = await sharp(composed)
    .resize(384, 480, { fit: "cover", position: "centre" })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
  await writeBufferSafe(thumbAbs, thumbBuf);

  return {
    ok: true,
    habitatKind: habitat.kind,
    subjectKind: subject.kind,
    regionId: habitat.regionId,
    art: artAbs,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));

  /** @type {Map<string, { slug: string, regionId: string, expansion: string, cardIds: string[] }>} */
  const bySlug = new Map();

  for (const card of cards) {
    const slug = card.riftlingSlug ? String(card.riftlingSlug) : null;
    if (!slug) continue;
    if (args.slug && slug !== args.slug) continue;

    const regionId =
      card.regionId ||
      ELEMENT_TO_REGION[String(card.element || "").toLowerCase()] ||
      "riftwild-commons";
    const expansion = expansionFor(card);
    const existing = bySlug.get(slug);
    if (existing) {
      existing.cardIds.push(card.id);
      // Prefer an explicit regionId when present.
      if (card.regionId) existing.regionId = card.regionId;
      continue;
    }
    bySlug.set(slug, {
      slug,
      regionId,
      expansion,
      cardIds: [card.id],
    });
  }

  const entries = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  console.log(
    `Composite Codex habitats → TCG clean art for ${entries.length} species` +
      (args.dryRun ? " (dry-run)" : ""),
  );

  let ok = 0;
  let failed = 0;
  const failures = [];
  const regionCounts = {};

  for (const entry of entries) {
    if (args.dryRun) {
      const habitat = resolveHabitat(entry.regionId);
      const subject = resolveSubject(entry.slug);
      const status =
        habitat && subject
          ? `ok → ${habitat.kind}/${subject.kind}`
          : `FAIL habitat=${Boolean(habitat)} subject=${Boolean(subject)}`;
      console.log(`  ${entry.slug} [${entry.regionId}] ${status} (${entry.cardIds.length} cards)`);
      if (habitat && subject) ok += 1;
      else {
        failed += 1;
        failures.push(entry.slug);
      }
      continue;
    }

    const result = await compositeSpecies(entry);
    if (result.ok) {
      ok += 1;
      regionCounts[result.regionId] = (regionCounts[result.regionId] || 0) + 1;
      console.log(
        `  ok ${entry.slug} ← ${result.regionId} (${result.habitatKind}+${result.subjectKind}) · ${entry.cardIds.length} cards`,
      );
    } else {
      failed += 1;
      failures.push(`${entry.slug}: ${result.reason}`);
      console.warn(`  FAIL ${entry.slug}: ${result.reason}`);
    }
  }

  console.log(`\nDone: ${ok} composited, ${failed} failed`);
  if (Object.keys(regionCounts).length) {
    console.log("By region:", regionCounts);
  }
  if (failures.length) {
    console.log("Failures:", failures.slice(0, 20).join("; "));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
