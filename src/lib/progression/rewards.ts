/**
 * Level-up reward tables — stats, skill points, cosmetics, titles, aura, prestige.
 */

import type { KeeperCombatStats, LevelReward } from "@/lib/progression/types";

export const PER_LEVEL_STATS = {
  maxHp: 5,
  atk: 2,
  def: 2,
  speed: 1,
  statPoints: 1,
} as const;

export const BASE_COMBAT_STATS: KeeperCombatStats = {
  maxHp: 100,
  atk: 10,
  def: 10,
  speed: 10,
};

export function applyPerLevelStats(stats: KeeperCombatStats, levels = 1): KeeperCombatStats {
  const n = Math.max(0, Math.floor(levels));
  return {
    maxHp: stats.maxHp + PER_LEVEL_STATS.maxHp * n,
    atk: stats.atk + PER_LEVEL_STATS.atk * n,
    def: stats.def + PER_LEVEL_STATS.def * n,
    speed: stats.speed + PER_LEVEL_STATS.speed * n,
  };
}

export function cosmeticRewardId(level: number): string {
  return `cosmetic:level-${level}`;
}

export function titleRewardId(level: number): string {
  return `title:keeper-${level}`;
}

export function auraRewardId(level: number): string {
  return `aura:rift-${level}`;
}

/**
 * Rewards granted when reaching `level` (after the level-up).
 */
export function rewardsForLevel(level: number): LevelReward[] {
  const lv = Math.max(1, Math.floor(level));
  const out: LevelReward[] = [
    {
      kind: "stat_bundle",
      level: lv,
      label: `+${PER_LEVEL_STATS.maxHp} Max HP · +${PER_LEVEL_STATS.atk} Atk · +${PER_LEVEL_STATS.def} Def · +${PER_LEVEL_STATS.speed} Speed`,
      payload: { ...PER_LEVEL_STATS },
    },
    {
      kind: "stat_point",
      level: lv,
      label: "+1 Stat Point",
    },
  ];

  if (lv % 5 === 0) {
    out.push({ kind: "skill_point", level: lv, label: "+1 Skill Point" });
  }
  if (lv % 10 === 0) {
    out.push({
      kind: "cosmetic",
      level: lv,
      label: `Cosmetic unlock (Lv ${lv})`,
      payload: { id: cosmeticRewardId(lv) },
    });
  }
  if (lv % 25 === 0) {
    out.push({
      kind: "title",
      level: lv,
      label: `Title unlock (Lv ${lv})`,
      payload: { id: titleRewardId(lv) },
    });
  }
  if (lv % 50 === 0) {
    out.push({
      kind: "rift_aura",
      level: lv,
      label: `Rift Aura (Lv ${lv})`,
      payload: { id: auraRewardId(lv) },
    });
  }
  if (lv >= 100 && lv % 100 === 0) {
    out.push({
      kind: "prestige_unlock",
      level: lv,
      label: "Prestige unlocked",
    });
  }

  return out;
}

/** Collect rewards for each level crossed from (fromLevel] exclusive through toLevel inclusive. */
export function rewardsForLevelRange(fromLevel: number, toLevel: number): LevelReward[] {
  const from = Math.max(1, Math.floor(fromLevel));
  const to = Math.max(from, Math.floor(toLevel));
  const out: LevelReward[] = [];
  for (let lv = from + 1; lv <= to; lv++) {
    out.push(...rewardsForLevel(lv));
  }
  return out;
}

export function previewNextMilestoneRewards(level: number, lookAhead = 10): LevelReward[] {
  const start = Math.max(1, Math.floor(level));
  const end = start + Math.max(1, lookAhead);
  const milestones: LevelReward[] = [];
  for (let lv = start + 1; lv <= end; lv++) {
    const rs = rewardsForLevel(lv).filter((r) => r.kind !== "stat_bundle" && r.kind !== "stat_point");
    if (rs.length) milestones.push(...rs);
  }
  return milestones.slice(0, 8);
}
