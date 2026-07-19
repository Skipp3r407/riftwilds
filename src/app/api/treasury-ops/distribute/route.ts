import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { executeDistribution } from "@/lib/treasury-ops";
import { requireTreasuryAdmin } from "@/lib/treasury-ops/api-auth";

export async function POST(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-distribute",
    limit: 30,
    clientKey: auth.session.userId,
    auditAction: "treasury_ops_distribute",
    actorId: auth.session.userId,
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonError("Treasury ops disabled", 503, "disabled", guard.requestId);
  }

  let body: {
    distributionId?: string;
    previewGrossLamports?: string;
    force?: boolean;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  try {
    const distribution = await executeDistribution({
      distributionId: body.distributionId,
      previewGrossLamports: body.previewGrossLamports,
      force: body.force,
      actorId: auth.session.userId,
      requestId: guard.requestId,
    });
    return jsonOk({ distribution }, guard.requestId);
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Distribute failed",
      400,
      "distribute_failed",
      guard.requestId,
    );
  }
}
