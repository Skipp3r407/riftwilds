import { z } from "zod";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import { issueWalletChallenge, verifyWalletChallenge } from "@/lib/economy/sol";

const issueSchema = z.object({
  wallet: z.string().min(32).max(64),
  purpose: z.string().min(3).max(120),
  domain: z.string().max(120).optional(),
});

const verifySchema = z.object({
  challengeId: z.string().min(8).max(120),
  wallet: z.string().min(32).max(64),
  signatureBase58: z.string().min(64).max(200),
});

/** Issue or verify a wallet ownership challenge (extends SIWS patterns). */
export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "economy-sol-wallet-challenge",
    limit: 30,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400, "bad_request");
  }

  const action = (body as { action?: string }).action ?? "issue";

  if (action === "verify") {
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid verify payload", 400, "validation_error");
    }
    const result = verifyWalletChallenge(parsed.data);
    if (!result.ok) {
      return jsonError(result.message, 400, result.error);
    }
    return jsonOk({ verified: true, wallet: result.wallet }, guard.requestId);
  }

  const parsed = issueSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid issue payload", 400, "validation_error");
  }
  const result = issueWalletChallenge(parsed.data);
  if (!result.ok) {
    return jsonError(result.message, 403, result.error);
  }
  return jsonOk(
    {
      challengeId: result.challenge.challengeId,
      wallet: result.challenge.wallet,
      message: result.challenge.message,
      expiresAt: result.challenge.expiresAt,
      purpose: result.challenge.purpose,
      note: "Sign this message to prove wallet ownership. Never trust an unsigned client address.",
    },
    guard.requestId,
  );
}
