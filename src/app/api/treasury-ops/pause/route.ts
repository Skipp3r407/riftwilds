import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { emergencyStop, pauseTreasury } from "@/lib/treasury-ops";
import { requireTreasuryAdmin } from "@/lib/treasury-ops/api-auth";

export async function POST(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-pause",
    limit: 20,
    clientKey: auth.session.userId,
    auditAction: "treasury_ops_pause",
    actorId: auth.session.userId,
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonError("Treasury ops disabled", 503, "disabled", guard.requestId);
  }

  let emergency = false;
  try {
    const body = (await request.json()) as { emergency?: boolean };
    emergency = Boolean(body.emergency);
  } catch {
    /* empty */
  }

  const settings = emergency
    ? emergencyStop(auth.session.userId, guard.requestId)
    : pauseTreasury(auth.session.userId, guard.requestId);

  return jsonOk({ settings }, guard.requestId);
}
