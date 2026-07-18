/**
 * Player-facing product + economy roadmap copy.
 * Aligns with docs/vision/PRODUCT_ECONOMY_ROADMAP.md and docs/vision/ROADMAP.md.
 */

export type RoadmapPhaseId = "now" | "coin" | "world";

export type RoadmapPhase = {
  id: RoadmapPhaseId;
  eyebrow: string;
  title: string;
  status: string;
  statusTone: "live" | "next" | "later";
  lede: string;
  bullets: string[];
  links: { href: string; label: string }[];
};

export const ROADMAP_META = {
  title: "Roadmap",
  description:
    "Riftwilds roadmap — Rift Battles now, Credits and coin expansion next, Living World as a later release. SOL is optional and never required for core play.",
  kicker: "Product · Economy",
  intro:
    "Rift Battles is the live game. We grow Credits, Rift Shards, and optional wallet cosmetics around that loop — then open Living World as a social habitat that builds on your decks and collection. No wallet required to play. No pay-to-win.",
  disclaimer:
    "Entertainment only. Credits power everyday play. Optional SOL is never required for battles, decks, quests, or progression — and never buys competitive card power. Nothing here is a promise of profit or investment return.",
} as const;

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: "now",
    eyebrow: "Phase 1 · Live",
    title: "Rift Battles — the card deck game",
    status: "Now",
    statusTone: "live",
    lede: "Collect cards, build a deck, duel with Rift Energy, and claim quests. This is the core loop Keepers play today.",
    bullets: [
      "Card Binder — browse your collection and shape a legal deck",
      "Practice Rift Battles — primary combat on the Rift Energy board",
      "Quests — battle, packs, hatchery, and care contracts for Credits and progress",
      "Packs & shop — spend Credits (Gold) to grow your collection",
      "Riftlings — companions that feed card identity; care stays Credits-first",
      "Live World stays available as a preview — public Living World release comes later",
    ],
    links: [
      { href: "/tcg/battle", label: "Rift Battle" },
      { href: "/tcg/collection", label: "Card Binder" },
      { href: "/quests", label: "Quests" },
      { href: "/help", label: "Help" },
    ],
  },
  {
    id: "coin",
    eyebrow: "Phase 2 · Expanding",
    title: "Coin & economy expansion",
    status: "Next",
    statusTone: "next",
    lede: "Deepen Gold sinks and faucets, introduce Rift Shards as a secondary soft currency, and keep optional SOL behind flags — cosmetics and convenience only.",
    bullets: [
      "Gold (Credits) — earn from quests, goals, and events; spend on packs, shop, fees, and care",
      "Balanced sinks & faucets — rewards stay meaningful without farming printers",
      "Rift Shards — prestige and cosmetics; never required for matches or starter decks",
      "Season tracks — free track stays viable; premium adds cosmetics and convenience",
      "Optional SOL — feature-flagged; never required for play or competitive card power",
      "No pay-to-win — collectible editions do not grant exclusive battle strength",
    ],
    links: [
      { href: "/economy/credits", label: "Credits guide" },
      { href: "/economy", label: "Economy" },
      { href: "/fairness", label: "Fairness" },
      { href: "/shop", label: "Shop" },
    ],
  },
  {
    id: "world",
    eyebrow: "Phase 3 · Future release",
    title: "Living World — social habitat",
    status: "Later",
    statusTone: "later",
    lede: "A later release — not a delete. Walk, meet friends, explore, and house in a living habitat that hands off into the same Rift Battle board.",
    bullets: [
      "Social hub — presence, friends, and shared spaces",
      "Exploration — regions, discovery, and world events",
      "Housing & neighborhoods — expression and visits",
      "TCG handoff — world encounters return to Rift Battles",
      "Your decks, collection, and Credits progress carry forward",
      "Systems stay in the product during development; public launch when ready",
    ],
    links: [
      { href: "/live-world", label: "Live World preview" },
      { href: "/world", label: "World" },
      { href: "/homestead", label: "Homestead" },
      { href: "/social", label: "Social Hub" },
    ],
  },
];

export const ROADMAP_PILLARS = [
  {
    title: "TCG first",
    body: "Rift Battles is the launch product. Living World opens when it is ready to feel like a habitat — not a hollow shell.",
  },
  {
    title: "Credits required · SOL optional",
    body: "Everyday play runs on Gold (Credits). A wallet is never a gate for decks, matches, or quests.",
  },
  {
    title: "No pay-to-win",
    body: "Essential competitive cards stay earnable. Optional spends are cosmetics and convenience only.",
  },
  {
    title: "Build, don’t scrap",
    body: "Live World, housing, and social systems stay. We soft-gate or preview — we do not rip them out for the TCG launch.",
  },
] as const;
