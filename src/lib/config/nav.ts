/**
 * Primary Riftwilds navigation — TCG-first launch IA.
 * Live World + World Restoration soft-gated via `LIVE_WORLD_PUBLIC_ACCESS_ENABLED`.
 * Pump.fun chart/milestones live under Community / Token Launch — not homepage identity.
 */

import { liveWorldAccessBadge } from "@/lib/config/feature-flags";

export type NavLink = {
  href: string;
  label: string;
  /** Shown in compact header (legacy flat list) */
  header?: boolean;
  /** Shown in game sidebar */
  sidebar?: boolean;
  /** Optional status chip (e.g. Coming Soon) */
  badge?: string;
};

/** Desktop mega-groups + mobile drawer sections */
export type NavGroup = {
  id: string;
  label: string;
  /** Primary destination when the group label is activated as a link */
  href: string;
  items: { href: string; label: string; badge?: string }[];
};

/**
 * Coming Soon until Live World public launch.
 * Local/dev shows "COMING SOON · DEV ACCESS" when entry is open for developers.
 */
const liveWorldNavBadge = liveWorldAccessBadge();

export const primaryNav: NavLink[] = [
  { href: "/", label: "Home", header: true, sidebar: false },
  { href: "/play", label: "Play", header: true, sidebar: true },
  { href: "/tcg/battle", label: "Rift Battle", header: true, sidebar: true },
  { href: "/tcg/deck-builder", label: "Deck Atelier", header: true, sidebar: true },
  { href: "/tcg/codex", label: "Rift Codex", header: true, sidebar: true },
  { href: "/tcg/collection", label: "Card Binder", header: true, sidebar: true },
  { href: "/dashboard", label: "Dashboard", header: true, sidebar: true },
  { href: "/hatchery", label: "Hatchery", header: true, sidebar: true },
  { href: "/world", label: "World", header: true, sidebar: true },
  {
    href: "/live-world",
    label: "Live World",
    header: false,
    sidebar: true,
    badge: liveWorldNavBadge,
  },
  {
    href: "/restoration",
    label: "Restoration",
    header: false,
    sidebar: true,
    badge: liveWorldNavBadge,
  },
  { href: "/arena", label: "Arena", header: false, sidebar: true },
  { href: "/shop", label: "Card Shop", header: true, sidebar: true },
  { href: "/exchange", label: "Rift Exchange", header: true, sidebar: true },
  { href: "/marketplace", label: "Marketplace", header: true, sidebar: true },
  { href: "/inventory", label: "Inventory", header: false, sidebar: true },
  { href: "/guilds", label: "Guilds", header: false, sidebar: true },
  { href: "/homestead", label: "Homestead", header: false, sidebar: true },
  { href: "/ecosystem", label: "Ecosystem", header: false, sidebar: true },
  { href: "/treasury", label: "Treasury", header: true, sidebar: true },
  { href: "/rewards", label: "Rewards", header: true, sidebar: true },
  { href: "/loyalty", label: "Loyalty", header: true, sidebar: true },
  { href: "/economy", label: "Economy", header: false, sidebar: true },
  { href: "/token", label: "Token", header: true, sidebar: true },
  { href: "/transparency", label: "Transparency", header: false, sidebar: true },
  { href: "/social", label: "Social", header: false, sidebar: true },
  { href: "/creators", label: "Creators", header: false, sidebar: true },
];

export const headerNav = primaryNav.filter((l) => l.header);
export const sidebarNav = primaryNav.filter((l) => l.sidebar);

export const extraSidebarNav: NavLink[] = [
  { href: "/profile", label: "Profile" },
  { href: "/collection", label: "Collection" },
  { href: "/quests", label: "Quests" },
  { href: "/help", label: "Help" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/academy", label: "Academy" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/login", label: "Account" },
  { href: "/settings/nakama", label: "Nakama" },
];

/** Grouped command-bar navigation (desktop dropdowns + mobile sections) */
export const headerNavGroups: NavGroup[] = [
  {
    id: "play",
    label: "Play",
    href: "/play",
    items: [
      { href: "/play", label: "Play hub" },
      { href: "/tcg/battle", label: "Rift Battle" },
      { href: "/tcg/deck-builder", label: "Deck Atelier" },
      { href: "/tcg/codex", label: "Rift Codex" },
      { href: "/tcg/museum", label: "Museum Hall" },
      { href: "/tcg/collection", label: "Card Binder" },
      { href: "/hatchery", label: "Hatchery" },
      { href: "/collection", label: "Pet Collection" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/quests", label: "Quests" },
      { href: "/help", label: "Help" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/academy", label: "Player Academy" },
      { href: "/profile", label: "Profile" },
      { href: "/login", label: "Account / Login" },
    ],
  },
  {
    id: "combat",
    label: "Rift Battles",
    href: "/tcg/battle",
    items: [
      { href: "/tcg/battle", label: "Rift Battle" },
      { href: "/tcg/deck-builder", label: "Deck Atelier" },
      { href: "/tcg/codex", label: "Rift Codex" },
      { href: "/tcg/museum", label: "Museum Hall" },
      { href: "/tcg/collection", label: "Card Binder" },
      { href: "/arena", label: "Arena (legacy)" },
      { href: "/leaderboards", label: "Leaderboards" },
      { href: "/battle", label: "Battle" },
    ],
  },
  {
    id: "world",
    label: "World",
    href: "/world",
    items: [
      { href: "/world", label: "World" },
      { href: "/live-world", label: "Live World", badge: liveWorldNavBadge },
      { href: "/restoration", label: "World Restoration", badge: liveWorldNavBadge },
      { href: "/about", label: "About / Story" },
      { href: "/comics", label: "Lore Library" },
      { href: "/fan-kit", label: "Fan Kit" },
      { href: "/coloring", label: "Coloring" },
      { href: "/printables", label: "Printables" },
      { href: "/help", label: "Help" },
      { href: "/academy", label: "Player Academy" },
      { href: "/codex/riftlings", label: "Riftling Codex" },
      { href: "/codex/world", label: "World Codex" },
      { href: "/creatures", label: "Creatures" },
      { href: "/homestead", label: "Homestead" },
      { href: "/guilds", label: "Guilds" },
      { href: "/ecosystem", label: "Ecosystem" },
      { href: "/spirit-realm", label: "Spirit Realm" },
      { href: "/memorials", label: "Memorial Garden" },
    ],
  },
  {
    id: "market",
    label: "Market",
    href: "/exchange",
    items: [
      { href: "/exchange", label: "Rift Exchange" },
      { href: "/marketplace", label: "Player Marketplace" },
      { href: "/marketplace/shops", label: "Player shops" },
      { href: "/marketplace/auctions", label: "Auction house" },
      { href: "/shop", label: "Card Shop" },
      { href: "/inventory", label: "Inventory" },
      { href: "/creators", label: "Creator Hub" },
      { href: "/rewards", label: "Reward Center" },
      { href: "/treasury", label: "Treasury" },
    ],
  },
  {
    id: "economy",
    label: "Economy",
    href: "/treasury",
    items: [
      { href: "/treasury", label: "Community Treasury" },
      { href: "/rewards", label: "Reward Center" },
      { href: "/loyalty", label: "Loyalty / Rift Storm" },
      { href: "/token", label: "Token" },
      { href: "/analytics/token", label: "Token Analytics" },
      { href: "/economy", label: "Economy" },
      { href: "/economy/credits", label: "Credits Guide" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/transparency", label: "Transparency" },
      { href: "/fairness", label: "Fairness" },
    ],
  },
  {
    id: "community",
    label: "Community",
    href: "/social",
    items: [
      { href: "/social", label: "Social Hub" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/fan-kit", label: "Fan Kit" },
      { href: "/press", label: "Press / Streamer Kit" },
      { href: "/creators", label: "Creators" },
      { href: "/coloring", label: "Kids Coloring" },
      { href: "/printables", label: "Printables (300 DPI)" },
      { href: "/patch-notes", label: "Patch Notes" },
      { href: "/token", label: "Token Launch" },
      { href: "/analytics/token", label: "Chart / Milestones" },
      { href: "/ecosystem", label: "Ecosystem Feed" },
    ],
  },
];
