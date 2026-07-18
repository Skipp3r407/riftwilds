import { z } from "zod";
import { withApiGuard, jsonOk, jsonError } from "@/lib/security/api-guard";
import {
  assertAiCannotGrantRewards,
  generateNpcDialogue,
} from "@/game/npc-ai";
import { getSessionContext } from "@/lib/auth/session";

const bodySchema = z.object({
  npcId: z.string().min(1),
  playerMessage: z.string().max(500).optional(),
  regionId: z.string().optional(),
  knownFlags: z.array(z.string()).optional(),
  demoUser: z.string().optional(),
});

export async function POST(request: Request) {
  const guard = await withApiGuard({
    bucket: "npc-ai-dialogue",
    limit: 40,
    clientKey: request.headers.get("x-forwarded-for") ?? "anon",
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
  const playerId = session?.userId ?? parsed.data.demoUser ?? "demo-keeper";

  const dialogue = generateNpcDialogue({
    npcId: parsed.data.npcId,
    playerId,
    playerMessage: parsed.data.playerMessage,
    regionId: parsed.data.regionId,
    knownFlags: parsed.data.knownFlags,
  });

  try {
    assertAiCannotGrantRewards(dialogue);
  } catch {
    return jsonError("AI reward violation", 500, "ai_reward_violation", guard.requestId);
  }

  return jsonOk(
    {
      dialogue,
      economyNote:
        "AI dialogue never grants Credits, items, or quest completions. Use quest/job/ledger APIs.",
    },
    guard.requestId,
  );
}
