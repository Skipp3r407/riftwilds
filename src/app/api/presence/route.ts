import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { getLivePresenceSnapshot } from "@/lib/ecosystem/presence";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "presence-read",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.ECOSYSTEM_PRESENCE_STUBS_ENABLED) {
    return jsonOk({ enabled: false, presence: null }, guard.requestId);
  }

  return jsonOk(
    {
      enabled: true,
      presence: getLivePresenceSnapshot(),
    },
    guard.requestId,
  );
}
