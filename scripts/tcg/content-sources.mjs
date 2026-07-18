/**
 * Load Riftwilds world content for TCG generation (read-only).
 * Parses lore / item / region sources without importing TypeScript modules.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");

const AFFINITY_TO_ELEMENT = {
  EMBER: "fire",
  FIRE: "fire",
  TIDE: "water",
  WATER: "water",
  FROST: "water",
  ICE: "water",
  GROVE: "nature",
  NATURE: "nature",
  MOSS: "nature",
  STONE: "earth",
  EARTH: "earth",
  STORM: "storm",
  WIND: "storm",
  CRYSTAL: "crystal",
  SHADOW: "shadow",
  UMBRAL: "shadow",
  VOID: "void",
  LIGHT: "light",
  RADIANT: "light",
  DAWN: "light",
  SPIRIT: "spirit",
  ARCANE: "arcane",
  RIFT: "arcane",
  METAL: "metal",
  ALLOY: "metal",
  GEAR: "metal",
  CELESTIAL: "celestial",
  STAR: "celestial",
  POISON: "poison",
  TOXIC: "poison",
  NEUTRAL: "neutral",
  COMMON: "neutral",
};

const REGION_NAME_TO_ID = {
  "ember crater": "ember-crater",
  "moonwater coast": "moonwater-coast",
  "elderwood forest": "elderwood-forest",
  "stormspire peaks": "stormspire-peaks",
  "stoneheart canyon": "stoneheart-canyon",
  "frostveil basin": "frostveil-basin",
  "radiant citadel": "radiant-citadel",
  "void hollow": "void-hollow",
  "alloy ruins": "alloy-ruins",
  "spirit marsh": "spirit-marsh",
  "celestial rift": "celestial-rift",
  "riftwild commons": "riftwild-commons",
  "spirit realm": "spirit-realm",
};

export function affinityToElement(affinity) {
  if (!affinity || affinity === "null") return "neutral";
  const key = String(affinity).toUpperCase().replace(/[^A-Z_]/g, "");
  return AFFINITY_TO_ELEMENT[key] || "neutral";
}

export function regionNameToId(name) {
  if (!name) return "riftwild-commons";
  const key = String(name).trim().toLowerCase();
  if (REGION_NAME_TO_ID[key]) return REGION_NAME_TO_ID[key];
  return key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "riftwild-commons";
}

function firstString(src, keys) {
  for (const key of keys) {
    const m = src.match(new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "m"));
    if (m) return m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
  }
  return "";
}

/** Parse species lore modules under src/content/pets/lore (excludes index). */
export function loadSpeciesFromLore() {
  const dir = path.join(ROOT, "src/content/pets/lore");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
  const species = [];
  for (const file of files) {
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    const slug = firstString(src, ["slug"]) || file.replace(/\.ts$/, "");
    const name = firstString(src, ["name"]) || slug;
    const title = firstString(src, ["title"]);
    const shortBio = firstString(src, ["shortBio"]);
    const affinity = firstString(src, ["affinity"]) || "NEUTRAL";
    const nativeRegion = firstString(src, ["nativeRegion"]);
    const battleTendencies = firstString(src, ["battleTendencies"]);
    const evolvedStageBehavior = firstString(src, ["evolvedStageBehavior"]);
    const naturalTalentsMatch = src.match(/"naturalTalents"\s*:\s*\[([\s\S]*?)\]/);
    const talents = [];
    if (naturalTalentsMatch) {
      for (const tm of naturalTalentsMatch[1].matchAll(/"((?:\\\\.|[^"\\\\])*)"/g)) {
        talents.push(tm[1]);
      }
    }
    species.push({
      slug,
      name,
      title,
      shortBio,
      affinity,
      element: affinityToElement(affinity),
      regionId: regionNameToId(nativeRegion),
      nativeRegion,
      battleTendencies,
      evolvedStageBehavior,
      talents,
      hasEvolutionStub: Boolean(evolvedStageBehavior && evolvedStageBehavior.length > 20),
    });
  }
  species.sort((a, b) => a.slug.localeCompare(b.slug));
  return species;
}

/** Full region packs (authored) + spirit-realm instance. */
export function loadRegions() {
  const dir = path.join(ROOT, "src/content/regions/packs");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "scaffold.ts");
  const regions = [];
  for (const file of files) {
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    const regionId = (src.match(/regionId:\s*"([^"]+)"/) || [])[1];
    const regionName = (src.match(/regionName:\s*"([^"]+)"/) || [])[1];
    const blurb = (src.match(/blurb:\s*\n?\s*"((?:\\.|[^"\\])*)"/) || [])[1] || "";
    if (!regionId || !regionName) continue;
    const elementGuess =
      /ember|ash|forge/i.test(regionId)
        ? "fire"
        : /moonwater|tide|azure/i.test(regionId)
          ? "water"
          : /elderwood|grove/i.test(regionId)
            ? "nature"
            : /storm/i.test(regionId)
              ? "storm"
              : /stoneheart|canyon/i.test(regionId)
                ? "earth"
                : /frost/i.test(regionId)
                  ? "water"
                  : /radiant|citadel/i.test(regionId)
                    ? "light"
                    : /void/i.test(regionId)
                      ? "void"
                      : /alloy/i.test(regionId)
                        ? "metal"
                        : /spirit/i.test(regionId)
                          ? "spirit"
                          : /celestial/i.test(regionId)
                            ? "celestial"
                            : "neutral";
    regions.push({
      regionId,
      regionName,
      blurb: blurb.replace(/\\n/g, " "),
      element: elementGuess,
    });
  }
  return regions;
}

/**
 * Parse catalog item blocks from w({...}) / p({...}) / a({...}) style exports.
 * Returns { id, name, rarity, affinity, description, family, effect? }.
 */
export function loadCatalogItems(relativeFile, family) {
  const file = path.join(ROOT, relativeFile);
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, "utf8");
  const items = [];
  const blockRe = /\b(?:w|p|a|m)\(\s*\{([\s\S]*?)\}\s*\)/g;
  let m;
  while ((m = blockRe.exec(src))) {
    const block = m[1];
    const id = (block.match(/\bid:\s*"([^"]+)"/) || [])[1];
    const name = (block.match(/\bname:\s*"([^"]+)"/) || [])[1];
    if (!id || !name) continue;
    const rarity = ((block.match(/\brarity:\s*"([^"]+)"/) || [])[1] || "COMMON").toLowerCase();
    const affinityRaw = (block.match(/\baffinity:\s*("([^"]+)"|null)/) || [])[2] || null;
    const description = (block.match(/\bdescription:\s*"((?:\\.|[^"\\])*)"/) || [])[1] || "";
    const effect = (block.match(/\beffect:\s*"((?:\\.|[^"\\])*)"/) || [])[1] || "";
    items.push({
      id,
      name,
      rarity,
      affinity: affinityRaw,
      element: affinityToElement(affinityRaw),
      description: description.replace(/\\"/g, '"'),
      effect: effect.replace(/\\"/g, '"'),
      family,
    });
  }
  return items;
}

/** Materials use `rows: Array<[id, name, rarity, description]>`. */
export function loadMaterialsCatalog() {
  const file = path.join(ROOT, "src/lib/items/catalog/materials.ts");
  const src = fs.readFileSync(file, "utf8");
  const items = [];
  for (const m of src.matchAll(/\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"((?:\\.|[^"\\])*)"\]/g)) {
    items.push({
      id: m[1],
      name: m[2],
      rarity: m[3].toLowerCase(),
      affinity: null,
      element: affinityToElement(m[1].split("-")[0]),
      description: m[4].replace(/\\"/g, '"'),
      effect: "",
      family: "MATERIAL",
    });
  }
  return items;
}

/** Abilities are inline object literals in an array. */
export function loadAbilitiesCatalog() {
  const file = path.join(ROOT, "src/lib/items/catalog/abilities.ts");
  const src = fs.readFileSync(file, "utf8");
  const items = [];
  for (const m of src.matchAll(
    /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*description:\s*"((?:\\.|[^"\\])*)",\s*affinity:\s*("([^"]+)"|null)/g,
  )) {
    const affinityRaw = m[5] || null;
    const rarityMatch = src.slice(m.index, m.index + 400).match(/rarity:\s*"([^"]+)"/);
    items.push({
      id: m[1],
      name: m[2],
      rarity: (rarityMatch?.[1] || "COMMON").toLowerCase(),
      affinity: affinityRaw,
      element: affinityToElement(affinityRaw),
      description: m[3].replace(/\\"/g, '"'),
      effect: m[3].replace(/\\"/g, '"'),
      family: "ABILITY",
    });
  }
  return items;
}

export function loadAllCatalogItems() {
  return {
    weapons: loadCatalogItems("src/lib/items/catalog/weapons.ts", "WEAPON"),
    armor: loadCatalogItems("src/lib/items/catalog/armor.ts", "ARMOR"),
    potions: loadCatalogItems("src/lib/items/catalog/potions.ts", "POTION"),
    materials: loadMaterialsCatalog(),
    abilities: loadAbilitiesCatalog(),
  };
}

export function loadGameLibrary() {
  const file = path.join(ROOT, "src/content/assets/game-library.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const byCategory = {};
  for (const e of data.entries || []) {
    if (!byCategory[e.category]) byCategory[e.category] = [];
    byCategory[e.category].push(e);
  }
  return { entries: data.entries || [], byCategory };
}

/** Prefer pet thumbs/portraits; fall back to library riftling/item art when present. */
export function resolvePetAssetPath(slug, library) {
  const candidates = [
    `/assets/pets/thumbs/${slug}.webp`,
    `/assets/pets/thumbs/${slug}.png`,
    `/assets/pets/${slug}.webp`,
    `/assets/pets/${slug}.png`,
    `/assets/pets/${slug}.svg`,
    `/assets/pets/${slug}-portrait.svg`,
    `/assets/pets/${slug}-icon.svg`,
  ];
  for (const rel of candidates) {
    if (fs.existsSync(path.join(ROOT, "public", rel.replace(/^\//, "")))) {
      return { assetPath: rel, libraryAssetId: null };
    }
  }
  const riftlings = library?.byCategory?.riftlings || [];
  const hit = riftlings.find(
    (e) =>
      e.variant?.type === slug ||
      e.id.includes(slug) ||
      (e.tags || []).includes(slug) ||
      (e.label || "").toLowerCase().includes(slug),
  );
  if (hit?.path) {
    return { assetPath: hit.path, libraryAssetId: hit.id };
  }
  return { assetPath: null, libraryAssetId: null };
}

export function resolveItemAssetPath(item, library) {
  const familyDir =
    item.family === "WEAPON"
      ? "weapons"
      : item.family === "ARMOR"
        ? "armor"
        : item.family === "POTION"
          ? "potions"
          : item.family === "MATERIAL"
            ? "materials"
            : "abilities";
  const candidates = [
    `/assets/items/${familyDir}/icons/${item.id}.png`,
    `/assets/items/${familyDir}/icons/${item.id}.webp`,
    `/assets/items/${familyDir}/${item.id}.png`,
  ];
  for (const rel of candidates) {
    if (fs.existsSync(path.join(ROOT, "public", rel.replace(/^\//, "")))) {
      return { assetPath: rel, libraryAssetId: null };
    }
  }
  const pool = [
    ...(library?.byCategory?.items || []),
    ...(library?.byCategory?.equipment || []),
  ];
  const needle = item.id.split("-")[0];
  const hit =
    pool.find((e) => e.id.includes(item.id) || (e.tags || []).includes(item.id)) ||
    pool.find((e) => e.id.includes(needle)) ||
    pool[Math.abs(hash(item.id)) % Math.max(1, pool.length)];
  if (hit?.path) {
    return { assetPath: hit.path, libraryAssetId: hit.id };
  }
  return { assetPath: null, libraryAssetId: null };
}

export function resolveLibraryAsset(entry) {
  if (!entry?.path) return { assetPath: null, libraryAssetId: null };
  const disk = path.join(ROOT, "public", entry.path.replace(/^\//, ""));
  if (fs.existsSync(disk)) {
    return { assetPath: entry.path, libraryAssetId: entry.id };
  }
  return { assetPath: entry.path, libraryAssetId: entry.id };
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export function itemRarityToTcg(rarity) {
  const r = String(rarity || "common").toLowerCase();
  if (r === "mythic" || r === "celestial") return "mythic";
  if (r === "legendary") return "legendary";
  if (r === "epic" || r === "rare") return r === "epic" ? "epic" : "rare";
  if (r === "uncommon") return "uncommon";
  return "common";
}
