import { NextResponse } from "next/server";
import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { CIVILIZATION_MILESTONES } from "@/game/civilization/milestones";
import {
  activeWorldEffects,
  civilizationProgressPercent,
  contributeToMilestone,
  getCivilizationProgress,
} from "@/game/civilization/progress-store";
import { onCivilizationContribute } from "@/game/achievements/hooks";
import { appendTimelineEvent } from "@/game/timeline/store";
import { trackAnalytics } from "@/lib/analytics/events";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "civilization-read",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.CIVILIZATION_RESTORATION_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const progress = getCivilizationProgress();
  return jsonOk(
    {
      enabled: true,
      progress,
      progressPercent: civilizationProgressPercent(),
      milestones: CIVILIZATION_MILESTONES.map((m) => ({
        ...m,
        contributed: progress.contributions[m.key] ?? 0,
        unlocked: progress.unlockedMilestoneKeys.includes(m.key),
      })),
      activeEffects: activeWorldEffects(),
      disclaimer:
        "Civilization progress is cooperative entertainment content with no cash value.",
    },
    guard.requestId,
  );
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "civilization-write",
    limit: 30,
    windowMs: 60_000,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "civilization_contribute",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.CIVILIZATION_RESTORATION_ENABLED) {
    return NextResponse.json(
      { ok: false, error: "disabled", requestId: guard.requestId },
      { status: 403 },
    );
  }

  let body: { milestoneKey?: string; amount?: number };
  try {
    body = (await request.json()) as { milestoneKey?: string; amount?: number };
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", requestId: guard.requestId },
      { status: 400 },
    );
  }

  const milestoneKey = body.milestoneKey ?? "commons_lanterns";
  const amount = Math.min(100, Math.max(1, Number(body.amount) || 1));
  const result = contributeToMilestone(milestoneKey, amount);
  onCivilizationContribute();
  trackAnalytics("civ_contribute", { milestoneKey, amount });

  if (result.newlyUnlocked.length > 0) {
    appendTimelineEvent({
      scope: "civilization",
      title: `Milestone unlocked: ${result.newlyUnlocked.join(", ")}`,
      detail: "Permanent world effects applied to the living wilds.",
      tags: ["civilization", "milestone"],
      refs: { milestones: result.newlyUnlocked.join(",") },
    });
  }

  return jsonOk(
    {
      contributed: amount,
      newlyUnlocked: result.newlyUnlocked,
      effects: result.effects,
      progress: result.progress,
      disclaimer:
        "Contributions are entertainment. No investment return or guaranteed rewards.",
    },
    guard.requestId,
  );
}
