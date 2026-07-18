/**
 * Primary Riftwilds navigation — post-grad ecosystem IA.
 * Pump.fun chart/milestones live under Community / Token Launch — not homepage identity.
 */

export type NavLink = {
  href: string;
  label: string;
  /** Shown in compact header (legacy flat list) */
  header?: boolean;
  /** Shown in game sidebar */
  sidebar?: boolean;
};

/** Desktop mega-groups + mobile drawer sections */
export type NavGroup = {
  id: string;
  label: string;
  /** Primary destination when the group label is activated as a link */
  href: string;
  items: { href: string; label: string }[];
};

export const primaryNav: NavLink[] = [
  { href: "/", label: "Home", header: true, sidebar: false },
  { href: "/play", label: "Play", header: true, sidebar: true },
  { href: "/dashboard", label: "Dashboard", header: true, sidebar: true },
  { href: "/hatchery", label: "Hatchery", header: true, sidebar: true },
  { href: "/world", label: "World", header: true, sidebar: true },
  { href: "/live-world", label: "Live World", header: true, sidebar: true },
  { href: "/restoration", label: "Restoration", header: false, sidebar: true },
  { href: "/arena", label: "Arena", header: true, sidebar: true },
  { href: "/marketplace", label: "Marketplace", header: true, sidebar: true },
  { href: "/shop", label: "Shop", header: true, sidebar: true },
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
  { href: "/academy", label: "Academy / Help" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/login", label: "Account" },
];

/** Grouped command-bar navigation (desktop dropdowns + mobile sections) */
export const headerNavGroups: NavGroup[] = [
  {
    id: "play",
    label: "Play",
    href: "/play",
    items: [
      { href: "/play", label: "Play" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/hatchery", label: "Hatchery" },
      { href: "/collection", label: "Collection" },
      { href: "/quests", label: "Quests" },
      { href: "/academy", label: "Academy / Help" },
      { href: "/profile", label: "Profile" },
      { href: "/login", label: "Account / Login" },
    ],
  },
  {
    id: "world",
    label: "World",
    href: "/world",
    items: [
      { href: "/world", label: "World" },
      { href: "/live-world", label: "Live World" },
      { href: "/restoration", label: "World Restoration" },
      { href: "/about", label: "About / Story" },
      { href: "/comics", label: "Comics" },
      { href: "/fan-kit", label: "Fan Kit" },
      { href: "/coloring", label: "Coloring" },
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
    id: "combat",
    label: "Combat",
    href: "/arena",
    items: [
      { href: "/arena", label: "Arena" },
      { href: "/leaderboards", label: "Leaderboards" },
      { href: "/battle", label: "Battle" },
    ],
  },
  {
    id: "market",
    label: "Market",
    href: "/marketplace",
    items: [
      { href: "/marketplace", label: "Marketplace" },
      { href: "/shop", label: "Shop" },
      { href: "/inventory", label: "Inventory" },
      { href: "/creators", label: "Creator Hub" },
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
      { href: "/fan-kit", label: "Fan Kit" },
      { href: "/press", label: "Press / Streamer Kit" },
      { href: "/creators", label: "Creators" },
      { href: "/coloring", label: "Kids Coloring" },
      { href: "/token", label: "Token Launch" },
      { href: "/analytics/token", label: "Chart / Milestones" },
      { href: "/ecosystem", label: "Ecosystem Feed" },
    ],
  },
];
