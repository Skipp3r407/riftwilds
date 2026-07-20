import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/**
 * Full-bleed atmospheric wallpapers for major routes.
 * Prefer PNG painted scenes; keep center dark enough for UI readability.
 */
export const WALLPAPERS = {
  hero: "/assets/ui/wallpapers/hero.png",
  play: "/assets/ui/wallpapers/play.png",
  /** Incubation vault hall — bump query when regenerating painted wallpaper */
  hatchery: "/assets/ui/wallpapers/hatchery.png?v=claimvault2",
  world: "/assets/ui/wallpapers/world.png",
  "live-world": "/assets/ui/wallpapers/live-world.png",
  restoration: "/assets/ui/wallpapers/world-restoration.png",
  /** Rift Arena — dual-portal combat floor (bump when regenerating) */
  arena: "/assets/ui/wallpapers/arena.png?v=riftarena2",
  marketplace: "/assets/ui/wallpapers/marketplace.png",
  shop: "/assets/ui/wallpapers/shop.png",
  /** Creator Hub — magical atelier / merchant hall atmosphere */
  creators: "/assets/ui/wallpapers/shop.png",
  inventory: "/assets/ui/wallpapers/inventory.png",
  guilds: "/assets/ui/wallpapers/guilds.png",
  social: "/assets/ui/wallpapers/social.png",
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
  /** Riftling Codex — cosmic rift archive / species hall */
  codex: "/assets/ui/wallpapers/codex.png?v=riftarchive1",
  /** Player Academy — night keeper school / cathedral courtyard */
  academy: "/assets/ui/wallpapers/academy.png?v=keeperhall1",
  profile: "/assets/ui/wallpapers/profile.png",
  collection: "/assets/ui/wallpapers/collection.png",
  quests: "/assets/ui/wallpapers/quests.png",
  leaderboards: "/assets/ui/wallpapers/leaderboards.png",
  pets: "/assets/ui/wallpapers/pets.png",
  docs: "/assets/ui/wallpapers/docs.png",
  battle: "/assets/ui/wallpapers/battle.png",
  /** Practice Board — painted rift cavern arena (no hex grid) */
  "tcg-battle": "/assets/ui/wallpapers/tcg-battle.png?v=practiceboard3",
  memorials: "/assets/ui/wallpapers/memorials.png",
  about: "/assets/about/about-hero-rift.png",
  /** Parents & Kids — magical archive / parchment hall */
  printables: "/assets/ui/wallpapers/docs.png",
  /** Kids coloring — cozy homestead twilight */
  coloring: "/assets/ui/wallpapers/homestead.png",
  /** Fan Kit hub — soft care atmosphere */
  "fan-kit": "/assets/ui/wallpapers/care.png",
  /** Auth gateway — rift cavern threshold (dark center for form cards) */
  auth: "/assets/ui/wallpapers/auth.png?v=authgate1",
} as const;

export type WallpaperKey = keyof typeof WALLPAPERS;

/** Route prefix → wallpaper (longest match wins). */
const ROUTE_WALLPAPERS: { prefix: string; name: WallpaperKey; opacity?: number }[] = [
  { prefix: "/", name: "hero", opacity: 0.62 },
  { prefix: "/play", name: "play", opacity: 0.4 },
  /** Keep vault art readable under panels — lighter than default game routes */
  { prefix: "/hatchery", name: "hatchery", opacity: 0.72 },
  { prefix: "/world", name: "world", opacity: 0.42 },
  { prefix: "/live-world", name: "live-world", opacity: 0.4 },
  { prefix: "/live", name: "live-world", opacity: 0.4 },
  { prefix: "/restoration", name: "restoration", opacity: 0.42 },
  /** Keep dual-portal arena readable under hub panels */
  { prefix: "/arena", name: "arena", opacity: 0.68 },
  { prefix: "/exchange", name: "economy", opacity: 0.55 },
  { prefix: "/marketplace", name: "marketplace", opacity: 0.52 },
  /** Merchant hall — keep art readable; panels carry local scrims */
  { prefix: "/shop", name: "shop", opacity: 0.72 },
  { prefix: "/creators", name: "creators", opacity: 0.45 },
  { prefix: "/inventory", name: "inventory", opacity: 0.48 },
  { prefix: "/guilds", name: "guilds", opacity: 0.4 },
  { prefix: "/social", name: "social", opacity: 0.42 },
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
  /** Species encyclopedia — keep nebula vault readable under card grid */
  { prefix: "/codex/riftlings", name: "codex", opacity: 0.58 },
  /** World history encyclopedia — same vault atmosphere as Riftling Codex */
  { prefix: "/codex/world", name: "codex", opacity: 0.55 },
  { prefix: "/profile", name: "profile", opacity: 0.4 },
  { prefix: "/collection", name: "collection", opacity: 0.58 },
  { prefix: "/quests", name: "quests", opacity: 0.4 },
  { prefix: "/leaderboards", name: "leaderboards", opacity: 0.4 },
  { prefix: "/pets", name: "pets", opacity: 0.4 },
  { prefix: "/creature", name: "creatures", opacity: 0.38 },
  { prefix: "/docs", name: "docs", opacity: 0.4 },
  /** Player Academy — night cathedral / keeper school courtyard */
  { prefix: "/academy", name: "academy", opacity: 0.58 },
  /** Keeper Guide — crystal archive / guide hall */
  { prefix: "/help", name: "docs", opacity: 0.45 },
  { prefix: "/patch-notes", name: "docs", opacity: 0.38 },
  { prefix: "/updates", name: "docs", opacity: 0.38 },
  { prefix: "/battle", name: "battle", opacity: 0.4 },
  /** Practice Board — painted cavern stays visible under HUD glass */
  { prefix: "/tcg/battle", name: "tcg-battle", opacity: 0.64 },
  { prefix: "/tcg/collection", name: "collection", opacity: 0.48 },
  { prefix: "/tcg", name: "tcg-battle", opacity: 0.52 },
  { prefix: "/memorials", name: "memorials", opacity: 0.4 },
  { prefix: "/legal", name: "docs", opacity: 0.35 },
  { prefix: "/about", name: "about", opacity: 0.28 },
  /** Parents & Kids print studio — archive hall stays visible under panels */
  { prefix: "/printables", name: "printables", opacity: 0.58 },
  { prefix: "/coloring", name: "coloring", opacity: 0.52 },
  { prefix: "/fan-kit", name: "fan-kit", opacity: 0.48 },
  { prefix: "/comics", name: "live-world", opacity: 0.42 },
  /** Riftkeeper auth gateway — dedicated cavern wallpaper (dark center) */
  { prefix: "/login", name: "auth", opacity: 0.62 },
  { prefix: "/signup", name: "auth", opacity: 0.62 },
  { prefix: "/forgot-password", name: "auth", opacity: 0.58 },
  { prefix: "/reset-password", name: "auth", opacity: 0.58 },
  { prefix: "/verify-email", name: "auth", opacity: 0.58 },
  { prefix: "/onboarding", name: "auth", opacity: 0.55 },
  { prefix: "/account", name: "auth", opacity: 0.58 },
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
      name === "shop" ||
      name === "tcg-battle" ||
      name === "printables" ||
      name === "coloring" ||
      name === "codex" ||
      name === "academy" ||
      name === "auth");

  const shopHall = name === "shop" || name === "creators";
  const hatcheryHall = name === "hatchery";
  const authHall = name === "auth";
  const codexHall = name === "codex";
  const academyHall = name === "academy";
  const arenaHall = name === "arena";
  const battleHall = name === "tcg-battle" || name === "battle";
  const kidsHall =
    name === "printables" || name === "coloring" || name === "fan-kit" || name === "docs";

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
      {shopHall ? (
        <>
          {/* Warmer, lighter wash so lantern/crystal hall reads through */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(18,12,8,0.18)] via-[rgba(8,10,16,0.08)] to-[rgba(6,8,14,0.42)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_30%,rgba(255,150,70,0.12)_0%,transparent_48%),radial-gradient(ellipse_at_75%_55%,rgba(40,180,200,0.08)_0%,transparent_42%),radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,22,0.18)_70%,rgba(7,11,22,0.38)_100%)]" />
        </>
      ) : authHall ? (
        <>
          {/* Auth gateway — keep edge crystals/lanterns readable; soft center for form cards */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,8,16,0.28)] via-[rgba(7,11,22,0.06)] to-[rgba(6,8,14,0.5)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_0%,rgba(7,11,22,0.1)_55%,rgba(7,11,22,0.36)_100%),radial-gradient(ellipse_at_18%_65%,rgba(61,231,255,0.07)_0%,transparent_40%),radial-gradient(ellipse_at_82%_60%,rgba(255,184,77,0.08)_0%,transparent_40%)]" />
        </>
      ) : hatcheryHall ? (
        <>
          {/* Incubation vault — keep painted nests / cyan rifts visible under claim UI */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,10,18,0.2)] via-[rgba(7,11,22,0.06)] to-[rgba(6,8,14,0.46)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_0%,rgba(7,11,22,0.12)_58%,rgba(7,11,22,0.36)_100%),radial-gradient(ellipse_at_20%_70%,rgba(255,150,70,0.08)_0%,transparent_40%),radial-gradient(ellipse_at_80%_55%,rgba(61,231,255,0.1)_0%,transparent_42%)]" />
        </>
      ) : codexHall ? (
        <>
          {/* Nebula vault — tame the rift skylight; keep archive aisle visible under cards */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,8,16,0.42)] via-[rgba(7,11,22,0.1)] to-[rgba(6,8,14,0.52)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,rgba(90,70,160,0.1)_0%,transparent_42%),radial-gradient(ellipse_at_20%_70%,rgba(61,231,255,0.07)_0%,transparent_40%),radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,22,0.18)_62%,rgba(7,11,22,0.4)_100%)]" />
        </>
      ) : academyHall ? (
        <>
          {/* Keeper school night — tame cyan fountain / rift sky; keep cathedral readable under panels */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,8,16,0.38)] via-[rgba(7,11,22,0.1)] to-[rgba(6,8,14,0.54)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_40%,rgba(61,231,255,0.08)_0%,transparent_45%),radial-gradient(ellipse_at_80%_55%,rgba(255,150,70,0.07)_0%,transparent_40%),radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,22,0.2)_60%,rgba(7,11,22,0.44)_100%)]" />
        </>
      ) : arenaHall ? (
        <>
          {/* Dual-portal arena — tame nebula bloom; keep combat floor / portals readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,8,16,0.32)] via-[rgba(7,11,22,0.08)] to-[rgba(6,8,14,0.5)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_55%,rgba(61,231,255,0.08)_0%,transparent_42%),radial-gradient(ellipse_at_78%_55%,rgba(255,150,70,0.08)_0%,transparent_42%),radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,22,0.16)_58%,rgba(7,11,22,0.4)_100%)]" />
        </>
      ) : battleHall ? (
        <>
          {/* Practice cavern — soft crystal/lantern wash; mid-board dark for HUD */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(6,8,16,0.3)] via-[rgba(7,11,22,0.06)] to-[rgba(6,8,14,0.48)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_0%,rgba(7,11,22,0.12)_58%,rgba(7,11,22,0.38)_100%),radial-gradient(ellipse_at_18%_70%,rgba(61,231,255,0.07)_0%,transparent_42%),radial-gradient(ellipse_at_82%_55%,rgba(255,184,77,0.08)_0%,transparent_40%)]" />
        </>
      ) : kidsHall ? (
        <>
          {/* Soft parchment-hall wash for Parents & Kids surfaces */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(16,12,8,0.28)] via-[rgba(10,12,18,0.12)] to-[rgba(8,10,16,0.52)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,184,77,0.1)_0%,transparent_45%),radial-gradient(ellipse_at_75%_40%,rgba(61,231,255,0.08)_0%,transparent_42%),radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,22,0.2)_68%,rgba(7,11,22,0.42)_100%)]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,11,22,0.22)] via-[rgba(7,11,22,0.1)] to-[rgba(7,11,22,0.48)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,11,22,0.04)_0%,rgba(7,11,22,0.22)_70%,rgba(7,11,22,0.4)_100%)]" />
        </>
      )}
    </div>
  );
}
