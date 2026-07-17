/**
 * Generates 30+ original Riftling weapon art prompt markdown files.
 * Run: npx tsx scripts/assets/generate-weapon-prompts.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

type WeaponPrompt = {
  slug: string;
  name: string;
  weaponClass: string;
  anatomy: string;
  affinity: string;
  shape: string;
  materials: string;
  attachment: string;
  palette: string;
  magic: string;
  anim: string;
};

const weapons: WeaponPrompt[] = [
  {
    slug: "ember-talons",
    name: "Ember Talons",
    weaponClass: "Claw",
    anatomy: "quadruped / biped front paws",
    affinity: "Ember",
    shape: "curved claw caps with ember vents",
    materials: "obsidian keratin, cooled magma glass",
    attachment: "frontPaw sheaths",
    palette: "charcoal, ember orange, soft gold sparks",
    magic: "heat shimmer and micro sparks on swipe",
    anim: "claw swipe trails, equip snap-on",
  },
  {
    slug: "tideglass-claws",
    name: "Tideglass Claws",
    weaponClass: "Claw",
    anatomy: "biped / amphibious paws",
    affinity: "Tide",
    shape: "translucent crescent claws",
    materials: "tideglass, seafoam enamel",
    attachment: "frontPaw",
    palette: "aqua, seafoam, pearl white",
    magic: "droplet trails",
    anim: "liquid slash arc",
  },
  {
    slug: "thorn-grips",
    name: "Thorn Grips",
    weaponClass: "Claw",
    anatomy: "quadruped paws",
    affinity: "Grove",
    shape: "living thorn gauntlets",
    materials: "briar wood, sap amber",
    attachment: "frontPaw",
    palette: "moss green, amber, bark brown",
    magic: "leaf motes",
    anim: "vine snap",
  },
  {
    slug: "frost-hooks",
    name: "Frost Hooks",
    weaponClass: "Claw",
    anatomy: "clawed creatures",
    affinity: "Frost",
    shape: "icy hook claws",
    materials: "rime crystal, pale steel fantasy alloy",
    attachment: "frontPaw",
    palette: "ice blue, white, silver",
    magic: "frost bloom on impact",
    anim: "chill slash",
  },
  {
    slug: "rift-tailblade",
    name: "Rift Tailblade",
    weaponClass: "Tail",
    anatomy: "long-tailed / serpentine",
    affinity: "Void",
    shape: "crescent blade on tail tip",
    materials: "rift metal, void crystal edge",
    attachment: "tailTip",
    palette: "indigo, violet, black gloss",
    magic: "rift slits in air",
    anim: "whip-blade arc",
  },
  {
    slug: "alloy-tail-ring",
    name: "Alloy Tail Ring",
    weaponClass: "Tail",
    anatomy: "long-tailed pets",
    affinity: "Alloy",
    shape: "segmented gear ring around mid-tail",
    materials: "brass gears, soft teal enamel",
    attachment: "tailBase",
    palette: "brass, teal, graphite",
    magic: "spinning rune rings",
    anim: "spin strike",
  },
  {
    slug: "storm-ribbon",
    name: "Storm Ribbon",
    weaponClass: "Tail",
    anatomy: "long-tailed / winged",
    affinity: "Storm",
    shape: "flowing ribbon of charged cloth-metal",
    materials: "storm silk, copper thread",
    attachment: "tailBase",
    palette: "electric blue, white, copper",
    magic: "static sparks along ribbon",
    anim: "ribbon lash",
  },
  {
    slug: "bramble-flail",
    name: "Bramble Flail",
    weaponClass: "Tail",
    anatomy: "heavy-tailed pets",
    affinity: "Grove",
    shape: "woven bramble ball on vine tether",
    materials: "living vine, seed pods",
    attachment: "tailTip",
    palette: "forest green, brown, soft yellow pods",
    magic: "seed sparkles",
    anim: "flail swing",
  },
  {
    slug: "crystal-horncap",
    name: "Crystal Horncap",
    weaponClass: "Horn",
    anatomy: "horned / antlered",
    affinity: "Stone",
    shape: "faceted mineral horn tips",
    materials: "quartz, basalt",
    attachment: "horn",
    palette: "slate, crystal cyan, warm gray",
    magic: "mineral glints",
    anim: "headbutt charge",
  },
  {
    slug: "radiant-crownspike",
    name: "Radiant Crownspike",
    weaponClass: "Horn",
    anatomy: "head-first attackers",
    affinity: "Radiant",
    shape: "sunburst crown spike",
    materials: "sunmetal, prism glass",
    attachment: "head",
    palette: "gold, soft white, rose light",
    magic: "halo rays",
    anim: "radiant poke",
  },
  {
    slug: "stonebreaker-crest",
    name: "Stonebreaker Crest",
    weaponClass: "Horn",
    anatomy: "crested bipeds",
    affinity: "Stone",
    shape: "heavy geometric crest plate",
    materials: "granite plates, rune inlay",
    attachment: "head",
    palette: "granite gray, ochre runes",
    magic: "dust shockwave",
    anim: "crest slam",
  },
  {
    slug: "spirit-antler-charm",
    name: "Spirit Antler Charm",
    weaponClass: "Horn",
    anatomy: "antlered spirit pets",
    affinity: "Spirit",
    shape: "ethereal antler ornaments with hanging charms",
    materials: "ghostwood, spirit beads",
    attachment: "horn",
    palette: "lavender mist, pearl, soft teal",
    magic: "floating charm orbits",
    anim: "charm shimmer",
  },
  {
    slug: "ember-orb",
    name: "Ember Orb",
    weaponClass: "Floating Focus",
    anatomy: "floating / spirit pets",
    affinity: "Ember",
    shape: "hovering coal orb in a rune ring",
    materials: "cinder crystal, ash metal",
    attachment: "floatingFocus",
    palette: "ember core, dark ring, gold rim",
    magic: "orbiting sparks",
    anim: "orb pulse fire",
  },
  {
    slug: "tide-pearl",
    name: "Tide Pearl",
    weaponClass: "Floating Focus",
    anatomy: "floating / aquatic spirit",
    affinity: "Tide",
    shape: "large luminous pearl in water halo",
    materials: "moon pearl, tideglass",
    attachment: "floatingFocus",
    palette: "pearl white, deep teal",
    magic: "orbiting droplets",
    anim: "pulse wave",
  },
  {
    slug: "void-prism",
    name: "Void Prism",
    weaponClass: "Floating Focus",
    anatomy: "floating pets without limbs",
    affinity: "Void",
    shape: "angular dark prism with inner star",
    materials: "voidglass, star iron",
    attachment: "floatingFocus",
    palette: "black, violet, star white",
    magic: "space-warp shimmer",
    anim: "prism beam flick",
  },
  {
    slug: "spirit-lantern",
    name: "Spirit Lantern",
    weaponClass: "Floating Focus",
    anatomy: "spirit pets",
    affinity: "Spirit",
    shape: "warm hexagonal lantern focus",
    materials: "paper-bronze fantasy frame, soft flame",
    attachment: "floatingFocus",
    palette: "warm amber, soft bronze",
    magic: "gentle spirit flame",
    anim: "lantern sway cast",
  },
  {
    slug: "radiant-halo",
    name: "Radiant Halo",
    weaponClass: "Floating Focus",
    anatomy: "floating / radiant pets",
    affinity: "Radiant",
    shape: "broken-ring halo of light shards",
    materials: "sun crystal shards",
    attachment: "floatingFocus",
    palette: "white gold, soft pink",
    magic: "rotating light shards",
    anim: "halo spin",
  },
  {
    slug: "alloy-pulse-harness",
    name: "Alloy Pulse Harness",
    weaponClass: "Harness",
    anatomy: "back-mounted harness users",
    affinity: "Alloy",
    shape: "compact backpack harness with pulse emitters",
    materials: "brass plates, teal coils",
    attachment: "back",
    palette: "brass, teal glow",
    magic: "harmless energy pulses (not firearms)",
    anim: "pulse burst",
  },
  {
    slug: "grove-seed-launcher",
    name: "Grove Seed Launcher",
    weaponClass: "Harness",
    anatomy: "back harness",
    affinity: "Grove",
    shape: "mossy seed pod launcher rig",
    materials: "living wood, seed pods",
    attachment: "back",
    palette: "moss, seed yellow, bark",
    magic: "magical seed bursts (training-safe)",
    anim: "seed lob",
  },
  {
    slug: "storm-coil-pack",
    name: "Storm Coil Pack",
    weaponClass: "Harness",
    anatomy: "back harness",
    affinity: "Storm",
    shape: "coiled lightning pack with ribbon outlets",
    materials: "copper coils, cloudglass",
    attachment: "back",
    palette: "copper, electric blue",
    magic: "arc ribbons (fantasy, non-gun)",
    anim: "coil zap",
  },
  {
    slug: "frost-mist-rig",
    name: "Frost Mist Rig",
    weaponClass: "Harness",
    anatomy: "back / chest harness",
    affinity: "Frost",
    shape: "mist vents and ice crystal tanks",
    materials: "rime metal, frost crystal",
    attachment: "back",
    palette: "ice blue, silver mist",
    magic: "cooling mist clouds",
    anim: "mist spray",
  },
  {
    slug: "barkguard-shield",
    name: "Barkguard Shield",
    weaponClass: "Shield",
    anatomy: "chest / paw brace",
    affinity: "Grove",
    shape: "living bark kite plate",
    materials: "bark plates, vine bindings",
    attachment: "chest",
    palette: "bark brown, leaf green",
    magic: "harden glow when braced",
    anim: "guard raise",
  },
  {
    slug: "moonwater-ward",
    name: "Moonwater Ward",
    weaponClass: "Shield",
    anatomy: "floating ward / chest",
    affinity: "Tide",
    shape: "crescent water shield disc",
    materials: "moonwater membrane, shell rim",
    attachment: "chest",
    palette: "moon silver, deep blue",
    magic: "rippling barrier",
    anim: "ward shimmer",
  },
  {
    slug: "obsidian-plate",
    name: "Obsidian Plate",
    weaponClass: "Shield",
    anatomy: "chest armor plate",
    affinity: "Ember",
    shape: "faceted obsidian breastplate shard",
    materials: "obsidian, ember seams",
    attachment: "chest",
    palette: "black glass, ember seams",
    magic: "heat-vein glow",
    anim: "plate brace",
  },
  {
    slug: "spirit-veil",
    name: "Spirit Veil",
    weaponClass: "Shield",
    anatomy: "neck / chest veil",
    affinity: "Spirit",
    shape: "translucent protective veil",
    materials: "spirit gauze, bead anchors",
    attachment: "neck",
    palette: "lavender translucent, pearl",
    magic: "soft veil pulse",
    anim: "veil unfurl",
  },
  {
    slug: "alloy-barrier",
    name: "Alloy Barrier",
    weaponClass: "Shield",
    anatomy: "foreleg / chest",
    affinity: "Alloy",
    shape: "hex-panel kinetic barrier",
    materials: "alloy plates, teal energy film",
    attachment: "chest",
    palette: "steel blue, teal hexes",
    magic: "hex shield pop",
    anim: "barrier deploy",
  },
  {
    slug: "focus-lens",
    name: "Focus Lens",
    weaponClass: "Support",
    anatomy: "floating near head / neck",
    affinity: "Radiant",
    shape: "orbicular focusing lens charm",
    materials: "crystal lens, gold rim",
    attachment: "neck",
    palette: "clear crystal, gold",
    magic: "aiming light mote",
    anim: "lens flare focus",
  },
  {
    slug: "healing-bell",
    name: "Healing Bell",
    weaponClass: "Support",
    anatomy: "neck charm",
    affinity: "Spirit",
    shape: "small fantasy bell charm",
    materials: "silver-green metal, ribbon",
    attachment: "neck",
    palette: "mint silver, soft green",
    magic: "healing chime rings",
    anim: "bell ring heal",
  },
  {
    slug: "energy-charm",
    name: "Energy Charm",
    weaponClass: "Support",
    anatomy: "neck / chest",
    affinity: "Storm",
    shape: "charged crystal pendant",
    materials: "storm crystal, leather cord fantasy",
    attachment: "neck",
    palette: "violet crystal, electric rim",
    magic: "energy refill sparkles",
    anim: "charm charge",
  },
  {
    slug: "speed-anklet",
    name: "Speed Anklet",
    weaponClass: "Support",
    anatomy: "rear paw / ankle",
    affinity: "Storm",
    shape: "lightweight anklet with wind fins",
    materials: "cloud metal, wind feathers fantasy",
    attachment: "rearPaw",
    palette: "sky blue, white fins",
    magic: "speed lines",
    anim: "dash trail",
  },
  {
    slug: "bond-ribbon",
    name: "Bond Ribbon",
    weaponClass: "Support",
    anatomy: "neck / chest",
    affinity: "Radiant",
    shape: "soft woven ribbon with crest knot",
    materials: "bond silk, crest bead",
    attachment: "neck",
    palette: "rose gold, soft cream",
    magic: "warm bond glow",
    anim: "ribbon flutter",
  },
  {
    slug: "void-shroud-clasp",
    name: "Void Shroud Clasp",
    weaponClass: "Support",
    anatomy: "chest / back",
    affinity: "Void",
    shape: "cloak clasp with mini shroud fins",
    materials: "void cloth, dark star metal",
    attachment: "chest",
    palette: "deep purple, black",
    magic: "soft shroud mist",
    anim: "shroud flicker",
  },
];

const outDir = join(process.cwd(), "asset-prompts", "weapons");
mkdirSync(outDir, { recursive: true });

const negative = `realistic firearm, gun, rifle, pistol, ammunition, military weapon, blood, gore, dismemberment, human hands holding weapon, pet body in frame, text, logo, watermark, brand mark, barcode, UI chrome, photoreal camera, modern tactical gear`;

for (const w of weapons) {
  const md = `# ${w.name}

| Field | Value |
|-------|-------|
| Weapon name | ${w.name} |
| Weapon class | ${w.weaponClass} |
| Compatible anatomy | ${w.anatomy} |
| Affinity | ${w.affinity} |
| Shape | ${w.shape} |
| Materials | ${w.materials} |
| Attachment method | ${w.attachment} |
| Color palette | ${w.palette} |
| Magical effects | ${w.magic} |
| Profile icon | 256×256 cropped silhouette-friendly |
| Battle overlay | Layered attachment for ${w.attachment} with mirrored facing |
| Inventory image | Full object, no pet, no hands |
| Attachment points | ${w.attachment} (x/y/rot/scale/layer in species metadata) |
| Animation requirements | ${w.anim}; equip/unequip; idle hover if floating |
| Master size | 1024 × 1024 |
| Background | Transparent |
| Status | Prompt written |

## Master inventory prompt

Create a completely original fantasy creature weapon for a 2D pet battle game called Riftwilds: **${w.name}**.
Class: ${w.weaponClass}. Affinity: ${w.affinity}. Shape: ${w.shape}. Materials: ${w.materials}.
Three-quarter angle, full object visible, creature-scaled (not human-sized), stylized magical design.
Color palette: ${w.palette}. Magical effects: ${w.magic}.
Transparent background. No text, no logo, no hands, no pet body in this inventory version.
Polished 2D fantasy illustration with clean outlines and cel shading. Not a realistic firearm.

## Battle overlay prompt

Same weapon as a battle sprite overlay for attachment point **${w.attachment}**, readable at small size, facing right (provide mirrored notes), soft magical FX: ${w.magic}. Transparent background. No blood or graphic injury.

## Profile icon prompt

Cropped iconic version of ${w.name} on transparent background, strong silhouette, 256×256 friendly.

## Negative prompt

${negative}
`;
  writeFileSync(join(outDir, `${w.slug}.md`), md, "utf8");
}

const index = `# Weapon art prompts

Original Riftling weapons for Riftwilds Arena. Fantasy / magical only — no realistic firearms.

Count: ${weapons.length}

${weapons.map((w) => `- [${w.name}](./${w.slug}.md) — ${w.weaponClass} · ${w.affinity}`).join("\n")}

See also: \`../templates/negative-prompt.md\`
`;
writeFileSync(join(outDir, "index.md"), index, "utf8");
console.log(`Wrote ${weapons.length} weapon prompts to asset-prompts/weapons/`);
