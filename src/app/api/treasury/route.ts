import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getCommunityTreasuryDashboard } from "@/lib/ecosystem/treasury";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "treasury-read",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.ECOSYSTEM_TREASURY_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  return jsonOk(
    { enabled: true, treasury: getCommunityTreasuryDashboard() },
    guard.requestId,
  );
}
