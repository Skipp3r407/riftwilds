/**
 * Rift Battle Hub — mode registry, URL helpers, and legacy redirect map.
 * Rift Stakes is a battle mode (optional SOL), not a top-level app.
 */

export const BATTLE_HUB_MODES = [
  "practice",
  "casual",
  "ranked",
  "ai",
  "tournament",
  "stakes",
] as const;

export type BattleHubMode = (typeof BATTLE_HUB_MODES)[number];

export type BattleHubModeMeta = {
  id: BattleHubMode;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  /** Hub mode-card hero thumbnail (public path). */
  thumbnail: string;
  badge?: string;
  badgeTone?: "live" | "warn" | "info" | "default";
  requiresWallet?: boolean;
  /** Deep links / related surfaces preserved under the hub */
  relatedHrefs?: { href: string; label: string }[];
};

export const BATTLE_HUB_MODE_META: Record<BattleHubMode, BattleHubModeMeta> = {
  practice: {
    id: "practice",
    label: "Practice",
    shortLabel: "Practice",
    tagline: "Sandbox & tutorial",
    description:
      "Train vs AI, test decks, run the Practice Board, and walk the tutorial — no stakes, no MMR.",
    thumbnail: "/assets/ui/battle-modes/mode-practice.png",
    badge: "Free",
    badgeTone: "live",
    relatedHrefs: [
      { href: "/tcg/battle?mode=practice&board=1", label: "Practice Board" },
      { href: "/tcg/tutorial", label: "Tutorial" },
      { href: "/tcg/deck-builder", label: "Deck Atelier" },
      { href: "/arena/training", label: "Legacy training" },
    ],
  },
  casual: {
    id: "casual",
    label: "Casual",
    shortLabel: "Casual",
    tagline: "Quick match & friends",
    description:
      "Queue a free duel, invite a friend, or open a private room. Never mixed with SOL stakes.",
    thumbnail: "/assets/ui/battle-modes/mode-casual.png",
    badge: "Free",
    badgeTone: "live",
    relatedHrefs: [
      { href: "/arena", label: "Free Arena hub" },
      { href: "/tcg/battle?mode=practice&board=1", label: "Private invite board" },
      { href: "/social?tab=friends", label: "Friends" },
      { href: "/arena/duels", label: "Custom duels" },
    ],
  },
  ranked: {
    id: "ranked",
    label: "Ranked",
    shortLabel: "Ranked",
    tagline: "Season · ladder · MMR",
    description:
      "Seasonal ladder, rank tiers, and skill-based matchmaking. Free competitive play only.",
    thumbnail: "/assets/ui/battle-modes/mode-ranked.png",
    badge: "Free",
    badgeTone: "live",
    relatedHrefs: [
      { href: "/arena/ranked", label: "Ranked ladder" },
      { href: "/arena/leaderboard", label: "Leaderboard" },
      { href: "/leaderboards", label: "Global boards" },
    ],
  },
  ai: {
    id: "ai",
    label: "AI Challenge",
    shortLabel: "AI",
    tagline: "Bosses & training",
    description:
      "Pick difficulty, face story bosses, and grind training matches against Kael and co.",
    thumbnail: "/assets/ui/battle-modes/mode-ai.png",
    badge: "Free",
    badgeTone: "info",
    relatedHrefs: [
      { href: "/tcg/battle?mode=practice&board=1", label: "Practice vs Kael" },
      { href: "/arena/training", label: "Training grounds" },
      { href: "/tcg/tutorial", label: "Guided tutorial" },
    ],
  },
  tournament: {
    id: "tournament",
    label: "Tournament",
    shortLabel: "Tournament",
    tagline: "Cups · guild · live",
    description:
      "Upcoming and live cups, hosted brackets, and guild clash calendars. Free entry by default.",
    thumbnail: "/assets/ui/battle-modes/mode-tournament.png",
    badge: "Free",
    badgeTone: "live",
    relatedHrefs: [
      { href: "/arena/tournaments", label: "Tournament lobby" },
      { href: "/guilds", label: "Guilds" },
      { href: "/social?tab=calendar", label: "Event calendar" },
    ],
  },
  stakes: {
    id: "stakes",
    label: "Rift Stakes",
    shortLabel: "Rift Stakes",
    tagline: "Optional SOL wagers",
    description:
      "Separate SOL stake queue with transparent fees and escrow. Wallet required. Never auto-enrolled from free modes.",
    thumbnail: "/assets/ui/battle-modes/mode-stakes.png",
    badge: "Optional · SOL",
    badgeTone: "warn",
    requiresWallet: true,
    relatedHrefs: [
      { href: "/tcg/battle?mode=stakes&panel=history", label: "Stake history" },
      { href: "/tcg/battle?mode=stakes&panel=leaderboard", label: "Stake leaderboard" },
      { href: "/tcg/battle?mode=stakes&panel=treasury", label: "Fee treasury" },
    ],
  },
};

export const BATTLE_HUB_PATH = "/tcg/battle";

export function isBattleHubMode(value: string | null | undefined): value is BattleHubMode {
  return Boolean(value && (BATTLE_HUB_MODES as readonly string[]).includes(value));
}

export function parseBattleHubMode(
  value: string | null | undefined,
  fallback: BattleHubMode = "practice",
): BattleHubMode {
  return isBattleHubMode(value) ? value : fallback;
}

/** Hub URL for a mode (never leaves /tcg/battle). */
export function battleHubHref(
  mode?: BattleHubMode | null,
  extras?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  if (mode) params.set("mode", mode);
  if (extras) {
    for (const [k, v] of Object.entries(extras)) {
      if (v) params.set(k, v);
    }
  }
  const q = params.toString();
  return q ? `${BATTLE_HUB_PATH}?${q}` : BATTLE_HUB_PATH;
}

/** True when the battle page should open the Practice Board instead of the hub shell. */
export function shouldOpenPracticeBoard(sp: {
  invite?: string | null;
  encounter?: string | null;
  board?: string | null;
  play?: string | null;
}): boolean {
  return Boolean(
    sp.invite ||
      sp.encounter ||
      sp.board === "1" ||
      sp.board === "true" ||
      sp.play === "1" ||
      sp.play === "true",
  );
}

/**
 * Legacy → Battle Hub redirect map (page-level redirects).
 * Match rooms stay on `/rift-stakes/match` (active duel surface).
 */
export const RIFT_STAKES_REDIRECT_MAP: {
  from: string;
  to: string;
  note: string;
}[] = [
  {
    from: "/rift-stakes",
    to: battleHubHref("stakes"),
    note: "Lobby → Stakes tab",
  },
  {
    from: "/rift-stakes/history",
    to: battleHubHref("stakes", { panel: "history" }),
    note: "History panel",
  },
  {
    from: "/rift-stakes/leaderboard",
    to: battleHubHref("stakes", { panel: "leaderboard" }),
    note: "Leaderboard panel",
  },
  {
    from: "/rift-stakes/treasury",
    to: battleHubHref("stakes", { panel: "treasury" }),
    note: "Fee treasury panel",
  },
  {
    from: "/rift-stakes/match",
    to: "/rift-stakes/match",
    note: "Active stake match — no redirect (deep link)",
  },
];

/** Unified match-history filter chips (scaffolding across free + stakes). */
export const BATTLE_HISTORY_MODE_FILTERS: {
  id: string;
  label: string;
  href: string;
}[] = [
  { id: "all", label: "All modes", href: "/arena/history" },
  { id: "practice", label: "Practice", href: "/arena/history?mode=practice" },
  { id: "casual", label: "Casual", href: "/arena/history?mode=casual" },
  { id: "ranked", label: "Ranked", href: "/arena/history?mode=ranked" },
  { id: "ai", label: "AI", href: "/arena/history?mode=ai" },
  { id: "tournament", label: "Tournament", href: "/arena/history?mode=tournament" },
  {
    id: "stakes",
    label: "Rift Stakes",
    href: battleHubHref("stakes", { panel: "history" }),
  },
];
