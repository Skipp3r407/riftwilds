import { z } from "zod";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { creditCredits, debitCredits, getCreditBalance } from "@/lib/credits/ledger";
import { CREDITS_DISCLAIMER } from "@/lib/credits/config";
import { getSessionContext } from "@/lib/auth/session";
import type { CreditFaucetReason, CreditSinkReason } from "@/lib/credits/types";

const bodySchema = z.object({
  action: z.enum(["credit", "debit"]),
  amount: z.number().int().positive(),
  reason: z.string(),
  requestId: z.string().min(4).max(200),
  demoUser: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "credits-transact",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
    auditAction: "credits_transact",
  });
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400, "bad_json", guard.requestId);
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonError(parsed.error.message, 400, "validation_failed", guard.requestId);
  }

  const session = await getSessionContext();
  const userId = session?.userId ?? parsed.data.demoUser ?? "demo-keeper";

  const { hydrateMemoryFromPrisma, persistRecentCreditMutation } = await import(
    "@/lib/credits/persist-bridge"
  );
  await hydrateMemoryFromPrisma(userId);

  // Block AI-sourced grants at the API edge
  if (parsed.data.metadata?.source === "ai_npc") {
    return jsonError(
      "AI NPC cannot grant Credits",
      403,
      "ai_cannot_grant",
      guard.requestId,
    );
  }

  const result =
    parsed.data.action === "credit"
      ? creditCredits({
          userId,
          amount: parsed.data.amount,
          reason: parsed.data.reason as CreditFaucetReason,
          requestId: parsed.data.requestId,
          metadata: parsed.data.metadata,
        })
      : debitCredits({
          userId,
          amount: parsed.data.amount,
          reason: parsed.data.reason as CreditSinkReason,
          requestId: parsed.data.requestId,
          metadata: parsed.data.metadata,
        });

  if (!result.ok) {
    return jsonError(result.message, 400, result.error, guard.requestId);
  }

  await persistRecentCreditMutation(userId, parsed.data.requestId);

  return jsonOk(
    {
      entry: result.entry,
      balance: result.balance ?? getCreditBalance(userId),
      idempotentReplay: result.idempotentReplay ?? false,
      disclaimer: CREDITS_DISCLAIMER,
    },
    guard.requestId,
  );
}
