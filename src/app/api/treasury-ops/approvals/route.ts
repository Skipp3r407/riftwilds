import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { approveDistribution, executeDistribution, getDashboard } from "@/lib/treasury-ops";
import { requireTreasuryAdmin } from "@/lib/treasury-ops/api-auth";

export async function GET(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-approvals",
    limit: 60,
    clientKey: auth.session.userId,
  });
  if (!guard.ok) return guard.response;

  const dash = getDashboard();
  return jsonOk({ approvals: dash.approvalQueue }, guard.requestId);
}

export async function POST(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-approvals-write",
    limit: 30,
    clientKey: auth.session.userId,
    auditAction: "treasury_ops_approval",
    actorId: auth.session.userId,
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonError("Treasury ops disabled", 503, "disabled", guard.requestId);
  }

  let body: {
    distributionId?: string;
    approve?: boolean;
    note?: string;
    executeAfter?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Invalid JSON", 400, "bad_request", guard.requestId);
  }

  if (!body.distributionId || typeof body.approve !== "boolean") {
    return jsonError("distributionId and approve required", 400, "bad_request", guard.requestId);
  }

  try {
    const distribution = approveDistribution({
      distributionId: body.distributionId,
      approve: body.approve,
      note: body.note,
      actorId: auth.session.userId,
      requestId: guard.requestId,
    });

    let executed = null;
    if (body.approve && body.executeAfter !== false) {
      executed = await executeDistribution({
        distributionId: distribution.id,
        actorId: auth.session.userId,
        requestId: guard.requestId,
      });
    }

    return jsonOk({ distribution, executed }, guard.requestId);
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Approval failed",
      400,
      "approval_failed",
      guard.requestId,
    );
  }
}
