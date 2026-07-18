import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * Full-bleed atmospheric wallpapers for major routes.
 * Prefer PNG painted scenes; keep center dark enough for UI readability.
 */
export const WALLPAPERS = {
  hero: "/assets/ui/wallpapers/hero.png",
  play: "/assets/ui/wallpapers/play.png",
  hatchery: "/assets/ui/wallpapers/hatchery.png",
  world: "/assets/ui/wallpapers/world.png",
  "live-world": "/assets/ui/wallpapers/live-world.png",
  arena: "/assets/ui/wallpapers/arena.png",
  marketplace: "/assets/ui/wallpapers/marketplace.png",
  shop: "/assets/ui/wallpapers/shop.png",
  inventory: "/assets/ui/wallpapers/inventory.png",
  guilds: "/assets/ui/wallpapers/guilds.png",
  homestead: "/assets/ui/wallpapers/homestead.png",
  economy: "/assets/ui/wallpapers/economy.png",
  treasury: "/assets/treasury/hero.png",
  token: "/assets/ui/wallpapers/token.png",
  rewards: "/assets/ui/wallpapers/rewards.png",
  care: "/assets/ui/wallpapers/care.png",
  loyalty: "/assets/loyalty/rift-storm-banner.png",
  ecosystem: "/assets/ui/ecosystem/living-world-cta.png",
  transparency: "/assets/ui/wallpapers/transparency.png",
  fairness: "/assets/ui/wallpapers/fairness.png",
  creatures: "/assets/ui/wallpapers/creatures.png",
  profile: "/assets/ui/wallpapers/profile.png",
  collection: "/assets/ui/wallpapers/collection.png",
  quests: "/assets/ui/wallpapers/quests.png",
  leaderboards: "/assets/ui/wallpapers/leaderboards.png",
  pets: "/assets/ui/wallpapers/pets.png",
  docs: "/assets/ui/wallpapers/docs.png",
  battle: "/assets/ui/wallpapers/battle.png",
  "tcg-battle": "/assets/ui/wallpapers/tcg-battle.png",
  memorials: "/assets/ui/wallpapers/memorials.png",
  about: "/assets/about/about-hero-rift.png",
} as const;

export type WallpaperKey = keyof typeof WALLPAPERS;

/** Route prefix → wallpaper (longest match wins). */
const ROUTE_WALLPAPERS: { prefix: string; name: WallpaperKey; opacity?: number }[] = [
  { prefix: "/", name: "hero", opacity: 0.62 },
  { prefix: "/play", name: "play", opacity: 0.4 },
  { prefix: "/hatchery", name: "hatchery", opacity: 0.48 },
  { prefix: "/world", name: "world", opacity: 0.42 },
  { prefix: "/live-world", name: "live-world", opacity: 0.4 },
  { prefix: "/live", name: "live-world", opacity: 0.4 },
  { prefix: "/arena", name: "arena", opacity: 0.4 },
  { prefix: "/marketplace", name: "marketplace", opacity: 0.4 },
  { prefix: "/shop", name: "shop", opacity: 0.4 },
  { prefix: "/inventory", name: "inventory", opacity: 0.48 },
  { prefix: "/guilds", name: "guilds", opacity: 0.4 },
  { prefix: "/homestead", name: "homestead", opacity: 0.42 },
  { prefix: "/housing", name: "homestead", opacity: 0.42 },
  { prefix: "/neighborhoods", name: "homestead", opacity: 0.4 },
  { prefix: "/economy", name: "economy", opacity: 0.72 },
  { prefix: "/treasury", name: "treasury", opacity: 0.68 },
  { prefix: "/token", name: "token", opacity: 0.62 },
  { prefix: "/rewards", name: "rewards", opacity: 0.65 },
  { prefix: "/loyalty", name: "loyalty", opacity: 0.55 },
  { prefix: "/ecosystem", name: "ecosystem", opacity: 0.5 },
  { prefix: "/community", name: "token", opacity: 0.58 },
  { prefix: "/transparency", name: "transparency", opacity: 0.6 },
  { prefix: "/fairness", name: "fairness", opacity: 0.6 },
  { prefix: "/creatures", name: "creatures", opacity: 0.45 },
  { prefix: "/profile", name: "profile", opacity: 0.4 },
  { prefix: "/collection", name: "collection", opacity: 0.4 },
  { prefix: "/quests", name: "quests", opacity: 0.4 },
  { prefix: "/leaderboards", name: "leaderboards", opacity: 0.4 },
  { prefix: "/pets", name: "pets", opacity: 0.4 },
  { prefix: "/creature", name: "creatures", opacity: 0.38 },
  { prefix: "/docs", name: "docs", opacity: 0.4 },
  { prefix: "/patch-notes", name: "docs", opacity: 0.38 },
  { prefix: "/updates", name: "docs", opacity: 0.38 },
  { prefix: "/battle", name: "battle", opacity: 0.4 },
  { prefix: "/tcg/battle", name: "tcg-battle", opacity: 0.52 },
  { prefix: "/tcg/collection", name: "collection", opacity: 0.48 },
  { prefix: "/tcg", name: "tcg-battle", opacity: 0.45 },
  { prefix: "/memorials", name: "memorials", opacity: 0.4 },
  { prefix: "/legal", name: "docs", opacity: 0.35 },
  { prefix: "/about", name: "about", opacity: 0.28 },
];

export function resolveWallpaperForPath(pathname: string): {
  name: WallpaperKey;
  opacity: number;
} | null {
  const path = pathname.split("?")[0] || "/";
  let best: { prefix: string; name: WallpaperKey; opacity?: number } | null = null;

  for (const entry of ROUTE_WALLPAPERS) {
    const match =
      entry.prefix === "/"
        ? path === "/"
        : path === entry.prefix || path.startsWith(`${entry.prefix}/`);
    if (!match) continue;
    if (!best || entry.prefix.length > best.prefix.length) {
      best = entry;
    }
  }

  if (!best) return null;
  return { name: best.name, opacity: best.opacity ?? 0.4 };
}

type Props = {
  name: WallpaperKey;
  className?: string;
  opacity?: number;
  /** Eager-load for above-the-fold / primary destinations. */
  priority?: boolean;
};

export function PageWallpaper({ name, className, opacity = 0.55, priority }: Props) {
  const src = WALLPAPERS[name];
  const eager =
    priority ??
    (name === "hero" ||
      name === "hatchery" ||
      name === "arena" ||
      name === "play" ||
      name === "tcg-battle");

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <Image
        src={src}
        alt=""
        fill
        className="object-cover object-center"
        style={{ opacity }}
        priority={eager}
        loading={eager ? "eager" : undefined}
        sizes="100vw"
        unoptimized
      />
      {/* Light scrim — wallpaper stays visible; glass panels carry most readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,11,22,0.22)] via-[rgba(7,11,22,0.1)] to-[rgba(7,11,22,0.48)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,11,22,0.04)_0%,rgba(7,11,22,0.22)_70%,rgba(7,11,22,0.4)_100%)]" />
    </div>
  );
}
