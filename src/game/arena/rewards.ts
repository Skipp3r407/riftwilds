import type { BattleType } from "@/game/arena/battle-types";
import { assertNoRealValueWagering } from "@/lib/config/arena";

/** Credits sinks/rewards capped — no SOL for basic play. */
export const BATTLE_REWARD_CAPS = {
  CREDITS_WIN_MAX: 40,
  CREDITS_LOSS_MAX: 12,
  XP_WIN_MAX: 80,
  XP_LOSS_MAX: 25,
  ARENA_POINTS_WIN_MAX: 30,
  ARENA_POINTS_LOSS_MAX: 10,
  DAILY_CREDITS_FROM_BATTLES: 400,
  DAILY_XP_FROM_BATTLES: 800,
} as const;

export type BattleReward = {
  credits: number;
  xp: number;
  arenaPoints: number;
  items: { itemId: string; qty: number }[];
  cosmetics: string[];
};

const BASE: Record<
  BattleType,
  { winCredits: number; lossCredits: number; winXp: number; lossXp: number; winAp: number; lossAp: number }
> = {
  PRACTICE: { winCredits: 8, lossCredits: 3, winXp: 20, lossXp: 8, winAp: 10, lossAp: 3 },
  DUEL: { winCredits: 18, lossCredits: 6, winXp: 40, lossXp: 14, winAp: 20, lossAp: 6 },
  RANKED: { winCredits: 25, lossCredits: 8, winXp: 55, lossXp: 18, winAp: 28, lossAp: 8 },
  TOURNAMENT: { winCredits: 30, lossCredits: 10, winXp: 70, lossXp: 22, winAp: 30, lossAp: 10 },
  GUILD: { winCredits: 22, lossCredits: 8, winXp: 50, lossXp: 16, winAp: 24, lossAp: 8 },
  BOSS: { winCredits: 35, lossCredits: 10, winXp: 75, lossXp: 20, winAp: 20, lossAp: 5 },
  RAID: { winCredits: 40, lossCredits: 12, winXp: 80, lossXp: 25, winAp: 22, lossAp: 6 },
  STORY: { winCredits: 15, lossCredits: 5, winXp: 35, lossXp: 12, winAp: 12, lossAp: 4 },
  NPC: { winCredits: 12, lossCredits: 4, winXp: 28, lossXp: 10, winAp: 14, lossAp: 4 },
  ARENA: { winCredits: 16, lossCredits: 5, winXp: 36, lossXp: 12, winAp: 18, lossAp: 5 },
  EVENT: { winCredits: 20, lossCredits: 7, winXp: 45, lossXp: 15, winAp: 20, lossAp: 6 },
  PVE: { winCredits: 14, lossCredits: 4, winXp: 30, lossXp: 10, winAp: 12, lossAp: 4 },
};

export function computeBattleRewards(params: {
  battleType: BattleType;
  won: boolean;
  draw?: boolean;
}): BattleReward {
  assertNoRealValueWagering();
  const base = BASE[params.battleType];
  if (params.draw) {
    return {
      credits: Math.min(BATTLE_REWARD_CAPS.CREDITS_LOSS_MAX, Math.floor(base.lossCredits * 1.5)),
      xp: Math.min(BATTLE_REWARD_CAPS.XP_LOSS_MAX, Math.floor(base.lossXp * 1.4)),
      arenaPoints: Math.min(BATTLE_REWARD_CAPS.ARENA_POINTS_LOSS_MAX, Math.floor(base.lossAp * 1.5)),
      items: [],
      cosmetics: [],
    };
  }
  if (params.won) {
    return {
      credits: Math.min(BATTLE_REWARD_CAPS.CREDITS_WIN_MAX, base.winCredits),
      xp: Math.min(BATTLE_REWARD_CAPS.XP_WIN_MAX, base.winXp),
      arenaPoints: Math.min(BATTLE_REWARD_CAPS.ARENA_POINTS_WIN_MAX, base.winAp),
      items:
        params.battleType === "PRACTICE"
          ? []
          : [{ itemId: "rift-polish", qty: 1 }],
      cosmetics: [],
    };
  }
  return {
    credits: Math.min(BATTLE_REWARD_CAPS.CREDITS_LOSS_MAX, base.lossCredits),
    xp: Math.min(BATTLE_REWARD_CAPS.XP_LOSS_MAX, base.lossXp),
    arenaPoints: Math.min(BATTLE_REWARD_CAPS.ARENA_POINTS_LOSS_MAX, base.lossAp),
    items: [],
    cosmetics: [],
  };
}

export function clampDailyBattleCredits(earnedToday: number, grant: number): number {
  return Math.max(0, Math.min(grant, BATTLE_REWARD_CAPS.DAILY_CREDITS_FROM_BATTLES - earnedToday));
}

export function clampDailyBattleXp(earnedToday: number, grant: number): number {
  return Math.max(0, Math.min(grant, BATTLE_REWARD_CAPS.DAILY_XP_FROM_BATTLES - earnedToday));
}
