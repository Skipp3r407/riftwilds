/**
 * Wire painted NPC portraits into TCG hero cards + subject plates.
 * Rejects tiny game-library pawn sprites (~1KB geometric placeholders).
 *
 * Usage: node scripts/tcg/install-hero-card-art.mjs
 *
 * Out:
 *   public/assets/tcg/subjects/{slug}.png
 *   updates src/content/tcg/data/cards.json art.assetPath for heroes
 *   artifacts/tcg-hero-art-install.json
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT } from "./content-sources.mjs";

const CARDS_PATH = path.join(ROOT, "src/content/tcg/data/cards.json");
const SUBJECTS_DIR = path.join(ROOT, "public/assets/tcg/subjects");
const NPC_ROOT = path.join(ROOT, "public/assets/npcs");
const REPORT_PATH = path.join(ROOT, "artifacts/tcg-hero-art-install.json");
const MIN_BYTES = 8_000;

function subjectSlugFromCard(card) {
  const id = String(card.id || "");
  return (
    id
      .replace(/^rotr-(?:s|e|c|t|h|x|l|w|r|prop)-/, "")
      .replace(/^companion-/, "")
      .replace(/^legendary-/, "")
      .replace(/^artifact-/, "")
      .replace(/^quest-/, "")
      .replace(/^item-/, "")
      .replace(/^npc-/, "") || id
  );
}

/** Prefer largest non-region-nested PNG, else webp. */
function collectPortraits() {
  const bySlug = new Map();
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/^portrait\.(png|webp)$/i.test(ent.name)) continue;
      const st = fs.statSync(full);
      if (st.size < MIN_BYTES) continue;
      const rel = full.slice(NPC_ROOT.length + 1).replace(/\\/g, "/");
      const parts = rel.split("/");
      // slug is parent folder name
      const slug = parts[parts.length - 2];
      if (!slug) continue;
      const prev = bySlug.get(slug);
      const score = st.size + (ent.name.endsWith(".png") ? 1e9 : 0);
      if (!prev || score > prev.score) {
        bySlug.set(slug, { slug, disk: full, rel: `/assets/npcs/${rel}`, size: st.size, score });
      }
    }
  }
  walk(NPC_ROOT);
  return bySlug;
}

/**
 * Explicit unique portrait assignments for hero cards.
 * Values are NPC portrait folder slugs under public/assets/npcs/.
 */
const HERO_PORTRAIT_MAP = {
  "elara-venn": "elara-venn",
  "mira-of-care": "mira",
  "captain-brine": "captain-orren",
  "forge-warden-kael": "forgekeeper-vessa",
  "archivist-solen": "archivist-solen",
  // keepers (outfit variants) — unique painted faces
  "keeper-travel-cloak": "tessa-windmere",
  "keeper-plaza-coat": "bram-ironroot",
  "keeper-grove-vest": "mosskeeper-elden",
  "keeper-ember-apron": "warden-pyra",
  "keeper-tide-slicker": "luma-tidecrest",
  "keeper-frost-parka": "jori-icebloom",
  "keeper-storm-cape": "skywarden-ilya",
  "keeper-stone-tabard": "petra-stoneveil",
  "keeper-spirit-shawl": "medium-amara",
  "keeper-void-hood": "veya-dusk",
  "keeper-alloy-harness": "professor-ferrum",
  "keeper-radiant-robe": "chancellor-aurex",
  // role NPCs
  "npc-merchant": "salvager-knox",
  "npc-guard": "guard-portal-hex",
  "npc-gardener": "gardener-sip",
  "npc-courier": "alloy-runner-bit",
  "npc-fisher": "finn-coralhand",
  "npc-smith": "doran-flint",
  "npc-scholar": "scholar-lyra",
  "npc-cook": "cook-pot-uma",
  "npc-child": "echo-child-nimi",
  "npc-elder": "grandmother-willowmere",
  "npc-bard": "plaza-musician-reo",
  "npc-healer": "marsh-herbal-mist",
  "npc-farmer": "elder-forager-nim",
  "npc-builder": "stone-hauler-mog",
  "npc-stablehand": "storm-porter-zee",
  "npc-scribe": "citadel-scribe-omi",
  "npc-hunter": "hunter-varek",
  "npc-tailor": "aurora-linn",
  "npc-potter": "gemwright-opal",
  "npc-miller": "stone-survey-lin",
  "npc-innkeeper": "coast-innkeep-dor",
  "npc-dockhand": "marsh-porter-reed",
  "npc-acolyte": "celestial-acolyte-nova",
  "npc-ranger": "fenn-quickbranch",
};

/** Role keyword fallbacks when explicit map miss. */
const ROLE_FALLBACKS = [
  [/merchant|trader|vendor/, ["plaza-musician-reo", "tinker-pax"]],
  [/guard|sentinel/, ["guard-portal-hex", "stone-guard-slab", "void-guard-veil"]],
  [/garden/, ["gardener-sip", "elder-forager-nim"]],
  [/courier|runner|porter/, ["alloy-runner-bit", "alloy-porter-cog", "storm-porter-zee"]],
  [/fisher|dock|brine/, ["finn-coralhand", "coast-innkeep-dor"]],
  [/smith|forge|welder/, ["doran-flint", "forgekeeper-vessa", "alloy-welder-spark"]],
  [/scholar|scribe|archiv/, ["scholar-lyra", "archivist-solen", "citadel-scribe-omi"]],
  [/cook/, ["cook-pot-uma", "ember-cook-cind", "stone-cook-peb"]],
  [/child|nimi/, ["echo-child-nimi"]],
  [/elder|grandmother/, ["grandmother-willowmere", "elder-carver-tor"]],
  [/bard|musician|singer/, ["plaza-musician-reo", "marsh-singer-fog", "elder-singer-luma"]],
  [/heal|herbal/, ["marsh-herbal-mist", "lantern-keeper-sio"]],
  [/farm|forage/, ["elder-forager-nim", "gardener-sip"]],
  [/build|hauler|mason/, ["stone-hauler-mog", "bram-ironroot"]],
  [/stable|porter/, ["storm-porter-zee", "frost-porter-yul"]],
  [/hunt/, ["hunter-varek", "frost-scout-rin"]],
  [/tailor|cloth/, ["aurora-linn", "tessa-windmere"]],
  [/potter|gem|opal/, ["gemwright-opal"]],
  [/miller|survey/, ["stone-survey-lin"]],
  [/inn/, ["coast-innkeep-dor"]],
  [/acolyte/, ["celestial-acolyte-nova", "citadel-acolyte-ven"]],
  [/ranger|warden|scout/, ["fenn-quickbranch", "warden-sylvi", "frost-scout-rin"]],
  [/radiant|chancellor|curator/, ["chancellor-aurex", "curator-verin"]],
  [/void|shade|dusk/, ["veya-dusk", "shadecaller-neris", "keeper-null"]],
  [/storm|sky/, ["skywarden-ilya", "aeron-cloudstep"]],
  [/frost|ice/, ["jori-icebloom", "frost-scout-rin"]],
  [/tide|coral|moon/, ["luma-tidecrest", "finn-coralhand"]],
  [/ember|pyra|cinder/, ["warden-pyra", "cinder-sage-malrec"]],
  [/alloy|ferrum|tinker/, ["professor-ferrum", "tinker-pax"]],
  [/spirit|marsh|medium/, ["medium-amara", "lantern-keeper-sio"]],
  [/stone|petra|marshal/, ["petra-stoneveil", "marshal-korr"]],
  [/grove|moss|willow/, ["mosskeeper-elden", "warden-sylvi"]],
];

function pickPortrait(slug, portraits, used) {
  const trySlug = (s) => {
    if (!s || used.has(s)) return null;
    const hit = portraits.get(s);
    return hit || null;
  };

  let hit = trySlug(HERO_PORTRAIT_MAP[slug]);
  if (hit) return hit;

  // mira may live as mira-* 
  if (slug.includes("mira")) {
    for (const [s, p] of portraits) {
      if (/^mira/i.test(s) && !used.has(s)) return p;
    }
  }

  for (const [re, list] of ROLE_FALLBACKS) {
    if (!re.test(slug)) continue;
    for (const s of list) {
      hit = trySlug(s);
      if (hit) return hit;
    }
  }

  // last resort: unused portrait with role token overlap
  const tokens = slug.split(/-/).filter((t) => t.length > 3 && t !== "keeper" && t !== "npc");
  for (const [s, p] of portraits) {
    if (used.has(s)) continue;
    if (tokens.some((t) => s.includes(t))) return p;
  }

  // absolute last: any unused large portrait
  let best = null;
  for (const p of portraits.values()) {
    if (used.has(p.slug)) continue;
    if (!best || p.size > best.size) best = p;
  }
  return best;
}

async function installSubject(portraitDisk, outPng) {
  await sharp(portraitDisk)
    .resize(1024, 1024, { fit: "cover", position: "attention" })
    .png({ compressionLevel: 8 })
    .toFile(outPng);
}

async function main() {
  const portraits = collectPortraits();
  console.log(`Painted portraits indexed: ${portraits.size}`);

  const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
  const heroes = cards.filter((c) => c.type === "hero");
  fs.mkdirSync(SUBJECTS_DIR, { recursive: true });

  const used = new Set();
  const report = { installed: [], missing: [], skipped: [] };

  // Prefer named champions first so they keep their true faces
  const ordered = [...heroes].sort((a, b) => {
    const rank = (c) =>
      /elara|mira|brine|kael|solen/i.test(c.id) ? 0 : String(c.id).includes("-npc-npc-") ? 2 : 1;
    return rank(a) - rank(b);
  });

  for (const card of ordered) {
    const slug = subjectSlugFromCard(card);
    const portrait = pickPortrait(slug, portraits, used);
    if (!portrait) {
      report.missing.push({ id: card.id, slug, name: card.localization?.name });
      continue;
    }
    used.add(portrait.slug);

    const subjectOut = path.join(SUBJECTS_DIR, `${slug}.png`);
    await installSubject(portrait.disk, subjectOut);

    const publicSubject = `/assets/tcg/subjects/${slug}.png`;
    if (!card.art) card.art = {};
    card.art.assetPath = portrait.rel;
    card.art.subjectPath = publicSubject;
    card.art.cardImagePath = `/assets/tcg/cards/${card.id}.webp`;

    report.installed.push({
      id: card.id,
      slug,
      name: card.localization?.name,
      portrait: portrait.rel,
      subject: publicSubject,
      portraitBytes: portrait.size,
    });
    console.log(`OK ${card.id} <- ${portrait.slug}`);
  }

  fs.writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2) + "\n");
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(
    `\nInstalled ${report.installed.length}/${heroes.length} hero subjects. Missing: ${report.missing.length}`,
  );
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
