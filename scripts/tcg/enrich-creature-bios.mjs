/**
 * Rewrite generic template shortBios into unique species-complete blurbs,
 * fix diet grammar, diversify socialBehavior, and sync card flavorText.
 *
 * Usage: node scripts/tcg/enrich-creature-bios.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./content-sources.mjs";

const LORE_DIR = path.join(ROOT, "src/content/pets/lore");
const DATA = path.join(ROOT, "src/content/tcg/data");
const CARDS_PATH = path.join(DATA, "cards.json");
const BUNDLE_PATH = path.join(DATA, "bundle.json");
const FAMILIES_PATH = path.join(DATA, "card-families.json");

function firstString(src, key) {
  const m = src.match(new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "m"));
  return m ? m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : "";
}

function firstArray(src, key) {
  const m = src.match(new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`));
  if (!m) return [];
  const out = [];
  for (const tm of m[1].matchAll(/"((?:\\\\.|[^"\\\\])*)"/g)) {
    out.push(tm[1].replace(/\\"/g, '"'));
  }
  return out;
}

function replaceField(src, key, value) {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
  const re = new RegExp(`("${key}"\\s*:\\s*")((?:\\\\.|[^"\\\\])*)(")`);
  if (!re.test(src)) {
    throw new Error(`Field ${key} not found`);
  }
  return src.replace(re, `$1${escaped}$3`);
}

function endsComplete(text) {
  const t = (text || "").trim();
  return t.length > 0 && /[.!?]"?$/.test(t);
}

function isGenericShortBio(text) {
  return /quiet talent for reading unstable air|soft routines|Often mistaken for simple/i.test(
    text || "",
  );
}

function hashPick(seed, arr) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

function fixDiet(diet, food) {
  let d = (diet || "").trim();
  if (!d) {
    return `Omnivorous, leaning toward ${food} and affinity-compatible forage.`;
  }
  d = d
    .replace(/^Omnivorous lean toward/i, "Omnivorous, leaning toward")
    .replace(/^Herbivorous lean toward/i, "Herbivorous, leaning toward")
    .replace(/^Carnivorous lean toward/i, "Carnivorous, leaning toward")
    .replace(/^Insectivorous lean toward/i, "Insectivorous, leaning toward");
  if (!endsComplete(d)) d = d.replace(/[.]*$/, "") + ".";
  return d;
}

function buildSocial(slug, temperament, affinity) {
  const templates = [
    `Bonds in small trusted circles; weighs strangers by scent, posture, and whether a keeper’s voice stays kind.`,
    `Greets familiar keepers first, then tests newcomers with cautious curiosity before committing.`,
    `Stays close to hearthmates and uses soft ${affinity.toLowerCase()} cues to signal comfort or warning.`,
    `Prefers cooperative loops over rigid packs; a ${temperament.toLowerCase()} streak becomes the group’s emotional center.`,
    `Shares forage and rest sites with allies, but withdraws when voices turn sharp or hurried.`,
    `Reads the room before joining play; once trust settles, loyalty runs deep and quiet.`,
  ];
  return hashPick(slug + "-social", templates);
}

function buildShortBio(fields) {
  const {
    slug,
    name,
    pluralName,
    title,
    nativeRegion,
    affinity,
    movementStyle,
    temperament,
    talent,
    food,
    signatureSound,
    signatureScent,
    naturalBehavior,
    battleTendencies,
  } = fields;

  const move = movementStyle || "nimble and place-wise";
  const temper = temperament || "watchful";
  const foodName = food || `${affinity} forage`;
  const sound = signatureSound || "a soft affinity chime";
  const scent = signatureScent || `${affinity.toLowerCase()} weather`;

  // Pull a short unique clause from naturalBehavior without the "Typically" opener.
  let habit = (naturalBehavior || "")
    .replace(/^Typically\s+/i, "")
    .replace(/\.$/, "")
    .trim();
  if (habit.length > 110) {
    // Prefer whole comma clauses; never cut mid-word.
    const parts = habit.split(",").map((p) => p.trim()).filter(Boolean);
    let built = "";
    for (const part of parts) {
      const next = built ? `${built}, ${part}` : part;
      if (next.length > 110) break;
      built = next;
    }
    habit = built || parts[0] || habit;
    // Soft word-boundary fallback if still too long.
    if (habit.length > 110) {
      const words = habit.split(/\s+/);
      habit = "";
      for (const w of words) {
        const next = habit ? `${habit} ${w}` : w;
        if (next.length > 110) break;
        habit = next;
      }
    }
  }

  const closers = [
    `Keepers know them by ${sound} and the scent of ${scent}.`,
    `In ${nativeRegion}, they favor ${foodName} and teach quieter routes to those who listen.`,
    `Battle habits lean ${battleTendencies.toLowerCase()}, but day-to-day life is still about place and trust.`,
    `Their ${talent.toLowerCase()} talent shows first as caretaking, not combat.`,
  ];
  const closer = hashPick(slug + "-close", closers);

  const habitSentence = habit
    ? /^(they|it|wild|prefer|bond|greet|reads|shares|stays)\b/i.test(habit)
      ? `${habit.charAt(0).toUpperCase()}${habit.slice(1)}.`
      : `In the wild they stay ${habit.charAt(0).toLowerCase()}${habit.slice(1)}.`
    : `${pluralName} stay attentive to micro-changes in their home ground.`;

  const variants = [
    `${pluralName} of ${nativeRegion}, titled “${title},” are ${temper.toLowerCase()} ${affinity.toLowerCase()}-touched Riftlings—${move}. ${habitSentence} Favorites include ${foodName}. ${closer}`,
    `Known as the “${title},” ${name} belongs to ${nativeRegion}’s living edges. ${pluralName} move ${move}, stay ${temper.toLowerCase()} with strangers, and lean on ${talent.toLowerCase()} when the air turns strange. They savor ${foodName}. ${closer}`,
    `${pluralName} carry the “${title}” name among keepers of ${nativeRegion}. ${habitSentence} They eat ${foodName} eagerly and answer honest invitations faster than forced bonds. ${closer}`,
  ];

  let bio = hashPick(slug + "-bio", variants).replace(/\s+/g, " ").trim();
  if (!endsComplete(bio)) bio += ".";
  return bio;
}

const files = fs
  .readdirSync(LORE_DIR)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts");

let shortBioFixed = 0;
let dietFixed = 0;
let socialFixed = 0;
const bySlug = new Map();

for (const file of files) {
  let src = fs.readFileSync(path.join(LORE_DIR, file), "utf8");
  const slug = firstString(src, "slug") || file.replace(/\.ts$/, "");
  const name = firstString(src, "name") || slug;
  const pluralName = firstString(src, "pluralName") || `${name}s`;
  const title = firstString(src, "title") || name;
  const nativeRegion = firstString(src, "nativeRegion") || "Riftwild Commons";
  const affinity = firstString(src, "affinity") || "SPIRIT";
  const movementStyle = firstString(src, "movementStyle");
  const naturalBehavior = firstString(src, "naturalBehavior");
  const battleTendencies = firstString(src, "battleTendencies") || "protective bursts";
  const signatureSound = firstString(src, "signatureSound");
  const signatureScent = firstString(src, "signatureScent");
  const foods = firstArray(src, "favoriteFoods");
  const traits = firstArray(src, "commonPersonalityTendencies");
  const talents = firstArray(src, "naturalTalents");
  const food = foods[0] || `${affinity} forage`;
  const temperament = traits[0] || "Watchful";
  const talent = talents[0] || "scouting";

  const oldShort = firstString(src, "shortBio");
  const oldDiet = firstString(src, "diet");
  const oldSocial = firstString(src, "socialBehavior");

  const newShort = buildShortBio({
    slug,
    name,
    pluralName,
    title,
    nativeRegion,
    affinity,
    movementStyle,
    temperament,
    talent,
    food,
    signatureSound,
    signatureScent,
    naturalBehavior,
    battleTendencies,
  });
  const newDiet = fixDiet(oldDiet, food);
  const newSocial =
    /Prefers small trusted circles; assesses strangers by scent, posture, and keeper tone/i.test(
      oldSocial,
    )
      ? buildSocial(slug, temperament, affinity)
      : oldSocial || buildSocial(slug, temperament, affinity);

  if (newShort !== oldShort) {
    src = replaceField(src, "shortBio", newShort);
    shortBioFixed++;
  }
  if (newDiet !== oldDiet) {
    src = replaceField(src, "diet", newDiet);
    dietFixed++;
  }
  if (newSocial !== oldSocial) {
    src = replaceField(src, "socialBehavior", newSocial);
    socialFixed++;
  }

  fs.writeFileSync(path.join(LORE_DIR, file), src, "utf8");
  bySlug.set(slug, { shortBio: firstString(src, "shortBio") || newShort });
}

function syncCardList(cards, label) {
  let n = 0;
  for (const card of cards) {
    if (card.type !== "creature") continue;
    const slug = card.riftlingSlug;
    const next = slug ? bySlug.get(slug)?.shortBio : null;
    if (!next || !endsComplete(next)) continue;
    // Skip companion/evo stubs with intentional short lines unless they still use truncated/generic mainline text.
    const flavor = card.localization?.flavorText || "";
    const isMainCreature = /^rotr-c-/.test(card.id);
    if (!isMainCreature) continue;
    if (flavor !== next) {
      card.localization.flavorText = next;
      n++;
    }
  }
  console.log(`${label} flavor synced:`, n);
  return n;
}

const cards = JSON.parse(fs.readFileSync(CARDS_PATH, "utf8"));
syncCardList(cards, "cards.json");
fs.writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2) + "\n", "utf8");

if (fs.existsSync(BUNDLE_PATH)) {
  const bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, "utf8"));
  if (Array.isArray(bundle.cards)) {
    syncCardList(bundle.cards, "bundle.json");
    fs.writeFileSync(BUNDLE_PATH, JSON.stringify(bundle, null, 2) + "\n", "utf8");
  }
}

let familyN = 0;
if (fs.existsSync(FAMILIES_PATH)) {
  const familyBundle = JSON.parse(fs.readFileSync(FAMILIES_PATH, "utf8"));
  const families = Array.isArray(familyBundle)
    ? familyBundle
    : familyBundle.families || [];
  for (const fam of families) {
    const slug = fam.speciesSlug || fam.riftlingSlug || fam.slug;
    const next = slug ? bySlug.get(slug)?.shortBio : null;
    if (!next) continue;
    for (const stage of fam.stages || []) {
      if (!stage.cardId?.startsWith("rotr-c-")) continue;
      if (isGenericShortBio(stage.flavorText) || stage.flavorText !== next) {
        stage.flavorText = next;
        familyN++;
      }
    }
  }
  fs.writeFileSync(FAMILIES_PATH, JSON.stringify(familyBundle, null, 2) + "\n", "utf8");
}

const stillGeneric = [];
for (const file of files) {
  const src = fs.readFileSync(path.join(LORE_DIR, file), "utf8");
  const slug = firstString(src, "slug") || file.replace(/\.ts$/, "");
  if (isGenericShortBio(firstString(src, "shortBio"))) stillGeneric.push(slug);
}

console.log("shortBios rewritten:", shortBioFixed);
console.log("diets fixed:", dietFixed);
console.log("socialBehavior diversified:", socialFixed);
console.log("card-families stages synced:", familyN);
console.log("still generic shortBios:", stillGeneric.length, stillGeneric.slice(0, 10).join(", "));
console.log("sample pyrespore:", bySlug.get("pyrespore")?.shortBio);
console.log("sample lavaling:", bySlug.get("lavaling")?.shortBio);
