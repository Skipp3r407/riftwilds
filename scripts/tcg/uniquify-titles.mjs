/**
 * Ensure every species has a unique keeper title (affinity-aware suffixes).
 * Usage: node scripts/tcg/uniquify-titles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./content-sources.mjs";

const LORE_DIR = path.join(ROOT, "src/content/pets/lore");

const BASE_TITLES = {
  EMBER: ["Hearthback Wanderer", "Ashpath Guide", "Crater Rim Sentinel", "Cinderlane Scout", "Emberwake Softling", "Ashlane Companion"],
  TIDE: ["Tideglass Juggler", "Moonshoal Glider", "Brinepath Companion", "Surfcrest Softling", "Tidepool Attendant", "Foamcrest Scout"],
  GROVE: ["Rootlane Listener", "Thorntrail Trickster", "Mossveil Attendant", "Seedlight Guide", "Fernpath Softling", "Saplane Companion"],
  STORM: ["Spirewind Rider", "Skyfracture Scout", "Thunderledge Companion", "Kitecrest Runner", "Galeledge Softling", "Ozonepath Guide"],
  STONE: ["Fossilstep Guardian", "Canyon Quietpaw", "Bedrock Companion", "Shelfward Sentinel", "Gritlane Softling", "Stonepath Keeper"],
  FROST: ["Snowveil Softling", "Aurora Quietpaw", "Basin Softguard", "Powderprint Walker", "Rimepath Companion", "Frostledge Scout"],
  RADIANT: ["Prismcourt Attendant", "Dawnshaft Companion", "Citadel Softlight", "Sunlane Guide", "Halopath Softling", "Gleamcrest Keeper"],
  VOID: ["Hollowstep Echo", "Mistcorridor Wanderer", "Echo-Dust Softling", "Rifthush Scout", "Umbralpath Companion", "Nullridge Softling"],
  ALLOY: ["Scrapgarden Tinker", "Gearheart Protector", "Copperbloom Companion", "Ruinsmith Softguard", "Cogpath Softling", "Wirelane Guide"],
  SPIRIT: ["Lantern-Crest Companion", "Marshlight Keeper", "Dreamreed Guide", "Whisperpath Attendant", "Spiritbloom Softling", "Veilpath Scout"],
  CELESTIAL: ["Starthread Companion", "Riftveil Guide", "Astral Softling", "Celestine Attendant", "Nightshaft Softling", "Orbitpath Scout"],
};

const AFFINITY_SUFFIX = {
  EMBER: ["of Emberwake", "of Ashlanes", "of Cinder Rims", "of Hearth Softprint", "of Living Coal"],
  TIDE: ["of Tideglass", "of Brinepaths", "of Moonshoals", "of Foamcrests", "of Surf Softprint"],
  GROVE: ["of Rootlanes", "of Moss Veils", "of Seedlight", "of Fern Softprint", "of Saplanes"],
  STORM: ["of Spirewind", "of Skyfracture", "of Thunderledge", "of Gale Softprint", "of Kitecrests"],
  STONE: ["of Fossilsteps", "of Canyon Quiet", "of Shelfward Stone", "of Gritlanes", "of Bedrock Softprint"],
  FROST: ["of Powder Veils", "of Aurora Softprint", "of Basin Quiet", "of Rimepaths", "of Snow Softprint"],
  RADIANT: ["of Sunshafts", "of Dawn Softprint", "of Citadel Light", "of Prismcourts", "of Halopaths"],
  VOID: ["of Hollow Mist", "of Rifthush", "of Echo-Dust", "of Umbral Softprint", "of Nullridges"],
  ALLOY: ["of Copperbloom", "of Gearheart", "of Scrapgardens", "of Cog Softprint", "of Wirelanes"],
  SPIRIT: ["of Marshlight", "of Whisperpaths", "of Dreamreed", "of Lantern Crest", "of Spirit Softprint"],
  CELESTIAL: ["of Starthread", "of Riftveils", "of Astral Softprint", "of Nightshafts", "of Orbitpaths"],
};

function get(src, key) {
  const m = src.match(new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "m"));
  return m ? m[1].replace(/\\"/g, '"') : "";
}

function setField(src, key, value) {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return src.replace(
    new RegExp(`("${key}"\\s*:\\s*")((?:\\\\.|[^"\\\\])*)(")`),
    `$1${escaped}$3`,
  );
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Strip prior uniquify suffixes so we can reassign cleanly. */
function stripSuffix(title) {
  return title
    .replace(
      /\s+of (Emberwake|Ashlanes|Cinder Rims|Hearth Softprint|Living Coal|Tideglass|Brinepaths|Moonshoals|Foamcrests|Surf Softprint|Rootlanes|Moss Veils|Seedlight|Fern Softprint|Saplanes|Spirewind|Skyfracture|Thunderledge|Gale Softprint|Kitecrests|Fossilsteps|Canyon Quiet|Shelfward Stone|Gritlanes|Bedrock Softprint|Powder Veils|Aurora Softprint|Basin Quiet|Rimepaths|Snow Softprint|Sunshafts|Dawn Softprint|Citadel Light|Prismcourts|Halopaths|Hollow Mist|Rifthush|Echo-Dust|Umbral Softprint|Nullridges|Copperbloom|Gearheart|Scrapgardens|Cog Softprint|Wirelanes|Marshlight|Whisperpaths|Dreamreed|Lantern Crest|Spirit Softprint|Starthread|Riftveils|Astral Softprint|Nightshafts|Orbitpaths|the Rim|Soft Paths|Quiet Ledges|Hearthlines|Surfcrests|Cinderlanes)$/i,
      "",
    )
    .trim();
}

const files = fs
  .readdirSync(LORE_DIR)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts");

const entries = files.map((file) => {
  const src = fs.readFileSync(path.join(LORE_DIR, file), "utf8");
  const affinity = (get(src, "affinity") || "SPIRIT").toUpperCase();
  return {
    file,
    src,
    slug: get(src, "slug") || file.replace(/\.ts$/, ""),
    name: get(src, "name"),
    affinity,
    title: stripSuffix(get(src, "title")),
  };
});

const used = new Set();
let changed = 0;

for (const e of entries.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const bases = BASE_TITLES[e.affinity] || BASE_TITLES.SPIRIT;
  const suffixes = AFFINITY_SUFFIX[e.affinity] || AFFINITY_SUFFIX.SPIRIT;
  let next = null;

  // Prefer original stripped title if free.
  if (e.title && !used.has(e.title)) {
    next = e.title;
  } else {
    for (let i = 0; i < bases.length && !next; i++) {
      const candidate = bases[(hash(e.slug) + i) % bases.length];
      if (!used.has(candidate)) next = candidate;
    }
  }

  if (!next || used.has(next)) {
    const base = next || e.title || bases[hash(e.slug) % bases.length];
    for (let i = 0; i < suffixes.length; i++) {
      const candidate = `${stripSuffix(base)} ${suffixes[(hash(e.slug + "sfx") + i) % suffixes.length]}`;
      if (!used.has(candidate)) {
        next = candidate;
        break;
      }
    }
  }

  if (!next || used.has(next)) {
    next = `${e.name} of ${e.affinity.charAt(0)}${e.affinity.slice(1).toLowerCase()} Softprint`;
    let n = 2;
    while (used.has(next)) next = `${e.name} Softprint ${n++}`;
  }

  used.add(next);
  e.nextTitle = next;
}

for (const e of entries) {
  const current = get(e.src, "title");
  if (current === e.nextTitle) continue;
  const nextSrc = setField(e.src, "title", e.nextTitle);
  fs.writeFileSync(path.join(LORE_DIR, e.file), nextSrc, "utf8");
  changed++;
  console.log(`${e.slug}: ${current} -> ${e.nextTitle}`);
}

console.log("titles updated:", changed);
console.log("unique titles now:", used.size);
