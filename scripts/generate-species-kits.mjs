import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const species = [
  ["cindercub", "EMBER", "Brave", "Warm-pelted cub"],
  ["mossprig", "GROVE", "Gentle", "Moss sproutling"],
  ["bubbloon", "TIDE", "Playful", "Buoyant orb"],
  ["voltkit", "STORM", "Energetic", "Static fur kit"],
  ["pebblit", "STONE", "Calm", "Rolling stone hatchling"],
  ["wisplet", "SPIRIT", "Curious", "Lantern spirit"],
  ["frostnip", "FROST", "Shy", "Powdery ice paws"],
  ["luminara", "RADIANT", "Calm", "Hovering prism"],
  ["hollowshade", "VOID", "Independent", "Shadow-soft form"],
  ["gearling", "ALLOY", "Protective", "Clockwork companion"],
  ["bramblefox", "GROVE", "Mischievous", "Thorn-tailed scout"],
  ["coralurge", "TIDE", "Protective", "Reef-plated guardian"],
  ["ashwing", "EMBER", "Brave", "Ash-feathered glider"],
  ["quartzhorn", "STONE", "Protective", "Crystal-horned walker"],
  ["staticat", "STORM", "Curious", "Spark-whiskered climber"],
  ["glimmerp", "RADIANT", "Playful", "Pollen-light insectoid"],
  ["mistwraith", "VOID", "Shy", "Mist-bodied wanderer"],
  ["ironbloom", "ALLOY", "Gentle", "Metal-petaled bloom"],
  ["riftpup", "SPIRIT", "Social", "Friendly rift pup"],
  ["tidewisp", "TIDE", "Sleepy", "Floating droplet"],
  ["embernewt", "EMBER", "Curious", "Heat-seeking salamander"],
  ["groveowl", "GROVE", "Calm", "Leaf-winged watcher"],
  ["stormmoth", "STORM", "Energetic", "Lightning-dusted moth"],
  ["stonegrub", "STONE", "Sleepy", "Burrowing mineral grub"],
  ["frostfin", "FROST", "Independent", "Crystal-fin swimmer"],
  ["radiantkit", "RADIANT", "Social", "Sunshaft collector"],
  ["voidling", "VOID", "Mischievous", "Blinking rift orb"],
  ["cogpup", "ALLOY", "Protective", "Scrap-yard pup"],
  ["lanternjay", "SPIRIT", "Curious", "Lantern-crest bird"],
  ["craterhorn", "EMBER", "Protective", "Crater sentinel"],
  ["moonray", "TIDE", "Gentle", "Moonlit gliding ray"],
  ["rootling", "GROVE", "Shy", "Walking root cluster"],
  ["spirekite", "STORM", "Brave", "Kite-winged peak rider"],
  ["canyonbeetle", "STONE", "Calm", "Armored fossil beetle"],
  ["snowpuff", "FROST", "Playful", "Rolling snow fluff"],
  ["citadelmoth", "RADIANT", "Calm", "Pale gold temple moth"],
  ["riftslug", "VOID", "Sleepy", "Star-trail serpentine"],
  ["scrapfinch", "ALLOY", "Mischievous", "Copper-wire nesting bird"],
  ["marshloom", "SPIRIT", "Gentle", "Blooming marsh spirit"],
  ["commonspark", "STORM", "Energetic", "Social habitat spark"],
  ["hearthstone", "STONE", "Protective", "Warm hearth pebble"],
  ["tideotter", "TIDE", "Social", "Tideglass juggling otter"],
  ["emberfox", "EMBER", "Mischievous", "Foxfire-tailed scout"],
  ["elderfern", "GROVE", "Calm", "Ancient fern biped"],
  ["peakibex", "STORM", "Brave", "Wind-horned climber"],
  ["fossilhound", "STONE", "Protective", "Fossil-plated hound"],
  ["veilhare", "FROST", "Shy", "Snow-veil hare"],
  ["auralynx", "RADIANT", "Independent", "Luminous-tufted lynx"],
  ["hollowmoth", "VOID", "Curious", "Echo-feeding moth"],
  ["celestora", "RADIANT", "Calm", "Starlight silk floater"],
];

const affStats = {
  EMBER: [92, 36, 26, 30, 100],
  TIDE: [96, 30, 30, 28, 102],
  GROVE: [98, 28, 32, 26, 100],
  STORM: [88, 34, 24, 36, 108],
  STONE: [108, 30, 38, 20, 95],
  FROST: [90, 32, 30, 28, 100],
  RADIANT: [94, 33, 28, 30, 104],
  VOID: [86, 35, 25, 34, 106],
  ALLOY: [100, 32, 34, 24, 98],
  SPIRIT: [92, 29, 29, 31, 105],
};

const tempMod = {
  Brave: [0, 3, 0, 2, 0],
  Gentle: [4, -2, 2, 0, 2],
  Playful: [0, 1, -1, 4, 2],
  Energetic: [-2, 2, -2, 5, 6],
  Calm: [2, 0, 3, -1, 0],
  Curious: [0, 1, 0, 3, 2],
  Shy: [0, -1, 2, 3, 0],
  Independent: [0, 2, 1, 2, 0],
  Protective: [4, 1, 5, -2, 0],
  Mischievous: [-2, 3, -2, 4, 2],
  Social: [2, 0, 0, 2, 4],
  Sleepy: [6, -2, 4, -4, -2],
};

/** Handcrafted kits for flagship species — fully unique names & fantasy. */
const handcrafted = {
  cindercub: {
    abs: [
      ["spark-claw", "Spark Claw", "Heated claws rake the foe.", "ATTACK", 42, 10, 0, null, "BURN", 2200, 2],
      ["kindling-guard", "Kindling Guard", "Fur flares into a warm barrier.", "DEFEND", 0, 8, 2, "SELF", "ARMORED", 10000, 2],
      ["cub-rush", "Cub Rush", "A brave rush that builds momentum.", "ATTACK", 50, 14, 1, null, null],
    ],
    trs: [
      ["kindling-coat", "Kindling Coat", "Warm fur softens chill and lifts spirits.", "CARE:happiness:4"],
      ["brave-heart", "Brave Heart", "Courage sharpens every strike.", "STAT:attack:3"],
      ["ember-kin", "Ember Kin", "Affinity techniques hit a little harder.", "AFFINITY:600"],
    ],
  },
  mossprig: {
    abs: [
      ["moss-needle", "Moss Needle", "A sharp living thorn.", "ATTACK", 40, 10, 0, null, "ROOTED", 1800, 1],
      ["soft-bark", "Soft Bark", "Moss thickens into bark.", "DEFEND", 0, 9, 2, "SELF", "ARMORED", 10000, 2],
      ["sprout-mend", "Sprout Mend", "Green light knits small wounds.", "HEAL", 32, 14, 2, "SELF", "REGENERATING", 10000, 2],
    ],
    trs: [
      ["living-moss", "Living Moss", "Slow natural recovery while resting.", "CARE:health:3"],
      ["gentle-roots", "Gentle Roots", "Bond grows easier with patience.", "CARE:bond:4"],
      ["grove-resilience", "Grove Resilience", "Sturdier frame than it looks.", "STAT:defense:3"],
    ],
  },
  bubbloon: {
    abs: [
      ["brine-bubble", "Brine Bubble", "Pops a pressurized brine orb.", "ATTACK", 38, 10, 0, null, "SOAKED", 2500, 2],
      ["drift-veil", "Drift Veil", "Bubbles blur the outline.", "SUPPORT", 0, 10, 2, "SELF", "SHROUDED", 10000, 2],
      ["surge-pop", "Surge Pop", "A playful burst of tideforce.", "ATTACK", 52, 15, 2, null, null],
    ],
    trs: [
      ["buoyant-core", "Buoyant Core", "Harder to pin down in a clash.", "EVASION:4"],
      ["playful-tide", "Playful Tide", "Joyful nature restores energy faster in care.", "CARE:energy:4"],
      ["moonwater-skin", "Moonwater Skin", "Slightly higher vitality.", "STAT:hp:6"],
    ],
  },
  voltkit: {
    abs: [
      ["static-nip", "Static Nip", "A crackling bite.", "ATTACK", 44, 11, 0, null, "CHARGED", 2000, 2],
      ["ridge-dash", "Ridge Dash", "Lightning-quick reposition.", "SUPPORT", 0, 8, 1, "SELF", "INSPIRED", 10000, 1],
      ["arc-flare", "Arc Flare", "Unleashes stored static.", "ULTIMATE", 72, 36, 4, null, "CHARGED", 4000, 2],
    ],
    trs: [
      ["static-fur", "Static Fur", "Crits come easier when charged.", "CRIT:500"],
      ["storm-sprint", "Storm Sprint", "Naturally swift.", "STAT:speed:4"],
      ["live-wire", "Live Wire", "More battle energy in reserve.", "STAT:energy:6"],
    ],
  },
  pebblit: {
    abs: [
      ["pebble-roll", "Pebble Roll", "Tucks in and rolls hard.", "ATTACK", 40, 10, 0, null, null],
      ["mineral-brace", "Mineral Brace", "Stone body locks tight.", "DEFEND", 0, 8, 2, "SELF", "FORTIFIED", 10000, 2],
      ["canyon-thump", "Canyon Thump", "A heavy ground slam.", "ATTACK", 56, 16, 2, null, "SLOWED", 2000, 1],
    ],
    trs: [
      ["stone-shell", "Stone Shell", "Dense mineral plating.", "STAT:defense:5"],
      ["steady-core", "Steady Core", "Calm temperament steadies health.", "CARE:health:3"],
      ["heavy-frame", "Heavy Frame", "Extra bulk.", "STAT:hp:8"],
    ],
  },
  wisplet: {
    abs: [
      ["lantern-flick", "Lantern Flick", "A soft spirit spark.", "ATTACK", 36, 9, 0, null, "ILLUMINATED", 2500, 2],
      ["dusk-hum", "Dusk Hum", "Soothing hum mends vitality.", "HEAL", 30, 13, 2, "SELF", "REGENERATING", 10000, 2],
      ["veil-step", "Veil Step", "Slips half into the marsh mist.", "SUPPORT", 0, 10, 2, "SELF", "SHROUDED", 10000, 2],
    ],
    trs: [
      ["lantern-soft", "Lantern Soft", "Gentle aura eases stress through care.", "CARE:happiness:5"],
      ["spirit-curious", "Spirit Curious", "Learns techniques a touch more sharply.", "AFFINITY:500"],
      ["marshlight", "Marshlight", "Slight focus edge in battle.", "CRIT:300"],
    ],
  },
  frostnip: {
    abs: [
      ["powder-paw", "Powder Paw", "Icy pawstrike leaves frost.", "ATTACK", 40, 10, 0, null, "CHILLED", 2500, 2],
      ["snow-curl", "Snow Curl", "Tucks into a powdery shell.", "DEFEND", 0, 9, 2, "SELF", "ARMORED", 10000, 2],
      ["ice-print", "Ice Print", "Freezing prints slow the foe.", "SUPPORT", 22, 12, 2, null, "SLOWED", 6000, 2],
    ],
    trs: [
      ["powder-coat", "Powder Coat", "Shy nature makes it slippery.", "EVASION:5"],
      ["frostveil-kin", "Frostveil Kin", "Affinity bite is colder.", "AFFINITY:500"],
      ["quiet-heart", "Quiet Heart", "Bond deepens with gentle care.", "CARE:bond:4"],
    ],
  },
  luminara: {
    abs: [
      ["prism-gleam", "Prism Gleam", "Refracted dawn light.", "ATTACK", 44, 12, 0, null, "ILLUMINATED", 2200, 2],
      ["dawn-ward", "Dawn Ward", "A floating prism shield.", "DEFEND", 0, 11, 2, "SELF", "ARMORED", 10000, 2],
      ["citadel-ray", "Citadel Ray", "Concentrated radiant lance.", "ULTIMATE", 78, 40, 5, null, "ILLUMINATED", 5000, 2],
    ],
    trs: [
      ["hover-prism", "Hover Prism", "Harder to land clean hits on.", "EVASION:3"],
      ["dawn-calm", "Dawn Calm", "Stable radiant core.", "STAT:energy:5"],
      ["lightwoven", "Lightwoven", "Affinity techniques shine brighter.", "AFFINITY:700"],
    ],
  },
  hollowshade: {
    abs: [
      ["rift-slip", "Rift Slip", "A shadowy lash from nowhere.", "ATTACK", 46, 12, 0, null, "WEAKENED", 2000, 2],
      ["soft-eclipse", "Soft Eclipse", "Wraps itself in void hush.", "SUPPORT", 0, 10, 2, "SELF", "SHROUDED", 10000, 2],
      ["hollow-bite", "Hollow Bite", "Drains vigor through a rift seam.", "ULTIMATE", 80, 42, 5, null, "WEAKENED", 4500, 2],
    ],
    trs: [
      ["shadow-soft", "Shadow Soft", "Slips past glancing blows.", "EVASION:6"],
      ["independent-rift", "Independent Rift", "Self-sufficient energy reserves.", "STAT:energy:5"],
      ["void-edge", "Void Edge", "Critical seams open easier.", "CRIT:600"],
    ],
  },
  gearling: {
    abs: [
      ["cog-strike", "Cog Strike", "Spinning gear teeth bite.", "ATTACK", 42, 11, 0, null, null],
      ["scrap-plate", "Scrap Plate", "Locks hex plating in place.", "DEFEND", 0, 10, 2, "SELF", "FORTIFIED", 10000, 2],
      ["clockwork-pulse", "Clockwork Pulse", "Overclocked alloy surge.", "ATTACK", 58, 18, 2, null, "CHARGED", 2000, 1],
    ],
    trs: [
      ["clockwork-heart", "Clockwork Heart", "Reliable mechanical stamina.", "STAT:hp:6"],
      ["guardian-gears", "Guardian Gears", "Protective instinct hardens defense.", "STAT:defense:4"],
      ["alloy-tune", "Alloy Tune", "Affinity resonance is cleaner.", "AFFINITY:500"],
    ],
  },
  celestora: {
    abs: [
      ["star-silk", "Star Silk", "Threads of riftlight cut the air.", "ATTACK", 48, 12, 0, null, "ILLUMINATED", 2800, 2],
      ["aurora-veil", "Aurora Veil", "Starlight silk folds into a ward.", "DEFEND", 0, 12, 2, "SELF", "ARMORED", 10000, 2],
      ["celestial-mend", "Celestial Mend", "Soft starfall restores allies' form.", "HEAL", 40, 16, 2, "SELF", "REGENERATING", 10000, 2],
      ["rift-ascension", "Rift Ascension", "Endgame bloom of pure dawnforce.", "ULTIMATE", 88, 48, 5, null, "ILLUMINATED", 6000, 3],
    ],
    trs: [
      ["starlight-silk", "Starlight Silk", "Celestial weave resists pressure.", "STAT:defense:4"],
      ["endgame-aura", "Endgame Aura", "Vast energy well.", "STAT:energy:10"],
      ["dawn-sovereign", "Dawn Sovereign", "Radiant techniques crest higher.", "AFFINITY:900"],
      ["calm-orbit", "Calm Orbit", "Serene presence eases care stress.", "CARE:happiness:5"],
    ],
  },
};

const nameBanks = {
  EMBER: {
    atk: ["Ash Lash", "Cinder Bite", "Heat Spike", "Lava Flick", "Crater Claw", "Foxfire Snap", "Magma Tip", "Soot Rush"],
    def: ["Ember Shell", "Heat Hearth", "Cinder Plate", "Ash Mantle"],
    heal: ["Warm Mend", "Hearth Glow"],
    sup: ["Smoke Screen", "Heat Focus"],
    ult: ["Craterflare", "Heartburst Rush", "Foxfire Storm"],
  },
  TIDE: {
    atk: ["Tide Slap", "Brine Lance", "Wave Crest", "Moonfoam Jet", "Reef Bash", "Otter Whirl", "Ray Glide", "Surf Tip"],
    def: ["Tide Shell", "Reef Guard", "Foam Barrier"],
    heal: ["Moonwater Mend", "Tide Rest"],
    sup: ["Undertow", "Drift Mist"],
    ult: ["Mooncollapse", "Reefbreak Surge", "Tideglass Spiral"],
  },
  GROVE: {
    atk: ["Thorn Whip", "Leaf Dart", "Bramble Snap", "Root Jab", "Fern Edge", "Owl Talon", "Seed Burst", "Vine Snap"],
    def: ["Bark Guard", "Fern Ward", "Thicket Plate"],
    heal: ["Grove Mend", "Sap Seal"],
    sup: ["Root Bind", "Pollen Haze"],
    ult: ["Worldroot Pulse", "Elder Bloom", "Thornstorm"],
  },
  STORM: {
    atk: ["Volt Peck", "Static Bolt", "Gale Slash", "Spire Dive", "Moth Zap", "Spark Needle", "Thunder Tip", "Wind Horn"],
    def: ["Storm Veil", "Static Guard"],
    heal: ["Ozone Breath"],
    sup: ["Tailwind", "Charge Up"],
    ult: ["Sky Rift Bolt", "Tempest Dive", "Peak Thunder"],
  },
  STONE: {
    atk: ["Rock Bite", "Quartz Gore", "Fossil Crush", "Beetle Ram", "Grub Bore", "Hearth Slam", "Canyon Edge", "Plate Bash"],
    def: ["Stone Guard", "Fossil Plate", "Quartz Shell"],
    heal: ["Mineral Mend"],
    sup: ["Tremor Dust", "Steady Stance"],
    ult: ["Mountain Guard", "Fossil Avalanche", "Canyon Quake"],
  },
  FROST: {
    atk: ["Frost Bite", "Ice Shard", "Snowball", "Veil Kick", "Fin Slash", "Powder Dart", "Rime Tip", "Flurry Jab"],
    def: ["Frost Shell", "Snow Curl", "Rime Plate"],
    heal: ["Cold Mend"],
    sup: ["Chill Field", "Whiteout"],
    ult: ["Winter Ring", "Veil Blizzard", "Crystal Flood"],
  },
  RADIANT: {
    atk: ["Sunshaft", "Gleam Sting", "Aura Slash", "Moth Dust", "Kit Beam", "Lynx Flash", "Star Needle", "Prism Tip"],
    def: ["Radiant Ward", "Dawn Veil", "Citadel Guard"],
    heal: ["Dawn Mend", "Starlight Seal"],
    sup: ["Illuminate", "Blessing Glow"],
    ult: ["Dawnstar Ray", "Celestial Parade", "Aura Nova"],
  },
  VOID: {
    atk: ["Echo Bite", "Rift Nudge", "Hollow Sting", "Slug Drift", "Shade Flick", "Void Tip", "Mist Claw", "Blink Jab"],
    def: ["Void Cloak", "Echo Shell"],
    heal: ["Hollow Mend"],
    sup: ["Blink Out", "Silence Veil"],
    ult: ["Eclipse Pulse", "Singularity Nip", "Hollow Choir"],
  },
  ALLOY: {
    atk: ["Gear Bite", "Scrap Peck", "Bloom Spike", "Cog Rush", "Wire Snap", "Hex Tip", "Finch Dive", "Plate Cut"],
    def: ["Alloy Barrier", "Hex Plate", "Cog Guard"],
    heal: ["Oil Mend"],
    sup: ["Overclock", "Magnet Field"],
    ult: ["Titan Core Spin", "Scrapstorm", "Hex Overdrive"],
  },
  SPIRIT: {
    atk: ["Spirit Flame", "Lantern Peck", "Marsh Tip", "Pup Spark", "Loom Lash", "Ancestral Flick", "Wisp Dart", "Bloom Spark"],
    def: ["Spirit Ward", "Lantern Guard"],
    heal: ["Spirit Mend", "Ancestral Balm"],
    sup: ["Guide Light", "Memory Haze"],
    ult: ["Lantern Parade", "Marsh Awakening", "Ancestral Choir"],
  },
};

const traitBanks = {
  EMBER: [
    ["ashen-hide", "Ashen Hide", "Heat-toughened hide.", "STAT:defense:3"],
    ["kindled-spirit", "Kindled Spirit", "Happiness rises easier near warmth.", "CARE:happiness:3"],
    ["ember-focus", "Ember Focus", "Critical heat finds weak points.", "CRIT:400"],
  ],
  TIDE: [
    ["slick-scales", "Slick Scales", "Water-slick evasion.", "EVASION:3"],
    ["tidal-lungs", "Tidal Lungs", "Stronger stamina pool.", "STAT:energy:4"],
    ["moon-calm", "Moon Calm", "Gentle care soothes deeply.", "CARE:bond:3"],
  ],
  GROVE: [
    ["deep-roots", "Deep Roots", "Hard to topple.", "STAT:defense:4"],
    ["sap-blood", "Sap Blood", "Natural vitality.", "STAT:hp:5"],
    ["green-heart", "Green Heart", "Bond with keepers grows steadily.", "CARE:bond:4"],
  ],
  STORM: [
    ["livewire", "Livewire", "Extra spark in reserve.", "STAT:energy:5"],
    ["gale-step", "Gale Step", "Moves like wind.", "STAT:speed:4"],
    ["charged-wits", "Charged Wits", "Sharper critical arcs.", "CRIT:450"],
  ],
  STONE: [
    ["bedrock", "Bedrock", "Massive resilience.", "STAT:defense:5"],
    ["heavy-ore", "Heavy Ore", "Dense body.", "STAT:hp:7"],
    ["steady-keeper", "Steady Keeper", "Health holds under care.", "CARE:health:3"],
  ],
  FROST: [
    ["rime-coat", "Rime Coat", "Icy outer layer.", "STAT:defense:3"],
    ["powder-step", "Powder Step", "Vanishes into flurries.", "EVASION:4"],
    ["cold-focus", "Cold Focus", "Piercing chill crits.", "CRIT:400"],
  ],
  RADIANT: [
    ["sun-core", "Sun Core", "Bright energy reserves.", "STAT:energy:5"],
    ["halo-edge", "Halo Edge", "Affinity light cuts cleaner.", "AFFINITY:600"],
    ["dawn-joy", "Dawn Joy", "Care lifts the spirit.", "CARE:happiness:4"],
  ],
  VOID: [
    ["rift-skin", "Rift Skin", "Hard to track.", "EVASION:5"],
    ["echo-mind", "Echo Mind", "Affinity voids bite deeper.", "AFFINITY:600"],
    ["silent-bond", "Silent Bond", "Quiet companionship builds bond.", "CARE:bond:3"],
  ],
  ALLOY: [
    ["tempered-frame", "Tempered Frame", "Forged resilience.", "STAT:defense:4"],
    ["hex-core", "Hex Core", "Stable power cell.", "STAT:energy:4"],
    ["loyal-gears", "Loyal Gears", "Protective loyalty.", "STAT:attack:2"],
  ],
  SPIRIT: [
    ["lantern-soul", "Lantern Soul", "Soft spiritual presence.", "CARE:happiness:4"],
    ["ancestral-echo", "Ancestral Echo", "Affinity spirit techniques swell.", "AFFINITY:550"],
    ["wisp-step", "Wisp Step", "Half-here mobility.", "STAT:speed:3"],
  ],
};

const statusByAff = {
  EMBER: "BURN",
  TIDE: "SOAKED",
  GROVE: "ROOTED",
  STORM: "CHARGED",
  STONE: "SLOWED",
  FROST: "CHILLED",
  RADIANT: "ILLUMINATED",
  VOID: "WEAKENED",
  ALLOY: "CHARGED",
  SPIRIT: "ILLUMINATED",
};

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function prettySlug(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function aid(slug, name) {
  const safe = String(name ?? "technique");
  return `${slug}-${safe.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

const kits = {};

for (const [slug, aff, temp, blurb] of species) {
  const base = affStats[aff].slice();
  const mod = tempMod[temp] || [0, 0, 0, 0, 0];
  for (let i = 0; i < 5; i++) base[i] += mod[i];
  if (slug === "celestora") {
    base[0] += 12;
    base[1] += 6;
    base[2] += 4;
    base[3] += 4;
    base[4] += 8;
  }
  if (slug === "mistwraith") {
    base[1] += 5;
    base[3] += 5;
    base[4] += 6;
  }
  if (slug === "auralynx") {
    base[1] += 4;
    base[3] += 3;
  }
  if (slug === "hollowshade") {
    base[1] += 3;
    base[3] += 4;
  }

  if (handcrafted[slug]) {
    kits[slug] = { stats: base, ...handcrafted[slug] };
    continue;
  }

  const bank = nameBanks[aff];
  if (!bank) throw new Error(`Missing name bank for ${aff}`);
  const h = hash(slug);
  const atkName = bank.atk[h % bank.atk.length] ?? "Rift Strike";
  let atk2 = bank.atk[(h >> 3) % bank.atk.length] ?? "Rift Rush";
  if (atk2 === atkName) atk2 = bank.atk[(h + 1) % bank.atk.length] ?? "Rift Rush";
  const defName = bank.def[h % bank.def.length] ?? "Rift Guard";
  const utilPool = [...bank.heal, ...bank.sup];
  const utilName = utilPool[(h >> 5) % utilPool.length] ?? "Rift Focus";
  const ultName = bank.ult[h % bank.ult.length] ?? "Rift Finale";
  const isHeal = bank.heal.includes(utilName);
  const st = statusByAff[aff];
  const shape = h % 4;

  // Species-unique display names (pool + species prefix vibe)
  const sigAtk = `${prettySlug(slug)}'s ${atkName}`;
  const sigUlt = `${prettySlug(slug)} ${ultName}`;

  let abs;
  if (shape === 0) {
    abs = [
      [aid(slug, atkName), sigAtk, `${blurb} signature strike.`, "ATTACK", 40 + (h % 8), 10, 0, null, st, 2000 + (h % 800), 2],
      [aid(slug, defName), defName, `A defensive art of the ${prettySlug(slug)} line.`, "DEFEND", 0, 9, 2, "SELF", "ARMORED", 10000, 2],
      [
        aid(slug, utilName),
        utilName,
        isHeal ? "Restores vitality with affinity light." : "Shapes the field in its favor.",
        isHeal ? "HEAL" : "SUPPORT",
        isHeal ? 30 + (h % 8) : 0,
        isHeal ? 14 : 10,
        2,
        "SELF",
        isHeal ? "REGENERATING" : "INSPIRED",
        10000,
        2,
      ],
    ];
  } else if (shape === 1) {
    abs = [
      [aid(slug, atkName), sigAtk, `${blurb} opening technique.`, "ATTACK", 38 + (h % 6), 10, 0, null, st, 1800, 2],
      [aid(slug, atk2), atk2, "A second-string assault.", "ATTACK", 48 + (h % 10), 14, 1, null, null],
      [aid(slug, ultName), sigUlt, "Dramatic signature finisher.", "ULTIMATE", 70 + (h % 12), 38, 4, null, st, 3500, 2],
    ];
  } else if (shape === 2) {
    abs = [
      [aid(slug, atkName), sigAtk, "Primary affinity assault.", "ATTACK", 42 + (h % 7), 11, 0, null, st, 2200, 2],
      [aid(slug, defName), defName, "Brace and endure.", "DEFEND", 0, 8, 2, "SELF", "FORTIFIED", 10000, 2],
      [aid(slug, ultName), sigUlt, "High-cost dramatic technique.", "ULTIMATE", 74 + (h % 10), 40, 5, null, null],
    ];
  } else {
    abs = [
      [aid(slug, atkName), sigAtk, "Reliable opening hit.", "ATTACK", 36 + (h % 8), 9, 0, null, null],
      [
        aid(slug, utilName),
        utilName,
        isHeal ? "Affinity healing art." : "Tactical field craft.",
        isHeal ? "HEAL" : "SUPPORT",
        isHeal ? 34 : 18,
        isHeal ? 15 : 11,
        2,
        isHeal ? "SELF" : null,
        isHeal ? "REGENERATING" : st,
        isHeal ? 10000 : 5000,
        2,
      ],
      [aid(slug, defName), defName, "Protective stance.", "DEFEND", 0, 10, 2, "SELF", "ARMORED", 10000, 2],
      [aid(slug, ultName), sigUlt, "Named ultimate technique.", "ULTIMATE", 76 + (h % 8), 42, 5, null, st, 4000, 2],
    ];
  }

  const tbank = traitBanks[aff];
  if (!tbank?.length) throw new Error(`Missing trait bank for ${aff}`);
  const trs = [];
  const seen = new Set();
  const picks = [h % tbank.length, (h >> 2) % tbank.length, (h >> 4) % tbank.length];
  for (const idx of picks) {
    const t = tbank[idx];
    if (!t || seen.has(t[0])) continue;
    seen.add(t[0]);
    trs.push(t);
    if (trs.length >= 2) break;
  }
  while (trs.length < 2) {
    const t = tbank[trs.length % tbank.length];
    if (!t || seen.has(t[0])) break;
    seen.add(t[0]);
    trs.push(t);
  }
  const essenceHook = h % 3 === 0 ? "STAT:attack:2" : h % 3 === 1 ? "STAT:speed:2" : "CARE:energy:3";
  trs.push([
    `${slug}-essence`,
    `${prettySlug(slug)} Essence`,
    `Signature passive of the ${prettySlug(slug)} line.`,
    essenceHook,
  ]);

  kits[slug] = { stats: base, abs, trs };
}

function emitHook(h) {
  if (!h) return null;
  if (h.startsWith("STAT:")) {
    const [, stat, amt] = h.split(":");
    return `{ kind: "STAT_BONUS", stat: ${JSON.stringify(stat)}, amount: ${amt} }`;
  }
  if (h.startsWith("CARE:")) {
    const [, care, amt] = h.split(":");
    return `{ kind: "CARE_BONUS", care: ${JSON.stringify(care)}, amount: ${amt} }`;
  }
  if (h.startsWith("CRIT:")) return `{ kind: "CRIT_BONUS", bps: ${h.split(":")[1]} }`;
  if (h.startsWith("EVASION:")) return `{ kind: "EVASION_BONUS", amount: ${h.split(":")[1]} }`;
  if (h.startsWith("AFFINITY:")) return `{ kind: "AFFINITY_POWER", bps: ${h.split(":")[1]} }`;
  return null;
}

function emitAbility(a) {
  const [id, name, desc, cat, pwr, en, cd, target, status, chance, dur] = a;
  const lines = [
    "      {",
    `        id: ${JSON.stringify(id)},`,
    `        name: ${JSON.stringify(name)},`,
    `        description: ${JSON.stringify(desc)},`,
    `        category: ${JSON.stringify(cat)},`,
    `        power: ${pwr},`,
    `        energyCost: ${en},`,
    `        cooldown: ${cd},`,
  ];
  if (target) lines.push(`        target: ${JSON.stringify(target)},`);
  if (status) {
    lines.push(
      `        status: { id: ${JSON.stringify(status)}, chanceBps: ${chance || 10000}, duration: ${dur || 2} },`,
    );
  }
  lines.push("      }");
  return lines.join("\n");
}

function emitTrait(t) {
  const [id, name, desc, hook] = t;
  const lines = [
    "      {",
    `        id: ${JSON.stringify(id)},`,
    `        name: ${JSON.stringify(name)},`,
    `        description: ${JSON.stringify(desc)},`,
  ];
  const hookCode = emitHook(hook);
  if (hookCode) lines.push(`        hook: ${hookCode},`);
  lines.push("      }");
  return lines.join("\n");
}

let out = `import type { SpeciesKit } from "@/game/creatures/rpg-types";

/**
 * Per-species RPG kits: base stats, signature abilities, and traits.
 * Original Riftwilds IP — not Nintendo/Square names.
 */

export const SPECIES_KITS: Record<string, SpeciesKit> = {
`;

for (const [slug] of species) {
  const k = kits[slug];
  const [hp, atk, def, spd, en] = k.stats;
  out += `  ${JSON.stringify(slug)}: {\n`;
  out += `    baseStats: { hp: ${hp}, attack: ${atk}, defense: ${def}, speed: ${spd}, energy: ${en} },\n`;
  out += `    abilities: [\n${k.abs.map(emitAbility).join(",\n")}\n    ],\n`;
  out += `    traits: [\n${k.trs.map(emitTrait).join(",\n")}\n    ],\n`;
  out += `  },\n`;
}

out += `};

export function getSpeciesKit(slug: string): SpeciesKit | undefined {
  return SPECIES_KITS[slug];
}
`;

const dest = path.join(root, "src/game/creatures/species-kits.ts");
fs.writeFileSync(dest, out);
console.log(`Wrote ${Object.keys(kits).length} kits -> ${dest}`);
console.log(`Bytes: ${fs.statSync(dest).size}`);
