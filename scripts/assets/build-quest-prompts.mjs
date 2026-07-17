import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const list = JSON.parse(fs.readFileSync(path.join(root, "tmp-quest-list.json"), "utf8"));

const REGION = {
  "sproutfall-grove": "lush mossy grove, soft emerald canopy light, amber spore motes",
  "cindercrag-basin": "volcanic cinder basin, cracked obsidian, ember glow, ash haze",
  "riftwild-commons": "portal plaza hub, navy stone, cyan rift light, amber lanterns",
  "ember-crater": "volcanic crater rim, molten veins, navy sky, amber lava glow",
  "moonwater-coast": "moonlit tide coast, bioluminescent water, cyan reflections",
  "elderwood-forest": "ancient forest, glowing roots, deep green and amber light",
  "stormspire-peaks": "storm mountain peaks, lightning cyan arcs, wind-swept cliffs",
  "stoneheart-canyon": "canyon of stone strata, fossil veins, warm amber dust light",
  "frostveil-basin": "frozen basin, aurora cyan-violet, ice crystals, navy night",
  "radiant-citadel": "radiant marble citadel, dawn gold and cyan holy light",
  "void-hollow": "void hollow corridors, purple-black distortion, cyan portal seams",
  "alloy-ruins": "ruined alloy warframe halls, copper metal, cyan schematics glow",
  "spirit-marsh": "misty spirit marsh, lantern glow, teal fog, soft amber lights",
  "celestial-rift": "celestial star rift, cosmic navy, constellation cyan and violet",
};

const CAT = {
  STORY: "epic story journey moment",
  DAILY: "cozy daily keeper ritual",
  WEEKLY: "weekly milestone ceremony",
  EXPLORATION: "exploration scout vista",
  CARE: "cozy pet care bonding moment with cute original fantasy creature companion",
  BATTLE: "training spar energy clash, no gore",
  COLLECTION: "affinity creature discovery showcase",
  COMMUNITY: "community gathering of keepers",
  EVENT: "seasonal festival atmosphere",
};

function prompt(q) {
  const region =
    q.regionKey && REGION[q.regionKey]
      ? REGION[q.regionKey]
      : "Riftwilds fantasy world, navy cyan amber palette";
  const cat = CAT[q.category] || "quest moment";
  return (
    `Premium 2D cinematic comic-fantasy quest panel for Riftwilds original IP. ` +
    `Scene: ${q.name} — ${q.description}. Mood: ${cat}. Setting: ${region}. ` +
    `Style: painterly digital illustration, rich atmospheric lighting, readable silhouette, ` +
    `game-ready concept art, navy deep blues, cyan energy accents, amber highlights. ` +
    `Wide cinematic composition for a quest card banner. ` +
    `No text, no letters, no logos, no watermarks, no UI chrome, no Pokémon, ` +
    `unique original fantasy creature-world aesthetic.`
  );
}

const out = list.map((q) => ({
  key: q.key,
  name: q.name,
  prompt: prompt(q),
  aspectRatio: "16:9",
  outputRelPath: `assets/quests/${q.key}.png`,
}));

fs.writeFileSync(path.join(root, "tmp-quest-prompts.json"), JSON.stringify(out, null, 2));
console.log(out.length, "prompts written");
