import {
  COMMUNITY_MILESTONES,
  type CommunityMilestone,
} from "@/content/community/milestones";

export type MilestoneProgress = CommunityMilestone & {
  current: number | null;
  progressPercent: number;
  /** Human-readable progress for dashboards (e.g. "120 / 500" or "— / 500"). */
  progressLabel: string;
  reached: boolean;
  metricAvailable: boolean;
};

export type CommunityMetricSnapshot = {
  holders: number | null;
  marketplaceTrades: number;
  eggsHatched: number;
  petsEvolved: number;
};

export function getCommunityMilestones(): CommunityMilestone[] {
  return COMMUNITY_MILESTONES;
}

export function evaluateMilestones(metrics: CommunityMetricSnapshot): MilestoneProgress[] {
  return COMMUNITY_MILESTONES.map((m) => {
    const current = metrics[metricKey(m.metric)];
    const metricAvailable = current !== null && current !== undefined;
    const value = typeof current === "number" ? current : null;
    const progressPercent =
      value === null ? 0 : Math.min(100, Math.round((value / m.threshold) * 1000) / 10);
    const progressLabel =
      value === null
        ? `— / ${m.threshold.toLocaleString()}`
        : `${value.toLocaleString()} / ${m.threshold.toLocaleString()}`;
    return {
      ...m,
      current: value,
      progressPercent,
      progressLabel,
      reached: value !== null && value >= m.threshold,
      metricAvailable,
    };
  });
}

function metricKey(
  metric: CommunityMilestone["metric"],
): keyof CommunityMetricSnapshot {
  switch (metric) {
    case "holders":
      return "holders";
    case "marketplace_trades":
      return "marketplaceTrades";
    case "eggs_hatched":
      return "eggsHatched";
    case "pets_evolved":
      return "petsEvolved";
  }
}
