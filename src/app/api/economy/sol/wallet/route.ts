import { z } from "zod";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { getWalletCenterSnapshot } from "@/lib/economy/sol";

const querySchema = z.object({
  userId: z.string().min(2).max(80).default("demo-keeper"),
  wallet: z.string().min(32).max(64).optional().nullable(),
});

/** Wallet Center snapshot — soft mode; SOL spend UX remains flag-gated. */
export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "economy-sol-wallet",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    userId: url.searchParams.get("userId") ?? "demo-keeper",
    wallet: url.searchParams.get("wallet"),
  });
  if (!parsed.success) return jsonError("Invalid query", 400, "validation_error");

  const snapshot = getWalletCenterSnapshot({
    userId: parsed.data.userId,
    walletAddress: parsed.data.wallet ?? null,
  });

  return jsonOk(
    {
      ...snapshot,
      note: "Optional wallet. Never enter seed phrases. Production SOL spends stay disabled.",
    },
    guard.requestId,
  );
}
