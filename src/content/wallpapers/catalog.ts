/**
 * Riftwilds downloadable wallpapers — original fantasy art.
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
  tags: string[];
};

export const WALLPAPER_CREDIT =
  "Free download for personal use (desktops, phones, backgrounds). Please do not resell or use commercially.";

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "commons-plaza",
    slug: "commons-plaza",
    title: "Commons Plaza",
    shortLabel: "Commons",
    description: "Warm dusk light over the Riftwild Commons fountain square.",
    pngSrc: "/assets/wallpapers/commons-plaza.png",
    svgSrc: "/assets/wallpapers/commons-plaza.svg",
    tags: ["commons", "plaza"],
  },
  {
    id: "spark-glow",
    slug: "spark-glow",
    title: "Spark Glow",
    shortLabel: "Spark",
    description: "Spark the Glowpup shining under a soft cyan–amber night.",
    pngSrc: "/assets/wallpapers/spark-glow.png",
    svgSrc: "/assets/wallpapers/spark-glow.svg",
    tags: ["spark", "riftling"],
  },
  {
    id: "riftling-meadow",
    slug: "riftling-meadow",
    title: "Riftling Meadow",
    shortLabel: "Meadow",
    description: "Friendly Riftlings resting in a sunlit meadow.",
    pngSrc: "/assets/wallpapers/riftling-meadow.png",
    svgSrc: "/assets/wallpapers/riftling-meadow.svg",
    tags: ["riftling", "nature"],
  },
  {
    id: "circus-night",
    slug: "circus-night",
    title: "Circus Night",
    shortLabel: "Circus",
    description: "The Traveling Circus tent glowing under festival stars.",
    pngSrc: "/assets/wallpapers/circus-night.png",
    svgSrc: "/assets/wallpapers/circus-night.svg",
    tags: ["circus", "night"],
  },
  {
    id: "festival-lanterns",
    slug: "festival-lanterns",
    title: "Festival Lanterns",
    shortLabel: "Festival",
    description: "Colored lanterns drifting above a celebration night.",
    pngSrc: "/assets/wallpapers/festival-lanterns.png",
    svgSrc: "/assets/wallpapers/festival-lanterns.svg",
    tags: ["festival", "lanterns"],
  },
  {
    id: "lantern-street",
    slug: "lantern-street",
    title: "Night Lantern Street",
    shortLabel: "Street",
    description: "Quiet cobblestones and warm shop lanterns after dark.",
    pngSrc: "/assets/wallpapers/lantern-street.png",
    svgSrc: "/assets/wallpapers/lantern-street.svg",
    tags: ["night", "street"],
  },
  {
    id: "rift-sky",
    slug: "rift-sky",
    title: "Rift Sky",
    shortLabel: "Rift Sky",
    description: "A living rift tearing color across the night firmament.",
    pngSrc: "/assets/wallpapers/rift-sky.png",
    svgSrc: "/assets/wallpapers/rift-sky.svg",
    tags: ["rift", "sky"],
  },
  {
    id: "moonwater-harbor",
    slug: "moonwater-harbor",
    title: "Moonwater Harbor",
    shortLabel: "Harbor",
    description: "Moonlit sails and calm water at Moonwater Coast.",
    pngSrc: "/assets/wallpapers/moonwater-harbor.png",
    svgSrc: "/assets/wallpapers/moonwater-harbor.svg",
    tags: ["harbor", "coast"],
  },
  {
    id: "elderwood-forest",
    slug: "elderwood-forest",
    title: "Elderwood Forest",
    shortLabel: "Forest",
    description: "Tall canopy light filtering through Elderwood paths.",
    pngSrc: "/assets/wallpapers/elderwood-forest.png",
    svgSrc: "/assets/wallpapers/elderwood-forest.svg",
    tags: ["forest", "elderwood"],
  },
  {
    id: "radiant-castle",
    slug: "radiant-castle",
    title: "Radiant Castle",
    shortLabel: "Castle",
    description: "A glowing citadel silhouette against sunset violet.",
    pngSrc: "/assets/wallpapers/radiant-castle.png",
    svgSrc: "/assets/wallpapers/radiant-castle.svg",
    tags: ["castle", "citadel"],
  },
  {
    id: "homestead-dusk",
    slug: "homestead-dusk",
    title: "Homestead Dusk",
    shortLabel: "Homestead",
    description: "A cozy keeper homestead under peach-and-violet dusk.",
    pngSrc: "/assets/wallpapers/homestead-dusk.png",
    svgSrc: "/assets/wallpapers/homestead-dusk.svg",
    tags: ["homestead", "dusk"],
  },
  {
    id: "stormspire",
    slug: "stormspire",
    title: "Stormspire Peaks",
    shortLabel: "Storm",
    description: "Lightning-kissed peaks above the storm ridge.",
    pngSrc: "/assets/wallpapers/stormspire.png",
    svgSrc: "/assets/wallpapers/stormspire.svg",
    tags: ["storm", "peaks"],
  },
  {
    id: "keeper-academy",
    slug: "keeper-academy",
    title: "Keeper Academy",
    shortLabel: "Academy",
    description: "The Academy halls catching late golden light.",
    pngSrc: "/assets/wallpapers/keeper-academy.png",
    svgSrc: "/assets/wallpapers/keeper-academy.svg",
    tags: ["academy", "keepers"],
  },
  {
    id: "fountain-square",
    slug: "fountain-square",
    title: "Fountain Square",
    shortLabel: "Fountain",
    description: "Sparkling fountain spray in the heart of Commons.",
    pngSrc: "/assets/wallpapers/fountain-square.png",
    svgSrc: "/assets/wallpapers/fountain-square.svg",
    tags: ["fountain", "commons"],
  },
  {
    id: "cosmic-aurora",
    slug: "cosmic-aurora",
    title: "Cosmic Rift Aurora",
    shortLabel: "Aurora",
    description: "Aurora ribbons of cyan, violet, and rose across the cosmos.",
    pngSrc: "/assets/wallpapers/cosmic-aurora.png",
    svgSrc: "/assets/wallpapers/cosmic-aurora.svg",
    tags: ["cosmic", "aurora"],
  },
];

export function listWallpapers(): Wallpaper[] {
  return WALLPAPERS;
}

export function getWallpaper(slug: string): Wallpaper | undefined {
  return WALLPAPERS.find((w) => w.slug === slug);
}
