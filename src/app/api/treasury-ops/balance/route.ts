import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getBalances, getDashboard } from "@/lib/treasury-ops";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "treasury-ops-balance",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const dash = getDashboard();
  return jsonOk(
    {
      enabled: true,
      ...getBalances(),
      projectTreasuryBalanceLamports: dash.projectTreasuryBalanceLamports,
      healthScore: dash.healthScore,
      mode: dash.mode,
    },
    guard.requestId,
  );
}
