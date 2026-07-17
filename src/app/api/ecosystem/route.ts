import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { buildEcosystemSnapshot } from "@/game/expansion/ecosystem";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "ecosystem",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.ECOSYSTEM_DASHBOARD_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  return jsonOk({ enabled: true, snapshot: buildEcosystemSnapshot() }, guard.requestId);
}
