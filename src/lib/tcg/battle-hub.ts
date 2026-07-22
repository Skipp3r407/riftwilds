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

/** Section / sub-tile thumbnails inside each Battle Hub mode tab. */
export type BattleHubTile = {
  id: string;
  title: string;
  body: string;
  thumbnail: string;
  href?: string;
  tone?: "default" | "warn" | "amber";
};

export const BATTLE_HUB_SECTION_TILES: Record<BattleHubMode, BattleHubTile[]> = {
  practice: [
    {
      id: "practice-board",
      title: "Practice Board",
      body: "Sandbox duel vs Kael — no MMR, no SOL.",
      thumbnail: "/assets/ui/battle-hub/hub-practice-board.png",
      href: "/tcg/battle?mode=practice&board=1",
    },
    {
      id: "tutorial",
      title: "Tutorial",
      body: "Guided walkthrough of core combat.",
      thumbnail: "/assets/ui/battle-hub/hub-practice-tutorial.png",
      href: "/tcg/tutorial",
    },
    {
      id: "atelier",
      title: "Deck Atelier",
      body: "Tune lists before you queue.",
      thumbnail: "/assets/ui/battle-hub/hub-practice-atelier.png",
      href: "/tcg/deck-builder",
    },
    {
      id: "legacy",
      title: "Legacy training",
      body: "Classic training grounds drills.",
      thumbnail: "/assets/ui/battle-hub/hub-practice-legacy.png",
      href: "/arena/training",
    },
  ],
  casual: [
    {
      id: "quick",
      title: "Quick match",
      body: "Join the free Arena queue.",
      thumbnail: "/assets/ui/battle-hub/hub-casual-quick.png",
      href: "/arena#queue",
    },
    {
      id: "friends",
      title: "Friends",
      body: "Challenge Keepers from Social.",
      thumbnail: "/assets/ui/battle-hub/hub-casual-friends.png",
      href: "/social?tab=friends",
    },
    {
      id: "private",
      title: "Private room",
      body: "Invite link on the Practice Board.",
      thumbnail: "/assets/ui/battle-hub/hub-casual-private.png",
      href: "/tcg/battle?mode=practice&board=1",
    },
    {
      id: "arena",
      title: "Free Arena hub",
      body: "Browse free match surfaces.",
      thumbnail: "/assets/ui/battle-hub/hub-casual-arena.png",
      href: "/arena",
    },
    {
      id: "duels",
      title: "Custom duels",
      body: "Set your own free duel table.",
      thumbnail: "/assets/ui/battle-hub/hub-casual-duels.png",
      href: "/arena/duels",
    },
  ],
  ranked: [
    {
      id: "season",
      title: "Season",
      body: "Active free ladder.",
      thumbnail: "/assets/ui/battle-hub/hub-ranked-season.png",
      href: "/arena/ranked",
    },
    {
      id: "rank",
      title: "Rank",
      body: "Tier climb · Arena Points.",
      thumbnail: "/assets/ui/battle-hub/hub-ranked-rank.png",
      href: "/arena/ranked",
    },
    {
      id: "mmr",
      title: "MMR",
      body: "Skill queue · no SOL.",
      thumbnail: "/assets/ui/battle-hub/hub-ranked-mmr.png",
      href: "/arena/ranked",
    },
    {
      id: "ladder",
      title: "Ranked ladder",
      body: "Season standings and climb path.",
      thumbnail: "/assets/ui/battle-hub/hub-ranked-ladder.png",
      href: "/arena/ranked",
    },
    {
      id: "leaderboard",
      title: "Leaderboard",
      body: "Arena competitive boards.",
      thumbnail: "/assets/ui/battle-hub/hub-ranked-leaderboard.png",
      href: "/arena/leaderboard",
    },
    {
      id: "global",
      title: "Global boards",
      body: "Cross-mode Keeper rankings.",
      thumbnail: "/assets/ui/battle-hub/hub-ranked-global.png",
      href: "/leaderboards",
    },
  ],
  ai: [
    {
      id: "easy",
      title: "Easy",
      body: "Gentle drills for new Keepers.",
      thumbnail: "/assets/ui/battle-hub/hub-ai-easy.png",
      href: "/tcg/battle?mode=practice&board=1",
    },
    {
      id: "normal",
      title: "Normal",
      body: "Balanced rivalry vs Kael.",
      thumbnail: "/assets/ui/battle-hub/hub-ai-normal.png",
      href: "/tcg/battle?mode=practice&board=1",
    },
    {
      id: "hard",
      title: "Hard",
      body: "High-pressure training.",
      thumbnail: "/assets/ui/battle-hub/hub-ai-hard.png",
      href: "/tcg/battle?mode=practice&board=1",
    },
    {
      id: "boss",
      title: "Boss",
      body: "Story boss intensity.",
      thumbnail: "/assets/ui/battle-hub/hub-ai-boss.png",
      href: "/arena/training",
      tone: "amber",
    },
    {
      id: "kael",
      title: "Practice vs Kael",
      body: "Open the Practice Board.",
      thumbnail: "/assets/ui/battle-hub/hub-ai-kael.png",
      href: "/tcg/battle?mode=practice&board=1",
    },
    {
      id: "training",
      title: "Training grounds",
      body: "Legacy AI drills & routines.",
      thumbnail: "/assets/ui/battle-hub/hub-ai-training.png",
      href: "/arena/training",
    },
    {
      id: "guided",
      title: "Guided tutorial",
      body: "Learn the rules step by step.",
      thumbnail: "/assets/ui/battle-hub/hub-practice-tutorial.png",
      href: "/tcg/tutorial",
    },
  ],
  tournament: [
    {
      id: "upcoming",
      title: "Upcoming",
      body: "Browse the calendar.",
      thumbnail: "/assets/ui/battle-hub/hub-tournament-upcoming.png",
      href: "/social?tab=calendar",
    },
    {
      id: "live",
      title: "Live",
      body: "Spectate & join open cups.",
      thumbnail: "/assets/ui/battle-hub/hub-tournament-live.png",
      href: "/arena/tournaments",
    },
    {
      id: "hosted",
      title: "Hosted",
      body: "Player-run brackets.",
      thumbnail: "/assets/ui/battle-hub/hub-tournament-hosted.png",
      href: "/arena/tournaments",
    },
    {
      id: "guild",
      title: "Guild",
      body: "Guild clash seasons.",
      thumbnail: "/assets/ui/battle-hub/hub-tournament-guild.png",
      href: "/guilds",
    },
    {
      id: "lobby",
      title: "Tournament lobby",
      body: "Cups, brackets, and entry.",
      thumbnail: "/assets/ui/battle-hub/hub-tournament-lobby.png",
      href: "/arena/tournaments",
    },
    {
      id: "calendar",
      title: "Event calendar",
      body: "Upcoming free cups & events.",
      thumbnail: "/assets/ui/battle-hub/hub-tournament-calendar.png",
      href: "/social?tab=calendar",
    },
  ],
  stakes: [
    {
      id: "lobby",
      title: "Lobby",
      body: "Stake tiers, queues, escrow.",
      thumbnail: "/assets/ui/battle-hub/hub-stakes-lobby.png",
      href: "/tcg/battle?mode=stakes",
      tone: "warn",
    },
    {
      id: "history",
      title: "History",
      body: "Settled and open stake matches.",
      thumbnail: "/assets/ui/battle-hub/hub-stakes-history.png",
      href: "/tcg/battle?mode=stakes&panel=history",
      tone: "warn",
    },
    {
      id: "leaderboard",
      title: "Leaderboard",
      body: "Net SOL from settled stakes.",
      thumbnail: "/assets/ui/battle-hub/hub-stakes-leaderboard.png",
      href: "/tcg/battle?mode=stakes&panel=leaderboard",
      tone: "warn",
    },
    {
      id: "treasury",
      title: "Fee treasury",
      body: "Platform fees from Rift Stakes.",
      thumbnail: "/assets/ui/battle-hub/hub-stakes-treasury.png",
      href: "/tcg/battle?mode=stakes&panel=treasury",
      tone: "warn",
    },
  ],
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
