/**
 * Keeper Help — TCG / Rift Battles–first guides.
 * Numbers mirror `TCG_DEFAULTS` + `RIFT_ENERGY` foundational rules.
 */

export type HelpQuickLink = {
  href: string;
  label: string;
  blurb: string;
};

export type HelpSection = {
  id: string;
  title: string;
  summary: string;
  body: string[];
  hrefs?: { href: string; label: string }[];
};

export const HELP_QUICK_LINKS: HelpQuickLink[] = [
  {
    href: "/tcg/battle",
    label: "Rift Battle",
    blurb: "Practice the Rift Energy board — primary combat.",
  },
  {
    href: "/tcg/collection",
    label: "Card Binder",
    blurb: "Browse cards and shape a legal deck.",
  },
  {
    href: "/quests",
    label: "Quests",
    blurb: "Battle, binder, hatchery, and care contracts.",
  },
  {
    href: "/shop",
    label: "Shop",
    blurb: "Spend Credits on packs and everyday goods.",
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    blurb: "Trade cards and packs with Credits.",
  },
  {
    href: "/roadmap",
    label: "Roadmap",
    blurb: "Rift Battles now, coin expansion next, Living World later.",
  },
];

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "quick-start",
    title: "Quick start",
    summary: "Collect cards → build a deck → duel → claim quests. SOL is never required.",
    body: [
      "Open the Card Binder to see your collection, then jump into a Rift Battle practice match.",
      "Claim quests for Credits and Rift Points as you battle and open packs.",
      "Hatchery and pet care sit alongside the TCG loop — optional flavor, not a paywall.",
    ],
    hrefs: [
      { href: "/tcg/collection", label: "Open binder" },
      { href: "/tcg/battle", label: "Start practice battle" },
      { href: "/quests", label: "Quest board" },
    ],
  },
  {
    id: "how-to-battle",
    title: "How to battle",
    summary: "Spend Rift Energy, field units, end turn to strike the foe’s Keeper.",
    body: [
      "Each side protects a Keeper (20 HP). Reduce the challenger to 0 to win.",
      "On your turn: play affordable cards from hand, then End turn so board units strike.",
      "Opening hand is 3 cards. Hand max is 7; board holds up to 5 units.",
      "Matches time out after 30 turns if neither Keeper falls.",
      "Practice boards need no wallet and award quest progress locally when tracking is on.",
    ],
    hrefs: [
      { href: "/tcg/battle", label: "Practice board" },
      { href: "/tcg/collection", label: "Build from binder" },
    ],
  },
  {
    id: "rift-energy",
    title: "Rift Energy",
    summary: "The turn resource on every card — distinct from Arena meters or cosmetics.",
    body: [
      "You start with 1 Rift Energy max. Each turn the max grows by 1, up to a cap of 10.",
      "Energy refills to the turn max at the start of your turn (no carry-over).",
      "Card costs show as RE on the card. If you cannot afford a play, it stays greyed out.",
      "Spending energy on units and spells is how quests track tcg_energy_spend progress.",
    ],
    hrefs: [{ href: "/tcg/battle", label: "Try a practice match" }],
  },
  {
    id: "binder-decks",
    title: "Binder, collection & decks",
    summary: "Your binder is the source of truth for constructed play.",
    body: [
      "Legal decks need 20–40 cards. Starter lists ship around 30.",
      "Respect each card’s max-copies rule when you customize later.",
      "Open the binder anytime from Play or the header — it also ticks binder quests.",
      "Legacy Arena loadouts are soft-secondary; Rift Battles use gameplay card copies.",
    ],
    hrefs: [
      { href: "/tcg/collection", label: "Card Binder" },
      { href: "/collection", label: "Pet collection" },
    ],
  },
  {
    id: "packs",
    title: "Packs",
    summary: "Credits buy standard gameplay packs. Premium SOL packs stay optional and flagged.",
    body: [
      "Buy card packs in the Shop with Credits earned from play — no wallet required for the core path.",
      "Pack contents feed your binder; duplicates stack as count in collection.",
      "Premium collector editions, if enabled later, never grant exclusive match power.",
    ],
    hrefs: [
      { href: "/shop/packs", label: "Card packs" },
      { href: "/shop", label: "Full shop" },
    ],
  },
  {
    id: "quests",
    title: "Quests for TCG",
    summary: "Duel contracts track battles, binder opens, energy spends, and care loops.",
    body: [
      "Daily and weekly goals reward keeper XP, Credits, care items, and Rift Points — not cash.",
      "Living World habitat steps are soft-deferred; launch focus is battle + binder metrics.",
      "Finish practice wins and binder sessions to clear the early board.",
    ],
    hrefs: [{ href: "/quests", label: "Open quests" }],
  },
  {
    id: "shop-market",
    title: "Shop, marketplace & Credits",
    summary: "Credits are soft currency for play. Marketplace trades stay Credits-first.",
    body: [
      "Earn Credits from quests, battles, and events. Spend them on packs, care goods, and convenience.",
      "Marketplace listings for cards and packs use Credits — clearly labeled, no wagering.",
      "Community token / Pump.fun holdings do not mint Credits or guarantee SOL.",
    ],
    hrefs: [
      { href: "/shop", label: "Shop" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/economy/credits", label: "Credits guide" },
    ],
  },
  {
    id: "sol-optional",
    title: "SOL is optional",
    summary: "Core play — battles, binder, quests, packs with Credits — never requires SOL.",
    body: [
      "You can hatch, duel, collect, and complete Academy lessons without a wallet.",
      "Optional crypto surfaces (token chart, future premium editions) are labeled separately.",
      "Never share seed phrases. Staff will not ask for them — see Fairness / Risk if unsure.",
    ],
    hrefs: [
      { href: "/fairness", label: "Fairness" },
      { href: "/legal/risk", label: "Risk notice" },
    ],
  },
  {
    id: "live-world",
    title: "Live World (preview)",
    summary: "Optional habitat for exploration — not required to learn or enjoy Rift Battles.",
    body: [
      "Live World is a future/preview social habitat. Launch teaching centers on the TCG loop above.",
      "If you enter during development: WASD to move, E/Space to interact, M for map, F1 for Help.",
      "Skip it entirely and you still have full access to battles, binder, quests, and shop.",
    ],
    hrefs: [
      { href: "/live-world", label: "Live World preview" },
      { href: "/world", label: "World overview" },
    ],
  },
  {
    id: "more-learning",
    title: "Deeper learning",
    summary: "Interactive Academy lessons and lore stay available when you want drills.",
    body: [
      "Player Academy has quizzes, interactives, and FAQ search — progress saves in your browser.",
      "Codex pages cover Riftling species and world lore without blocking the battle loop.",
    ],
    hrefs: [
      { href: "/academy", label: "Player Academy" },
      { href: "/codex/riftlings", label: "Riftling Codex" },
      { href: "/patch-notes", label: "Patch notes" },
    ],
  },
];

export const HELP_FAQ_TEASERS = [
  {
    q: "Do I need SOL to play?",
    a: "No. Battles, binder, quests, and Credit packs never require SOL.",
  },
  {
    q: "Where do I start?",
    a: "Open Card Binder, then Rift Battle practice. Claim quests as you go.",
  },
  {
    q: "What is Rift Energy?",
    a: "The turn resource for playing cards — starts at 1, grows each turn to a cap of 10.",
  },
];
