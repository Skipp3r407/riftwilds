/**
 * Content validation pipeline — structured packs, map goals, faucet↔sink pairing.
 */

import { ALL_MAP_GOALS, starterMapGoalRecommendations } from "@/content/map-goals";
import { REGION_CONTENT_PACKS, assertRegionPackCoverage } from "@/content/regions";
import { JOB_BOARD } from "@/content/jobs/board";
import { PUBLIC_EVENTS } from "@/content/events/public-events";
import { PROFESSION_CATALOG } from "@/content/professions/catalog";
import { DAILY_GOALS, WEEKLY_GOALS } from "@/content/goals/daily-weekly";
import { FAUCET_RULES, FAUCET_SINK_PAIRINGS, SINK_RULES } from "@/lib/credits/config";
import { REGION_IDENTITIES } from "@/game/world-maps/regions";

export type ContentValidationIssue = {
  code: string;
  severity: "error" | "warn";
  message: string;
};

export type ContentValidationReport = {
  ok: boolean;
  checkedAt: string;
  issues: ContentValidationIssue[];
  stats: Record<string, number>;
};

export function validateGameContent(): ContentValidationReport {
  const issues: ContentValidationIssue[] = [];
  const regionIds = REGION_IDENTITIES.map((r) => r.id);

  const coverage = assertRegionPackCoverage(regionIds);
  for (const id of coverage.missing) {
    issues.push({
      code: "MISSING_REGION_PACK",
      severity: "error",
      message: `No content pack for region ${id}`,
    });
  }
  for (const id of coverage.incomplete) {
    issues.push({
      code: "INCOMPLETE_REGION_PACK",
      severity: "error",
      message: `Incomplete pack for region ${id}`,
    });
  }

  const commons = REGION_CONTENT_PACKS.find((p) => p.regionId === "riftwild-commons");
  if (!commons || commons.completeness !== "full") {
    issues.push({
      code: "COMMONS_NOT_FULL",
      severity: "error",
      message: "Riftwild Commons pack must be completeness=full",
    });
  }

  const starter = starterMapGoalRecommendations();
  if (starter.length < 3) {
    issues.push({
      code: "STARTER_GOALS_LT_3",
      severity: "error",
      message: `Expected 3 starter map goals, got ${starter.length}`,
    });
  }

  for (const g of ALL_MAP_GOALS) {
    if (!g.title.trim() || !g.suggestedSink) {
      issues.push({
        code: "MAP_GOAL_INVALID",
        severity: "error",
        message: `Invalid map goal ${g.id}`,
      });
    }
    if (!SINK_RULES[g.suggestedSink] && g.suggestedSink !== "NPC_SHOP_BUY") {
      // NPC_SHOP_BUY exists in SINK_RULES — if missing, warn
      if (!SINK_RULES[g.suggestedSink]) {
        issues.push({
          code: "MAP_GOAL_UNKNOWN_SINK",
          severity: "warn",
          message: `Map goal ${g.id} sink ${g.suggestedSink} not in SINK_RULES`,
        });
      }
    }
  }

  for (const pairing of FAUCET_SINK_PAIRINGS) {
    if (!FAUCET_RULES[pairing.faucet]) {
      issues.push({
        code: "PAIRING_UNKNOWN_FAUCET",
        severity: "error",
        message: `Pairing references unknown faucet ${pairing.faucet}`,
      });
    }
    for (const sink of pairing.sinks) {
      if (!SINK_RULES[sink]) {
        issues.push({
          code: "PAIRING_UNKNOWN_SINK",
          severity: "error",
          message: `Pairing ${pairing.faucet} → unknown sink ${sink}`,
        });
      }
    }
  }

  for (const job of JOB_BOARD) {
    if (job.creditReward > (FAUCET_RULES.JOB_BOARD?.maxPerGrant ?? 0)) {
      issues.push({
        code: "JOB_REWARD_OVER_CAP",
        severity: "error",
        message: `Job ${job.id} reward ${job.creditReward} exceeds JOB_BOARD maxPerGrant`,
      });
    }
  }

  for (const ev of PUBLIC_EVENTS) {
    if (ev.creditReward > (FAUCET_RULES.EVENT_REWARD?.maxPerGrant ?? 0)) {
      issues.push({
        code: "EVENT_REWARD_OVER_CAP",
        severity: "warn",
        message: `Event ${ev.id} reward may exceed EVENT_REWARD maxPerGrant`,
      });
    }
  }

  for (const p of PROFESSION_CATALOG) {
    if (!p.inputsFrom.length && p.id !== "forager" && p.id !== "miner" && p.id !== "angler") {
      issues.push({
        code: "PROFESSION_NO_INPUTS",
        severity: "warn",
        message: `Profession ${p.id} has no interdependence inputs`,
      });
    }
  }

  for (const g of [...DAILY_GOALS, ...WEEKLY_GOALS]) {
    if (g.creditReward <= 0) {
      issues.push({
        code: "GOAL_ZERO_REWARD",
        severity: "error",
        message: `Goal ${g.id} has non-positive reward`,
      });
    }
  }

  const errors = issues.filter((i) => i.severity === "error");
  return {
    ok: errors.length === 0,
    checkedAt: new Date().toISOString(),
    issues,
    stats: {
      regionPacks: REGION_CONTENT_PACKS.length,
      mapGoals: ALL_MAP_GOALS.length,
      jobs: JOB_BOARD.length,
      events: PUBLIC_EVENTS.length,
      professions: PROFESSION_CATALOG.length,
      dailyGoals: DAILY_GOALS.length,
      weeklyGoals: WEEKLY_GOALS.length,
      faucetRules: Object.keys(FAUCET_RULES).length,
      sinkRules: Object.keys(SINK_RULES).length,
      errorCount: errors.length,
      warnCount: issues.filter((i) => i.severity === "warn").length,
    },
  };
}
