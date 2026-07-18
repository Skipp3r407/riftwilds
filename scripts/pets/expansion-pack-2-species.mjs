/**
 * Wave-2 Riftling expansion: 50 original species.
 * Run: node scripts/pets/expansion-pack-2-species.mjs
 * Then: node scripts/generate-species-kits.mjs
 * Then: npx tsx scripts/pets/generate-species-lore.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

/** @type {Array<[string, string, string, string, string, string, string, string, string?, string?]>} */
export const EXPANSION_SPECIES = [
  // slug, name, affinity, bodyType, temperament, habitat, food, description, rarityBias?, size?
  ["slagpup", "Slagpup", "EMBER", "QUADRUPED", "Brave", "Ember Crater", "Emberberry", "Molten-pawed pup that cools into tough slag.", "COMMON"],
  ["pyrespore", "Pyrespore", "EMBER", "PLANT_BODIED", "Curious", "Ember Crater", "Emberberry", "Spore bloom that sheds warm ember pollen.", "UNCOMMON"],
  ["cinderquill", "Cinderquill", "EMBER", "AVIAN", "Independent", "Ember Crater", "Emberberry", "Ash-plumed quillbird of crater rim thermals.", "RARE"],
  ["lavaling", "Lavaling", "EMBER", "AMORPHOUS", "Playful", "Ember Crater", "Emberberry", "Soft lava blob that hardens when startled.", "COMMON"],
  ["furnacebeetle", "Furnacebeetle", "EMBER", "INSECTOID", "Protective", "Ember Crater", "Emberberry", "Heat-chambered beetle that vents forge-warm air.", "UNCOMMON"],

  ["brinepaw", "Brinepaw", "TIDE", "QUADRUPED", "Social", "Moonwater Coast", "Moonvine", "Salt-whiskered coastal prowler with wet prints.", "COMMON"],
  ["kelpwisp", "Kelpwisp", "TIDE", "FLOATING", "Gentle", "Moonwater Coast", "Moonvine", "Hovering kelp ribbon that tastes of moonfoam.", "COMMON"],
  ["sprayfin", "Sprayfin", "TIDE", "AQUATIC", "Energetic", "Moonwater Coast", "Moonvine", "Surf-skimming finner that leaps through spray.", "UNCOMMON"],
  ["pearlurk", "Pearlurk", "TIDE", "AQUATIC", "Shy", "Moonwater Coast", "Moonvine", "Shell-lurking pearl guardian of tide caves.", "RARE"],
  ["tidequill", "Tidequill", "TIDE", "AVIAN", "Curious", "Moonwater Coast", "Moonvine", "Shorebird with ink-dark tide-patterned plumage.", "COMMON"],

  ["fernfox", "Fernfox", "GROVE", "QUADRUPED", "Mischievous", "Elderwood Forest", "Groveleaf", "Fern-tailed fox that vanishes into understory.", "COMMON"],
  ["saplingo", "Saplingo", "GROVE", "BIPED", "Gentle", "Elderwood Forest", "Groveleaf", "Upright sapling companion with sticky leaf hands.", "COMMON"],
  ["vinepup", "Vinepup", "GROVE", "QUADRUPED", "Playful", "Elderwood Forest", "Groveleaf", "Vine-wrapped pup that braids trails as it runs.", "UNCOMMON"],
  ["thornling", "Thornling", "GROVE", "PLANT_BODIED", "Protective", "Elderwood Forest", "Groveleaf", "Spined seedling that softens for trusted keepers.", "RARE"],
  ["mossdrake", "Mossdrake", "GROVE", "SERPENTINE", "Calm", "Elderwood Forest", "Groveleaf", "Low serpentine draped in living moss armor.", "EPIC"],

  ["galekit", "Galekit", "STORM", "QUADRUPED", "Energetic", "Stormspire Peaks", "Stormbud", "Wind-ruffed kit that chases cloud shadows.", "COMMON"],
  ["cloudleaper", "Cloudleaper", "STORM", "BIPED", "Brave", "Stormspire Peaks", "Stormbud", "Spring-legged peak hopper that rides updrafts.", "UNCOMMON"],
  ["sparkmoth", "Sparkmoth", "STORM", "INSECTOID", "Curious", "Stormspire Peaks", "Stormbud", "Tiny moth whose dust crackles like dry lightning.", "COMMON"],
  ["windrift", "Windrift", "STORM", "FLOATING", "Independent", "Stormspire Peaks", "Stormbud", "Ribbon-bodied floater that steers on gusts alone.", "RARE"],
  ["thunderpaw", "Thunderpaw", "STORM", "QUADRUPED", "Brave", "Stormspire Peaks", "Stormbud", "Heavy-pawed ridge runner with booming steps.", "UNCOMMON"],

  ["shalehorn", "Shalehorn", "STONE", "QUADRUPED", "Protective", "Stoneheart Canyon", "Stonefruit", "Layered shale horns scrape sparks from canyon walls.", "COMMON"],
  ["gritling", "Gritling", "STONE", "STONE_BODIED", "Sleepy", "Stoneheart Canyon", "Stonefruit", "Grit-bodied pebblekin that naps in dust bowls.", "COMMON"],
  ["basaltpup", "Basaltpup", "STONE", "QUADRUPED", "Calm", "Stoneheart Canyon", "Stonefruit", "Columnar basalt pup with cool volcanic plates.", "UNCOMMON"],
  ["crystowl", "Crystowl", "STONE", "AVIAN", "Independent", "Stoneheart Canyon", "Stonefruit", "Crystal-eyed canyon owl that roosts on geodes.", "RARE"],
  ["rubblefin", "Rubblefin", "STONE", "AQUATIC", "Curious", "Stoneheart Canyon", "Stonefruit", "Stone-stream swimmer with gravel-scaled fins.", "COMMON"],

  ["glazehare", "Glazehare", "FROST", "QUADRUPED", "Shy", "Frostveil Basin", "Frostroot", "Ice-glazed hare that leaves glass-thin trails.", "COMMON"],
  ["rimewing", "Rimewing", "FROST", "AVIAN", "Calm", "Frostveil Basin", "Frostroot", "Frost-rimmed wing that sings in thin cold air.", "UNCOMMON"],
  ["iciclepup", "Iciclepup", "FROST", "QUADRUPED", "Playful", "Frostveil Basin", "Frostroot", "Icicle-whiskered pup that chews soft snow.", "COMMON"],
  ["snowglyph", "Snowglyph", "FROST", "SPIRIT_BODIED", "Curious", "Frostveil Basin", "Frostroot", "Snow-script spirit that writes fading runes.", "RARE"],
  ["frostbloom", "Frostbloom", "FROST", "PLANT_BODIED", "Gentle", "Frostveil Basin", "Frostroot", "Ice-petaled bloom that opens only at blue dusk.", "UNCOMMON"],

  ["dawnkit", "Dawnkit", "RADIANT", "QUADRUPED", "Social", "Radiant Citadel", "Radiant Lily", "Sunrise-furred kit that warms cold stone floors.", "COMMON"],
  ["prismoth", "Prismoth", "RADIANT", "INSECTOID", "Playful", "Radiant Citadel", "Radiant Lily", "Facet-wing moth that scatters soft prism dust.", "COMMON"],
  ["solfinch", "Solfinch", "RADIANT", "AVIAN", "Energetic", "Radiant Citadel", "Radiant Lily", "Sunbeam finch nesting in citadel lattice light.", "UNCOMMON"],
  ["gleamhare", "Gleamhare", "RADIANT", "QUADRUPED", "Mischievous", "Radiant Citadel", "Radiant Lily", "Gleaming hare that blinks bright when startled.", "RARE"],
  ["lightspire", "Lightspire", "RADIANT", "FLOATING", "Calm", "Radiant Citadel", "Radiant Lily", "Spire of condensed dawnlight with a gentle pulse.", "EPIC"],

  ["umbralisk", "Umbralisk", "VOID", "SERPENTINE", "Independent", "Void Hollow", "Voidcap", "Shadow-coil serpent that drinks dim corridor light.", "UNCOMMON"],
  ["duskling", "Duskling", "VOID", "FLOATING", "Shy", "Void Hollow", "Voidcap", "Dusk orb that dims lanterns when nervous.", "COMMON"],
  ["nullpaw", "Nullpaw", "VOID", "QUADRUPED", "Curious", "Void Hollow", "Voidcap", "Soft-pawed voidling that erases its own footprints.", "COMMON"],
  ["echofig", "Echofig", "VOID", "PLANT_BODIED", "Sleepy", "Void Hollow", "Voidcap", "Fig-shaped hollow plant that whispers back sounds.", "RARE"],
  ["shadowmire", "Shadowmire", "VOID", "AMORPHOUS", "Protective", "Void Hollow", "Voidcap", "Living mire of night that shelters lost pets.", "LEGENDARY"],

  ["boltgear", "Boltgear", "ALLOY", "MECHANICAL_ORGANIC", "Energetic", "Alloy Ruins", "Alloy Moss", "Bolt-hearted gearling that spins when excited.", "COMMON"],
  ["scrapowl", "Scrapowl", "ALLOY", "AVIAN", "Curious", "Alloy Ruins", "Alloy Moss", "Copper-feather owl nesting in scrap rafters.", "UNCOMMON"],
  ["copperfin", "Copperfin", "ALLOY", "AQUATIC", "Calm", "Alloy Ruins", "Alloy Moss", "Cooling-channel swimmer with copper scale plates.", "COMMON"],
  ["wirefox", "Wirefox", "ALLOY", "QUADRUPED", "Mischievous", "Alloy Ruins", "Alloy Moss", "Wire-tailed fox that rewires shiny refuse into toys.", "RARE"],
  ["chronobeetle", "Chronobeetle", "ALLOY", "INSECTOID", "Protective", "Alloy Ruins", "Alloy Moss", "Clock-shelled beetle that ticks in sync with ruins.", "EPIC"],

  ["ghostbloom", "Ghostbloom", "SPIRIT", "PLANT_BODIED", "Gentle", "Spirit Marsh", "Spirit Bloom", "Pale marsh bloom that glows when keepers sing.", "COMMON"],
  ["dreamhare", "Dreamhare", "SPIRIT", "QUADRUPED", "Sleepy", "Spirit Marsh", "Spirit Bloom", "Soft hare that naps across thin dream borders.", "UNCOMMON"],
  ["wispdeer", "Wispdeer", "SPIRIT", "QUADRUPED", "Shy", "Spirit Marsh", "Spirit Bloom", "Antlered wisp-deer leaving lantern-light prints.", "RARE"],
  ["soulmoth", "Soulmoth", "SPIRIT", "INSECTOID", "Curious", "Spirit Marsh", "Spirit Bloom", "Soul-dust moth that follows honest promises.", "COMMON"],
  ["starveil", "Starveil", "SPIRIT", "FLOATING", "Calm", "Celestial Rift", "Spirit Bloom", "Veil of starlit silk from the Celestial Rift edge.", "CELESTIAL", "MEDIUM"],
];

function catalogLine(row) {
  const [slug, name, affinity, bodyType, temperament, habitat, food, description, rarityBias = "COMMON", size] = row;
  const desc = JSON.stringify(description);
  if (size) {
    return `  s(${JSON.stringify(slug)}, ${JSON.stringify(name)}, ${JSON.stringify(affinity)}, ${JSON.stringify(bodyType)}, ${JSON.stringify(temperament)}, ${JSON.stringify(habitat)}, ${JSON.stringify(food)}, ${desc}, ${JSON.stringify(rarityBias)}, ${JSON.stringify(size)}),`;
  }
  if (rarityBias !== "COMMON") {
    return `  s(${JSON.stringify(slug)}, ${JSON.stringify(name)}, ${JSON.stringify(affinity)}, ${JSON.stringify(bodyType)}, ${JSON.stringify(temperament)}, ${JSON.stringify(habitat)}, ${JSON.stringify(food)}, ${desc}, ${JSON.stringify(rarityBias)}),`;
  }
  return `  s(${JSON.stringify(slug)}, ${JSON.stringify(name)}, ${JSON.stringify(affinity)}, ${JSON.stringify(bodyType)}, ${JSON.stringify(temperament)}, ${JSON.stringify(habitat)}, ${JSON.stringify(food)}, ${desc}),`;
}

function kitRow(row) {
  const [slug, , affinity, , temperament, , , description] = row;
  const short = description.split(/[.,]/)[0] ?? description;
  return `  [${JSON.stringify(slug)}, ${JSON.stringify(affinity)}, ${JSON.stringify(temperament)}, ${JSON.stringify(short)}],`;
}

function main() {
  const catalogPath = path.join(root, "src/game/creatures/species-catalog.ts");
  let catalog = fs.readFileSync(catalogPath, "utf8");
  const marker = '  s("celestora", "Celestora", "RADIANT", "FLOATING", "Calm", "Celestial Rift", "Radiant Lily", "Endgame rift floater of starlight silk.", "CELESTIAL", "MEDIUM"),\n];';
  if (!catalog.includes(marker)) {
    throw new Error("Could not find celestora catalog marker — catalog already patched?");
  }
  if (catalog.includes('"slagpup"') || catalog.includes("slagpup")) {
    console.log("Catalog already contains expansion species; skipping catalog patch.");
  } else {
    const insert = EXPANSION_SPECIES.map(catalogLine).join("\n");
    catalog = catalog.replace(
      marker,
      `  s("celestora", "Celestora", "RADIANT", "FLOATING", "Calm", "Celestial Rift", "Radiant Lily", "Endgame rift floater of starlight silk.", "CELESTIAL", "MEDIUM"),\n  // --- Wave-2 expansion (50) ---\n${insert}\n];`,
    );
    fs.writeFileSync(catalogPath, catalog);
    console.log(`Patched catalog with ${EXPANSION_SPECIES.length} species -> ${catalogPath}`);
  }

  const kitsGenPath = path.join(root, "scripts/generate-species-kits.mjs");
  let kitsGen = fs.readFileSync(kitsGenPath, "utf8");
  if (kitsGen.includes('["slagpup"')) {
    console.log("Kit generator already lists expansion species; skipping.");
  } else {
    const kitInsert = EXPANSION_SPECIES.map(kitRow).join("\n");
    kitsGen = kitsGen.replace(
      '  ["celestora", "RADIANT", "Calm", "Starlight silk floater"],\n];',
      `  ["celestora", "RADIANT", "Calm", "Starlight silk floater"],\n  // Wave-2 expansion\n${kitInsert}\n];`,
    );
    fs.writeFileSync(kitsGenPath, kitsGen);
    console.log(`Patched kit generator with ${EXPANSION_SPECIES.length} rows.`);
  }

  const listPath = path.join(root, "scripts/pets/expansion-pack-2-slugs.json");
  fs.writeFileSync(
    listPath,
    JSON.stringify(
      EXPANSION_SPECIES.map((r) => ({
        slug: r[0],
        name: r[1],
        affinity: r[2],
        bodyType: r[3],
        habitat: r[5],
        rarityBias: r[8] ?? "COMMON",
        description: r[7],
      })),
      null,
      2,
    ),
  );
  console.log(`Wrote slug list -> ${listPath}`);
}

main();
