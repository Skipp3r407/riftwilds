import { getSessionContext } from "@/lib/auth/session";
import { jsonError } from "@/lib/security/api-guard";

export async function requireTreasuryAdmin() {
  const session = await getSessionContext();
  if (!session || session.role !== "admin") {
    return {
      ok: false as const,
      response: jsonError("Admin only", 403, "forbidden"),
      session: null,
    };
  }
  return { ok: true as const, session, response: null };
}
