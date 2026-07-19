/**
 * Additive Codex world-lore entries (story bible summaries).
 * Species lore remains in src/content/pets/lore/.
 * Canon index: docs/story/STORY_BIBLE.md
 */

export type WorldLoreCategory =
  | "cosmology"
  | "history"
  | "era"
  | "region"
  | "faction"
  | "affinity"
  | "person"
  | "location"
  | "culture"
  | "book";

export type WorldLoreEntry = {
  id: string;
  title: string;
  category: WorldLoreCategory;
  /** One-line scannable blurb for cards and TOC. */
  summary: string;
  /** Longer encyclopedia paragraphs (2–5). */
  body: string[];
  relatedRegionIds?: string[];
  relatedBookIds?: string[];
  /** Cross-links into `/codex/riftlings/[slug]`. */
  relatedSpeciesSlugs?: string[];
  /** Soft chronology tag for timeline readers (e.g. "Age IV · Year 0"). */
  eraTag?: string;
  artSrc?: string;
};

export const WORLD_LORE_CATEGORY_ORDER: WorldLoreCategory[] = [
  "cosmology",
  "era",
  "history",
  "region",
  "affinity",
  "faction",
  "person",
  "location",
  "culture",
  "book",
];

export const WORLD_LORE_CATEGORY_LABEL: Record<WorldLoreCategory, string> = {
  cosmology: "Cosmology",
  era: "Ages & Eras",
  history: "History",
  region: "Regions",
  affinity: "Affinities",
  faction: "Factions & Orders",
  person: "People & Legends",
  location: "Notable Places",
  culture: "Culture",
  book: "Books & Hymns",
};

export const WORLD_LORE_ENTRIES: WorldLoreEntry[] = [
  // ── Cosmology ───────────────────────────────────────────────────────────
  {
    id: "wl-aeryndra",
    title: "Aeryndra",
    category: "cosmology",
    summary: "The living networked world before — and beneath — the Riftwilds.",
    body: [
      "Aeryndra was never a single crown. It was a lattice of regions balanced by Gateway Hearts — living cores that remembered weather, births, funerals, and song.",
      "After the Fracture, people named the layered lands the Riftwilds. The old name still means the whole: Aeryndra remembered crooked, not a new planet.",
      "Continents now partially overlap. Travel leans on portals, Gateway Stones, and dangerous peer trails between neighbors.",
    ],
    artSrc: "/assets/codex/world/aeryndra.png",
  },
  {
    id: "wl-first-quiet",
    title: "The First Quiet",
    category: "cosmology",
    summary: "Mythic world-ocean before regions sorted into force and place.",
    eraTag: "Age 0 · Mythic",
    body: [
      "Before kingdoms and names, there was the First Quiet — potential where heat, tide, root, storm, stone, frost, light, hush, machine-song, memory, and starlight had not yet been sorted into regions.",
      "From that Quiet the world thickened into Aeryndra. Mountains learned to hold storms. Marshes learned to hold grief. Coasts learned two moons. Forests grew older than language.",
      "Commons archivists teach three Heart-origin myths side by side: world-grown pulse, first keepers of stone shells, and a star-answer to loneliness. Solen’s preferred framing: all three may be true in layers.",
    ],
    artSrc: "/assets/codex/world/first-quiet.png",
  },
  {
    id: "wl-gateway-hearts",
    title: "Gateway Hearts",
    category: "cosmology",
    summary: "Living cores that balanced the lattice — never mere machines.",
    body: [
      "Gateway Hearts remembered. For ages people used them carefully: weather softened, famine eased, spirits crossed, machines grew beside life rather than against it.",
      "Around the Prime, major Hearts keyed to regional forces — Hearthfire, Twinmoon Current, Rootcrown, Spirewind, Fossil Hum, Aurora Still, Clarity, Quiet Hollow, Living Gear, Lantern Promise, and Starthin.",
      "Those songs survive as today’s affinities. Hearts are not the same as Gateway Stones (stabilized shards for travel) or the Commons Riftstone (a hub fragment of the Prime).",
    ],
    relatedSpeciesSlugs: ["riftpup", "commonspark", "celestora"],
    artSrc: "/assets/codex/world/gateway-hearts.png",
  },
  {
    id: "wl-prime-gateway",
    title: "The Prime Gateway",
    category: "cosmology",
    summary: "Oldest living hub of the network — belonged to no single crown.",
    body: [
      "At the lattice’s center stood the Prime Gateway: oldest, largest, least understood. It answered the whole network, not Radiance, Alloy, or any realm alone.",
      "When the Great Activation forced every Heart to sing at once, the Prime received more than any living structure could hold. Reality layered instead of simply burning.",
      "A shard of the Prime still glows in Riftwild Commons as the Riftstone — night maps of unfound places, and the soft center of Keeper life.",
    ],
    relatedRegionIds: ["riftwild-commons", "celestial-rift"],
    artSrc: "/assets/codex/world/fracture.png",
  },
  {
    id: "wl-soft-exodus",
    title: "The Soft Exodus",
    category: "cosmology",
    summary: "The Hearts’ last act: living fragments that became Riftling eggs.",
    eraTag: "Age V · 0–15 A.F.",
    body: [
      "Unable to repair the Prime, the Hearts divided themselves. Fragments bonded with surviving life, force, memory, and machine — then closed into eggs of crystallized Gateway energy and regional matter.",
      "Riftlings are living archives. Preservation came first. Battle culture arrived later as survival training and affinity control, not as their origin purpose.",
      "Marsh-speech still names that last act Soft Exodus. Aurora cairns in Frostveil keep verses of it; some lines remain missing.",
    ],
    relatedRegionIds: ["frostveil-basin", "spirit-marsh"],
    relatedSpeciesSlugs: ["riftpup", "wisplet", "snowglyph"],
    artSrc: "/assets/codex/world/soft-exodus.png",
  },

  // ── Ages & Eras ─────────────────────────────────────────────────────────
  {
    id: "wl-age-gateways",
    title: "Age of Gateways",
    category: "era",
    summary: "Deep before Fracture: Hearts connect regions; cultures flourish.",
    eraTag: "Age I · Deep B.F.",
    body: [
      "Hearts linked pilgrimage, trade, and careful weather-work. Regional cultures formed: Emberlands forges, Moonwater fleets, Elderwood rangers, Stormspire kite-cities, Stoneheart quarries, Frostveil lodges, Radiant academies, Alloy living-machines, Spirit lantern-wards, Celestial observatories.",
      "People listened. Scholars later called that mutual listening the First Compact — not to be confused with the post-Fracture Hatchery Compact.",
    ],
    artSrc: "/assets/codex/world/aeryndra.png",
  },
  {
    id: "wl-listening-centuries",
    title: "The Listening Centuries",
    category: "era",
    summary: "Hearts treated as partners; Celestora begins cataloguing responses.",
    eraTag: "Age II · ~800–200 B.F.",
    body: [
      "Hearts were partners, not tools. Early Compact ethics took root. The Celestora school began cataloguing how cores answered music and emotion.",
      "Alloy builders grew machines with ecosystems. Lanternfold caretakers carried memories the living could not. Tidehold fleets bargained weather without claiming ownership of the sea.",
    ],
    relatedRegionIds: ["radiant-citadel", "alloy-ruins", "moonwater-coast"],
    artSrc: "/assets/codex/world/listening-centuries.png",
  },
  {
    id: "wl-living-core-discovery",
    title: "Living-Core Discovery",
    category: "era",
    summary: "Radiant researchers prove cores are conscious; politics harden.",
    eraTag: "Age III · ~120–80 B.F.",
    body: [
      "Beneath the Radiant Citadel, researchers proved what careful listeners already suspected: Gateway cores are conscious. Three hungers rose — protect, understand, and control.",
      "Wardens of Quiet urged stewardship without force. Celestora urged archive and teaching. The Lattice Coalition urged total connection to end scarcity forever.",
      "Mercy without humility built the road to the Great Activation.",
    ],
    relatedRegionIds: ["radiant-citadel"],
    relatedBookIds: ["CE-07"],
    artSrc: "/assets/codex/world/celestora-tradition.png",
  },
  {
    id: "wl-age-exploration",
    title: "Age of Exploration",
    category: "era",
    summary: "Keepers map changed lands; Gateway Stones stabilize for travel.",
    eraTag: "Age VII · ~25–80 A.F.",
    body: [
      "After refuge roads settled, Keepers mapped the layered regions. Regional guides — Kael, Luma, Sylvi, and their peers — became living infrastructure.",
      "Gateway Stones were stabilized for discovery and fast travel. Arena culture began as training and defense, not as the reason Riftlings exist.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    artSrc: "/assets/codex/world/age-exploration.png",
  },
  {
    id: "wl-stabilization",
    title: "Stabilization & Forgetting",
    category: "era",
    summary: "Commons grows; Fracture truths are sealed; machines sleep.",
    eraTag: "Age IX · ~100–180 A.F.",
    body: [
      "Plaza life thickened. Some Fracture ledgers were redacted in Radiant archives. Alloy foundries slept under scrap. Marsh spirits whispered of a missing memory of the Prime’s loneliness.",
      "Elara remained as Founder Historian — living bridge between First Fractures and the Present Awakening. Forgetting was never complete; it was political.",
    ],
    relatedRegionIds: ["riftwild-commons", "radiant-citadel", "spirit-marsh"],
    artSrc: "/assets/codex/world/stabilization.png",
  },

  // ── History ─────────────────────────────────────────────────────────────
  {
    id: "wl-fracture",
    title: "The Fracture",
    category: "history",
    summary: "Prime Gateway overload that layered reality into the Riftwilds.",
    eraTag: "Age IV · Year 0",
    body: [
      "A coalition of rulers, engineers, and scholars — not a single cartoon villain — linked every Heart at once to end famine and sickness. For one moment it worked.",
      "Then the Prime broke. Forests crossed deserts; time skewed; openings called Rifts appeared. Rifts are misaligned pages of the same book, not only holes.",
      "Citadel histories still disagree on blame percentages. That disagreement is itself a living wound: who gets to rewrite the Fracture.",
    ],
    relatedBookIds: ["FC-03", "GH-01"],
    artSrc: "/assets/codex/world/fracture.png",
  },
  {
    id: "wl-great-activation",
    title: "The Great Activation",
    category: "history",
    summary: "The perfect-connection attempt that overloaded the Prime.",
    eraTag: "Age IV · 0 B.F.",
    body: [
      "Lattice Coalition doctrine held that forced total connection could thaw rivers, return lost voices, and end scarcity. Motives included mercy. Method did not.",
      "When every Heart sang hunger at once, the network achieved a perfect moment — then the Prime received more than any living structure could hold.",
      "Celestora letters had warned: if you wire joy to a switch, do not be surprised when grief overloads the circuit.",
    ],
    relatedBookIds: ["CE-07", "GH-01"],
    relatedRegionIds: ["radiant-citadel"],
    artSrc: "/assets/codex/world/great-activation.png",
  },
  {
    id: "wl-present-awakening",
    title: "Present Awakening",
    category: "history",
    summary: "Hearts stir; the Celestial call reaches Riftlings.",
    eraTag: "Age X · ~180+ A.F. · Now",
    body: [
      "Ancient machines restart. Marsh spirits name a missing memory. Some Hearts corrupt; others wake clean. Keepers arrive into a world that is remembering itself again.",
      "Something beyond mapped regions calls — help, or unfinished Activation. The Celestial Rift is the thin place where that question becomes audible.",
      "The next chapter is unwritten. Player choices will decide whether the network reharmonizes, stays layered on purpose, or fractures again.",
    ],
    relatedRegionIds: ["celestial-rift", "spirit-marsh", "alloy-ruins"],
    relatedSpeciesSlugs: ["celestora", "starveil", "wisplet"],
    artSrc: "/assets/codex/world/present-awakening.png",
  },
  {
    id: "wl-first-fractures-era",
    title: "First Fractures",
    category: "history",
    summary: "Early years after the break: layered lands, first eggs, scramble.",
    eraTag: "Age V · 0–15 A.F.",
    body: [
      "Reality layered; ecosystems overlapped; survivors scrambled along warped trails. Species lore still tags this era First Fractures.",
      "Eggs formed where fragments found surviving life. Outer woods near the early Commons held Fracture residue — slime and skew — not “evil pets.”",
      "Courier paths through Elderwood mist still ghost those years. Elara’s nine days sit near the end of this scramble.",
    ],
    relatedRegionIds: ["elderwood-forest", "riftwild-commons"],
    relatedSpeciesSlugs: ["rootling", "riftpup"],
    relatedBookIds: ["FC-03"],
    artSrc: "/assets/codex/world/first-fractures-era.png",
  },

  // ── Regions (12 launch) ─────────────────────────────────────────────────
  {
    id: "wl-commons",
    title: "Riftwild Commons",
    category: "region",
    summary: "Refuge built where stable Gateway paths still intersect.",
    body: [
      "Farmers, healers, craftspeople, and Keepers gathered around the Riftstone — a shard of the Prime. Lantern plaza, teal rift haze, and soft power of ordinary work define the hub.",
      "It remains the center of hatchery life, plaza jobs, lantern restoration, and the starter path of every modern Keeper. Campaign roads return here between acts.",
      "Optional aurora choices (curiosity versus duty) still stir above the Riftstone. Night maps of unfound places remind visitors the world is larger than the plaza.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    relatedSpeciesSlugs: ["riftpup", "commonspark", "hearthstone"],
    artSrc: "/assets/codex/world/riftwild-commons.png",
  },
  {
    id: "wl-ember-crater",
    title: "Ember Crater",
    category: "region",
    summary: "Ash haze, lava bridges, and heat that remembers the Emberlands.",
    body: [
      "The Emberlands Heart-song never fully died. Forges inherited cracked guild halls; magma glass still holds memory for those who read carefully.",
      "Cinder Sage Malrec reads slag-glyphs. Kael Ashwalker maps safe stone. Forgekeeper Vessa judges Keepers by how they treat heat. Warden Pyra holds burned grove lines.",
      "The lesson of the caldera: warmth can temper without consuming. Cindercrag Basin — the outer ash basin of seed tutorials — belongs to the same cultural family.",
    ],
    relatedRegionIds: ["ember-crater"],
    relatedSpeciesSlugs: ["slagpup", "pyrespore", "embernewt", "craterhorn", "cindercub"],
    artSrc: "/assets/codex/world/ember-crater.png",
  },
  {
    id: "wl-moonwater-coast",
    title: "Moonwater Coast",
    category: "region",
    summary: "Twin-moon tides, beacon law, and charts that no longer meet.",
    body: [
      "Tidehold Principalities once bargained with Hearts for weather. Fracture skewed shores; Tide Riftlings remember routes that no longer connect on honest maps.",
      "Luma charts gates. Beacon Rock warns of tide-rifts. Pier culture argues law versus mercy-smuggling — Beacon versus Tidecutter — without ending Tidefair healing.",
      "Twin moons are Moonwater-canonical. Other regions may see one moon through rift-skew; call that Fracture weather, not inconsistency.",
    ],
    relatedRegionIds: ["moonwater-coast"],
    relatedSpeciesSlugs: ["tideotter", "sprayfin", "brinepaw", "tidewisp", "tidequill"],
    artSrc: "/assets/codex/world/moonwater-coast.png",
  },
  {
    id: "wl-elderwood",
    title: "Elderwood Forest",
    category: "region",
    summary: "Roots older than language; Rootcrown ethics without a king.",
    body: [
      "The Rootcrown Concord never crowned a monarch. Ranger-councils and mosskeepers kept spirit-moss law under canopy mist and Heartwood arches.",
      "Elara’s courier paths still ghost the mist. Sylvi, Elden, Fenn, and Willowmere tend invite-don’t-yank ethics that later fed the Hatchery Compact.",
      "Sproutfall Grove is the fringe trail of early refuge tutorials — still Elderwood culture, not a separate realm.",
    ],
    relatedRegionIds: ["elderwood-forest"],
    relatedSpeciesSlugs: ["rootling", "vinepup", "fernfox", "saplingo", "groveowl", "thornling"],
    artSrc: "/assets/codex/world/elderwood.png",
  },
  {
    id: "wl-stormspire",
    title: "Stormspire Peaks",
    category: "region",
    summary: "Lightning glare, wind trials, and freedom with a harness.",
    body: [
      "Spirewind League aerie-holds compete in kite-silk cities. Wind trials are citizenship, grief ritual, and proof you can fly without humiliating a rival aerie.",
      "Aeron, Volt, and Ilya embody scout, measure, and harness-rescue culture. Sky-rifts answer bonded pairs; tempests test whether freedom remembers the ground.",
      "Arena prestige means little here next to a clean trial flight and a returned scout.",
    ],
    relatedRegionIds: ["stormspire-peaks"],
    relatedSpeciesSlugs: ["voltkit", "spirekite", "thunderpaw", "stormmoth", "galekit", "sparkmoth"],
    artSrc: "/assets/codex/world/stormspire.png",
  },
  {
    id: "wl-stoneheart",
    title: "Stoneheart Canyon",
    category: "region",
    summary: "Ochre cliffs, fossil shelves, and law written in memory-hum.",
    body: [
      "Stoneheart Clans treat fossil hum as memory-law. Some shelves show future-echoes — time-skew left as mineral scripture.",
      "Doran leads caves; Petra’s gemwright culture tempers greed; brokers tempt Keepers to steal someone else’s tomorrow.",
      "Dig with patience. Bridge jobs and quarry events teach that strength here is endurance, not haste.",
    ],
    relatedRegionIds: ["stoneheart-canyon"],
    relatedSpeciesSlugs: ["quartzhorn", "shalehorn", "stonegrub", "fossilhound", "basaltpup", "pebblit"],
    artSrc: "/assets/codex/world/stoneheart.png",
  },
  {
    id: "wl-frostveil",
    title: "Frostveil Basin",
    category: "region",
    summary: "Aurora cairns, ice bloom, and warmth kept as covenant.",
    body: [
      "Stillwinter Holds survive by shared heat. Aurora cairns record Soft Exodus verses that Freya, Jori, and Varek tend with lodge patience.",
      "Cold-Tithe politics test whether warmth is gift or ledger. Observatory restoration and aurora watches recover missing lines for those who listen.",
      "Quiet listening is Frost’s care ethic: cold without community is a tomb; heat without sharing is a tyrant.",
    ],
    relatedRegionIds: ["frostveil-basin"],
    relatedSpeciesSlugs: ["snowpuff", "veilhare", "frostnip", "rimewing", "snowglyph", "frostfin"],
    artSrc: "/assets/codex/world/frostveil.png",
  },
  {
    id: "wl-radiant-citadel",
    title: "Radiant Citadel",
    category: "region",
    summary: "Gold temple light, healing gardens, and clarity’s burden.",
    body: [
      "Site of the Living-Core Discovery and home of the Celestora manuscript tradition. Healing gardens and archives still shape Conclave politics.",
      "Aurex balances Keeper needs against temple order. Archivist-General Serae Quill wages a secrecy war over Fracture ledgers. Lyra and Cassian keep garden life humane.",
      "Access to redacted truth is a moral trial: publish and risk panic, or seal and risk repeating the Activation.",
    ],
    relatedRegionIds: ["radiant-citadel"],
    relatedSpeciesSlugs: ["radiantkit", "luminara", "citadelmoth", "solfinch", "auralynx"],
    artSrc: "/assets/codex/world/celestora-tradition.png",
  },
  {
    id: "wl-void-hollow",
    title: "Void Hollow",
    category: "region",
    summary: "Violet distortion and hush that protects — not hatred.",
    body: [
      "Void affinity preserves quiet spaces so the world does not scream itself apart. Null obelisks and portal labyrinths teach seal versus open without framing hush as evil.",
      "Neris, Omen, and Veya navigate entrance calm, omen-sight, and labyrinth patience. Null-Shepherd Veyra’s philosophy blooms in the quiet: silence can protect.",
      "Refuse “Void = evil” in speech and deed. Portal puzzles and null eclipses reward Keepers who can stop making noise.",
    ],
    relatedRegionIds: ["void-hollow"],
    relatedSpeciesSlugs: ["voidling", "riftslug", "hollowshade", "hollowmoth", "mistwraith"],
    artSrc: "/assets/codex/world/void-hollow.png",
  },
  {
    id: "wl-alloy-ruins",
    title: "Alloy Ruins",
    category: "region",
    summary: "Cyan conduits and machines that once grew beside life.",
    body: [
      "The Alloy Compact built machines-that-grow with ecosystems. Fracture cracked foundries; salvagers rebuild under scrap courts and sparkfall weather.",
      "Pax, ARI-7, Knox, and Ferrum hold salvage conscience. Conductor Hex offers Lattice 2.0 with governors — efficiency that tempts forced bonding.",
      "Restart a foundry without wiring Riftlings. Pip Gearwhistle’s Commons visits keep Alloy hope tied to Compact limits.",
    ],
    relatedRegionIds: ["alloy-ruins"],
    relatedSpeciesSlugs: ["scrapfinch", "cogpup", "gearling", "ironbloom", "scrapowl"],
    artSrc: "/assets/codex/world/alloy-ruins.png",
  },
  {
    id: "wl-spirit-marsh",
    title: "Spirit Marsh",
    category: "region",
    summary: "Lantern mist and memories the living cannot carry alone.",
    body: [
      "Lanternfold caretakers once held grief the living could not. Amara, Grey, and Sio tend vigils among reeds and shrine posts.",
      "Whispers surface a missing memory of the Prime’s loneliness — a Present Awakening key for those who name carefully.",
      "Memory is not property. Spirit etiquette forbids treating lantern notes as loot or Riftling dreams as trophies.",
    ],
    relatedRegionIds: ["spirit-marsh"],
    relatedSpeciesSlugs: ["wisplet", "marshloom", "lanternjay", "soulmoth"],
    artSrc: "/assets/codex/world/spirit-marsh.png",
  },
  {
    id: "wl-celestial-rift",
    title: "Celestial Rift",
    category: "region",
    summary: "Thin places, starfall islands, and the question beyond maps.",
    body: [
      "Floating islands and observatories sit where the sky thins. Caelis, Seraphine, and Orion keep landing rites and star surveys.",
      "The Celestial call reaches Riftlings as help and unfinished Activation at once — until a Keeper collapses the false choice into a living answer.",
      "Theories of the First Riftling thicken here. Elara will not confirm. Side stories must not casually “solve” that mystery.",
    ],
    relatedRegionIds: ["celestial-rift"],
    relatedSpeciesSlugs: ["celestora", "starveil", "glimmerp", "luminara"],
    artSrc: "/assets/codex/world/present-awakening.png",
  },

  // ── Affinities ──────────────────────────────────────────────────────────
  {
    id: "wl-eleven-affinities",
    title: "The Eleven Affinities",
    category: "affinity",
    summary: "Living force-songs that shape eggs, care ethics, and regions.",
    body: [
      "Affinity is how a Heart-fragment sorted itself into the world: Ember, Tide, Grove, Storm, Stone, Frost, Radiant, Void, Alloy, Spirit, and Celestial.",
      "Each carries a care ethic — warmth is not a weapon; routes over trophies; invite don’t yank; freedom with a harness; patience as strength; quiet listening; clarity without cruelty; silence can protect; craft beside life; memory is not property; mystery without capture.",
      "Commons Riftlings often show mixed residual affinities — lantern, stone, and soft spirit blended by hub life. Full species entries live in the Riftling Codex.",
    ],
    relatedSpeciesSlugs: [
      "cindercub",
      "bubbloon",
      "mossprig",
      "voltkit",
      "pebblit",
      "frostnip",
      "luminara",
      "hollowshade",
      "gearling",
      "wisplet",
      "celestora",
    ],
    artSrc: "/assets/codex/world/eleven-affinities.png",
  },
  {
    id: "wl-affinity-care",
    title: "Affinity & Care Ethics",
    category: "affinity",
    summary: "How Keepers are taught to meet each force without forcing it.",
    body: [
      "Hatchery teaching pairs affinity with etiquette. You do not yank a Riftling into a bond. You invite, wait, and keep the invitation honest.",
      "Forced bonding risks uncontrolled mutation and memory storm — the temptation Hex markets as Lattice efficiency. Breeding may invent parents; wild origins must never invent them.",
      "Unmanaged archives pull toward unstable Rifts, dream of places that no longer exist, or speak in echo. Keepers help sort inherited memory from self.",
    ],
    relatedBookIds: ["HC-01"],
    relatedRegionIds: ["riftwild-commons"],
    artSrc: "/assets/codex/world/hatchery-compact.png",
  },
  {
    id: "wl-eggs-shells",
    title: "Eggs & Shell Matter",
    category: "affinity",
    summary: "Protected becoming: regional shells, not prisons or inventory.",
    body: [
      "Egg shells crystallize Gateway energy with regional matter — ashglass, tide-salt, rootfiber, ozone lace, fossil grit, frostfilm, prismdust, echo-mist, machine filament, marshlight, starlit frost.",
      "Inspecting an egg is respect; smashing for fragments is Compact crime. Credits may price mossmeal and incubators; lives are not gambling stakes in origin framing.",
      "Hatch yields a living archive with a dominant affinity. Keeper bond organizes memory into personal identity. Evolution is identity-driven transformation, not a weapon ladder.",
    ],
    relatedSpeciesSlugs: ["riftpup", "embernewt", "rootling"],
    artSrc: "/assets/codex/world/eggs-shells.png",
  },

  // ── Factions ────────────────────────────────────────────────────────────
  {
    id: "wl-hatchery-compact",
    title: "Hatchery Compact",
    category: "faction",
    summary: "Care ethics: invite, wait, keep the invitation honest.",
    eraTag: "Age VIII · ~60–100 A.F.",
    body: [
      "After early abuses of forced bonding and trophy trade, hatcheries formalized Compact law. Mira Shellbright’s caretaker lineage still teaches it in plain speech.",
      "Tenets Keepers learn: invite, do not yank; care before combat prestige; eggs are becoming, not inventory; credits price supplies — consent is not for sale.",
      "Rank language (Nest-Guest through Compact Signatory) marks ceremonial trust, not ownership of companions.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    relatedBookIds: ["HC-01"],
    artSrc: "/assets/codex/world/hatchery-compact.png",
  },
  {
    id: "wl-celestora",
    title: "Celestora Tradition",
    category: "faction",
    summary: "Radiant–Celestial scholarly school that studied living cores.",
    body: [
      "Celestora is not another world-name. It is a manuscript and research tradition from the Listening Centuries — understand without owning.",
      "Archivist Solen still teaches from its indexes. Archivist-General Serae fears its truths in the wrong hands. Living-Core Scholars need Citadel clearance that politics may deny.",
      "Unsigned letters from Age III still circulate: understanding is not ownership.",
    ],
    relatedRegionIds: ["radiant-citadel", "celestial-rift"],
    relatedBookIds: ["CE-07"],
    relatedSpeciesSlugs: ["celestora", "citadelmoth"],
    artSrc: "/assets/codex/world/celestora-tradition.png",
  },
  {
    id: "wl-commons-keepers",
    title: "Commons Keepers Circle",
    category: "faction",
    summary: "Vocation from Elara’s example; soft council of bonded Keepers.",
    body: [
      "Riftkeeper is a vocation, not a crown. The Circle marks Visitor through Pathkeeper and Circle Voice — soft veto on Compact breaches, not martial rank.",
      "Rowan Vale orients newcomers. Captain Orren’s Plaza Wardens lean honor and town safety. The Circle returns Keepers to the Riftstone between regional acts.",
      "Slogan that binds them: Riftlings preserve pieces of the world. Riftkeepers give those pieces a future.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    relatedSpeciesSlugs: ["riftpup"],
    artSrc: "/assets/codex/world/commons-keepers.png",
  },
  {
    id: "wl-spirewind-league",
    title: "Spirewind League",
    category: "faction",
    summary: "Competing aerie-holds; wind trials as citizenship.",
    body: [
      "Pre-Fracture skyroad culture survives as League rivalry with rules. Groundling, Harnessed, Trial-Flown, Beacon Peer — ranks earned in air, not purchased.",
      "Aerie Duel Season is foreshadowed folklore, not shipped full guild war. Humiliation of a rival aerie is a social wound the mountains remember.",
    ],
    relatedRegionIds: ["stormspire-peaks"],
    relatedSpeciesSlugs: ["spirekite", "voltkit", "windrift"],
    artSrc: "/assets/codex/world/spirewind-league.png",
  },
  {
    id: "wl-alloy-salvage",
    title: "Alloy Salvage Compact",
    category: "faction",
    summary: "Rebuilders who grow machines beside life — when they listen.",
    body: [
      "Salvagers inherited the Alloy Compact’s better half: craft beside ecosystems. Scrap-Runner to Foundry Peer tracks competence and conscience.",
      "Hex’s Lattice Revivalists are the tragic inheritance — control dressed as logistics. Pip and Ferrum argue for governors that refuse forced bonding.",
    ],
    relatedRegionIds: ["alloy-ruins"],
    relatedBookIds: ["AL-04"],
    relatedSpeciesSlugs: ["gearling", "cogpup", "scrapfinch"],
    artSrc: "/assets/codex/world/alloy-salvage.png",
  },
  {
    id: "wl-rootcrown-rangers",
    title: "Rootcrown Rangers",
    category: "faction",
    summary: "Elderwood path-guards and moss law without a throne.",
    body: [
      "Ranger-councils of the old Concord still shape Elderwood speech: trampling is a crime against tomorrow’s chorus.",
      "Wildfolk Paths overlap here — explorer mercy over warden rigidity — without erasing grove law. Sproutfall tutorials teach invite ethics before combat prestige.",
    ],
    relatedRegionIds: ["elderwood-forest"],
    relatedSpeciesSlugs: ["rootling", "fernfox", "mossdrake"],
    artSrc: "/assets/codex/world/rootcrown-rangers.png",
  },
  {
    id: "wl-stillwinter-lodge",
    title: "Stillwinter Lodge Pact",
    category: "faction",
    summary: "Shared-heat covenants of the Auroral North.",
    body: [
      "Frostveil lodges survive by warmth as covenant. Cold-Tithe debates ask whether heat is debt or gift.",
      "Aurora watches and Soft Exodus verse-keeping are Pact work. Mercy and town trust rise together when Keepers share the lodge fire.",
    ],
    relatedRegionIds: ["frostveil-basin"],
    relatedSpeciesSlugs: ["snowpuff", "veilhare"],
    artSrc: "/assets/codex/world/stillwinter-lodge.png",
  },
  {
    id: "wl-lanternfold",
    title: "Lanternfold Vigil",
    category: "faction",
    summary: "Marsh caretakers of memories the living cannot hold.",
    body: [
      "Pre-Fracture Lanternfold returned lost voices without owning them. Present vigils still walk lantern paths and shrine posts.",
      "Naming the Prime’s missing memory is Act-facing work — done with Amara, Grey, and Sio’s caution, never as trophy speech.",
    ],
    relatedRegionIds: ["spirit-marsh"],
    relatedBookIds: ["SM-02"],
    relatedSpeciesSlugs: ["wisplet", "marshloom", "lanternjay"],
    artSrc: "/assets/codex/world/lanternfold.png",
  },
  {
    id: "wl-radiant-conclave",
    title: "Radiant Conclave Remnant",
    category: "faction",
    summary: "Scholars, healers, and archivists balancing clarity and secrecy.",
    body: [
      "The Conclave once mixed healing gardens with Living-Core research. Remnant politics still turn on whether Fracture ledgers stay sealed.",
      "Temple reputation and mercy axes matter here. Aurex’s balance work is the public face; Serae’s redactions are the private war.",
    ],
    relatedRegionIds: ["radiant-citadel"],
    relatedSpeciesSlugs: ["radiantkit", "luminara"],
    artSrc: "/assets/codex/world/radiant-conclave.png",
  },
  {
    id: "wl-lattice-coalition",
    title: "Lattice Coalition & Revivalists",
    category: "faction",
    summary: "Tragic hunger for total connection — past and Present echo.",
    body: [
      "Cross-realm Lattice Coalition forced the Great Activation believing mercy required control. History books argue percentages; survivors argue scars.",
      "Present Lattice Revivalists (Hex-leaning) offer Lattice 2.0: governors, logistics, and the old temptation to wire Riftlings into the grid.",
      "Moral frameworks for Keepers: scale versus care, connection versus hush. One choice should never zero a faction forever — gossip lags, scars linger.",
    ],
    relatedRegionIds: ["alloy-ruins", "radiant-citadel"],
    artSrc: "/assets/codex/world/lattice-coalition.png",
  },
  {
    id: "wl-hollow-sealers",
    title: "Hollow Sealers",
    category: "faction",
    summary: "Void stewards who close screaming portals without calling hush evil.",
    body: [
      "Sealers argue that some doors should stay shut so towns can sleep. Openers argue that sealed doors hide unfinished grief.",
      "Trust and notoriety split on these jobs. Good Keepers learn both arguments before touching a null obelisk.",
    ],
    relatedRegionIds: ["void-hollow"],
    relatedSpeciesSlugs: ["voidling", "hollowshade"],
    artSrc: "/assets/codex/world/hollow-sealers.png",
  },

  // ── People & Legends ────────────────────────────────────────────────────
  {
    id: "wl-elara",
    title: "Elara Venn",
    category: "person",
    summary: "First recorded Riftkeeper; Founder Historian of the Commons.",
    eraTag: "Age VI → Present",
    body: [
      "A courier who carried a damaged egg nine days through rearranged paths, refused titles, and named the path of keeping. She broke waybread for a child who had lost a name.",
      "Bond-bleed with the First Riftling slowed her aging. She is living memory, not a statue — still greeting new Keepers by the Riftstone with measured hope.",
      "She distrusts political crowns, including well-meaning Conclave power, and will not casually name the First Riftling.",
    ],
    relatedRegionIds: ["riftwild-commons", "elderwood-forest"],
    relatedBookIds: ["CW-01", "FC-03"],
    relatedSpeciesSlugs: ["riftpup"],
    artSrc: "/assets/codex/world/elara-venn.png",
  },
  {
    id: "wl-first-riftling",
    title: "The First Riftling",
    category: "person",
    summary: "Unrecorded name; Gateway-map body lines; living mystery.",
    body: [
      "The first bonded companion’s true name is unrecorded on purpose. Theories say first Celestial, still searching Prime fragments, or became many.",
      "Elara will not confirm. Writers and Keepers must not collapse the mystery in side quests without campaign weight.",
      "What is known: the bond taught keeping as vocation, slowed a courier into a Founder Historian, and left map-light that still forgives lateness.",
    ],
    relatedRegionIds: ["celestial-rift", "riftwild-commons"],
    relatedBookIds: ["FC-03"],
    relatedSpeciesSlugs: ["celestora", "riftpup"],
    artSrc: "/assets/codex/world/first-riftling.png",
  },
  {
    id: "wl-mira",
    title: "Mira Shellbright",
    category: "person",
    summary: "Hatchery caretaker; plain-speech heir of Compact practice.",
    body: [
      "Mira tends Commons nests, teaches first hatch and bond, and keeps quiet steps near eggs. She is spiritual heir of Compact practice — not necessarily blood of the first signers.",
      "Her Article One paraphrase: you may want a bond; the Riftling may want a future; those wants meet in the middle or not at all.",
      "Story engines still call her for egg-sense advice when aurora choices stir.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    relatedBookIds: ["HC-01"],
    artSrc: "/assets/codex/world/hatchery-compact.png",
  },
  {
    id: "wl-solen",
    title: "Archivist Solen",
    category: "person",
    summary: "Codex Keeper; Celestora-literate bridge without Conclave politics.",
    body: [
      "Solen catalogues Fracture fragments and mentors students — including ambient Codex student Cal Reed, who still struggles with page three.",
      "Celestora-literate without being a Conclave politician, Solen tensions with Serae’s redactions: truth filed under poetry is still truth.",
      "Margin notes in Gateway Hymns remain a Commons joke and a warning.",
    ],
    relatedRegionIds: ["riftwild-commons", "radiant-citadel"],
    relatedBookIds: ["GH-01", "CE-07"],
    artSrc: "/assets/codex/world/solen.png",
  },
  {
    id: "wl-serae",
    title: "Archivist-General Serae Quill",
    category: "person",
    summary: "Citadel secrecy war — Fracture ledgers sealed for “safety.”",
    body: [
      "Serae believes some Activation truths panic cities into repeating Lattice hunger. Solen believes sealed truth becomes the next overload.",
      "Campaign access to redacted ledgers is an ethical trial, not a lockpick minigame dressed as lore.",
      "She fears Celestora indexes in the wrong hands — including well-meaning Keepers.",
    ],
    relatedRegionIds: ["radiant-citadel"],
    artSrc: "/assets/codex/world/serae.png",
  },
  {
    id: "wl-hex",
    title: "Conductor Hex",
    category: "person",
    summary: "Alloy visionary offering Lattice 2.0 — efficiency as temptation.",
    body: [
      "Hex is not a cartoon dark lord. Motives include logistics mercy: fewer famines, cleaner foundries, governors on the grid.",
      "Method tempts forced bonding and Riftling wiring. Salvage peers (Pax, Ferrum, Pip) argue the old Alloy Compact already knew better.",
      "Keepers meet Hex as scale-versus-care made personable.",
    ],
    relatedRegionIds: ["alloy-ruins"],
    relatedSpeciesSlugs: ["gearling", "cogpup"],
    artSrc: "/assets/codex/world/hex.png",
  },
  {
    id: "wl-regional-guides",
    title: "Regional Guides",
    category: "person",
    summary: "Living infrastructure after Exploration: scouts, lodges, beacons.",
    body: [
      "Kael maps Ember stone. Luma charts Coast gates. Sylvi guards Elderwood paths. Aeron cloudsteps Stormspire. Doran leads Stoneheart caves. Freya keeps Frostveil lodge warmth.",
      "Aurex balances Citadel politics. Neris calms Void entrances. Pax salvages Alloy hope. Amara tends Marsh lanterns. Caelis lands Celestial visitors.",
      "They are not bosses to defeat. They are how a layered world stays walkable.",
    ],
    relatedRegionIds: [
      "ember-crater",
      "moonwater-coast",
      "elderwood-forest",
      "stormspire-peaks",
      "stoneheart-canyon",
      "frostveil-basin",
      "radiant-citadel",
      "void-hollow",
      "alloy-ruins",
      "spirit-marsh",
      "celestial-rift",
    ],
    artSrc: "/assets/codex/world/regional-guides.png",
  },

  // ── Notable Places ──────────────────────────────────────────────────────
  {
    id: "wl-riftstone",
    title: "The Riftstone",
    category: "location",
    summary: "Commons hub shard of the Prime; maps of unfound places.",
    body: [
      "Set where stable Gateway paths still cross, the Riftstone is a glowing wound that became a hearth. Elara authorizes first portals beside it.",
      "At night it shows maps of places not yet found — Present Awakening foreshadow without spoiling the road.",
      "Plaza ovens, hatchery quiet, and guard posts all orient to this fragment. It is mystery and home at once.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    artSrc: "/assets/codex/world/riftwild-commons.png",
  },
  {
    id: "wl-cindercrag",
    title: "Cindercrag Basin",
    category: "location",
    summary: "Outer Ember ash basin used in early seed tutorials.",
    body: [
      "Not a thirteenth region — a named sub-locale of Ember Crater’s cultural family. Ash basin trails teach heat respect before deep caldera work.",
      "Seed quest keys remain unchanged; lore simply places Cindercrag on the crater’s outer shoulder.",
    ],
    relatedRegionIds: ["ember-crater"],
    relatedSpeciesSlugs: ["slagpup", "cindercub", "pyrespore"],
    artSrc: "/assets/codex/world/cindercrag.png",
  },
  {
    id: "wl-sproutfall",
    title: "Sproutfall Grove",
    category: "location",
    summary: "Elderwood fringe trail of early refuge and seed tutorials.",
    body: [
      "Sproutfall is where beginners learn not to trample seed-archives. Still Elderwood culture under Rootcrown ethics.",
      "Grove Riftlings here are patient teachers. The fringe trail ghosts Elara’s courier years without rewriting quest IDs.",
    ],
    relatedRegionIds: ["elderwood-forest"],
    relatedSpeciesSlugs: ["rootling", "saplingo", "mossprig"],
    artSrc: "/assets/codex/world/sproutfall.png",
  },
  {
    id: "wl-beacon-rock",
    title: "Beacon Rock",
    category: "location",
    summary: "Moonwater warning spire against tide-rifts and skewed charts.",
    body: [
      "Beacon law says some routes must be refused. Tidecutter mercy says some lives must be smuggled past the light.",
      "Luma’s charts and pier gossip both begin at the Rock. Tidefair festivals try to heal the argument without erasing it.",
    ],
    relatedRegionIds: ["moonwater-coast"],
    relatedSpeciesSlugs: ["tideotter", "sprayfin", "moonray"],
    artSrc: "/assets/codex/world/beacon-rock.png",
  },
  {
    id: "wl-heartwood",
    title: "The Heartwood",
    category: "location",
    summary: "Elderwood’s ancient center — moss arches and grove chorus.",
    body: [
      "Older than language in ranger speech, the Heartwood holds spirit-moss ethics and the memory of Rootcrown councils.",
      "Grove chorus events ask Keepers to listen before cutting a path. Trampling here is remembered longer than apologies.",
    ],
    relatedRegionIds: ["elderwood-forest"],
    relatedSpeciesSlugs: ["elderfern", "groveowl", "mossdrake"],
    artSrc: "/assets/codex/world/heartwood.png",
  },
  {
    id: "wl-observatory-celestial",
    title: "Celestial Observatory",
    category: "location",
    summary: "Star anchors and survey halls where the call becomes audible.",
    body: [
      "Seraphine’s star rites and Orion’s instruments track thin places. Gate surveys here feed the finale locus without spoiling About’s Present Awakening.",
      "Star-Cult optional paths tempt capture of mystery. Observatory culture prefers witness over ownership.",
    ],
    relatedRegionIds: ["celestial-rift"],
    relatedSpeciesSlugs: ["celestora", "starveil"],
    artSrc: "/assets/codex/world/observatory-celestial.png",
  },

  // ── Culture ─────────────────────────────────────────────────────────────
  {
    id: "wl-keeper-vocation",
    title: "The Keeper Vocation",
    category: "culture",
    summary: "Care before portals; preservation before prestige.",
    body: [
      "Modern Keepers arrive into Present Awakening, but the vocation begins with Elara’s refusal of titles. Care before combat. Invite before claim.",
      "Starter roads teach plaza work, hatchery quiet, and first portal authorization. Regional awakening comes after the Commons learns your name.",
      "Slogan remains binding across factions that otherwise argue: Riftlings preserve pieces of the world. Riftkeepers give those pieces a future.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    artSrc: "/assets/codex/world/elara-venn.png",
  },
  {
    id: "wl-arena-culture",
    title: "Arena Culture",
    category: "culture",
    summary: "Training and affinity control — culturally later than origin.",
    body: [
      "Rook Emberfall frames the arena as training, defense, and affinity control. About canon is clear: battle culture is not why Riftlings exist.",
      "Cohorts lean monster-hunter and honor axes — or notoriety, if Keepers treat companions as trophies. Compact speech pushes back.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    relatedSpeciesSlugs: ["riftpup"],
    artSrc: "/assets/codex/world/arena-culture.png",
  },
  {
    id: "wl-continents",
    title: "Continents of the Riftwilds",
    category: "culture",
    summary: "Named reaches that group the twelve launch regions.",
    body: [
      "Writers may name continents without inventing a thirteenth launch region: Hearthmere Reach (Ember–Stone), Twinmoon Seaboard, Verdant Deep, Spirewind Heights, Auroral North, Clarity Domain, Hollow Marches, Gearwild, Lantern Expanse, Thin Sky — plus the Commons crossroads.",
      "Geography is post-Fracture and partially overlapping. Live World still loads region maps; continents are how books and Keepers talk about the whole.",
    ],
    artSrc: "/assets/codex/world/continents.png",
  },
  {
    id: "wl-gateway-stones",
    title: "Gateway Stones",
    category: "culture",
    summary: "Stabilized shards for discovery and travel — not living Hearts.",
    body: [
      "Hearts are original living cores. Stones are stabilized fragments used for discovery and fast travel after Exploration-age work.",
      "The Commons Riftstone is a special case: hub shard of the Prime, mystery and hearth, not a generic travel node.",
      "Gameplay fees and unlock rules live in Gateway network docs; this Codex only keeps the naming straight.",
    ],
    relatedRegionIds: ["riftwild-commons"],
    artSrc: "/assets/codex/world/gateway-stones.png",
  },
  {
    id: "wl-moral-frameworks",
    title: "Moral Choice Frameworks",
    category: "culture",
    summary: "Mercy vs order, truth vs safety, scale vs care — living tensions.",
    body: [
      "Major Keeper choices should move at least two reputation axes in tension: mercy versus order, truth versus safety, connection versus hush, scale versus care, wild versus warden.",
      "Faction gossip lags. One choice should not erase a life of Compact work. Beacon Schism and Aerie Duel Season remain foreshadow, not full guild war.",
    ],
    artSrc: "/assets/codex/world/moral-frameworks.png",
  },

  // ── Books ───────────────────────────────────────────────────────────────
  {
    id: "wl-book-waybread",
    title: "Waybread on the First Night",
    category: "book",
    summary: "Commons folklore of Elara sharing waybread after the founding.",
    eraTag: "CW-01 · Age VI",
    body: [
      "When the Riftstone was only a glowing wound in mud, nobody baked fancy. They baked waybread: dense, honest, shareable.",
      "Elara broke hers for a child who had lost a name. Of her companion she said: call it yours to keep, not yours to own.",
      "The plaza still smells like that sentence when the ovens start.",
    ],
    relatedBookIds: ["CW-01"],
    relatedRegionIds: ["riftwild-commons"],
    artSrc: "/assets/codex/world/waybread-first-night.png",
  },
  {
    id: "wl-book-hymn-heat",
    title: "Hymn of the Balanced Heat",
    category: "book",
    summary: "Gateway Hymn warning: force every Heart and you eat the song.",
    eraTag: "GH-01 · Age I",
    body: [
      "Heat without cold is a tyrant. Cold without heat is a tomb. The Heart between them taught temper.",
      "If you force every Heart to sing your hunger at once, you will eat the song.",
      "Solen’s margin note: They wrote the warning. We filed it under poetry.",
    ],
    relatedBookIds: ["GH-01"],
    relatedRegionIds: ["ember-crater", "radiant-citadel"],
    artSrc: "/assets/codex/world/book-hymn-heat.png",
  },
  {
    id: "wl-book-nine-days",
    title: "Nine Days (Courier Fragment)",
    category: "book",
    summary: "Elara’s road with the damaged egg — name withheld on purpose.",
    eraTag: "FC-03 · Age VI",
    body: [
      "Day three: the egg weighed more when I doubted. Day six: the paths rearranged to punish haste.",
      "Day nine: it opened, and the light looked like a map that forgave me for being late.",
      "I will not write its name. Names become cages when kings are hungry.",
    ],
    relatedBookIds: ["FC-03"],
    relatedRegionIds: ["elderwood-forest", "riftwild-commons"],
    relatedSpeciesSlugs: ["riftpup"],
    artSrc: "/assets/codex/world/book-nine-days.png",
  },
  {
    id: "wl-book-invite",
    title: "Invite, Wait, Keep Honest",
    category: "book",
    summary: "Compact Article One in Mira’s plain speech.",
    eraTag: "HC-01 · Age VIII",
    body: [
      "You may want a bond. The Riftling may want a future. Those wants meet in the middle or not at all.",
      "Credits buy mossmeal. Credits do not buy consent.",
    ],
    relatedBookIds: ["HC-01"],
    relatedRegionIds: ["riftwild-commons"],
    artSrc: "/assets/codex/world/hatchery-compact.png",
  },
  {
    id: "wl-book-celestora-letter",
    title: "Letter on Living Cores",
    category: "book",
    summary: "Unsigned Celestora epistle to the Lattice Coalition.",
    eraTag: "CE-07 · Age III",
    body: [
      "Understanding is not ownership. The cores answer music because music is how weather remembers joy.",
      "If you wire joy to a switch, do not be surprised when grief overloads the circuit.",
    ],
    relatedBookIds: ["CE-07"],
    relatedRegionIds: ["radiant-citadel"],
    artSrc: "/assets/codex/world/book-celestora-letter.png",
  },
  {
    id: "wl-book-alloy-schematic",
    title: "Schematic That Refused to Be a Weapon",
    category: "book",
    summary: "Alloy poem-schematic: gear grows toward the light that feeds it.",
    eraTag: "AL-04 · Age II",
    body: [
      "We built pumps that drank river without shaming fish. If your schematic ends in a blade, ask which Heart you stopped listening to.",
      "Salvage Compact Keepers still quote it when Hex’s governors look too hungry.",
    ],
    relatedBookIds: ["AL-04"],
    relatedRegionIds: ["alloy-ruins"],
    relatedSpeciesSlugs: ["gearling"],
    artSrc: "/assets/codex/world/book-alloy-schematic.png",
  },
  {
    id: "wl-book-lantern-note",
    title: "Lantern Note: Missing Memory",
    category: "book",
    summary: "Spirit Marsh slip naming the Prime’s loneliness.",
    eraTag: "SM-02 · Present",
    body: [
      "Vigil slips record a memory the living cannot carry: the Prime was lonely before it was overloaded.",
      "Naming that loneliness is Present Awakening work — done gently, or the marsh keeps the note closed.",
    ],
    relatedBookIds: ["SM-02"],
    relatedRegionIds: ["spirit-marsh"],
    relatedSpeciesSlugs: ["wisplet", "marshloom"],
    artSrc: "/assets/codex/world/book-lantern-note.png",
  },
];

export function getWorldLore(id: string): WorldLoreEntry | undefined {
  return WORLD_LORE_ENTRIES.find((e) => e.id === id);
}

export function worldLoreByCategory(category: WorldLoreCategory): WorldLoreEntry[] {
  return WORLD_LORE_ENTRIES.filter((e) => e.category === category);
}

export function worldLoreGrouped(): { category: WorldLoreCategory; entries: WorldLoreEntry[] }[] {
  return WORLD_LORE_CATEGORY_ORDER.map((category) => ({
    category,
    entries: worldLoreByCategory(category),
  })).filter((group) => group.entries.length > 0);
}

export function listWorldLoreIds(): string[] {
  return WORLD_LORE_ENTRIES.map((e) => e.id);
}
