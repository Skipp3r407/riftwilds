import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { exportReport, loadTreasuryOpsState } from "@/lib/treasury-ops";
import { requireTreasuryAdmin } from "@/lib/treasury-ops/api-auth";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "treasury-ops-reports",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonOk({ enabled: false }, guard.requestId);
  }
  const state = loadTreasuryOpsState();
  return jsonOk({ enabled: true, reports: state.reports.slice(0, 50) }, guard.requestId);
}

export async function POST(request: Request) {
  const auth = await requireTreasuryAdmin();
  if (!auth.ok) return auth.response;

  const guard = await withApiGuard({
    bucket: "treasury-ops-reports-export",
    limit: 20,
    clientKey: auth.session.userId,
    auditAction: "treasury_ops_report_export",
    actorId: auth.session.userId,
  });
  if (!guard.ok) return guard.response;
  if (!featureFlagDefaults.TREASURY_OPS_ENABLED) {
    return jsonError("Treasury ops disabled", 503, "disabled", guard.requestId);
  }

  const report = exportReport();
  return jsonOk({ report }, guard.requestId);
}
