import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getHistory } from "@/lib/treasury-ops";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "treasury-ops-history",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const url = new URL(request.url);
  const limit = Math.min(200, Number(url.searchParams.get("limit") ?? 50) || 50);
  return jsonOk({ enabled: true, ...getHistory(limit) }, guard.requestId);
}
