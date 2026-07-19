import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import {
  listCollectibleEditionBrowser,
  listOwnedCollectibleEditions,
  queueCollectibleMint,
  gameplayCardEqualsCollectibleEdition,
} from "@/lib/economy/sol";

/** Collectible edition catalog + ownership browser (cosmetics ≠ gameplay). */
export async function GET(request: Request) {
  const guard = await withApiGuard({
    bucket: "economy-sol-collectibles",
    limit: 60,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "demo-keeper";

  return jsonOk(
    {
      gameplayEqualsCollectible: gameplayCardEqualsCollectibleEdition(),
      editions: listCollectibleEditionBrowser({ userId }),
      owned: listOwnedCollectibleEditions(userId),
      mint: queueCollectibleMint({
        userId,
        editionId: "probe",
        requestId: "probe",
      }),
      note: "Editions link to TCG gameplayCardId for art only — never battle stats.",
    },
    guard.requestId,
  );
}

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "economy-sol-collectibles-post",
    limit: 30,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
  });
  if (!guard.ok) return guard.response;

  let body: { userId?: string; editionId?: string; requestId?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400, "bad_request");
  }

  const userId = body.userId ?? "demo-keeper";
  const editionId = body.editionId;
  const requestId = body.requestId;
  if (!editionId || !requestId) {
    return jsonError("editionId and requestId required", 400, "validation_error");
  }

  const mint = queueCollectibleMint({ userId, editionId, requestId });
  return jsonOk({ mint, productionMintDisabled: true }, guard.requestId);
}
