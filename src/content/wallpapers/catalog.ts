/**
 * Riftwilds downloadable wallpapers — cinematic battle art + creature scenes.
 * Free for personal use; not for resale.
 */

export type Wallpaper = {
  id: string;
  slug: string;
  title: string;
  shortLabel: string;
  description: string;
  /** Desktop 1920×1080 PNG */
  pngSrc: string;
  /** Optional SVG source */
  svgSrc?: string;
  /** Optional UI tile preview (lighter than full wallpaper download) */
  thumbSrc?: string;
  tags: string[];
};

export const WALLPAPER_CREDIT =
  "Free download for personal use (desktops, phones, backgrounds). Please do not resell or use commercially.";

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "commons-plaza",
    slug: "commons-plaza",
    title: "Commons Under Siege",
    shortLabel: "Commons",
    description:
      "Keepers hold the fountain square as a cyan rift storm cracks the plaza and stalls shatter.",
    pngSrc: "/assets/wallpapers/commons-plaza.png",
    thumbSrc: "/assets/ui/comics/desktop-commons.png",
    tags: ["commons", "battle", "siege"],
  },
  {
    id: "spark-glow",
    slug: "spark-glow",
    title: "Spark's Stand",
    shortLabel: "Spark",
    description:
      "Spark the Glowpup leaps into a corrupted beast’s charge — cyan sparks vs amber fangs.",
    pngSrc: "/assets/wallpapers/spark-glow.png",
    thumbSrc: "/assets/ui/comics/desktop-spark.png",
    tags: ["spark", "riftling", "battle"],
  },
  {
    id: "riftling-meadow",
    slug: "riftling-meadow",
    title: "Meadow Ambush",
    shortLabel: "Meadow",
    description:
      "Rifters and Riftlings clash with corrupted wildlife as a rift tear rips the meadow open.",
    pngSrc: "/assets/wallpapers/riftling-meadow.png",
    thumbSrc: "/assets/ui/comics/desktop-meadow.png",
    tags: ["riftling", "ambush", "battle"],
  },
  {
    id: "circus-night",
    slug: "circus-night",
    title: "Circus Under Fire",
    shortLabel: "Circus",
    description:
      "The Traveling Circus tent burns and tears while Keepers defend the ring from rift beasts.",
    pngSrc: "/assets/wallpapers/circus-night.png",
    thumbSrc: "/assets/ui/comics/desktop-circus.png",
    tags: ["circus", "siege", "night"],
  },
  {
    id: "festival-lanterns",
    slug: "festival-lanterns",
    title: "Market Inferno",
    shortLabel: "Market",
    description:
      "Festival lanterns fall through smoke as Keepers fight through a burning market breach.",
    pngSrc: "/assets/wallpapers/festival-lanterns.png",
    tags: ["festival", "market", "battle"],
  },
  {
    id: "lantern-street",
    slug: "lantern-street",
    title: "Street of Sparks",
    shortLabel: "Street",
    description:
      "Night cobblestones split with cyan rift wounds; Keepers clash amid shattered shop stalls.",
    pngSrc: "/assets/wallpapers/lantern-street.png",
    tags: ["street", "night", "battle"],
  },
  {
    id: "rift-sky",
    slug: "rift-sky",
    title: "Rift Storm Break",
    shortLabel: "Rift Storm",
    description:
      "A living sky-rift tears the firmament while Keepers face storm-born beasts on the ridge.",
    pngSrc: "/assets/wallpapers/rift-sky.png",
    tags: ["rift", "storm", "sky"],
  },
  {
    id: "moonwater-harbor",
    slug: "moonwater-harbor",
    title: "Harbor Rift Tide",
    shortLabel: "Harbor",
    description:
      "A rift-tide kraken rises against Moonwater docks as Keepers brace shattered piers.",
    pngSrc: "/assets/wallpapers/moonwater-harbor.png",
    tags: ["harbor", "kraken", "boss"],
  },
  {
    id: "elderwood-forest",
    slug: "elderwood-forest",
    title: "Bridge Collapse",
    shortLabel: "Elderwood",
    description:
      "An Elderwood bridge shears apart mid-fight — Keepers leap as corrupted roots strike.",
    pngSrc: "/assets/wallpapers/elderwood-forest.png",
    tags: ["forest", "collapse", "battle"],
  },
  {
    id: "radiant-castle",
    slug: "radiant-castle",
    title: "Citadel Assault",
    shortLabel: "Citadel",
    description:
      "World-boss siege at the glowing citadel gates — siege light, broken walls, last stand.",
    pngSrc: "/assets/wallpapers/radiant-castle.png",
    tags: ["castle", "boss", "siege"],
  },
  {
    id: "homestead-dusk",
    slug: "homestead-dusk",
    title: "Homestead Last Light",
    shortLabel: "Homestead",
    description:
      "A Keeper homestead burns at dusk while Rifters hold the porch against riftspawn.",
    pngSrc: "/assets/wallpapers/homestead-dusk.png",
    tags: ["homestead", "defense", "dusk"],
  },
  {
    id: "stormspire",
    slug: "stormspire",
    title: "Stormspire Clash",
    shortLabel: "Stormspire",
    description:
      "Lightning-kissed peaks become a warfront as Keepers duel a storm-forged rift titan.",
    pngSrc: "/assets/wallpapers/stormspire.png",
    tags: ["storm", "peaks", "boss"],
  },
  {
    id: "keeper-academy",
    slug: "keeper-academy",
    title: "Academy Defense",
    shortLabel: "Academy",
    description:
      "Cadets and mentors seal the Academy halls as rift energy floods cracked lecture stone.",
    pngSrc: "/assets/wallpapers/keeper-academy.png",
    tags: ["academy", "defense", "keepers"],
  },
  {
    id: "fountain-square",
    slug: "fountain-square",
    title: "Fountain Breach",
    shortLabel: "Fountain",
    description:
      "The Commons fountain ruptures — cyan spray and amber sparks as Rifters push the breach.",
    pngSrc: "/assets/wallpapers/fountain-square.png",
    tags: ["fountain", "breach", "commons"],
  },
  {
    id: "cosmic-aurora",
    slug: "cosmic-aurora",
    title: "Aurora Warfront",
    shortLabel: "Aurora",
    description:
      "Cosmic cyan–amber aurora ribbons frame an epic sky battle above a shattered ridge.",
    pngSrc: "/assets/wallpapers/cosmic-aurora.png",
    tags: ["cosmic", "aurora", "warfront"],
  },
  {
    id: "creature-spark-commons",
    slug: "creature-spark-commons",
    title: "Spark at the Commons",
    shortLabel: "Spark",
    description:
      "Spark the Glowpup stands on lantern-lit Commons cobbles as dusk riftlight softens the plaza.",
    pngSrc: "/assets/wallpapers/creature-spark-commons.png",
    tags: ["spark", "glowpup", "commons", "creature"],
  },
  {
    id: "creature-emberfox-crater",
    slug: "creature-emberfox-crater",
    title: "Emberfox Crater Watch",
    shortLabel: "Emberfox",
    description:
      "Emberfox perches on a glowing Ember Crater ledge — ash hide, ember eyes, molten rivers below.",
    pngSrc: "/assets/wallpapers/creature-emberfox-crater.png",
    tags: ["emberfox", "ember", "crater", "creature"],
  },
  {
    id: "creature-bramblefox-elderwood",
    slug: "creature-bramblefox-elderwood",
    title: "Bramblefox Thorntrail",
    shortLabel: "Bramblefox",
    description:
      "Bramblefox leaps Elderwood roots through mist and saplight — thorn-trail mischief in the grove.",
    pngSrc: "/assets/wallpapers/creature-bramblefox-elderwood.png",
    tags: ["bramblefox", "elderwood", "grove", "creature"],
  },
  {
    id: "creature-mossprig-grove",
    slug: "creature-mossprig-grove",
    title: "Mossprig Glade",
    shortLabel: "Mossprig",
    description:
      "Gentle Mossprig nestled among mushrooms and moss stones in a quiet Elderwood glade.",
    pngSrc: "/assets/wallpapers/creature-mossprig-grove.png",
    tags: ["mossprig", "grove", "elderwood", "creature"],
  },
  {
    id: "creature-ashwing-ember",
    slug: "creature-ashwing-ember",
    title: "Ashwing Over Ember",
    shortLabel: "Ashwing",
    description:
      "Ashwing soars above Ember Crater smoke plumes — ember feathers cutting a warm sunset sky.",
    pngSrc: "/assets/wallpapers/creature-ashwing-ember.png",
    tags: ["ashwing", "ember", "sky", "creature"],
  },
  {
    id: "creature-auralynx-citadel",
    slug: "creature-auralynx-citadel",
    title: "Auralynx at Dawn",
    shortLabel: "Auralynx",
    description:
      "Auralynx on Radiant Citadel marble steps — pale light fur under golden dawn and cyan aurora.",
    pngSrc: "/assets/wallpapers/creature-auralynx-citadel.png",
    tags: ["auralynx", "citadel", "light", "creature"],
  },
  {
    id: "creature-basaltpup-canyon",
    slug: "creature-basaltpup-canyon",
    title: "Basaltpup Overlook",
    shortLabel: "Basaltpup",
    description:
      "Basaltpup watches Stoneheart Canyon from a rocky ledge — basalt plates catching dusty sun.",
    pngSrc: "/assets/wallpapers/creature-basaltpup-canyon.png",
    tags: ["basaltpup", "canyon", "earth", "creature"],
  },
  {
    id: "creature-tideotter-harbor",
    slug: "creature-tideotter-harbor",
    title: "Tideotter Harbor Glow",
    shortLabel: "Tideotter",
    description:
      "Tideotter plays near Moonwater Harbor docks — pearl-blue coat under lantern twilight.",
    pngSrc: "/assets/wallpapers/creature-tideotter-harbor.png",
    tags: ["tideotter", "harbor", "tide", "creature"],
  },
  {
    id: "creature-sparkmoth-stormspire",
    slug: "creature-sparkmoth-stormspire",
    title: "Sparkmoth Spirewind",
    shortLabel: "Sparkmoth",
    description:
      "Sparkmoth hovers Stormspire cliffs in a lightning storm — kite-silk wings edged in cyan.",
    pngSrc: "/assets/wallpapers/creature-sparkmoth-stormspire.png",
    tags: ["sparkmoth", "stormspire", "storm", "creature"],
  },
  {
    id: "creature-cindercub-forge",
    slug: "creature-cindercub-forge",
    title: "Cindercub at the Forge",
    shortLabel: "Cindercub",
    description:
      "Cindercub warms by the Ember Forge hearth — smoldering fur and soft belly embers.",
    pngSrc: "/assets/wallpapers/creature-cindercub-forge.png",
    tags: ["cindercub", "forge", "ember", "creature"],
  },
  {
    id: "creature-frostnip-peaks",
    slug: "creature-frostnip-peaks",
    title: "Frostnip Peak Quiet",
    shortLabel: "Frostnip",
    description:
      "Frostnip curls on a snowy Stormspire ledge under soft cyan–gold aurora.",
    pngSrc: "/assets/wallpapers/creature-frostnip-peaks.png",
    tags: ["frostnip", "peaks", "ice", "creature"],
  },
  {
    id: "creature-wirefox-gearworks",
    slug: "creature-wirefox-gearworks",
    title: "Wirefox Gearworks",
    shortLabel: "Wirefox",
    description:
      "Wirefox prowls a night gearworks bay — copper wire accents and cyan circuit veins.",
    pngSrc: "/assets/wallpapers/creature-wirefox-gearworks.png",
    tags: ["wirefox", "gearworks", "forge", "creature"],
  },
  {
    id: "creature-groveowl-canopy",
    slug: "creature-groveowl-canopy",
    title: "Groveowl Canopy",
    shortLabel: "Groveowl",
    description:
      "Groveowl perched high in Elderwood canopy at golden hour — moss-green plumage watching the forest.",
    pngSrc: "/assets/wallpapers/creature-groveowl-canopy.png",
    tags: ["groveowl", "elderwood", "grove", "creature"],
  },
  {
    id: "creature-fernfox-meadow",
    slug: "creature-fernfox-meadow",
    title: "Fernfox Meadow Run",
    shortLabel: "Fernfox",
    description:
      "Fernfox trots a sunlit wildflower meadow — frond-tipped ears and gentle rift shimmer afar.",
    pngSrc: "/assets/wallpapers/creature-fernfox-meadow.png",
    tags: ["fernfox", "meadow", "grove", "creature"],
  },
  {
    id: "creature-stormmoth-rift-sky",
    slug: "creature-stormmoth-rift-sky",
    title: "Stormmoth Rift Flight",
    shortLabel: "Stormmoth",
    description:
      "Stormmoth cuts through a living sky-rift storm — indigo wings veined with electric cyan.",
    pngSrc: "/assets/wallpapers/creature-stormmoth-rift-sky.png",
    tags: ["stormmoth", "rift", "storm", "creature"],
  },
  {
    id: "creature-cogpup-hatchery",
    slug: "creature-cogpup-hatchery",
    title: "Cogpup Hatchery Nest",
    shortLabel: "Cogpup",
    description:
      "Cogpup among Hatchery egg cradles — soft fur, copper gears, and warm incubator glow.",
    pngSrc: "/assets/wallpapers/creature-cogpup-hatchery.png",
    tags: ["cogpup", "hatchery", "creature"],
  },
  {
    id: "creature-radiantkit-academy",
    slug: "creature-radiantkit-academy",
    title: "Radiantkit Academy Hall",
    shortLabel: "Radiantkit",
    description:
      "Radiantkit explores Keeper Academy halls — luminous fur beside crystal alcoves and tall windows.",
    pngSrc: "/assets/wallpapers/creature-radiantkit-academy.png",
    tags: ["radiantkit", "academy", "light", "creature"],
  },
  {
    id: "creature-pearlurk-tidepools",
    slug: "creature-pearlurk-tidepools",
    title: "Pearlurk Tide Pools",
    shortLabel: "Pearlurk",
    description:
      "Pearlurk half-emerged from moonlit Moonwater tide pools — pearlescent plates and cyan biolights.",
    pngSrc: "/assets/wallpapers/creature-pearlurk-tidepools.png",
    tags: ["pearlurk", "tide", "harbor", "creature"],
  },
  {
    id: "creature-wispdeer-aurora",
    slug: "creature-wispdeer-aurora",
    title: "Wispdeer Aurora Field",
    shortLabel: "Wispdeer",
    description:
      "Wispdeer stands under cyan–amber aurora — translucent light antlers in a highland meadow.",
    pngSrc: "/assets/wallpapers/creature-wispdeer-aurora.png",
    tags: ["wispdeer", "aurora", "creature"],
  },
  {
    id: "creature-voidling-rift-cavern",
    slug: "creature-voidling-rift-cavern",
    title: "Voidling Rift Cavern",
    shortLabel: "Voidling",
    description:
      "Voidling nestled in a crystalline rift cavern — star-flecked hide beside cyan cracks and amber crystal.",
    pngSrc: "/assets/wallpapers/creature-voidling-rift-cavern.png",
    tags: ["voidling", "rift", "cavern", "creature"],
  },
  {
    id: "spark-plaza-dawn",
    slug: "spark-plaza-dawn",
    title: "Spark at Dawn Plaza",
    shortLabel: "Spark Dawn",
    description:
      "Spark the Glowpup greets Riftwild Commons from the fountain rim as dawn lanterns warm the stalls.",
    pngSrc: "/assets/wallpapers/spark-plaza-dawn.png",
    tags: ["spark", "commons", "glowpup", "creature"],
  },
  {
    id: "emberfox-crater-glow",
    slug: "emberfox-crater-glow",
    title: "Emberfox Crater Glow",
    shortLabel: "Emberfox Glow",
    description:
      "Emberfox watches Ember Crater’s living coal pools — ashen plates, flame tail, amber corelight.",
    pngSrc: "/assets/wallpapers/emberfox-crater-glow.png",
    tags: ["emberfox", "crater", "ember", "creature"],
  },
  {
    id: "galekit-peak-winds",
    slug: "galekit-peak-winds",
    title: "Galekit Peak Winds",
    shortLabel: "Galekit",
    description:
      "Galekit races Stormspire ridgelines through kite-silk wind and cyan ozone crackle.",
    pngSrc: "/assets/wallpapers/galekit-peak-winds.png",
    tags: ["galekit", "stormspire", "storm", "creature"],
  },
  {
    id: "bramblefox-elderwood-path",
    slug: "bramblefox-elderwood-path",
    title: "Bramblefox Elderwood Path",
    shortLabel: "Bramble Path",
    description:
      "Bramblefox pads a sun-dappled Elderwood trail — vine-thorn tail and saplight motes.",
    pngSrc: "/assets/wallpapers/bramblefox-elderwood-path.png",
    tags: ["bramblefox", "elderwood", "grove", "creature"],
  },
  {
    id: "mossprig-saplight-grove",
    slug: "mossprig-saplight-grove",
    title: "Mossprig Saplight Grove",
    shortLabel: "Saplight",
    description:
      "Mossprig rests in a luminous moss grove where mushrooms glow soft gold and green.",
    pngSrc: "/assets/wallpapers/mossprig-saplight-grove.png",
    tags: ["mossprig", "grove", "meadow", "creature"],
  },
  {
    id: "thornling-rootlanes",
    slug: "thornling-rootlanes",
    title: "Thornling Rootlanes",
    shortLabel: "Thornling",
    description:
      "Thornling stands watch among Elderwood Rootlanes as twilight saplight veins the trunks.",
    pngSrc: "/assets/wallpapers/thornling-rootlanes.png",
    tags: ["thornling", "elderwood", "grove", "creature"],
  },
  {
    id: "wisplet-spirit-marsh",
    slug: "wisplet-spirit-marsh",
    title: "Wisplet Spirit Marsh",
    shortLabel: "Wisplet",
    description:
      "Wisplet drifts above Spirit Marsh reeds — lantern-soft body, dream-pollen haze, dusk boardwalks.",
    pngSrc: "/assets/wallpapers/wisplet-spirit-marsh.png",
    tags: ["wisplet", "marsh", "spirit", "creature"],
  },
  {
    id: "soulmoth-lantern-night",
    slug: "soulmoth-lantern-night",
    title: "Soulmoth Lantern Night",
    shortLabel: "Soulmoth",
    description:
      "Soulmoth threads a lantern festival street — cyan-gold wings among hanging amber lamps.",
    pngSrc: "/assets/wallpapers/soulmoth-lantern-night.png",
    tags: ["soulmoth", "festival", "spirit", "creature"],
  },
  {
    id: "iciclepup-frostveil",
    slug: "iciclepup-frostveil",
    title: "Iciclepup Frostveil",
    shortLabel: "Iciclepup",
    description:
      "Iciclepup bounds Frostveil Basin snow under cyan–amber aurora and crystal frost.",
    pngSrc: "/assets/wallpapers/iciclepup-frostveil.png",
    tags: ["iciclepup", "frostveil", "frost", "creature"],
  },
  {
    id: "nova-star-gate",
    slug: "nova-star-gate",
    title: "Nova at the Star Gate",
    shortLabel: "Nova",
    description:
      "Prime companion Nova faces an ancient Star Gate — twin cyan–amber core under shattered stars.",
    pngSrc: "/assets/wallpapers/nova-star-gate.png",
    tags: ["nova", "cosmos", "prime", "creature"],
  },
  {
    id: "mira-companions-hatchery",
    slug: "mira-companions-hatchery",
    title: "Mira's Companions Hatchery",
    shortLabel: "Companions",
    description:
      "Spark, Emberfox, and Mossprig share the Hatchery vault among glowing eggs and aurora windows.",
    pngSrc: "/assets/wallpapers/mira-companions-hatchery.png",
    tags: ["hatchery", "spark", "companions", "creature"],
  },
  {
    id: "circus-riftling-ring",
    slug: "circus-riftling-ring",
    title: "Circus Riftling Ring",
    shortLabel: "Circus Ring",
    description:
      "Spark and Bramblefox share the Traveling Circus ring under lanternlight and tent silk.",
    pngSrc: "/assets/wallpapers/circus-riftling-ring.png",
    tags: ["circus", "spark", "bramblefox", "creature"],
  },
  {
    id: "rift-cavern-companions",
    slug: "rift-cavern-companions",
    title: "Rift Cavern Companions",
    shortLabel: "Cavern",
    description:
      "Riftpup and Galekit explore a cyan-crystal cavern — amber magma veins, underground wonder.",
    pngSrc: "/assets/wallpapers/rift-cavern-companions.png",
    tags: ["cavern", "riftpup", "galekit", "creature"],
  },
  {
    id: "festival-meadow-pack",
    slug: "festival-meadow-pack",
    title: "Festival Meadow Pack",
    shortLabel: "Festival Pack",
    description:
      "Commonspark and meadow friends play among festival ribbons at golden hour.",
    pngSrc: "/assets/wallpapers/festival-meadow-pack.png",
    tags: ["festival", "meadow", "commonspark", "creature"],
  },
  {
    id: "night-sky-moths",
    slug: "night-sky-moths",
    title: "Night Sky Moths",
    shortLabel: "Moths",
    description:
      "Sparkmoth, Citadelmoth, and Soulmoth trail light across an aurora night sky.",
    pngSrc: "/assets/wallpapers/night-sky-moths.png",
    tags: ["moths", "night", "sky", "creature"],
  },
  {
    id: "auralynx-radiant-citadel",
    slug: "auralynx-radiant-citadel",
    title: "Auralynx Radiant Citadel",
    shortLabel: "Citadel Lynx",
    description:
      "Auralynx overlooks Radiant Citadel towers from a sunlit balcony of pale gold stone.",
    pngSrc: "/assets/wallpapers/auralynx-radiant-citadel.png",
    tags: ["auralynx", "citadel", "light", "creature"],
  },
  {
    id: "cindercub-ember-forge",
    slug: "cindercub-ember-forge",
    title: "Cindercub Ember Forge",
    shortLabel: "Forge Cub",
    description:
      "Cindercub warms beside the Ember Forge hearth — living coal, copper racks, soft sparks.",
    pngSrc: "/assets/wallpapers/cindercub-ember-forge.png",
    tags: ["cindercub", "forge", "ember", "creature"],
  },
  {
    id: "windrift-storm-ridge",
    slug: "windrift-storm-ridge",
    title: "Windrift Storm Ridge",
    shortLabel: "Windrift",
    description:
      "Windrift and Galekit race a Stormspire ridge through lightning-kissed peak winds.",
    pngSrc: "/assets/wallpapers/windrift-storm-ridge.png",
    tags: ["windrift", "galekit", "storm", "creature"],
  },
  {
    id: "dreamhare-moonwater",
    slug: "dreamhare-moonwater",
    title: "Dreamhare Moonwater",
    shortLabel: "Dreamhare",
    description:
      "Dreamhare rests on Moonwater Harbor docks as moonrise lanterns mirror the tide.",
    pngSrc: "/assets/wallpapers/dreamhare-moonwater.png",
    tags: ["dreamhare", "harbor", "spirit", "creature"],
  },
  {
    id: "riftpup-cyan-breach",
    slug: "riftpup-cyan-breach",
    title: "Riftpup Cyan Breach",
    shortLabel: "Riftpup",
    description:
      "Riftpup faces a vertical cyan Fracture tear over a night meadow of amber wildflowers.",
    pngSrc: "/assets/wallpapers/riftpup-cyan-breach.png",
    tags: ["riftpup", "rift", "breach", "creature"],
  },
];

export function listWallpapers(): Wallpaper[] {
  return WALLPAPERS;
}

/** Featured Desktop Art tiles (Commons, Spark, Meadow, Circus). */
export function listFeaturedWallpapers(limit = 4): Wallpaper[] {
  return WALLPAPERS.slice(0, limit);
}

export function getWallpaper(slug: string): Wallpaper | undefined {
  return WALLPAPERS.find((w) => w.slug === slug);
}
