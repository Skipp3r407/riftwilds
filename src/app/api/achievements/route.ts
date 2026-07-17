import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { ACHIEVEMENT_CATALOG } from "@/game/achievements/catalog";
import { evaluateAchievements } from "@/game/achievements/evaluator";
import {
  getDemoAchievementMetrics,
  getDemoUnlockedKeys,
} from "@/game/achievements/hooks";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "achievements",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.ACHIEVEMENT_UNIVERSE_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const metrics = getDemoAchievementMetrics();
  const unlockedKeys = getDemoUnlockedKeys();
  const evaluation = evaluateAchievements(metrics, unlockedKeys);

  return jsonOk(
    {
      enabled: true,
      catalogSize: ACHIEVEMENT_CATALOG.length,
      catalog: ACHIEVEMENT_CATALOG.map((a) => ({
        ...a,
        unlocked: unlockedKeys.includes(a.key) || evaluation.newlyUnlocked.some((n) => n.key === a.key),
        progress: Math.min(
          100,
          Math.round(((metrics[a.criteria.metric] ?? 0) / a.criteria.target) * 100),
        ),
      })),
      metrics,
      pendingUnlocks: evaluation.newlyUnlocked.map((a) => a.key),
    },
    guard.requestId,
  );
}
