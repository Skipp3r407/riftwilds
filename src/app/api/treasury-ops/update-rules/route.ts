import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { updateRules } from "@/lib/treasury-ops";
import { requireTreasuryAdmin } from "@/lib/treasury-ops/api-auth";

export async function POST(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-update-rules",
    limit: 20,
    clientKey: auth.session.userId,
    auditAction: "treasury_ops_update_rules",
    actorId: auth.session.userId,
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonError("Treasury ops disabled", 503, "disabled", guard.requestId);
  }

  let body: {
    splits?: Record<string, number>;
    minDistributionLamports?: string;
    distributionDelayMs?: number;
    autoApprovalThresholdLamports?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400, "bad_request", guard.requestId);
  }

  try {
    const rules = updateRules({
      ...body,
      actorId: auth.session.userId,
      requestId: guard.requestId,
    });
    return jsonOk({ rules }, guard.requestId);
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Update failed",
      400,
      "update_failed",
      guard.requestId,
    );
  }
}
