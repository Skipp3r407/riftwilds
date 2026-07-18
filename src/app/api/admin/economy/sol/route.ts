import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { getSessionContext } from "@/lib/auth/session";
import { getSolEconomyAdminPanel } from "@/lib/economy/sol";

/** Admin SOL economy panel snapshot — read-only stub. */
export async function GET(request: Request) {
  const session = await getSessionContext();
  if (!session || session.role !== "admin") {
    return jsonError("Admin only", 403, "forbidden");
  }

  const guard = await withApiGuard({
    bucket: "admin-economy-sol",
    limit: 60,
    clientKey: session.userId,
    auditAction: "admin_economy_sol_snapshot",
    actorId: session.userId,
  });
  if (!guard.ok) return guard.response;

  return jsonOk(getSolEconomyAdminPanel(), guard.requestId);
}
