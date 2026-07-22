/**
 * Best-effort Prisma persistence for keeper progression.
 * In-memory store remains source of truth for guests / local preview.
 */

import { getXPForLevel } from "@/lib/progression/formula";
import type { ProgressionState } from "@/lib/progression/types";

export async function persistProgressionBestEffort(state: ProgressionState): Promise<void> {
  if (!state.userId) return;
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const { isFeatureEnabled } = await import("@/lib/config/feature-flags");
    if (!isFeatureEnabled("KEEPER_PROGRESSION_PRISMA_ENABLED")) return;

    await prisma.playerProgression.upsert({
      where: { ownerKey: state.ownerKey },
      create: {
        ownerKey: state.ownerKey,
        userId: state.userId,
        level: state.level,
        currentXp: state.currentXp,
        lifetimeXp: state.lifetimeXp,
        prestige: state.prestige,
        prestigeUnlocked: state.prestigeUnlocked,
        statPoints: state.statPoints,
        skillPoints: state.skillPoints,
        masteryXp: state.masteryXp,
        loginStreak: state.loginStreak,
        longestLoginStreak: state.longestLoginStreak,
        restedXpPool: state.restedXpPool,
        lastSeenAt: new Date(state.lastSeenAt),
        combatStatsJson: state.combatStats,
        unlockedJson: {
          unlockedRewards: state.unlockedRewards,
          titles: state.titles,
          cosmetics: state.cosmetics,
          auras: state.auras,
          recentUnlocks: state.recentUnlocks,
        },
        masteryJson: {
          cardMastery: state.cardMastery,
          petMastery: state.petMastery,
          weaponMastery: state.weaponMastery,
        },
        statsJson: {
          battlesWon: state.battlesWon,
          battlesPlayed: state.battlesPlayed,
          questsCompleted: state.questsCompleted,
          highestCombo: state.highestCombo,
          opponentWinCounts: state.opponentWinCounts,
        },
        version: state.version,
      },
      update: {
        userId: state.userId,
        level: state.level,
        currentXp: state.currentXp,
        lifetimeXp: state.lifetimeXp,
        prestige: state.prestige,
        prestigeUnlocked: state.prestigeUnlocked,
        statPoints: state.statPoints,
        skillPoints: state.skillPoints,
        masteryXp: state.masteryXp,
        loginStreak: state.loginStreak,
        longestLoginStreak: state.longestLoginStreak,
        restedXpPool: state.restedXpPool,
        lastSeenAt: new Date(state.lastSeenAt),
        combatStatsJson: state.combatStats,
        unlockedJson: {
          unlockedRewards: state.unlockedRewards,
          titles: state.titles,
          cosmetics: state.cosmetics,
          auras: state.auras,
          recentUnlocks: state.recentUnlocks,
        },
        masteryJson: {
          cardMastery: state.cardMastery,
          petMastery: state.petMastery,
          weaponMastery: state.weaponMastery,
        },
        statsJson: {
          battlesWon: state.battlesWon,
          battlesPlayed: state.battlesPlayed,
          questsCompleted: state.questsCompleted,
          highestCombo: state.highestCombo,
          opponentWinCounts: state.opponentWinCounts,
        },
        version: state.version,
      },
    });

    // Keep legacy PlayerProfile.level / experience in sync when present.
    await prisma.playerProfile.updateMany({
      where: { userId: state.userId },
      data: {
        level: state.level,
        experience: state.currentXp,
      },
    });
  } catch {
    // DB optional in local/guest — ignore.
  }
}

export async function loadProgressionFromPrisma(
  ownerKey: string,
  userId: string,
): Promise<Partial<ProgressionState> | null> {
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const { isFeatureEnabled } = await import("@/lib/config/feature-flags");
    if (!isFeatureEnabled("KEEPER_PROGRESSION_PRISMA_ENABLED")) return null;

    const row = await prisma.playerProgression.findUnique({ where: { ownerKey } });
    if (!row) return null;

    const unlocked = (row.unlockedJson ?? {}) as Record<string, unknown>;
    const mastery = (row.masteryJson ?? {}) as Record<string, unknown>;
    const stats = (row.statsJson ?? {}) as Record<string, unknown>;
    const combat = (row.combatStatsJson ?? {}) as ProgressionState["combatStats"];

    return {
      ownerKey,
      userId,
      level: row.level,
      currentXp: row.currentXp,
      lifetimeXp: row.lifetimeXp,
      prestige: row.prestige,
      prestigeUnlocked: row.prestigeUnlocked,
      statPoints: row.statPoints,
      skillPoints: row.skillPoints,
      masteryXp: row.masteryXp,
      loginStreak: row.loginStreak,
      longestLoginStreak: row.longestLoginStreak,
      restedXpPool: row.restedXpPool,
      lastSeenAt: row.lastSeenAt.getTime(),
      combatStats: combat,
      unlockedRewards: (unlocked.unlockedRewards as string[]) ?? [],
      titles: (unlocked.titles as string[]) ?? [],
      cosmetics: (unlocked.cosmetics as string[]) ?? [],
      auras: (unlocked.auras as string[]) ?? [],
      recentUnlocks: (unlocked.recentUnlocks as string[]) ?? [],
      cardMastery: (mastery.cardMastery as ProgressionState["cardMastery"]) ?? {},
      petMastery: (mastery.petMastery as ProgressionState["petMastery"]) ?? {},
      weaponMastery: (mastery.weaponMastery as ProgressionState["weaponMastery"]) ?? {},
      battlesWon: Number(stats.battlesWon ?? 0),
      battlesPlayed: Number(stats.battlesPlayed ?? 0),
      questsCompleted: Number(stats.questsCompleted ?? 0),
      highestCombo: Number(stats.highestCombo ?? 0),
      opponentWinCounts: (stats.opponentWinCounts as Record<string, number>) ?? {},
      version: row.version,
    };
  } catch {
    return null;
  }
}

export function xpRequiredLabel(level: number): number {
  return getXPForLevel(level);
}
