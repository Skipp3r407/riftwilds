import { withApiGuard, jsonOk } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { ensureCoreDecadePackRegistered } from "@/game/expansion/packs/core-decade-pack";
import { listExpansionPacks, countContentByKind } from "@/game/expansion/registry";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "expansion-packs",
    limit: 90,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  if (!featureFlagDefaults.EXPANSION_FRAMEWORK_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }

  ensureCoreDecadePackRegistered();
  return jsonOk(
    {
      enabled: true,
      packs: listExpansionPacks(),
      countsByKind: countContentByKind(),
    },
    guard.requestId,
  );
}
