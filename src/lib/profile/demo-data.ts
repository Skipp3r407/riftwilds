/** Demo activity / achievement seed for Keeper Profile until live APIs land. */

export type ProfileActivity = {
  id: string;
  at: string;
  kind: "hatch" | "care" | "arena" | "quest" | "economy" | "memory";
  title: string;
  detail: string;
};

export type ProfileAchievement = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  rarity: "common" | "uncommon" | "rare" | "epic";
};

export const DEMO_ARENA_POINTS = 1240;
export const DEMO_QUESTS_COMPLETED = 7;

export const DEMO_ACTIVITY: ProfileActivity[] = [
  {
    id: "a1",
    at: "2h ago",
    kind: "arena",
    title: "Training bout complete",
    detail: "+42 Arena Points · non-transferable, no cash value",
  },
  {
    id: "a2",
    at: "5h ago",
    kind: "care",
    title: "Fed active Riftling",
    detail: "Care score improved · reward-eligible hint refreshed",
  },
  {
    id: "a3",
    at: "Yesterday",
    kind: "hatch",
    title: "Starter egg claimed",
    detail: "Common Rift Egg entered incubation",
  },
  {
    id: "a4",
    at: "Yesterday",
    kind: "memory",
    title: "First meal memory",
    detail: "Logged on your oldest companion",
  },
  {
    id: "a5",
    at: "2d ago",
    kind: "quest",
    title: "Daily patrol (demo)",
    detail: "Quest board preview · Phase 3 unlocks live tracking",
  },
  {
    id: "a6",
    at: "3d ago",
    kind: "economy",
    title: "Visited marketplace",
    detail: "Browsed listings · no guaranteed returns",
  },
];

export const DEMO_ACHIEVEMENTS: ProfileAchievement[] = [
  {
    id: "first-claim",
    label: "Egg Claimed",
    description: "Claim your first Rift Egg from the Hatchery.",
    unlocked: true,
    rarity: "common",
  },
  {
    id: "first-hatch",
    label: "First Hatch",
    description: "Hatch a companion into The Riftwilds.",
    unlocked: true,
    rarity: "uncommon",
  },
  {
    id: "care-keeper",
    label: "Care Keeper",
    description: "Complete three care actions in one day.",
    unlocked: true,
    rarity: "uncommon",
  },
  {
    id: "arena-rookie",
    label: "Arena Rookie",
    description: "Finish a training battle and earn Arena Points.",
    unlocked: true,
    rarity: "rare",
  },
  {
    id: "loadout-ready",
    label: "Loadout Ready",
    description: "Save an Arena loadout with a weapon equipped.",
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "rift-holder",
    label: "Rift Holder",
    description: "Connect a wallet and refresh your $RIFT tier.",
    unlocked: false,
    rarity: "epic",
  },
];

export const PROFILE_QUICK_LINKS = [
  {
    href: "/hatchery",
    label: "Hatchery",
    body: "Claim, incubate, and hatch Rift Eggs.",
    thumb: "hatchery",
  },
  {
    href: "/help",
    label: "Help",
    body: "Rift Battles, binder, packs, quests, and Credits — TCG-first guide.",
    thumb: "help",
  },
  {
    href: "/academy",
    label: "Player Academy",
    body: "Interactive drills and searchable FAQ.",
    thumb: "academy",
  },
  {
    href: "/inventory",
    label: "Inventory",
    body: "Browse items, materials, and cosmetics.",
    thumb: "inventory",
  },
  {
    href: "/arena",
    label: "Arena",
    body: "Train, load out, and earn Arena Points.",
    thumb: "arena",
  },
  {
    href: "/quests",
    label: "Quests",
    body: "Story and daily missions (Phase 3).",
    thumb: "quests",
  },
  {
    href: "/leaderboards",
    label: "Leaderboards",
    body: "Seasonal ladders for Arena, care, collection.",
    thumb: "leaderboards",
  },
] as const;

export function shortWallet(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
