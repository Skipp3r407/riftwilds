import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { retryFailed } from "@/lib/treasury-ops";
import { requireTreasuryAdmin } from "@/lib/treasury-ops/api-auth";

export async function POST(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-retry",
    limit: 20,
    clientKey: auth.session.userId,
    auditAction: "treasury_ops_retry",
    actorId: auth.session.userId,
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonError("Treasury ops disabled", 503, "disabled", guard.requestId);
  }

  let failedId: string | undefined;
  try {
    const body = (await request.json()) as { failedId?: string };
    failedId = body.failedId;
  } catch {
    /* batch retry */
  }

  const result = retryFailed({
    failedId,
    actorId: auth.session.userId,
    requestId: guard.requestId,
  });
  return jsonOk(result, guard.requestId);
}
