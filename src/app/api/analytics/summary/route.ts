import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { buildAnalyticsDashboard } from "@/lib/analytics/dashboard";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "analytics-summary",
    limit: 30,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "analytics_summary_read",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.ANALYTICS_DASHBOARD_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  return jsonOk(
    {
      enabled: true,
      dashboard: buildAnalyticsDashboard(),
      note: "Admin shell — wire role checks before production exposure.",
    },
    guard.requestId,
  );
}
