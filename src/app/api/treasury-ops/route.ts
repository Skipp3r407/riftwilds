import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getDashboard } from "@/lib/treasury-ops";

/** GET /api/treasury-ops — full dashboard snapshot (public read). */
export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "treasury-ops-dashboard",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  return jsonOk({ enabled: true, dashboard: getDashboard() }, guard.requestId);
}
