/**
 * Atmospheric backgrounds for section title hero bands (wallpaper + scrim only).
 * Prefer dedicated text-free crops in public/assets/ui/title-banners/{slug}.png when listed;
 * otherwise reuse route wallpapers from public/assets/ui/wallpapers/.
 * Do not use /assets/ui/titles wordmarks here — page titles are HTML text.
 */

import { sectionTitleFromLabel, type SectionTitleSlug } from "@/lib/assets/section-titles";

const TITLE_BANNER_DIR = "/assets/ui/title-banners";
const WALLPAPER_DIR = "/assets/ui/wallpapers";
/** Bump when atmosphere wallpapers change. */
const ATMOSPHERE_V = "atm5";

/**
 * Optional dedicated banner strips (wide crops). When a file is added under
 * title-banners/, list its slug here so it wins over the wallpaper fallback.
 */
const DEDICATED_TITLE_BANNERS: Partial<Record<SectionTitleSlug, string>> = {};

/** Section title slug → atmosphere image path. */
const TITLE_ATMOSPHERE: Record<string, string> = {
  home: `${WALLPAPER_DIR}/hero.png`,
  riftwilds: `${WALLPAPER_DIR}/hero.png`,
  play: `${WALLPAPER_DIR}/play.png`,
  hatchery: `${WALLPAPER_DIR}/hatchery.png`,
  world: `${WALLPAPER_DIR}/world.png`,
  "live-world": `${WALLPAPER_DIR}/live-world.png`,
  live: `${WALLPAPER_DIR}/live-world.png`,
  restoration: `${WALLPAPER_DIR}/world-restoration.png`,
  arena: `${WALLPAPER_DIR}/arena.png`,
  marketplace: `${WALLPAPER_DIR}/marketplace.png`,
  shop: `${WALLPAPER_DIR}/shop.png`,
  inventory: `${WALLPAPER_DIR}/inventory.png`,
  guilds: `${WALLPAPER_DIR}/guilds.png`,
  homestead: `${WALLPAPER_DIR}/homestead.png`,
  economy: `${WALLPAPER_DIR}/economy.png?v=economynnebula1`,
  token: `${WALLPAPER_DIR}/token.png`,
  transparency: `${WALLPAPER_DIR}/economy-space-soft.png?v=economynnebula1`,
  creatures: `${WALLPAPER_DIR}/creatures.png`,
  riftlings: `${WALLPAPER_DIR}/codex.png`,
  codex: `${WALLPAPER_DIR}/codex.png`,
  fairness: `${WALLPAPER_DIR}/economy-space-soft.png?v=economynnebula1`,
  profile: `${WALLPAPER_DIR}/profile.png`,
  collection: `${WALLPAPER_DIR}/collection.png`,
  quests: `${WALLPAPER_DIR}/quests.png`,
  leaderboards: `${WALLPAPER_DIR}/leaderboards.png`,
  docs: `${WALLPAPER_DIR}/docs.png`,
  pets: `${WALLPAPER_DIR}/pets.png`,
  battle: `${WALLPAPER_DIR}/battle.png`,
  memorials: `${WALLPAPER_DIR}/memorials.png`,
  rewards: `${WALLPAPER_DIR}/economy-nebula-alt.png?v=economynnebula1`,
  loyalty: `/assets/loyalty/rift-storm-banner.png`,
  ecosystem: `/assets/ui/ecosystem/living-world-cta.png`,
  treasury: `${WALLPAPER_DIR}/economy-nebula-alt.png?v=economynnebula1`,
};

function normalizeSlug(slug: string | undefined | null): string | undefined {
  if (!slug) return undefined;
  return slug.trim().toLowerCase();
}

/** Resolve a section slug from an explicit slug or a page title label. */
export function resolveTitleSlug(
  slug?: string | null,
  label?: string | null,
): string | undefined {
  const direct = normalizeSlug(slug);
  if (direct && (direct in TITLE_ATMOSPHERE || direct in DEDICATED_TITLE_BANNERS)) {
    return direct;
  }
  if (label) {
    const fromLabel = sectionTitleFromLabel(label);
    if (fromLabel) {
      const match = fromLabel.match(/\/([^/]+)\.png$/);
      if (match?.[1]) return match[1];
    }
    const key = normalizeSlug(label);
    if (key && key in TITLE_ATMOSPHERE) return key;
  }
  return direct;
}

/**
 * Public path for the title-band atmosphere image, or undefined if none.
 */
export function titleAtmospherePath(
  slug?: string | null,
  label?: string | null,
): string | undefined {
  const key = resolveTitleSlug(slug, label);
  if (!key) return undefined;

  const dedicated = DEDICATED_TITLE_BANNERS[key as SectionTitleSlug];
  if (dedicated) return `${dedicated}?v=${ATMOSPHERE_V}`;

  if (TITLE_ATMOSPHERE[key]) return `${TITLE_ATMOSPHERE[key]}?v=${ATMOSPHERE_V}`;

  // Do not invent paths for unlisted slugs (avoids empty/broken title plates).
  return undefined;
}
