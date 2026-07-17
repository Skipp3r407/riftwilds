import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getTokenAnalyticsDashboard } from "@/lib/ecosystem/token-analytics";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "token-analytics",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.ECOSYSTEM_TOKEN_ANALYTICS_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const dashboard = await getTokenAnalyticsDashboard();
  return jsonOk({ enabled: true, dashboard }, guard.requestId);
}
