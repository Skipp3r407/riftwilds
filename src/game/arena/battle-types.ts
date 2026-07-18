/**
 * Battle mode taxonomy — architecture for all Riftwilds combat surfaces.
 * Practice is fully playable; others are scaffolded for Phase 2+.
 */

export const BATTLE_TYPES = [
  "PRACTICE",
  "DUEL",
  "RANKED",
  "TOURNAMENT",
  "GUILD",
  "BOSS",
  "RAID",
  "STORY",
  "NPC",
  "ARENA",
  "EVENT",
  "PVE",
] as const;

export type BattleType = (typeof BATTLE_TYPES)[number];

export type TeamSizeMode = "1v1" | "2v2" | "3v3";

export const TEAM_SIZE_ACTIVE: Record<TeamSizeMode, number> = {
  "1v1": 1,
  "2v2": 2,
  "3v3": 3,
};

export const TEAM_SIZE_BENCH: Record<TeamSizeMode, number> = {
  "1v1": 0,
  "2v2": 0,
  "3v3": 0,
};

export type BattleTypeMeta = {
  id: BattleType;
  label: string;
  pvp: boolean;
  careNormalized: boolean;
  rewardsEnabled: boolean;
  implemented: "playable" | "stub" | "planned";
};

export const BATTLE_TYPE_META: Record<BattleType, BattleTypeMeta> = {
  PRACTICE: {
    id: "PRACTICE",
    label: "Practice vs AI",
    pvp: false,
    careNormalized: false,
    rewardsEnabled: true,
    implemented: "playable",
  },
  DUEL: {
    id: "DUEL",
    label: "Casual Duel",
    pvp: true,
    careNormalized: false,
    rewardsEnabled: true,
    implemented: "stub",
  },
  RANKED: {
    id: "RANKED",
    label: "Ranked Ladder",
    pvp: true,
    careNormalized: true,
    rewardsEnabled: true,
    implemented: "stub",
  },
  TOURNAMENT: {
    id: "TOURNAMENT",
    label: "Tournament Bracket",
    pvp: true,
    careNormalized: true,
    rewardsEnabled: true,
    implemented: "planned",
  },
  GUILD: {
    id: "GUILD",
    label: "Guild Clash",
    pvp: true,
    careNormalized: true,
    rewardsEnabled: true,
    implemented: "planned",
  },
  BOSS: {
    id: "BOSS",
    label: "Boss Encounter",
    pvp: false,
    careNormalized: false,
    rewardsEnabled: true,
    implemented: "planned",
  },
  RAID: {
    id: "RAID",
    label: "Raid Assault",
    pvp: false,
    careNormalized: false,
    rewardsEnabled: true,
    implemented: "planned",
  },
  STORY: {
    id: "STORY",
    label: "Story Battle",
    pvp: false,
    careNormalized: false,
    rewardsEnabled: true,
    implemented: "planned",
  },
  NPC: {
    id: "NPC",
    label: "NPC Trainer",
    pvp: false,
    careNormalized: false,
    rewardsEnabled: true,
    implemented: "stub",
  },
  ARENA: {
    id: "ARENA",
    label: "Open Arena",
    pvp: true,
    careNormalized: false,
    rewardsEnabled: true,
    implemented: "stub",
  },
  EVENT: {
    id: "EVENT",
    label: "Limited Event",
    pvp: false,
    careNormalized: false,
    rewardsEnabled: true,
    implemented: "planned",
  },
  PVE: {
    id: "PVE",
    label: "PvE Encounter",
    pvp: false,
    careNormalized: false,
    rewardsEnabled: true,
    implemented: "stub",
  },
};
