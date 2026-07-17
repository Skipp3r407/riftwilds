/**
 * Stylized section title / wordmark images (legacy assets).
 * Banner bands use HTML titles + wallpaper atmosphere instead;
 * these paths remain for optional non-banner surfaces (e.g. home brand mark)
 * and for slug/label resolution in title-banners.
 * Files live in public/assets/ui/titles/{slug}.png
 */

const TITLE_DIR = "/assets/ui/titles";
/** Bump when title PNGs are regenerated so Next/Image clients refresh. */
const TITLE_V = "play2";

function titlePath(file: string): string {
  return `${TITLE_DIR}/${file}?v=${TITLE_V}`;
}

/** Canonical slug → public path */
export const SECTION_TITLES = {
  home: titlePath("home.png"),
  riftwilds: titlePath("riftwilds.png"),
  play: titlePath("play.png"),
  hatchery: titlePath("hatchery.png"),
  world: titlePath("world.png"),
  "live-world": titlePath("live-world.png"),
  live: titlePath("live-world.png"),
  arena: titlePath("arena.png"),
  marketplace: titlePath("marketplace.png"),
  shop: titlePath("shop.png"),
  inventory: titlePath("inventory.png"),
  guilds: titlePath("guilds.png"),
  homestead: titlePath("homestead.png"),
  economy: titlePath("economy.png"),
  token: titlePath("token.png"),
  transparency: titlePath("transparency.png"),
  creatures: titlePath("creatures.png"),
  riftlings: titlePath("creatures.png"),
  fairness: titlePath("fairness.png"),
  profile: titlePath("profile.png"),
  collection: titlePath("collection.png"),
  quests: titlePath("quests.png"),
  leaderboards: titlePath("leaderboards.png"),
  docs: titlePath("docs.png"),
  pets: titlePath("pets.png"),
  battle: titlePath("battle.png"),
  memorials: titlePath("memorials.png"),
} as const;

export type SectionTitleSlug = keyof typeof SECTION_TITLES;

export function sectionTitlePath(slug: string | undefined | null): string | undefined {
  if (!slug) return undefined;
  const key = slug.trim().toLowerCase() as SectionTitleSlug;
  return SECTION_TITLES[key];
}

/** Resolve from a page title string when slug is omitted. */
const TITLE_ALIASES: Record<string, SectionTitleSlug> = {
  home: "home",
  riftwilds: "riftwilds",
  play: "play",
  hatchery: "hatchery",
  world: "world",
  "the riftwilds": "world",
  "live world": "live-world",
  arena: "arena",
  marketplace: "marketplace",
  shop: "shop",
  inventory: "inventory",
  guilds: "guilds",
  "riftbound guilds": "guilds",
  homestead: "homestead",
  "rift homesteads": "homestead",
  economy: "economy",
  token: "token",
  community: "token",
  transparency: "transparency",
  creatures: "creatures",
  riftlings: "riftlings",
  fairness: "fairness",
  profile: "profile",
  "keeper profile": "profile",
  collection: "collection",
  quests: "quests",
  leaderboards: "leaderboards",
  docs: "docs",
  pets: "pets",
  battle: "battle",
  memorials: "memorials",
};

export function sectionTitleFromLabel(label: string | undefined | null): string | undefined {
  if (!label) return undefined;
  const key = label.trim().toLowerCase();
  const slug = TITLE_ALIASES[key];
  return slug ? SECTION_TITLES[slug] : undefined;
}
