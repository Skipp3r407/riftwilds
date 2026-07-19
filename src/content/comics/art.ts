/** Shared art paths for Legends of the Rift — every path must exist under public/. */

export const COVER = {
  "the-first-rift": "/assets/comics/covers/01-the-first-rift.png",
  "sparks-journey": "/assets/comics/covers/02-sparks-journey.png",
  "the-traveling-circus": "/assets/comics/covers/03-traveling-circus.png",
  "the-lost-city": "/assets/comics/covers/04-the-lost-city.png",
  "the-storm-king": "/assets/comics/covers/05-the-storm-king.png",
  "the-merchants-secret": "/assets/comics/covers/06-merchants-secret.png",
  "the-great-hunt": "/assets/comics/covers/07-the-great-hunt.png",
  "the-last-guardian": "/assets/comics/covers/08-the-last-guardian.png",
  "festival-of-lights": "/assets/comics/covers/09-festival-of-lights.png",
  "the-shadow-beyond": "/assets/comics/covers/10-the-shadow-beyond.png",
} as const;

export const SPLASH = {
  riftDawn: "/assets/comics/splashes/rift-dawn.png",
  circus: "/assets/comics/splashes/circus-arrival.png",
  lostCity: "/assets/comics/splashes/lost-city.png",
  festival: "/assets/comics/splashes/festival.png",
  sparkPath: "/assets/comics/splashes/spark-path.png",
  stormKing: "/assets/comics/splashes/storm-king.png",
  merchant: "/assets/comics/splashes/merchant-night.png",
  hunt: "/assets/comics/splashes/great-hunt.png",
  guardian: "/assets/comics/splashes/last-guardian.png",
  shadow: "/assets/comics/splashes/shadow-beyond.png",
} as const;

/**
 * Page / scene art. Region + story keys intentionally remap onto comic library
 * assets (the old /assets/regions/*.png and /assets/story/* paths were missing
 * or were tiny cyan-diamond stubs).
 */
export const PAGE_ART = {
  commons: "/assets/comics/pages/key-commons.png",
  forest: "/assets/comics/pages/key-forest.png",
  festival: "/assets/comics/pages/key-festival.png",
  rift: "/assets/comics/pages/key-rift.png",
  commonsDusk: "/assets/comics/pages/page-commons-dusk.png",
  layeredRuin: "/assets/comics/pages/page-layered-ruin.png",
  lanternSky: "/assets/comics/pages/page-lantern-sky.png",
  regionCommons: "/assets/comics/pages/page-commons-dusk.png",
  regionElderwood: "/assets/comics/pages/key-forest.png",
  regionStorm: "/assets/comics/splashes/storm-king.png",
  regionVoid: "/assets/comics/splashes/shadow-beyond.png",
  regionEmber: "/assets/comics/splashes/great-hunt.png",
  storyFirstLight: "/assets/comics/splashes/rift-dawn.png",
  storyBloom: "/assets/comics/splashes/festival.png",
  timelineGateways: "/assets/comics/pages/key-rift.png",
  timelineAwakening: "/assets/comics/splashes/shadow-beyond.png",
} as const;

export const WALLPAPERS = {
  commons: "/assets/comics/bonus/wallpaper-commons.png",
  rift: "/assets/comics/bonus/wallpaper-rift.png",
} as const;

/** Atmosphere → fallback page art when a beat omits artSrc. */
export const ART_BY_ATMOSPHERE: Record<string, string> = {
  dawn: PAGE_ART.forest,
  day: PAGE_ART.commonsDusk,
  dusk: PAGE_ART.commonsDusk,
  night: SPLASH.merchant,
  rift: PAGE_ART.rift,
  festival: PAGE_ART.lanternSky,
  storm: SPLASH.stormKing,
  ruin: PAGE_ART.layeredRuin,
};

export function artForAtmosphere(atmosphere?: string | null): string {
  if (atmosphere && ART_BY_ATMOSPHERE[atmosphere]) {
    return ART_BY_ATMOSPHERE[atmosphere]!;
  }
  return PAGE_ART.commons;
}
