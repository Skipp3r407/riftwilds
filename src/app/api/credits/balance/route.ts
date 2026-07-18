import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import {
  ensureStarterCredits,
  getCreditAccount,
  getCreditBalance,
  listLedgerEntries,
} from "@/lib/credits/ledger";
import { CREDITS_DISCLAIMER } from "@/lib/credits/config";
import { getSessionContext } from "@/lib/auth/session";
import { listPrismaLedgerEntries, isCreditsPrismaEnabled } from "@/lib/credits/persistence";
import { hydrateMemoryFromPrisma } from "@/lib/credits/persist-bridge";

export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "credits-balance",
    limit: 120,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const session = await getSessionContext();
  const url = new URL(request.url);
  const demoUser = url.searchParams.get("demoUser") ?? "demo-keeper";
  const userId = session?.userId ?? demoUser;

  await hydrateMemoryFromPrisma(userId);
  if (getCreditBalance(userId) <= 0) {
    ensureStarterCredits(userId);
  }
  const account = getCreditAccount(userId);
  let recent = listLedgerEntries(userId, { limit: 15 });
  if (isCreditsPrismaEnabled() && recent.length === 0) {
    const dbRecent = await listPrismaLedgerEntries(userId, 15);
    if (dbRecent.length) recent = dbRecent;
  }

  return jsonOk(
    {
      currency: "CREDITS",
      userId,
      authenticated: Boolean(session),
      balance: account.balance,
      version: account.version,
      recent,
      persistence: isCreditsPrismaEnabled() ? "prisma+memory" : "memory",
      disclaimer: CREDITS_DISCLAIMER,
    },
    guard.requestId,
  );
}

export async function POST() {
  return jsonError("Use /api/credits/transact for mutations", 405, "method_not_allowed");
}
