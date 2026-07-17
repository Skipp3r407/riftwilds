import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getSessionContext } from "@/lib/auth/session";
import { getRewardCenterDashboard } from "@/lib/ecosystem/reward-center";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "rewards-center",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.ECOSYSTEM_REWARD_CENTER_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  const session = await getSessionContext();
  const url = new URL(request.url);
  const walletParam = url.searchParams.get("wallet");
  const walletKey = walletParam ?? session?.walletAddress ?? null;

  return jsonOk(
    {
      enabled: true,
      center: getRewardCenterDashboard({
        walletKey,
        claimsEnabled: featureFlagDefaults.REWARD_CLAIMS_ENABLED,
      }),
    },
    guard.requestId,
  );
}
