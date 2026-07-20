/**
 * Official Riftwilds cinematic origin lore for `/about`.
 *
 * Docs note:
 * - This module is the single source of truth for the About page story chapters,
 *   narrator script, timeline, character profiles, and informational blocks.
 * - Generated cinematic masters live in `public/assets/about/`.
 * - Graphic-novel comic panels live in `public/assets/about/comic/` (wordless art;
 *   titles/captions stay in HTML).
 * - Lifecycle / bridge card backgrounds live in `public/assets/about/lifecycle/`.
 * - Chapters without a dedicated master may reuse region/wallpaper art as interim
 *   backgrounds until more scene PNGs are produced.
 * - Story-first: no investment, token-price, or marketplace-profit framing here.
 * - All names, places, and mythology are original Riftwilds IP.
 */

export const ABOUT_SLOGAN =
  "Riftlings preserve pieces of the world. Riftkeepers give those pieces a future.";

export const ABOUT_META = {
  title: "The Story of Riftwilds | Discover the Origin of the Riftlings",
  description:
    "Learn how Gateway Heart fragments became Riftlings — from Fracture to First Eggs to First Keeper — and why they seek companions who can give those living pieces a future.",
  heroTitle: "THE STORY OF THE RIFTWILDS",
  heroSubtitle: "Before they were companions, they were guardians.",
  heroSupport:
    "Born from a world torn apart, the Riftlings were created to carry its last living pieces.",
} as const;

export type AboutChapterId =
  | "before"
  | "discovery"
  | "fracture"
  | "riftlings"
  | "keepers"
  | "commons"
  | "call";

export type ComicArt = {
  src: string;
  alt: string;
  /** HTML caption — never baked into the PNG */
  caption?: string;
};

export type AboutChapter = {
  id: AboutChapterId;
  navLabel: string;
  heading: string;
  kicker: string;
  support: string;
  body: string[];
  sceneSrc: string;
  sceneAlt: string;
  accent: string;
  /** true when art was generated for this About page; false when reusing region/wallpaper art */
  generatedAsset: boolean;
  /** Optional comic inset enriching the cinematic chapter */
  comicInset?: ComicArt;
};

export type TimelineEntry = {
  id: string;
  title: string;
  summary: string;
  comic: ComicArt;
};

export type CharacterProfile = {
  id: string;
  name: string;
  role: string;
  traits: string[];
  background: string;
  visualNotes: string;
  mysteryNote?: string;
  portrait: ComicArt;
  panels?: ComicArt[];
};

export type InfoBlock = {
  id: string;
  title: string;
  body: string[];
  bullets?: string[];
  comic?: ComicArt;
};

export type OriginDiagramNode = {
  id: string;
  label: string;
  detail: string;
  comic: ComicArt;
};

/** Scene path helpers — generated masters + interim region reuse */
export const aboutScenePaths = {
  hero: "/assets/about/about-hero-rift.png",
  aeryndra: "/assets/about/about-aeryndra-whole.png",
  discovery: "/assets/about/about-discovery-core.png",
  fracture: "/assets/about/about-fracture.png",
  firstRiftlings: "/assets/about/about-first-riftlings.png",
  elara: "/assets/about/about-elara-egg.png",
  commons: "/assets/about/about-commons-founding.png",
  call: "/assets/about/about-celestial-call.png",
  /** Birth-of-Riftlings comic panels (no text baked into art) */
  comicFragmentRelease: "/assets/about/comic/birth-01-fragment-release.png",
  comicBonding: "/assets/about/comic/birth-02-bonding.png",
  comicEggFormation: "/assets/about/comic/birth-03-egg-formation.png",
  comicFirstHatch: "/assets/about/comic/birth-04-first-hatch.png",
  /** Character + lore comic panels */
  comicElaraPortrait: "/assets/about/comic/comic-elara-portrait.png",
  comicElaraDiscovery: "/assets/about/comic/comic-elara-discovery.png",
  comicElaraJourney: "/assets/about/comic/comic-elara-journey.png",
  comicFirstRiftlingHatch: "/assets/about/comic/comic-first-riftling-hatch.png",
  comicFirstRiftlingMystery: "/assets/about/comic/comic-first-riftling-mystery.png",
  comicEraAgeGateways: "/assets/about/comic/comic-era-age-gateways.png",
  comicEraLivingCore: "/assets/about/comic/comic-era-living-core.png",
  comicEraGreatActivation: "/assets/about/comic/comic-era-great-activation.png",
  comicEraFracture: "/assets/about/comic/comic-era-fracture.png",
  comicEraFirstEggs: "/assets/about/comic/comic-era-first-eggs.png",
  comicEraFirstKeeper: "/assets/about/comic/comic-era-first-keeper.png",
  comicEraFoundingCommons: "/assets/about/comic/comic-era-founding-commons.png",
  comicEraAgeExploration: "/assets/about/comic/comic-era-age-exploration.png",
  comicEraPresentAwakening: "/assets/about/comic/comic-era-present-awakening.png",
  comicOrigin01: "/assets/about/comic/comic-origin-01-gateway-hearts.png",
  comicOrigin02: "/assets/about/comic/comic-origin-02-fracture.png",
  comicOrigin03: "/assets/about/comic/comic-origin-03-fragments.png",
  comicOrigin04: "/assets/about/comic/comic-origin-04-bond.png",
  comicOrigin05: "/assets/about/comic/comic-origin-05-eggs.png",
  comicOrigin06: "/assets/about/comic/comic-origin-06-keepers.png",
  comicInfoRiftlings: "/assets/about/comic/comic-info-what-are-riftlings.png",
  comicInfoRiftkeeper: "/assets/about/comic/comic-info-riftkeeper.png",
  comicInfoLiveWorld: "/assets/about/comic/comic-info-live-world.png",
  comicInfoWhatYouCanDo: "/assets/about/comic/comic-info-what-you-can-do.png",
  comicInfoLivingWorld: "/assets/about/comic/comic-info-living-world.png",
  comicInfoBuiltToGrow: "/assets/about/comic/comic-info-built-to-grow.png",
  comicInfoWhyMade: "/assets/about/comic/comic-info-why-riftlings-made.png",
  comicInfoWhyEggs: "/assets/about/comic/comic-info-why-eggs.png",
  comicInfoWhyEvolve: "/assets/about/comic/comic-info-why-evolve.png",
  comicChapterBefore: "/assets/about/comic/comic-chapter-before-inset.png",
  comicChapterDiscovery: "/assets/about/comic/comic-chapter-discovery-inset.png",
  comicChapterRiftlings: "/assets/about/comic/comic-chapter-riftlings-inset.png",
  /** Lifecycle step + Fracture→Keeper bridge card backgrounds */
  lifecycleFragment: "/assets/about/lifecycle/lifecycle-fragment.png",
  lifecycleBond: "/assets/about/lifecycle/lifecycle-bond.png",
  lifecycleEgg: "/assets/about/lifecycle/lifecycle-egg.png",
  lifecycleHatch: "/assets/about/lifecycle/lifecycle-hatch.png",
  lifecycleIdentity: "/assets/about/lifecycle/lifecycle-identity.png",
  bridgeFracture: "/assets/about/lifecycle/bridge-fracture.png",
  bridgeFirstEggs: "/assets/about/lifecycle/bridge-first-eggs.png",
  bridgeFirstKeeper: "/assets/about/lifecycle/bridge-first-keeper.png",
  /** Affinity birth vignette thumbnails (wordless comic moments) */
  vignetteEmber: "/assets/about/comic/birth-vignette-ember.png",
  vignetteTide: "/assets/about/comic/birth-vignette-tide.png",
  vignetteGrove: "/assets/about/comic/birth-vignette-grove.png",
  vignetteStorm: "/assets/about/comic/birth-vignette-storm.png",
  vignetteStone: "/assets/about/comic/birth-vignette-stone.png",
  vignetteFrost: "/assets/about/comic/birth-vignette-frost.png",
  vignetteRadiant: "/assets/about/comic/birth-vignette-radiant.png",
  vignetteVoid: "/assets/about/comic/birth-vignette-void.png",
  vignetteAlloy: "/assets/about/comic/birth-vignette-alloy.png",
  vignetteSpirit: "/assets/about/comic/birth-vignette-spirit.png",
  vignetteCelestial: "/assets/about/comic/birth-vignette-celestial.png",
  /** Interim reuse */
  radiant: "/assets/regions/radiant-citadel.png",
  celestial: "/assets/regions/celestial-rift.png",
  elderwood: "/assets/regions/elderwood-forest.png",
  commonsRegion: "/assets/regions/riftwild-commons.png",
} as const;

export const aboutChapters: AboutChapter[] = [
  {
    id: "before",
    navLabel: "Before the Rifts",
    heading: "WHEN THE WORLD WAS WHOLE",
    kicker: "Prologue",
    support:
      "Before the Riftwilds, every region was part of one living world. Ancient Gateway Hearts carried energy, memory, and life across impossible distances.",
    body: [
      "Long before the Riftwilds had a name, the world was known as Aeryndra — not a single kingdom, but a living network of connected regions, each shaped by a different force of nature.",
      "The Emberlands burned beneath red skies. The Moonwater seas followed the rhythm of two silver moons. The Elderwood grew around trees older than written language. The Stormspire mountains touched the clouds. The cities of Radiance studied healing, memory, and light. The builders of Alloy created machines that could grow beside living things. The Spirit Marsh preserved memories that the living could no longer carry.",
      "For thousands of years these regions were connected by Gateway Hearts. They balanced heat and cold, guided tides, carried seeds between forests, allowed spirits to pass peacefully, and prevented one region’s power from overwhelming another.",
      "At the center of the network stood the Prime Gateway — so old that no civilization could agree who created it. Some believed it was built by the first people. Others believed the world itself had grown it.",
    ],
    sceneSrc: aboutScenePaths.aeryndra,
    sceneAlt: "Aeryndra before the fracture — connected regions under a living gateway sky",
    accent: "var(--radiant)",
    generatedAsset: true,
    comicInset: {
      src: aboutScenePaths.comicChapterBefore,
      alt: "Comic panel of Aeryndra’s connected regions under a living gateway sky",
      caption: "When every region still answered the same living network.",
    },
  },
  {
    id: "discovery",
    navLabel: "The Discovery",
    heading: "THE WORLD WAS ALIVE",
    kicker: "Chapter II",
    support:
      "The Gateway Hearts were never simple machines. They remembered every storm, every creature, and every life that passed through them.",
    body: [
      "Deep beneath the Radiant Citadel, researchers discovered that the Gateway Hearts were not merely machines. Each one contained a living core.",
      "The cores responded to emotion, memory, weather, music, and the presence of nearby life. They were not fully plants, animals, or machines — they were pieces of the world’s consciousness.",
      "For generations, the Gateway Hearts had quietly learned from every creature, every storm, every birth, and every loss. The discovery changed everything.",
      "Some wanted to protect them. Some wanted to understand them. Others wanted to control them.",
    ],
    sceneSrc: aboutScenePaths.discovery,
    sceneAlt: "Researchers discovering a living Gateway Heart core beneath the Radiant Citadel",
    accent: "var(--cyan)",
    generatedAsset: true,
    comicInset: {
      src: aboutScenePaths.comicChapterDiscovery,
      alt: "Comic panel of scholars studying a living Gateway Heart core",
      caption: "The cores were never machines — they were pieces of the world’s mind.",
    },
  },
  {
    id: "fracture",
    navLabel: "The Fracture",
    heading: "THE DAY REALITY BROKE",
    kicker: "Chapter III",
    support:
      "A plan to heal the world overloaded its oldest living structure. The explosion divided reality and transformed Aeryndra into the Riftwilds.",
    body: [
      "A coalition of rulers, engineers, and scholars attempted to connect all Gateway Hearts at once. They believed the network could end famine, control weather, cure sickness, and make travel between regions instantaneous.",
      "For one brief moment, it worked. Rain fell over dying farmland. Frozen rivers began to move. Lost voices returned from the Spirit Marsh. The skies above every region filled with light.",
      "Then the Prime Gateway received more energy than any living structure could contain. It broke. The explosion did not destroy the world immediately — it separated reality into overlapping layers.",
      "Forests appeared inside deserts. Ocean water poured through mountain skies. Ancient ruins emerged where they had never been built. Time moved at different speeds from one valley to another. Creatures disappeared through openings in the air. These openings became known as Rifts. The connected lands became the Riftwilds.",
    ],
    sceneSrc: aboutScenePaths.fracture,
    sceneAlt: "The Prime Gateway fracturing as regions tear apart into overlapping realities",
    accent: "var(--violet)",
    generatedAsset: true,
  },
  {
    id: "riftlings",
    navLabel: "The First Riftlings",
    heading: "BORN TO REMEMBER",
    kicker: "Chapter IV",
    support:
      "Unable to repair the world, the Gateway Hearts performed a last act of love: they divided into living fragments so the world could still be carried forward.",
    body: [
      "As the Gateway network collapsed, the living cores attempted to save the world. They could not repair the Prime Gateway. They could not stop every Rift. So they chose a quieter miracle. They divided themselves.",
      "Each Gateway Heart released thousands of small living fragments — pieces of warmth, tide, root, storm, stone, frost, light, shadow, machine-song, memory, and starlight. The fragments did not hunt for masters. They searched for surviving life, for anything still willing to hold a piece of Aeryndra.",
      "Where a fragment found a bond — animal, plant, crystal, storm, machine, memory, or elemental force — it curled inward and began to become. Shells of crystallized Gateway energy and regional matter closed around that becoming. The first eggs appeared in ash beds, tide pools, root hollows, and ruined workshops.",
      "From those eggs, the first Riftlings hatched as living archives — not weapons, not servants, not trophies. An Ember Riftling carried the warmth of a dying volcanic ecosystem. A Tide Riftling remembered currents that no longer reached the same shore. A Grove Riftling held seeds from forests swallowed by unstable Rifts. Every affinity preserved a different disappearing truth.",
      "Yet an archive alone cannot choose what comes next. The Riftlings began to seek companions who could listen — the first Riftkeepers. That bridge from Fracture, to First Eggs, to First Keeper is the heart of how pets came to be in the Riftwilds.",
    ],
    sceneSrc: aboutScenePaths.firstRiftlings,
    sceneAlt: "Gateway fragments bonding with nature and light to form the first Riftling eggs",
    accent: "var(--emerald)",
    generatedAsset: true,
    comicInset: {
      src: aboutScenePaths.comicChapterRiftlings,
      alt: "Comic panel of Gateway fragments bonding with nature to form the first Riftlings",
      caption: "Unable to repair the world, the Hearts chose to carry it forward.",
    },
  },
  {
    id: "keepers",
    navLabel: "The First Keeper",
    heading: "A MEMORY NEEDS A FUTURE",
    kicker: "Chapter V",
    support:
      "The Riftlings carried the past. Riftkeepers gave them trust, identity, and the freedom to become more than what created them.",
    body: [
      "The first Riftlings survived alone, but many struggled to understand what they carried. Some were born with memories that were not their own. Some dreamed of places that no longer existed. Some felt compelled to travel toward unstable Rifts — as if the fragments inside them still remembered the network that made them.",
      "Surviving scholars discovered that Riftlings responded differently when bonded with a person. A trusted companion helped organize their memories. Care stabilized their affinity energy. Friendship helped prevent uncontrolled mutations. Shared experiences allowed Riftlings to form identities beyond the fragments used to create them.",
      "The first recorded keeper was Elara Venn — a courier, not a ruler. She found a damaged egg beneath fallen Elderwood roots, carried it through collapsing paths for nine days, and when it hatched, refused every title offered to her. She called herself only its keeper. From her example, the name Riftkeeper spread.",
      "A Riftkeeper does not own a Riftling in the traditional sense — they protect it, learn from it, travel beside it, and help it decide what kind of creature it will become. " +
        ABOUT_SLOGAN,
    ],
    sceneSrc: aboutScenePaths.elara,
    sceneAlt: "Elara Venn discovering a damaged glowing egg beneath fallen Elderwood roots",
    accent: "var(--grove)",
    generatedAsset: true,
  },
  {
    id: "commons",
    navLabel: "The Commons",
    heading: "A HOME BETWEEN WORLDS",
    kicker: "Chapter VI",
    support:
      "The Riftwild Commons became a refuge for explorers, families, scholars, craftspeople, and every Riftling searching for a place to belong.",
    body: [
      "The Riftwild Commons was built where several stable Gateway paths still intersected. At first it was only a shelter. Then came farmers, explorers, healers, craftspeople, Rift researchers, families searching for missing relatives — and Riftkeepers carrying strange eggs found across the broken regions.",
      "The Commons became a home for those who no longer had one. The central Riftstone was created from a surviving piece of the Prime Gateway. It remains active, though no one fully understands why.",
      "At night, its surface sometimes displays maps of places that do not exist. On rare occasions, it shows locations that have not yet been discovered.",
    ],
    sceneSrc: aboutScenePaths.commons,
    sceneAlt: "Early Riftwild Commons settlement gathering around a glowing central Riftstone",
    accent: "var(--tide)",
    generatedAsset: true,
  },
  {
    id: "call",
    navLabel: "The Call",
    heading: "THE RIFTS ARE OPENING AGAIN",
    kicker: "Chapter VII",
    support:
      "Something beyond the known regions is calling to the Riftlings. The Gateway Hearts are awakening, and the truth of the fracture remains buried.",
    body: [
      "The Riftwilds have never fully stabilized. New pathways appear. Old regions shift. Forgotten ruins return. Rift storms continue to spread strange energy across the world.",
      "Some Gateway Hearts are beginning to awaken again. Others have become corrupted. Ancient machines in the Alloy Ruins have restarted without command. Spirits in the marsh speak of a memory missing from the world. The Radiant Citadel hides records concerning the true cause of the fracture.",
      "And beyond every mapped region, something inside the Celestial Rift has begun calling to the Riftlings. No one knows whether the call is coming from the Prime Gateway — whether it is asking for help, or trying to finish what began long ago.",
      "This is where your story begins. The next chapter is not written yet.",
    ],
    sceneSrc: aboutScenePaths.call,
    sceneAlt: "A traveler and Riftling facing the distant Celestial Rift as ancient machines awaken",
    accent: "var(--amber)",
    generatedAsset: true,
  },
];

export const narrationScript = [
  "Before the Rifts, the world was whole.",
  "Its forests breathed beside ancient cities.",
  "Its oceans followed the pull of silver moons.",
  "Its mountains carried storms between the heavens and the earth.",
  "At the center of it all stood the Gateway Hearts—living structures that held the regions together.",
  "For generations, they watched.",
  "They listened.",
  "And they remembered.",
  "Then, in the pursuit of a perfect world, the people of Aeryndra awakened every Gateway at once.",
  "For one moment, they controlled nature itself.",
  "And in the next… they broke reality.",
  "When the Prime Gateway fell, the world shattered into the Riftwilds.",
  "Forests crossed into deserts.",
  "Seas poured through the sky.",
  "Time fractured.",
  "Entire histories began to disappear.",
  "The Gateway Hearts could not save the world.",
  "So they divided themselves into living fragments.",
  "The fragments bonded with animals, plants, crystals, storms, machines, and memories.",
  "Shells of crystallized energy closed around those bonds.",
  "The first eggs formed.",
  "And from flame, water, stone, memory, machinery, spirit, and light… the Riftlings were born.",
  "Not as weapons.",
  "Not as servants.",
  "But as living pieces of everything the world was about to lose.",
  "Yet a memory alone cannot choose its future.",
  "For that, the Riftlings needed companions.",
  "They needed protectors.",
  "They needed Riftkeepers.",
  "Elara Venn was the first to keep that promise.",
  "Now the Rifts are opening again.",
  "Ancient machines are waking.",
  "Forgotten voices are calling.",
  "And somewhere beyond the known world, the broken heart of Aeryndra is still beating.",
  "Your Riftling is waiting.",
  "And the next chapter belongs to you.",
] as const;

export const loreTimeline: TimelineEntry[] = [
  {
    id: "age-gateways",
    title: "The Age of Gateways",
    summary: "The Gateway Hearts connect Aeryndra.",
    comic: {
      src: aboutScenePaths.comicEraAgeGateways,
      alt: "Comic panel of living Gateway Hearts connecting Aeryndra’s regions",
    },
  },
  {
    id: "living-core",
    title: "The Living-Core Discovery",
    summary: "Researchers discover that the Gateways remember.",
    comic: {
      src: aboutScenePaths.comicEraLivingCore,
      alt: "Comic panel of researchers discovering a living Gateway core",
    },
  },
  {
    id: "great-activation",
    title: "The Great Activation",
    summary: "Every Gateway Heart is connected simultaneously.",
    comic: {
      src: aboutScenePaths.comicEraGreatActivation,
      alt: "Comic panel of every Gateway Heart igniting at once across the sky",
    },
  },
  {
    id: "fracture",
    title: "The Fracture",
    summary: "The Prime Gateway breaks reality.",
    comic: {
      src: aboutScenePaths.comicEraFracture,
      alt: "Comic panel of the Prime Gateway shattering reality into overlapping layers",
    },
  },
  {
    id: "first-eggs",
    title: "The First Eggs",
    summary:
      "Gateway fragments bond with life, close into shells, and begin becoming Riftlings.",
    comic: {
      src: aboutScenePaths.comicEraFirstEggs,
      alt: "Comic panel of the first Riftling eggs forming from Gateway fragments",
    },
  },
  {
    id: "first-keeper",
    title: "The First Keeper",
    summary: "Elara Venn keeps a damaged egg — and names the path of Riftkeepers.",
    comic: {
      src: aboutScenePaths.comicEraFirstKeeper,
      alt: "Comic panel of Elara Venn bonding with the newly hatched First Riftling",
    },
  },
  {
    id: "founding-commons",
    title: "The Founding of the Commons",
    summary: "Survivors establish a stable settlement.",
    comic: {
      src: aboutScenePaths.comicEraFoundingCommons,
      alt: "Comic panel of survivors founding the Riftwild Commons around a Riftstone",
    },
  },
  {
    id: "age-exploration",
    title: "The Age of Exploration",
    summary: "Riftkeepers begin mapping the changed regions.",
    comic: {
      src: aboutScenePaths.comicEraAgeExploration,
      alt: "Comic panel of Riftkeepers mapping fractured regions from a high ridge",
    },
  },
  {
    id: "present-awakening",
    title: "The Present Awakening",
    summary: "Gateway Hearts and ancient systems activate again.",
    comic: {
      src: aboutScenePaths.comicEraPresentAwakening,
      alt: "Comic panel of Gateway Hearts and ancient machines awakening again",
    },
  },
];

export const characterProfiles: CharacterProfile[] = [
  {
    id: "elara-venn",
    name: "Elara Venn",
    role: "The first recorded Riftkeeper",
    traits: [
      "Practical",
      "Compassionate",
      "Quietly brave",
      "Uninterested in recognition",
      "Protective of small creatures",
      "Distrustful of political leaders",
    ],
    background:
      "A courier from a small settlement near Elderwood Forest. She knew hidden paths, weather signs, and how to travel with limited supplies. She had no magical training and no important family lineage. During the first years after the fracture, she discovered a damaged egg beneath the roots of a fallen tree. For nine days she carried it through collapsing paths and unstable weather. When it opened, a small creature emerged with glowing lines resembling the old Gateway map — and together they guided hundreds of survivors to the Riftwild Commons. She refused every title offered to her. She called herself only its keeper.",
    visualNotes:
      "Weather-worn travel coat, satchel, simple boots, short cape, Elderwood travel markings — no royal armor, no oversized weapon.",
    portrait: {
      src: aboutScenePaths.comicElaraPortrait,
      alt: "Comic portrait of Elara Venn in a weather-worn travel coat with Elderwood markings",
    },
    panels: [
      {
        src: aboutScenePaths.comicElaraDiscovery,
        alt: "Comic panel of Elara discovering a damaged glowing egg beneath fallen roots",
        caption: "Day one — a cracked light under fallen Elderwood.",
      },
      {
        src: aboutScenePaths.comicElaraJourney,
        alt: "Comic panel of Elara carrying the damaged egg through a stormy fractured landscape",
        caption: "Nine days through collapsing paths and unstable weather.",
      },
    ],
  },
  {
    id: "first-riftling",
    name: "The First Riftling",
    role: "Unrecorded companion of Elara Venn",
    traits: [
      "Hatched from a damaged egg",
      "Glowing Gateway-like markings",
      "Could detect stable paths",
      "Deeply bonded to Elara",
      "May have been connected to every affinity",
    ],
    background:
      "Its true name was never recorded. Some say it became the first Celestial Riftling. Others believe it still walks somewhere beyond the known maps, searching for the remaining fragments of the Prime Gateway.",
    visualNotes: "Identity intentionally unresolved — a long-term world mystery.",
    mysteryNote:
      "Its final fate remains unwritten — a living question beyond the known maps.",
    portrait: {
      src: aboutScenePaths.comicFirstRiftlingHatch,
      alt: "Comic portrait of the First Riftling hatching with glowing Gateway-map body lines",
    },
    panels: [
      {
        src: aboutScenePaths.comicEraFirstKeeper,
        alt: "Comic panel of the First Riftling bonding with Elara Venn after hatching",
        caption: "A bond without a recorded name — only a keeper.",
      },
      {
        src: aboutScenePaths.comicFirstRiftlingMystery,
        alt: "Comic panel of the First Riftling as a mysterious silhouette facing a distant celestial rift",
        caption: "Beyond every map — a living question still walking.",
      },
    ],
  },
];

export const whyRiftlingsWereMade: InfoBlock = {
  id: "why-made",
  title: "Why Riftlings were made",
  body: [
    "Riftlings were created as a last act of preservation — not conquest. When the Gateway Hearts could no longer hold the world together, they chose to carry the world forward in living pieces.",
    "They preserve endangered ecosystems, carry memories of lost places, protect fragments of the Gateway Hearts, stabilize local affinity energy, locate unstable Rifts, guide survivors, safeguard plants and materials on the edge of extinction, and hold ancient knowledge until someone is ready to understand it.",
    "Later, Riftlings also develop identities beyond that original purpose — preferences, fears, humor, loyalty — because preservation without a future would only be a museum of ghosts.",
  ],
  bullets: [
    "Not originally created for combat entertainment",
    "Not designed as weapons or tools of control",
    "Not servants meant to replace ordinary animals",
    "Not trophies, currency, or gambling tokens in the origin lore",
    "Battling later grew as training, defense, affinity control, competition, teamwork, and preparation for dangerous regions",
  ],
  comic: {
    src: aboutScenePaths.comicInfoWhyMade,
    alt: "Comic illustration of a Riftling cradling a glowing fragment of a living ecosystem against a fractured world",
  },
};

export const whyEggsExist: InfoBlock = {
  id: "why-eggs",
  title: "Why eggs exist",
  body: [
    "A Gateway fragment cannot simply become a creature overnight. It must braid itself with matter, memory, and affinity energy without tearing the fragile life it hopes to save. That joining needs a shell.",
    "Egg shells form from crystallized Gateway energy plus regional matter — minerals, plant fibers, condensed weather, tide-salt, ashglass, memory residue, machine filament, or starlit frost, depending on where the bond takes hold.",
    "Inside the egg, the developing Riftling forms a stable body, a dominant affinity, a genetic pattern, and the first soft outline of a personal identity. The shell is not a prison. It is a protected becoming — a quiet room between fragment and self — until the creature can meet the world without dissolving back into raw energy.",
  ],
  comic: {
    src: aboutScenePaths.comicInfoWhyEggs,
    alt: "Comic illustration of a crystalline Gateway egg glowing among roots and minerals with a soft silhouette forming inside",
  },
};

export const whyPetsEvolve: InfoBlock = {
  id: "why-evolve",
  title: "Why Riftlings evolve",
  body: [
    "Evolution is identity-driven transformation — not merely age or combat power. It reflects what the Riftling has experienced and what it is becoming.",
  ],
  bullets: [
    "Their body can safely carry more Gateway energy",
    "Their bond becomes stronger",
    "They master an affinity",
    "They survive a major event",
    "They connect with a region",
    "They resolve a memory",
    "They make an important choice",
    "Their genetics awaken",
    "They complete an ancient trial",
  ],
  comic: {
    src: aboutScenePaths.comicInfoWhyEvolve,
    alt: "Comic illustration of a Riftling mid-evolution, its earlier form dissolving into light as a stronger silhouette emerges",
  },
};

export const originDiagramNodes: OriginDiagramNode[] = [
  {
    id: "hearts",
    label: "Gateway Hearts",
    detail: "Living cores of Aeryndra",
    comic: {
      src: aboutScenePaths.comicOrigin01,
      alt: "Comic panel of towering Gateway Hearts pulsing with cyan energy",
    },
  },
  {
    id: "fracture",
    label: "The Fracture",
    detail: "Prime Gateway overload",
    comic: {
      src: aboutScenePaths.comicOrigin02,
      alt: "Comic panel of the Prime Gateway fracturing reality",
    },
  },
  {
    id: "fragments",
    label: "Living Fragments",
    detail: "Cores divide to survive",
    comic: {
      src: aboutScenePaths.comicOrigin03,
      alt: "Comic panel of luminous Gateway fragments streaming into the broken world",
    },
  },
  {
    id: "bond",
    label: "Bond with Life",
    detail: "Flame · Tide · Grove · Memory…",
    comic: {
      src: aboutScenePaths.comicOrigin04,
      alt: "Comic panel of Gateway fragments bonding with flame, tide, grove, and memory",
    },
  },
  {
    id: "eggs",
    label: "Riftling Eggs",
    detail: "Protected becoming",
    comic: {
      src: aboutScenePaths.comicOrigin05,
      alt: "Comic panel of crystalline Riftling eggs glowing among roots and stone",
    },
  },
  {
    id: "keepers",
    label: "Riftkeepers",
    detail: "Companions who give a future",
    comic: {
      src: aboutScenePaths.comicOrigin06,
      alt: "Comic panel of a Riftkeeper bonding with a small glowing companion",
    },
  },
];

export const infoBlocks: InfoBlock[] = [
  {
    id: "what-are-riftlings",
    title: "What Are Riftlings?",
    body: [
      "Riftlings are living archives born from Gateway Heart fragments bonded with surviving life, memory, and affinity energy. Each one carries a piece of the world that existed before the fracture — ecosystems, histories, and soft knowledge that would otherwise vanish.",
      "They grow into companions with preferences, fears, dreams, and identities of their own. They are not props. They are the world’s attempt to remember itself.",
    ],
    comic: {
      src: aboutScenePaths.comicInfoRiftlings,
      alt: "Comic illustration of unique Riftling companions as living archives of the world",
    },
  },
  {
    id: "what-is-riftkeeper",
    title: "What Is a Riftkeeper?",
    body: [
      "Riftkeepers are the people who bond with Riftlings — protectors, traveling partners, and witnesses to what each creature carries.",
      "Players are modern Riftkeepers. You hatch and raise Riftlings, help them understand inherited memories, explore unstable regions, restore Gateway Hearts, discover lost history, and help decide how — or whether — the broken world reconnects. Trust is earned through actions, not titles.",
    ],
    comic: {
      src: aboutScenePaths.comicInfoRiftkeeper,
      alt: "Comic illustration of a Riftkeeper bonding with a small glowing companion",
    },
  },
  {
    id: "what-is-live-world",
    title: "What Is the Live World?",
    body: [
      "The Live World is a playable shared browser world where Riftkeepers can enter habitats, move freely, meet others, care for Riftlings, gather, explore, and take part in the living story of the Commons and beyond.",
      "It is not a passive stream. It is a place you walk into.",
    ],
    comic: {
      src: aboutScenePaths.comicInfoLiveWorld,
      alt: "Comic illustration of explorers and companions in the shared Live World settlement",
    },
  },
  {
    id: "what-you-can-do",
    title: "What Can You Do?",
    body: ["Across the Riftwilds, your path can include:"],
    bullets: [
      "Hatch",
      "Care",
      "Explore",
      "Gather",
      "Craft",
      "Battle",
      "Trade",
      "Build",
      "Join guilds",
      "Complete stories",
      "Discover memories",
      "Evolve pets",
    ],
    comic: {
      src: aboutScenePaths.comicInfoWhatYouCanDo,
      alt: "Comic illustration of a keeper hatching, caring for, and exploring with a Riftling",
    },
  },
  {
    id: "living-world",
    title: "A Living World",
    body: [
      "Pets have memories and develop preferences. Regions change. Events occur. New paths appear. The story expands. Your choices shape personal pet journeys — and the world keeps moving whether or not you are watching.",
    ],
    comic: {
      src: aboutScenePaths.comicInfoLivingWorld,
      alt: "Comic illustration of a companion overlooking a living settlement where biomes and memory-light keep shifting",
    },
  },
  {
    id: "built-to-grow",
    title: "Built to Grow",
    body: [
      "Riftwilds is designed as an expanding game world with room for new regions, creatures, quests, events, and stories. Schedules stay flexible — the world grows as the tale is ready to be told.",
    ],
    comic: {
      src: aboutScenePaths.comicInfoBuiltToGrow,
      alt: "Comic illustration of an expanding world map budding new regions from a glowing Gateway Heart",
    },
  },
];

export const heroCtas = {
  primary: [
    { href: "/tcg/battle", label: "PLAY RIFT BATTLE" },
    { href: "/codex/riftlings", label: "DISCOVER THE RIFTLINGS" },
  ],
  secondary: [
    { href: "/live-world", label: "LIVE WORLD — COMING SOON" },
    { href: "#origin", label: "WATCH THE ORIGIN" },
    { href: "#how-riftlings-came-to-be", label: "HOW RIFTLINGS BEGAN" },
  ],
} as const;

export type BirthStep = {
  id: string;
  title: string;
  comicCaption: string;
  body: string;
  /** Atmospheric card background (wordless) */
  image: ComicArt;
};

export type BridgeStep = {
  title: string;
  body: string;
  image: ComicArt;
};

export type BirthComicPanel = {
  id: string;
  stepId: string;
  src: string;
  alt: string;
  caption: string;
};

export type AffinityBirthVignette = {
  id: string;
  affinity: string;
  accent: string;
  bondMatter: string;
  comicCaption: string;
  prose: string;
  /** Wordless comic thumbnail — caption stays in HTML */
  thumbSrc: string;
  thumbAlt: string;
};

export type FullLorePanel = {
  id: string;
  title: string;
  summary: string;
  body: string[];
};

/** Long-form birth lore — How the Riftlings Came to Be */
export const howRiftlingsCameToBe = {
  id: "how-riftlings-came-to-be",
  kicker: "The Birth of Companions",
  heading: "How the Riftlings Came to Be",
  support:
    "From the last act of the Gateway Hearts to the first hatchling that looked back at a keeper — the step-by-step becoming of every pet in the Riftwilds.",
  introduction: [
    "After the Fracture, the living cores of the Gateway Hearts faced a truth they could not rewrite: the Prime Gateway was broken, and reality would not snap back into one piece. What they could still do was refuse to let the world vanish without a witness.",
    "So they performed their last act. They divided. Not as a weapon. Not as a summons. As a gift of continuation — living fragments sent into ash, tide, root, storm, stone, frost, light, hollow, machine, memory, and starlight.",
    ABOUT_SLOGAN,
  ],
  steps: [
    {
      id: "fragment",
      title: "Fragment",
      comicCaption: "The cores divide — thousands of living sparks leave the broken network.",
      body: "Each Gateway Heart released living fragments of itself: soft pieces of consciousness threaded with affinity. They drifted through the Riftwilds like seeds after a storm — searching not for owners, but for anything still alive enough to hold a memory.",
      image: {
        src: aboutScenePaths.lifecycleFragment,
        alt: "Luminous cyan-amber consciousness shards drifting through a broken gateway void",
      },
    },
    {
      id: "bond",
      title: "Bond",
      comicCaption: "A spark finds a pulse — animal, plant, crystal, storm, machine, or memory.",
      body: "When a fragment touched surviving life or force, it bonded. Ember fragments sought heat and ash-born creatures. Tide sought moonwater and living currents. Grove sought seed and root. Storm sought skyfracture. Stone sought canyon bone. Frost sought still ice. Radiant sought healing light. Void sought hush and hollow. Alloy sought growing machines. Spirit sought remembered voices. Celestial sought the thin places between maps.",
      image: {
        src: aboutScenePaths.lifecycleBond,
        alt: "A glowing spark bonding with roots, crystals, and living matter in a dark ruin grove",
      },
    },
    {
      id: "egg",
      title: "Egg",
      comicCaption: "Crystallized energy and regional matter close into a shell of protected becoming.",
      body: "A raw bond is unstable. The fragment and its chosen matter needed time to braid without tearing. Shells formed from crystallized Gateway energy plus the region’s own substance — ashglass, tide-salt, rootfiber, ozone lace, fossil grit, frostfilm, prismdust, echo-mist, machine filament, marshlight, or starlit frost. Inside: quiet. Outside: a world still rearranging itself.",
      image: {
        src: aboutScenePaths.lifecycleEgg,
        alt: "A crystalline Riftling egg forming in a nested lattice of cyan and amber light",
      },
    },
    {
      id: "hatch",
      title: "Hatch",
      comicCaption: "The shell opens — a living archive takes its first breath.",
      body: "When the body could hold the energy, the egg opened. The first Riftlings were small, strange, and full of inherited feeling. They carried ecosystems, routes, songs, and griefs that were not yet their own — and they looked for someone who could help them sort the difference.",
      image: {
        src: aboutScenePaths.lifecycleHatch,
        alt: "A crystalline egg cracking open with cyan light as a small Riftling silhouette emerges",
      },
    },
    {
      id: "identity",
      title: "Identity",
      comicCaption: "Care, trust, and shared days turn an archive into a self.",
      body: "Alone, many Riftlings drifted toward unstable Rifts or drowned in borrowed memories. With a Riftkeeper, they began to choose: which memories to keep, which fears to name, which futures to grow toward. That is when a preserved piece of the world becomes a companion — a pet with a future, not only a past.",
      image: {
        src: aboutScenePaths.lifecycleIdentity,
        alt: "Silhouettes of a keeper and glowing companion sharing a quiet bonded moment at dusk",
      },
    },
  ] satisfies BirthStep[],
  bridge: {
    heading: "From Fracture to First Keeper",
    steps: [
      {
        title: "The Fracture",
        body: "The Prime Gateway broke. Regions overlapped. Histories began to slip. The living cores could not restore the old map.",
        image: {
          src: aboutScenePaths.bridgeFracture,
          alt: "The Prime Gateway shattering as regions overlap in cyan and amber rift light",
        },
      },
      {
        title: "The First Eggs",
        body: "Fragments bonded with surviving life and closed into eggs across the Riftwilds — the world’s softest emergency plan.",
        image: {
          src: aboutScenePaths.bridgeFirstEggs,
          alt: "Multiple luminous crystalline eggs nestled across a dark wild Riftwilds landscape",
        },
      },
      {
        title: "The First Keeper",
        body: "Elara Venn carried a damaged egg through nine collapsing days. When it hatched, she refused every title and became the pattern others would follow: not ownership — keeping.",
        image: {
          src: aboutScenePaths.bridgeFirstKeeper,
          alt: "A lone silhouetted keeper carrying a damaged glowing egg through a collapsing storm path",
        },
      },
    ] satisfies BridgeStep[],
  },
  preservationNote: {
    heading: "Why they were never weapons",
    body: [
      "The Gateway Hearts remembered too much to make soldiers. They had watched births, storms, harvests, and funerals for generations. Their last act was archival and tender: carry what would otherwise be lost.",
      "Riftlings can defend, train, and stand in dangerous regions — those skills came later, as survival demanded. Their first purpose was preservation. They were not designed as servants to replace ordinary animals, nor as tools for rulers who had already broken the world once.",
    ],
  },
} as const;

export const birthComicPanels: BirthComicPanel[] = [
  {
    id: "comic-fragment",
    stepId: "fragment",
    src: aboutScenePaths.comicFragmentRelease,
    alt: "Living gateway cores releasing luminous fragments into a fractured sky",
    caption: "The cores divide — living sparks leave the broken network.",
  },
  {
    id: "comic-bond",
    stepId: "bond",
    src: aboutScenePaths.comicBonding,
    alt: "Luminous fragments bonding with animals, plants, crystals, storm, and living machinery",
    caption: "A spark finds a pulse — and chooses to stay.",
  },
  {
    id: "comic-egg",
    stepId: "egg",
    src: aboutScenePaths.comicEggFormation,
    alt: "First Riftling eggs forming from crystallized energy and regional matter",
    caption: "Shells close. Becoming begins in quiet.",
  },
  {
    id: "comic-hatch",
    stepId: "hatch",
    src: aboutScenePaths.comicFirstHatch,
    alt: "A small Riftling hatching beside a lone keeper beneath fallen tree roots",
    caption: "The archive opens its eyes — and looks for a future.",
  },
];

export const affinityBirthVignettes: AffinityBirthVignette[] = [
  {
    id: "ember",
    affinity: "Ember",
    accent: "var(--ember)",
    bondMatter: "Ash-born creatures · living coal · crater heat",
    comicCaption: "A spark nests in cooling ash — warmth refuses to die.",
    prose:
      "In the Emberlands, fragments sank into ash beds and bonded with creatures that still carried heat under their fur. The first Ember eggs glowed like banked coals. When they hatched, they carried the warmth of volcanic ecosystems that Rifts had half-erased — living hearth-memory, not fire for war.",
    thumbSrc: aboutScenePaths.vignetteEmber,
    thumbAlt: "Amber spark nesting in cooling volcanic ash beside a small ash-born creature",
  },
  {
    id: "tide",
    affinity: "Tide",
    accent: "var(--tide)",
    bondMatter: "Moonwater · living currents · salt and shell",
    comicCaption: "A current remembers a shore that moved away.",
    prose:
      "Along Moonwater coasts, fragments rode the twin-moon pull and bonded with tide-life and condensed spray. Tide eggs formed in rock pools that should not have existed after the Fracture. Their hatchlings remembered routes between shores that no longer lined up — maps written in motion.",
    thumbSrc: aboutScenePaths.vignetteTide,
    thumbAlt: "Cyan spark riding moonlit tidewater in a rocky coastal pool",
  },
  {
    id: "grove",
    affinity: "Grove",
    accent: "var(--grove)",
    bondMatter: "Seeds · rootwhisper · Elderwood saplight",
    comicCaption: "A seed and a spark agree to grow together.",
    prose:
      "In Elderwood hollows, fragments braided with seeds, moss, and the quiet intelligence of old roots. Grove eggs nested in fallen trunks like patient promises. Hatchlings preserved forests swallowed by unstable Rifts — green archives that still knew how to breathe.",
    thumbSrc: aboutScenePaths.vignetteGrove,
    thumbAlt: "Glowing seed and spark braiding inside a mossy Elderwood hollow",
  },
  {
    id: "storm",
    affinity: "Storm",
    accent: "var(--storm)",
    bondMatter: "Skyfracture · ozone · kite-silk wind",
    comicCaption: "Lightning softens into a heartbeat.",
    prose:
      "Above Stormspire, fragments rode thunderheads and bonded with sky-life and condensed storm energy. Storm eggs formed where ozone thickened into stillness between strikes. Their young carried weather-memory — how to warn, how to guide, how to keep a path open when the sky forgets itself.",
    thumbSrc: aboutScenePaths.vignetteStorm,
    thumbAlt: "Softened lightning heartbeat hovering between stormspire peaks",
  },
  {
    id: "stone",
    affinity: "Stone",
    accent: "var(--stone)",
    bondMatter: "Canyon bone · fossil grit · ruined-city pattern",
    comicCaption: "History settles into a shell of dust and patience.",
    prose:
      "In Stoneheart canyons, fragments sank into fossil dust and bonded with enduring creatures and the mineral memory of ruins. Stone eggs looked almost ordinary until light touched their ridges. Hatchlings wore the patterns of lost civilizations — quiet historians with paws.",
    thumbSrc: aboutScenePaths.vignetteStone,
    thumbAlt: "Fossil grit and canyon dust closing into a patient stone shell of light",
  },
  {
    id: "frost",
    affinity: "Frost",
    accent: "var(--frost)",
    bondMatter: "Still ice · powder snow · basin silence",
    comicCaption: "Cold keeps a secret until it is ready to wake.",
    prose:
      "Across Frostveil Basin, fragments cooled into frostfilm and bonded with creatures of powder and thin ice. Frost eggs waited under snow that fell out of season. When they opened, they carried winters that had been displaced by Rift weather — stillness as shelter, not as ending.",
    thumbSrc: aboutScenePaths.vignetteFrost,
    thumbAlt: "Cyan spark sealed under powder snow and still ice in a frozen basin",
  },
  {
    id: "radiant",
    affinity: "Radiant",
    accent: "var(--radiant)",
    bondMatter: "Healing light · prismdawn · citadel memory",
    comicCaption: "Light learns a gentler purpose than glare.",
    prose:
      "Beneath and beyond the Radiant Citadel, fragments gathered prismdawn and bonded with soft light-life. Radiant eggs formed where sunshaft pooled into calm. Hatchlings preserved healing knowledge and bright memory — reminders that the Gateways once balanced life, not just power.",
    thumbSrc: aboutScenePaths.vignetteRadiant,
    thumbAlt: "Warm prismdawn light pooling among crystals before a soft radiant creature",
  },
  {
    id: "void",
    affinity: "Void",
    accent: "var(--void)",
    bondMatter: "Hollowsilence · echo-dust · thin places",
    comicCaption: "Even emptiness can hold what must not be lost.",
    prose:
      "At Void Hollow’s edges, fragments settled into hush and bonded with echo-life and residual absence. Void eggs appeared where mist gathered into stillness. Their young protected what would otherwise dissolve between realities — the quiet between names, the soft shapes of almost-forgotten things.",
    thumbSrc: aboutScenePaths.vignetteVoid,
    thumbAlt: "Violet-cyan hush spark held in hollowsilence mist at a void edge",
  },
  {
    id: "alloy",
    affinity: "Alloy",
    accent: "var(--alloy)",
    bondMatter: "Living machinery · gear-moss · workshop song",
    comicCaption: "A machine remembers it was grown, not only built.",
    prose:
      "In Alloy ruins, fragments threaded through machines that still tried to grow beside living things. Alloy eggs formed in workshops where filament met moss. Hatchlings carried craft-knowledge and repair-instinct — living tools of continuity, never meant as chained servants.",
    thumbSrc: aboutScenePaths.vignetteAlloy,
    thumbAlt: "Living machinery and gear-moss forming a workshop egg of cyan-amber light",
  },
  {
    id: "spirit",
    affinity: "Spirit",
    accent: "var(--spirit)",
    bondMatter: "Remembered voices · marshlight · soft grief",
    comicCaption: "A memory asks for a body so it will not fade.",
    prose:
      "Through Spirit Marsh, fragments bonded with memories the living could no longer carry alone. Spirit eggs glowed like lanterns in reed-fog. Hatchlings sheltered names, songs, and farewells — archives of feeling that would have vanished when the world’s timelines slipped.",
    thumbSrc: aboutScenePaths.vignetteSpirit,
    thumbAlt: "Marshlight lanterns and a soft spirit spark gathering in reed-fog",
  },
  {
    id: "celestial",
    affinity: "Celestial",
    accent: "var(--violet)",
    bondMatter: "Starlit frost · map-light · thin sky between regions",
    comicCaption: "A spark listens to a call from beyond every map.",
    prose:
      "Near the Celestial Rift, rare fragments bonded with starlit frost and the thin places between regions. Celestial eggs were scarce and unstable — often damaged, often found by those already walking impossible paths. Some keepers whisper that Elara’s first companion carried this affinity, or all affinities at once. The truth remains part of the world’s open question.",
    thumbSrc: aboutScenePaths.vignetteCelestial,
    thumbAlt: "Starlit frost egg under a celestial rift of map-light and constellation glow",
  },
];

export const fullLorePanels: FullLorePanel[] = [
  {
    id: "lore-last-act",
    title: "The last act of the Gateway Hearts",
    summary: "Why the cores divided instead of fighting the Fracture.",
    body: [
      "The living cores tried, briefly, to hold the network. They failed — not from indifference, but from overflow. Reality had already layered itself into the Riftwilds.",
      "Division was their remaining mercy. By becoming many small fragments, they could still touch heat, tide, root, and memory in places the full Gateway could no longer reach. It was a retreat that looked like scattering — and a rescue that looked like birth.",
    ],
  },
  {
    id: "lore-eggs",
    title: "Why eggs exist",
    summary: "Crystallized Gateway energy plus regional matter = protected becoming.",
    body: whyEggsExist.body,
  },
  {
    id: "lore-not-weapons",
    title: "Not weapons. Not servants.",
    summary: "Preservation first — combat and craft came later as survival.",
    body: [
      ...whyRiftlingsWereMade.body,
      "If a Riftling fights beside you now, remember the origin: it was never forged for an arena. It was asked to remember a world — and later learned to defend the people who help it stay itself.",
    ],
  },
  {
    id: "lore-bridge",
    title: "Fracture → First Eggs → First Keeper",
    summary: "The clear path from broken reality to Elara’s bond.",
    body: [
      "Fracture: the Prime Gateway breaks; Aeryndra becomes the Riftwilds; histories begin to disappear.",
      "First Eggs: Gateway fragments bond with surviving life and close into shells of crystallized energy and regional matter across every affinity.",
      "First Keeper: Elara Venn finds a damaged egg, carries it through nine days of collapse, and when it hatches, chooses keeping over titles. From that choice, Riftkeepers — and the companionship at the heart of Riftwilds — begin.",
      ABOUT_SLOGAN,
    ],
  },
  {
    id: "lore-seek-keepers",
    title: "Why Riftlings seek Riftkeepers",
    summary: "An archive needs a future — trust turns fragment-memory into identity.",
    body: [
      "A Riftling hatches already holding more than one lifetime of sensation. Without a trusted companion, those sensations can tangle into compulsion — toward unstable Rifts, toward places that no longer exist, toward mutations that hurt.",
      "A Riftkeeper helps organize memory, stabilize affinity, and offer shared days that belong to the creature itself. That is why pets in the Riftwilds are not collectibles in the story’s heart: they are living pieces of the world looking for someone who will give those pieces a future.",
    ],
  },
];

export const soundDirection = {
  opening: ["Low atmospheric drone", "Distant wind", "Soft crystalline tones"],
  worldBefore: ["Warm strings", "Wooden instruments", "Gentle natural ambience"],
  discovery: ["Quiet pulses", "Glass harmonics", "Growing mystery"],
  fracture: ["Heavy impact", "Distorted choir", "Deep bass", "Breaking stone and energy"],
  birth: ["Soft piano", "Rising strings", "Subtle creature sounds", "Hopeful musical change"],
  keepers: ["Emotional melody", "Warm percussion", "Human and creature connection"],
  finalCall: ["Large cinematic theme", "Distant choir", "Unresolved final note"],
} as const;

/** Asset generation status for docs / handoff */
export const aboutAssetManifest = {
  generated: [
    "about-hero-rift.png",
    "about-aeryndra-whole.png",
    "about-discovery-core.png",
    "about-fracture.png",
    "about-first-riftlings.png",
    "about-elara-egg.png",
    "about-commons-founding.png",
    "about-celestial-call.png",
    "comic/birth-01-fragment-release.png",
    "comic/birth-02-bonding.png",
    "comic/birth-03-egg-formation.png",
    "comic/birth-04-first-hatch.png",
    "comic/comic-elara-portrait.png",
    "comic/comic-elara-discovery.png",
    "comic/comic-elara-journey.png",
    "comic/comic-first-riftling-hatch.png",
    "comic/comic-first-riftling-mystery.png",
    "comic/comic-era-age-gateways.png",
    "comic/comic-era-living-core.png",
    "comic/comic-era-great-activation.png",
    "comic/comic-era-fracture.png",
    "comic/comic-era-first-eggs.png",
    "comic/comic-era-first-keeper.png",
    "comic/comic-era-founding-commons.png",
    "comic/comic-era-age-exploration.png",
    "comic/comic-era-present-awakening.png",
    "comic/comic-origin-01-gateway-hearts.png",
    "comic/comic-origin-02-fracture.png",
    "comic/comic-origin-03-fragments.png",
    "comic/comic-origin-04-bond.png",
    "comic/comic-origin-05-eggs.png",
    "comic/comic-origin-06-keepers.png",
    "comic/comic-info-what-are-riftlings.png",
    "comic/comic-info-riftkeeper.png",
    "comic/comic-info-live-world.png",
    "comic/comic-info-what-you-can-do.png",
    "comic/comic-info-living-world.png",
    "comic/comic-info-built-to-grow.png",
    "comic/comic-info-why-riftlings-made.png",
    "comic/comic-info-why-eggs.png",
    "comic/comic-info-why-evolve.png",
    "comic/comic-chapter-before-inset.png",
    "comic/comic-chapter-discovery-inset.png",
    "comic/comic-chapter-riftlings-inset.png",
  ],
  interimReuse: [
    "public/assets/regions/*.png used only as supplemental map/context art",
  ],
} as const;
