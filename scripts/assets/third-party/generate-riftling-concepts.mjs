#!/usr/bin/env node
/**
 * Writes original Riftling concept design docs + CONCEPT SVG placeholders.
 * Does not touch production pet sprites or species runtime catalogs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const OUT = path.join(ROOT, "docs/riftlings/concepts");
const PLACE = path.join(OUT, "placeholders");

const NEGATIVE = `Pokémon, Pikachu, Charizard, Eevee, Digimon, Palworld, Axie Infinity, Neopets, Tamagotchi, copyrighted character, fan art, trainer, Poké Ball, logo, text, watermark, photographic realism, 3D plastic toy.`;

/** @type {Array<Record<string, string | string[]>>} */
const CONCEPTS = [
  {
    slug: "aetherspark",
    name: "Aetherspark",
    title: "Skyfract Emberling",
    affinity: "Storm",
    region: "Stormspire Peaks",
    personality: "Curious, jittery-bright, loyal once trusted; leaves ozone-sweet static when happy.",
    body: "Compact mustelid-otter hybrid with sail-fin ears and a filament tail that sheds soft skyfract sparks (not lightning bolts).",
    silhouette: "Low runner with two tall sail-ears and a trailing spark-ribbon; reads as storm-weasel, not electric rodent.",
    colors: "Slate violet, pale cyan, warm cream belly, soft gold filament tips",
    features: [
      "Sail-fin ears that fold flat in rain",
      "Skyfract filament tail (ribbon, not bolt)",
      "Cheek vents that puff ozone mist",
      "Paw pads with faint constellation freckles",
    ],
    ability: "Ribbon Arc — a curved spark-ribbon that marks safe footing",
    role: "Scout / early companion",
    replacesNote: "Improved name vs generic 'Spark'; avoids Commonspark / Sparkmoth collision by aether + ribbon motif",
  },
  {
    slug: "verdenth",
    name: "Verdenth",
    title: "Mossvein Keeper",
    affinity: "Grove",
    region: "Elderwood Reach",
    personality: "Patient gardener temperament; hums when soil is healthy.",
    body: "Stocky hexapod seedling-beast: four walk limbs + two pollen-fan arms; bark plate cape.",
    silhouette: "Rounded moss mound with six limbs and a pollen-fan crest — not a bipedal leaf sprite.",
    colors: "Forest emerald, bark brown, soft lichen silver, pollen gold",
    features: [
      "Living moss veins that shift when cared for",
      "Pollen-fan crest (tool, not leaf hair)",
      "Seed-pod satchel on hip plate",
      "Soft root toes that grip bark",
    ],
    ability: "Mossbind — temporary root-bridge for allies",
    role: "Care / support",
    replacesNote: "Replaces Mosskin naming; distinct from Mossprig / Mossdrake",
  },
  {
    slug: "pyrekit",
    name: "Pyrekit",
    title: "Hearthcoal Cub",
    affinity: "Ember",
    region: "Ember Crater",
    personality: "Warm-hearted daredevil; curls into a coal bun when shy.",
    body: "Short quadruped with kiln-brick fur tiles and a chimney-tail puff (smoke ring, not flame mane).",
    silhouette: "Brick-tiled cub with chimney puff tail — deliberately not a fire-lizard starter shape.",
    colors: "Charcoal, kiln orange, ash cream, ember rose",
    features: [
      "Kiln-brick fur tiles with cooling seams",
      "Chimney-tail that puffs rings when excited",
      "Glowing belly hearthstone (internal, not chest jewel)",
      "Soot whisker ticks",
    ],
    ability: "Hearth Ring — warm ward that restores comfort",
    role: "Starter-adjacent Ember companion",
    replacesNote: "Improved vs Embercub; distinct silhouette from Cindercub coal plates",
  },
  {
    slug: "tidecurl",
    name: "Tidecurl",
    title: "Spiral Foamling",
    affinity: "Tide",
    region: "Moonwater Coast",
    personality: "Playful, tide-clock smart; collects spiral shells as gifts.",
    body: "Floating coil-amphibian: soft spiral body with two paddle hands and a foam collar.",
    silhouette: "Vertical foam spiral with paddle hands — not a fish or seal clone.",
    colors: "Seafoam, deep teal, pearl white, dusk lavender",
    features: [
      "Foam collar that changes with moon phase lore",
      "Spiral shell heart visible under translucent skin",
      "Paddle hands for gentle pushes",
      "Salt-crystal freckles",
    ],
    ability: "Foam Spiral — soft crowd-control bubble helix",
    role: "Tide scout",
  },
  {
    slug: "gravelfin",
    name: "Gravelfin",
    title: "Riverstone Glider",
    affinity: "Stone",
    region: "Stoneheart Canyon",
    personality: "Quiet, stubbornly helpful; stacks pebbles into maps.",
    body: "Flat-bodied river glider with gravel scale plates and two stone-fin sails.",
    silhouette: "Wide flat stone skate with dual sails — not a rock golem biped (distinct from Pebblit).",
    colors: "River gray, mica silver, canyon rust, soft teal wet sheen",
    features: [
      "Mica scale shimmer when wet",
      "Stone-fin sails for short glides",
      "Pebble-map habit (lore)",
      "Underside suction pads for cliff rest",
    ],
    ability: "Mica Glide — brief cliff-to-cliff skim",
    role: "Traversal helper",
  },
  {
    slug: "nivisprout",
    name: "Nivisprout",
    title: "Frostbloom Sprout",
    affinity: "Frost",
    region: "Frostveil Expanse",
    personality: "Shy bloom that opens for trusted keepers; sleepy in warm rooms.",
    body: "Bipedal snowdrop plantling with petal cloak and ice-seed ankles.",
    silhouette: "Upright snowdrop with closed petal hood — not a rabbit puff (distinct from Frostuft/Snowpuff).",
    colors: "Snow white, ice mint, soft indigo shadow, pale gold stigma",
    features: [
      "Petal hood that blooms with trust",
      "Ice-seed anklets that chime softly",
      "Breath that crystallizes into temporary steps",
      "Root-hair braid",
    ],
    ability: "Bloomstep — freeze a safe footing tile",
    role: "Frost support",
  },
  {
    slug: "lustrakit",
    name: "Lustrakit",
    title: "Citadel Gleamfox",
    affinity: "Radiant",
    region: "Radiant Citadel",
    personality: "Proud but kind; polishes other Riftlings' crystals with its brush-tail.",
    body: "Sleek vulpine with stained-glass flank panels and a brush-tail of light threads.",
    silhouette: "Long fox with geometric glass flanks — not a sun disc (distinct from Sunmote).",
    colors: "Ivory, rose gold, citadel amber, cool white light",
    features: [
      "Stained-glass flank panels (regional motifs)",
      "Brush-tail of luminous threads",
      "Halo freckles that dim when tired",
      "Soft padded boots of light fur",
    ],
    ability: "Luster Polish — brief defense buff via gleam",
    role: "Radiant companion",
  },
  {
    slug: "nullember",
    name: "Nullember",
    title: "Ashvoid Ember",
    affinity: "Void",
    region: "Void Hollow",
    personality: "Gentle melancholic; collects lost buttons and returns them.",
    body: "Soft biped ember-void hybrid: charcoal plush body with a hollow chest window showing calm void-glow (never horror).",
    silhouette: "Round plush biped with window-chest — deliberately cute, not Umbreon/ghost franchise.",
    colors: "Charcoal, soft violet void, ember crumb orange, cream stitching",
    features: [
      "Chest window with slow void snow",
      "Button collection satchel",
      "Ember crumb freckles (warm, not menacing)",
      "Stitched ear notches",
    ],
    ability: "Quiet Pocket — briefly hide an item from chaos",
    role: "Void care companion",
  },
  {
    slug: "cogpetal",
    name: "Cogpetal",
    title: "Bloomwork Sprocket",
    affinity: "Alloy",
    region: "Alloy Ruins",
    personality: "Inventive fidgeter; grows copper roses from scrap.",
    body: "Small biped with petal-gear shoulders and a winding-key crest.",
    silhouette: "Key-crested biped with gear-petals — distinct from Gearling boxy mech.",
    colors: "Verdigris, copper, oil-black, soft pink petal metal",
    features: [
      "Winding-key crest (lore wind-up, not toy brand)",
      "Petal-gears that bloom when solved puzzles",
      "Oil-sweet scent in lore",
      "Magnet pads on palms",
    ],
    ability: "Petal Torque — repair a minor world interactable",
    role: "Puzzle / alloy support",
  },
  {
    slug: "marshgleam",
    name: "Marshgleam",
    title: "Lantern Reedling",
    affinity: "Spirit",
    region: "Spirit Marsh",
    personality: "Soft-spoken guide; lantern belly brightens near memorials.",
    body: "Reed-legged wader with a glass-lantern belly and moth-soft mantle.",
    silhouette: "Tall thin wader + lantern belly — distinct from Wisplet orb.",
    colors: "Marsh green, lantern amber, mist gray, pale lilac",
    features: [
      "Lantern belly with slow spirit moths inside",
      "Reed stilts for marsh walking",
      "Moth-soft mantle",
      "Memorial chime when near Spirit garden tiles",
    ],
    ability: "Reedlight — reveal a hidden marsh path",
    role: "Spirit guide",
  },
  {
    slug: "brackenhoof",
    name: "Brackenhoof",
    title: "Thornridge Guardian",
    affinity: "Grove + Stone",
    region: "Elderwood Reach / Stoneheart border",
    personality: "Steadfast herd guardian; kneels so smaller Riftlings can climb.",
    body: "Heavy quadruped with bracken antler-fans and stone hoof rings.",
    silhouette: "Wide guardian with fan-antlers — not Brambleback bark tank clone (taller, hoofed, open chest moss).",
    colors: "Bracken bronze, moss, granite, soft cream muzzle",
    features: [
      "Bracken antler-fans (seasonal leaf states)",
      "Stone hoof rings that spark flint",
      "Moss saddle naturally grown",
      "Warm breath that smells of wet earth",
    ],
    ability: "Ridge Kneel — create temporary mount platform for allies",
    role: "Tank / travel",
  },
  {
    slug: "skyspine",
    name: "Skyspine",
    title: "Gale Quill Runner",
    affinity: "Storm",
    region: "Stormspire Peaks",
    personality: "Competitive sprinter; races kites for fun.",
    body: "Biped hopper with hollow quill spines that whistle in wind.",
    silhouette: "Upright hopper with dorsal whistle-quills — not Zephyroo kangaroo clone (quill harp back).",
    colors: "Cloud white, storm indigo, electric mint tips",
    features: [
      "Whistle-quill harp along the spine",
      "Digitigrade hops",
      "Wind-sock ear tips",
      "Static nest under chin fur",
    ],
    ability: "Quill Whistle — disrupt enemy aim with tone",
    role: "Speed attacker",
  },
  {
    slug: "pearlshade",
    name: "Pearlshade",
    title: "Moonpearl Serpent",
    affinity: "Tide + Spirit",
    region: "Moonwater / Spirit Marsh",
    personality: "Dreamy storyteller; coils into pearl rings when listening.",
    body: "Long soft serpent with pearl segments and a shade-veil hood.",
    silhouette: "Segmented pearl snake with veil hood — distinct from Tiderune / Tidewisp.",
    colors: "Pearl, moon blue, shade violet, soft silver",
    features: [
      "Pearl segments that record lullabies (lore)",
      "Shade-veil hood",
      "Finlets like calligraphy strokes",
      "Eyes like wet moonstones",
    ],
    ability: "Pearl Ring — soothe panic / sleep aid in care",
    role: "Support / lore",
  },
  {
    slug: "magmacurl",
    name: "Magmacurl",
    title: "Obsidian Curlgrub",
    affinity: "Ember + Stone",
    region: "Ember Crater",
    personality: "Stubborn digger; curls into a cooling coil after bursts of heat.",
    body: "Armored curlgrub with obsidian bands and a magma-glass underbelly.",
    silhouette: "Coiled grub ring — distinct from Magmole burrower quadruped.",
    colors: "Obsidian, magma orange, cooled purple glass, ash",
    features: [
      "Curl defense (perfect ring)",
      "Magma-glass belly window",
      "Drill nose of cooled stone",
      "Heat-vent pores along bands",
    ],
    ability: "Cooling Coil — trade speed for defense",
    role: "Defense digger",
  },
  {
    slug: "starloom",
    name: "Starloom",
    title: "Constellation Weaver",
    affinity: "Radiant + Void",
    region: "Celestial Rift",
    personality: "Quiet artisan; weaves star-thread maps between friends.",
    body: "Floating loom-moth with a void abdomen window and radiant thread arms.",
    silhouette: "Horizontal loom-moth — distinct from Glimmermoth / Astralynx stalker.",
    colors: "Night navy, star gold, void plum, soft white thread",
    features: [
      "Thread arms that leave temporary constellation lines",
      "Void abdomen star-map",
      "Loom crest",
      "Dust like crushed starlight",
    ],
    ability: "Thread Map — mark a path for the party",
    role: "Utility / celestial",
  },
  {
    slug: "bloomgear",
    name: "Bloomgear",
    title: "Orchard Cogling",
    affinity: "Alloy + Grove",
    region: "Alloy Ruins orchards",
    personality: "Cheerful harvester; plants copper seeds that grow soft fruit.",
    body: "Round biped apple-gear hybrid with leaf hinges and a stem antenna.",
    silhouette: "Apple-round with gear equator — cute construct, not Gearling humanoid.",
    colors: "Orchard red, leaf green, brass, cream",
    features: [
      "Gear equator that clicks when happy",
      "Leaf hinge ears",
      "Stem antenna",
      "Copper seed pouch",
    ],
    ability: "Orchard Click — grow a temporary snack node",
    role: "Care / economy flavor",
  },
  {
    slug: "rimenook",
    name: "Rimenook",
    title: "Icenook Burrower",
    affinity: "Frost",
    region: "Frostveil Expanse",
    personality: "Nest-builder; invites friends into snow dens.",
    body: "Stocky quadruped with rime-plated nook shell on its back (hollow den).",
    silhouette: "Walking snow-den — distinct from Rimewing flyer and Iciclepup.",
    colors: "Ice blue, soft gray fur, rime white, den wood brown accents",
    features: [
      "Back-nook shell that opens as a mini den",
      "Rime whiskers",
      "Snowshoe paws",
      "Warm inner den glow",
    ],
    ability: "Nook Nest — care restore while sheltered",
    role: "Care / frost",
  },
  {
    slug: "shadewick",
    name: "Shadewick",
    title: "Candlevoid Wisp-Beast",
    affinity: "Void + Spirit",
    region: "Void Hollow / Spirit Marsh",
    personality: "Soft guardian of quiet rooms; wick-tail lights memorials.",
    body: "Small biped with wax-soft limbs and a shade-flame wick tail (cool flame).",
    silhouette: "Candle-beast biped — not Wisplet pure orb; has legs and wax drips.",
    colors: "Wax cream, shade purple, cool cyan flame, soot soft black",
    features: [
      "Cool shade-flame (never burns friends)",
      "Wax drip patterns unique per individual",
      "Memorial bow of spirit thread",
      "Eyes like candle lenses",
    ],
    ability: "Wick Vigil — reveal spirit traces",
    role: "Spirit / void support",
  },
  {
    slug: "briarmote",
    name: "Briarmote",
    title: "Seedthorn Mote",
    affinity: "Grove",
    region: "Elderwood Reach",
    personality: "Tiny fierce gardener; pokes weeds, hugs seedlings.",
    body: "Floating seed mote with retractable briar whiskers and a soft moss core.",
    silhouette: "Floating seed with briar halo — distinct from Thornling / Bloomble.",
    colors: "Seed tan, briar rose, moss green, pollen gold",
    features: [
      "Retractable briar whiskers",
      "Moss core heartbeat glow",
      "Pollen orbit motes",
      "Root-thread tether to keeper (lore)",
    ],
    ability: "Briar Tuck — light snare / weed clear",
    role: "Tiny grove utility",
  },
  {
    slug: "zephyrite",
    name: "Zephyrite",
    title: "Windcrystal Ibex",
    affinity: "Storm + Stone",
    region: "Stormspire / Stoneheart",
    personality: "Sure-footed climber; crystal horns ring like chimes in wind.",
    body: "Agile quadruped ibex with hollow crystal horns and cloud-fur cape.",
    silhouette: "Ibex with ringing crystal horns — distinct from Peakibex lore via hollow wind horns + cape.",
    colors: "Cliff taupe, cloud white, crystal cyan, storm slate",
    features: [
      "Hollow crystal horns that chime",
      "Cloud-fur cape",
      "Cloven wind pads",
      "Static snow along horn ridges",
    ],
    ability: "Chime Path — reveal climb holds",
    role: "Climb / hybrid",
  },
  {
    slug: "lumenfin",
    name: "Lumenfin",
    title: "Sunshoal Ribbon",
    affinity: "Tide + Radiant",
    region: "Moonwater / Radiant shores",
    personality: "Social shoaler; brightens groups, dims alone.",
    body: "Ribbon-fish construct of light-water membranes with twin lumen fins.",
    silhouette: "Horizontal light ribbon — distinct from Alloyfin metal eel.",
    colors: "Sunlit gold, clear water, coral blush, soft white",
    features: [
      "Twin lumen fins that store daylight",
      "Ribbon body that can knot into a ring",
      "Shoal call harmonic",
      "Salt-light scales",
    ],
    ability: "Shoal Glow — party vision in dark water",
    role: "Tide radiant support",
  },
  {
    slug: "riftwyrm",
    name: "Riftwyrm",
    title: "Gateway Coil Elder",
    affinity: "Celestial / Ancient",
    region: "Celestial Rift",
    personality: "Ancient, slow-speaking mentor; coils around Gateways as a living seal.",
    body: "Long soft-scaled coil with gateway-ring segments and feathered rift mane (not Western dragon wings).",
    silhouette: "Segmented gateway-coil with ring vertebrae — deliberately anti-franchise-dragon (no bat wings, no fire breath meme).",
    colors: "Midnight indigo, gateway cyan, soft gold rings, astral cream mane",
    features: [
      "Ring vertebrae that echo active Gateways",
      "Feathered rift mane (soft, not spiked)",
      "Eyes like distant portals",
      "Voice like layered choir (lore)",
    ],
    ability: "Seal Coil — stabilize a rift node temporarily",
    role: "Legendary / story elder — not a starter",
    replacesNote: "Kept Riftwyrm name with anti-dragon silhouette rules",
  },
];

function promptBlock(c) {
  return `Create a completely original full-body 2D fantasy creature named ${c.name}, a Riftling (${c.title}) with this body: ${c.body} Personality: ${c.personality} Affinity: ${c.affinity}. Colors: ${c.colors}. Unique silhouette: ${c.silhouette}. Special features: ${c.features.join("; ")}. Polished 2D game illustration with subtle pixel-art influence, clean outlines, soft layered shading, expressive eyes, upper-left lighting, transparent background, 2048x2048, full body visible. Original Riftwilds IP — not a franchise lookalike. Negative: ${NEGATIVE}`;
}

function md(c) {
  return `# ${c.name}

> **Status:** CONCEPT — design docs + placeholder only. Not in production species runtime.  
> **Batch:** 2026-07-18 original concept roster

## 1. Creature name
${c.name}

## 2. Species title
${c.title}

## 3. Personality
${c.personality}

## 4. Primary affinity
${c.affinity}

## 5. Native region (design)
${c.region}

## 6. Body structure
${c.body}

## 7. Unique silhouette description
${c.silhouette}

## 8. Main colors
${c.colors}

## 9. Special features
${c.features.map((f) => `- ${f}`).join("\n")}

## 10. Signature ability (design)
${c.ability}

## 11. Gameplay role
${c.role}

## 12. Naming notes
${c.replacesNote || "Original name chosen to avoid collisions with existing lore slugs and franchise patterns."}

## 13. Profile artwork prompt
\`\`\`
${promptBlock(c)}
\`\`\`

## 14. Shared negative prompt
\`\`\`
${NEGATIVE}
\`\`\`

## 15. Placeholder
Local CONCEPT SVG: \`placeholders/${c.slug}.svg\` (not a production sprite).

## 16. Approval
Awaiting human concept review before any production sprite sheet generation.
`;
}

function svg(c) {
  const label = String(c.name).slice(0, 14);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="CONCEPT ${c.name}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a2744"/>
      <stop offset="100%" stop-color="#0d1526"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <circle cx="256" cy="230" r="110" fill="#2a3d66" stroke="#5eead4" stroke-width="6"/>
  <ellipse cx="256" cy="360" rx="140" ry="48" fill="#243556"/>
  <text x="256" y="40" text-anchor="middle" fill="#fbbf24" font-family="ui-sans-serif,system-ui,sans-serif" font-size="28" font-weight="700">CONCEPT</text>
  <text x="256" y="245" text-anchor="middle" fill="#e2e8f0" font-family="ui-sans-serif,system-ui,sans-serif" font-size="32" font-weight="600">${label}</text>
  <text x="256" y="480" text-anchor="middle" fill="#94a3b8" font-family="ui-sans-serif,system-ui,sans-serif" font-size="16">Not a production asset</text>
</svg>
`;
}

fs.mkdirSync(PLACE, { recursive: true });
const indexRows = [];
for (const c of CONCEPTS) {
  fs.writeFileSync(path.join(OUT, `${c.slug}.md`), md(c), "utf8");
  fs.writeFileSync(path.join(PLACE, `${c.slug}.svg`), svg(c), "utf8");
  indexRows.push(
    `| ${c.name} | \`${c.slug}\` | ${c.affinity} | ${c.role} | [doc](./concepts/${c.slug}.md) |`,
  );
}

const roster = `# Original Riftling Concept Roster (Batch 2026-07-18)

**Count:** ${CONCEPTS.length} concepts  
**Status:** Design docs + CONCEPT placeholders only — **no production sprite sheets**  
**Review:** [CONCEPT_REVIEW.md](./CONCEPT_REVIEW.md) · [SIMILARITY_RISK_REVIEW.md](./SIMILARITY_RISK_REVIEW.md)

Names improved vs draft Spark / Mosskin / Embercub / Riftwyrm list to avoid collisions with existing lore (\`Commonspark\`, \`Mossprig\`, \`Cindercub\`, etc.).

| Name | Slug | Affinity | Role | Doc |
|------|------|----------|------|-----|
${indexRows.join("\n")}

## Placeholder location

\`docs/riftlings/concepts/placeholders/*.svg\` — labeled **CONCEPT**, not wired into Live World.
`;

fs.writeFileSync(path.join(ROOT, "docs/riftlings/CONCEPT_ROSTER_BATCH_2026-07-18.md"), roster, "utf8");
console.log(`Wrote ${CONCEPTS.length} concept docs + placeholders`);
