/**
 * Rift Arena match taxonomy — skill card duels (TCG primary).
 * Default experience is free play. SOL stake modes are Phase 2 scaffolds only.
 */

export const RIFT_ARENA_MATCH_TYPES = [
  "FREE",
  "TRAINING",
  "RANKED",
  "PRIVATE",
  "FRIEND",
  "GUILD",
  "TOURNAMENT",
  "CUSTOM",
] as const;

export type RiftArenaMatchType = (typeof RIFT_ARENA_MATCH_TYPES)[number];

export type RiftArenaMatchTypeMeta = {
  id: RiftArenaMatchType;
  label: string;
  description: string;
  phase: 1 | 2 | 3;
  /** Live enough for local demo / practice wiring */
  playable: boolean;
  requiresWallet: boolean;
  /** Optional SOL stake surface — never default ON */
  solStakeCapable: boolean;
};

export const RIFT_ARENA_MATCH_TYPE_META: RiftArenaMatchTypeMeta[] = [
  {
    id: "FREE",
    label: "Free Play",
    description: "Casual skill matchmaking — no stakes, no wallet.",
    phase: 1,
    playable: true,
    requiresWallet: false,
    solStakeCapable: false,
  },
  {
    id: "TRAINING",
    label: "Training",
    description: "Practice Board vs AI (Kael). Fully playable offline-local.",
    phase: 1,
    playable: true,
    requiresWallet: false,
    solStakeCapable: false,
  },
  {
    id: "PRIVATE",
    label: "Private Invite",
    description: "Room code / shareable link. Same-server local demo PvP.",
    phase: 1,
    playable: true,
    requiresWallet: false,
    solStakeCapable: false,
  },
  {
    id: "FRIEND",
    label: "Friend Challenge",
    description: "Social deep-link into a private lobby. Party stubs until MP Phase 2.",
    phase: 1,
    playable: true,
    requiresWallet: false,
    solStakeCapable: false,
  },
  {
    id: "RANKED",
    label: "Ranked Ladder",
    description: "Seasonal skill ladder scaffolding — rating updates local-only for now.",
    phase: 1,
    playable: false,
    requiresWallet: false,
    solStakeCapable: false,
  },
  {
    id: "GUILD",
    label: "Guild Clash",
    description: "Guild vs guild brackets — scaffold.",
    phase: 2,
    playable: false,
    requiresWallet: false,
    solStakeCapable: false,
  },
  {
    id: "TOURNAMENT",
    label: "Tournament",
    description: "Free / Credits brackets first. SOL entry stays flag-gated OFF.",
    phase: 2,
    playable: false,
    requiresWallet: false,
    solStakeCapable: true,
  },
  {
    id: "CUSTOM",
    label: "Custom",
    description: "House rules lobby — scaffold for community events.",
    phase: 2,
    playable: false,
    requiresWallet: false,
    solStakeCapable: true,
  },
];

export type RiftArenaSeason = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
};

export type RiftArenaLadderEntry = {
  rank: number;
  displayName: string;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
};

export type RiftArenaHistoryEntry = {
  id: string;
  matchType: RiftArenaMatchType;
  opponentName: string;
  result: "WIN" | "LOSS" | "DRAW" | "ABORT";
  playedAt: string;
  replayHookId: string | null;
};

export type RiftArenaChampion = {
  seasonId: string;
  displayName: string;
  title: string;
  rating: number;
};
