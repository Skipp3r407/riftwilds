/**
 * Player Dashboard model — wires real session data when present; honest placeholders elsewhere.
 */

export type DashboardPanelId =
  | "identity"
  | "balances"
  | "roster"
  | "eggs"
  | "cosmetics"
  | "achievements"
  | "listings"
  | "inventory"
  | "quests"
  | "missions"
  | "battle"
  | "exploration"
  | "friends"
  | "messages"
  | "guild"
  | "region";

export type DashboardPanel = {
  id: DashboardPanelId;
  title: string;
  status: "live" | "partial" | "placeholder";
  summary: string;
  href?: string;
  metrics: { label: string; value: string }[];
};

export type PlayerDashboardSnapshot = {
  username: string;
  displayName: string;
  avatarKey: string | null;
  rankTitle: string;
  regionLabel: string;
  guildLabel: string | null;
  walletShort: string | null;
  walletLinked: boolean;
  softLoginAvailable: boolean;
  panels: DashboardPanel[];
  quickLinks: { href: string; label: string }[];
  disclaimers: string[];
};

export function buildPlayerDashboardSnapshot(input?: {
  username?: string | null;
  displayName?: string | null;
  avatarKey?: string | null;
  rankTitle?: string | null;
  walletAddress?: string | null;
  petCount?: number;
  eggCount?: number;
  softCurrency?: number;
  demoCredits?: number;
  questPoints?: number;
  battleRating?: number;
  careStreak?: number;
  achievementCount?: number;
  listingCount?: number;
  inventoryCount?: number;
}): PlayerDashboardSnapshot {
  const wallet = input?.walletAddress ?? null;
  const walletShort = wallet
    ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}`
    : null;

  const panels: DashboardPanel[] = [
    {
      id: "identity",
      title: "Riftkeeper",
      status: input?.displayName || wallet ? "partial" : "placeholder",
      summary: "Username, avatar, rank — complete your profile anytime.",
      href: "/profile",
      metrics: [
        { label: "Display", value: input?.displayName ?? "Keeper" },
        { label: "Rank", value: input?.rankTitle ?? "Hatchling Keeper" },
        { label: "Username", value: input?.username ?? "unset" },
      ],
    },
    {
      id: "balances",
      title: "Balances",
      status: wallet ? "partial" : "placeholder",
      summary: "Soft currency always; token + SOL when wallet linked.",
      href: "/token",
      metrics: [
        { label: "Soft", value: String(input?.softCurrency ?? 0) },
        { label: "Demo credits", value: String(input?.demoCredits ?? 0) },
        { label: "Token / SOL", value: wallet ? "Refresh on /token" : "Link wallet" },
        { label: "Rewards", value: "See /rewards" },
      ],
    },
    {
      id: "roster",
      title: "Pets",
      status: (input?.petCount ?? 0) > 0 ? "live" : "placeholder",
      summary: "Living Riftlings in your care.",
      href: "/collection",
      metrics: [{ label: "Roster", value: String(input?.petCount ?? 0) }],
    },
    {
      id: "eggs",
      title: "Eggs",
      status: (input?.eggCount ?? 0) > 0 ? "live" : "placeholder",
      summary: "Incubating and ready eggs.",
      href: "/hatchery",
      metrics: [{ label: "Eggs", value: String(input?.eggCount ?? 0) }],
    },
    {
      id: "cosmetics",
      title: "Cosmetics",
      status: "placeholder",
      summary: "Loadout skins and homestead flair — catalog later.",
      href: "/shop/cosmetics",
      metrics: [{ label: "Owned", value: "—" }],
    },
    {
      id: "achievements",
      title: "Achievements",
      status: (input?.achievementCount ?? 0) > 0 ? "partial" : "placeholder",
      summary: "Universe catalog + personal unlocks.",
      href: "/ecosystem",
      metrics: [
        { label: "Unlocked", value: String(input?.achievementCount ?? 0) },
      ],
    },
    {
      id: "listings",
      title: "Listings",
      status: (input?.listingCount ?? 0) > 0 ? "partial" : "placeholder",
      summary: "Your marketplace listings.",
      href: "/marketplace",
      metrics: [{ label: "Active", value: String(input?.listingCount ?? 0) }],
    },
    {
      id: "inventory",
      title: "Inventory",
      status: (input?.inventoryCount ?? 0) > 0 ? "live" : "placeholder",
      summary: "Items, materials, scrolls.",
      href: "/inventory",
      metrics: [{ label: "Stacks", value: String(input?.inventoryCount ?? 0) }],
    },
    {
      id: "quests",
      title: "Quests",
      status: "placeholder",
      summary: "Story and daily quests.",
      href: "/quests",
      metrics: [{ label: "Quest points", value: String(input?.questPoints ?? 0) }],
    },
    {
      id: "missions",
      title: "Missions",
      status: "placeholder",
      summary: "Timed missions and care loops.",
      href: "/quests",
      metrics: [{ label: "Care streak", value: String(input?.careStreak ?? 0) }],
    },
    {
      id: "battle",
      title: "Battle",
      status: "partial",
      summary: "Arena training rating.",
      href: "/arena",
      metrics: [{ label: "Rating", value: String(input?.battleRating ?? 1000) }],
    },
    {
      id: "exploration",
      title: "Exploration",
      status: "placeholder",
      summary: "Expeditions and region progress.",
      href: "/world",
      metrics: [{ label: "Regions", value: "See World" }],
    },
    {
      id: "friends",
      title: "Friends",
      status: "placeholder",
      summary: "Social graph stub.",
      href: "/social",
      metrics: [{ label: "Friends", value: "—" }],
    },
    {
      id: "messages",
      title: "Messages",
      status: "placeholder",
      summary: "DM / mail stubs.",
      href: "/social",
      metrics: [{ label: "Unread", value: "—" }],
    },
    {
      id: "guild",
      title: "Guild",
      status: "placeholder",
      summary: "Guild shell — join when GUILDS_ENABLED.",
      href: "/guilds",
      metrics: [{ label: "Guild", value: "None" }],
    },
    {
      id: "region",
      title: "Home region",
      status: "placeholder",
      summary: "Preferred region — Living World habitat is a future release.",
      href: "/world",
      metrics: [{ label: "Region", value: "Hatchery Plaza" }],
    },
  ];

  return {
    username: input?.username ?? "unset",
    displayName: input?.displayName ?? "Keeper",
    avatarKey: input?.avatarKey ?? null,
    rankTitle: input?.rankTitle ?? "Hatchling Keeper",
    regionLabel: "Hatchery Plaza",
    guildLabel: null,
    walletShort,
    walletLinked: Boolean(wallet),
    softLoginAvailable: true,
    panels,
    quickLinks: [
      { href: "/play", label: "Play" },
      { href: "/tcg/battle", label: "Rift Battle" },
      { href: "/tcg/collection", label: "Card Binder" },
      { href: "/rewards", label: "Rewards" },
      { href: "/treasury", label: "Treasury" },
      { href: "/login", label: "Account" },
      { href: "/profile", label: "Profile" },
    ],
    disclaimers: [
      "Token balances and rewards never imply guaranteed returns.",
      "Email/social login is recommended; wallet connect is optional for soft play.",
    ],
  };
}
