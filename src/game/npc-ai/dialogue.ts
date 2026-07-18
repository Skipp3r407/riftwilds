/**
 * Contextual NPC dialogue with authored fallback.
 * AI path is a stub that never mutates economy — rewards only via server quest/ledger APIs.
 */

import { getNpcById, getNpcBySlug } from "@/content/npcs";
import { personalityForNpc } from "@/game/npc-ai/personalities";
import { getNpcMemory, updateNpcMemory } from "@/game/npc-ai/memory";
import type { AiDialogueRequest, AiDialogueResponse } from "@/game/npc-ai/types";

const REWARD_CLAIM_PATTERNS =
  /\b(give|grant|award|pay|send)\b.*\b(credits?|sol|token|item|reward|quest)\b/i;

/** Strip / reject any AI text that attempts to grant rewards. */
export function sanitizeAiLines(lines: string[]): string[] {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      if (REWARD_CLAIM_PATTERNS.test(l)) {
        return "I can talk, but rewards only come through the keeper ledgers — not my words.";
      }
      return l;
    });
}

function authoredFallback(npcId: string): { lines: string[]; reason: string } {
  const npc = getNpcById(npcId) ?? getNpcBySlug(npcId);
  if (npc) {
    const greet = (npc.greetingDialogue ?? []).filter(Boolean);
    if (greet.length) {
      return { lines: greet.slice(0, 3), reason: "authored_greeting" };
    }
    return {
      lines: [
        `${npc.displayName} nods. "The Commons keep honest books — Credits for work, never for promises."`,
      ],
      reason: "authored_generic",
    };
  }
  return {
    lines: [
      'A regional keeper regards you calmly. "Speak with the job board and quest ledgers for rewards."',
    ],
    reason: "missing_npc_def",
  };
}

/**
 * Generate contextual dialogue. Uses lightweight template "AI" stub + authored fallback.
 * `grantsRewards` is always false.
 */
export function generateNpcDialogue(req: AiDialogueRequest): AiDialogueResponse {
  const personality = personalityForNpc(req.npcId);
  const memory = getNpcMemory(req.npcId, req.playerId);

  // Simulated contextual AI — no external model; safe for offline/demo.
  const topic = req.playerMessage?.slice(0, 80) || "greeting";
  const regionBit = req.regionId ? ` here in ${req.regionId}` : "";
  const memBit = memory?.summary ? ` I recall: ${memory.summary}` : "";

  let lines: string[] = [];
  let source: "ai" | "authored_fallback" = "ai";
  let fallbackReason: string | undefined;

  try {
    lines = sanitizeAiLines([
      `${personality.speechStyle.replace(/\.$/, "")}${regionBit}.`,
      `As someone who values ${personality.values[0]}, I'll say this plainly: my words never mint Credits.`,
      req.playerMessage
        ? `On "${topic}" — check the Map Goals panel and job board for real work.`
        : `What brings you by?${memBit ? " " + memBit : ""}`,
    ]);
    if (!lines.length) throw new Error("empty");
  } catch {
    const fb = authoredFallback(req.npcId);
    lines = fb.lines;
    source = "authored_fallback";
    fallbackReason = fb.reason;
  }

  // If player tries to social-engineer rewards, force fallback clarification.
  if (req.playerMessage && REWARD_CLAIM_PATTERNS.test(req.playerMessage)) {
    lines = [
      "I can't grant Credits, items, or quest completions — only the server ledgers can.",
      ...authoredFallback(req.npcId).lines.slice(0, 1),
    ];
    source = "authored_fallback";
    fallbackReason = "reward_request_blocked";
  }

  const updated = updateNpcMemory({
    npcId: req.npcId,
    playerId: req.playerId,
    topic,
    flags: req.knownFlags,
  });

  return {
    lines,
    source,
    grantsRewards: false,
    personalityTraits: personality.traits,
    memorySummary: updated.summary,
    fallbackReason,
  };
}

/** Explicit guard for APIs — AI responses must never be treated as reward authority. */
export function assertAiCannotGrantRewards(response: AiDialogueResponse): void {
  if (response.grantsRewards !== false) {
    throw new Error("AI_NPC_REWARD_VIOLATION");
  }
}
