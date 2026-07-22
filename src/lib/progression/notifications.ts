/**
 * Progression notification helpers.
 */

import type {
  LevelReward,
  ProgressionNotification,
  ProgressionNotificationKind,
} from "@/lib/progression/types";

let notifSeq = 0;

export function makeNotification(
  kind: ProgressionNotificationKind,
  title: string,
  body: string,
  meta?: Record<string, unknown>,
): ProgressionNotification {
  notifSeq += 1;
  return {
    id: `prog-n-${Date.now()}-${notifSeq}`,
    kind,
    title,
    body,
    at: Date.now(),
    meta,
  };
}

export function notificationsForLevelRewards(
  levelsGained: number,
  newLevel: number,
  rewards: LevelReward[],
): ProgressionNotification[] {
  const out: ProgressionNotification[] = [];
  if (levelsGained > 0) {
    out.push(
      makeNotification(
        "LEVEL_UP",
        levelsGained > 1 ? `LEVEL UP ×${levelsGained}!` : "LEVEL UP!",
        `You reached Keeper Level ${newLevel}.`,
        { levelsGained, newLevel, rewards },
      ),
    );
  }
  for (const r of rewards) {
    if (r.kind === "skill_point") {
      out.push(makeNotification("SKILL_POINT", "Skill Point", r.label, { level: r.level }));
    }
    if (r.kind === "stat_point") {
      out.push(makeNotification("STAT_POINT", "Stat Point Available", r.label, { level: r.level }));
    }
    if (r.kind === "prestige_unlock") {
      out.push(
        makeNotification("PRESTIGE_READY", "Prestige Ready", "Reset to Level 1 and earn prestige perks."),
      );
    }
  }
  return out;
}

export function trimNotifications(
  list: ProgressionNotification[],
  max = 40,
): ProgressionNotification[] {
  return list.slice(0, max);
}
