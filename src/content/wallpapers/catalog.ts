/**
 * Riftwilds downloadable wallpapers — cinematic battle art.
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
