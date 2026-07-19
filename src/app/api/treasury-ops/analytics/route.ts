import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getAnalytics } from "@/lib/treasury-ops";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "treasury-ops-analytics",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  return jsonOk({ enabled: true, analytics: getAnalytics() }, guard.requestId);
}
