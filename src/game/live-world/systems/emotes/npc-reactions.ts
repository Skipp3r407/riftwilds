/**
 * NPC emote reactions — authored fallback lines + optional AI flavor hook.
 * No rewards, quests, or economy side-effects.
 */

import type { EmoteEventBus } from "@/game/live-world/systems/emotes/event-bus";

export type NpcReaction = {
  emoteKey: string;
  line: string;
};

/** Authored family-safe reactions by player emote. */
const AUTHORED: Record<string, NpcReaction[]> = {
  wave: [
    { emoteKey: "wave", line: "The Keeper waves back with a warm smile." },
    { emoteKey: "hello", line: "\"Hello, traveler!\"" },
  ],
  hello: [
    { emoteKey: "wave", line: "\"Well met!\"" },
    { emoteKey: "nod", line: "They nod in greeting." },
  ],
  salute: [
    { emoteKey: "salute", line: "They return a crisp salute." },
    { emoteKey: "bow", line: "A respectful bow answers yours." },
  ],
  bow: [
    { emoteKey: "bow", line: "They bow in kind." },
    { emoteKey: "nod", line: "A gentle nod acknowledges your respect." },
  ],
  cheer: [
    { emoteKey: "clap", line: "\"Haha — keep that spirit!\"" },
    { emoteKey: "cheer", line: "They cheer along, purely for fun." },
  ],
  thanks: [
    { emoteKey: "nod", line: "\"Anytime, Keeper.\"" },
    { emoteKey: "wave", line: "They wave it off kindly." },
  ],
  dance: [
    { emoteKey: "clap", line: "\"Nice moves — plaza approved!\"" },
    { emoteKey: "laugh", line: "They laugh and clap along." },
  ],
};

export const NPC_REACT_COOLDOWN_MS = 8000;

export type NpcReactionController = {
  tryReact: (input: {
    npcSlug: string;
    playerEmoteKey: string;
    /** Optional AI-flavored line; falls back to authored if empty. */
    aiLine?: string | null;
    now?: number;
  }) => { ok: true; reaction: NpcReaction } | { ok: false; reason: string };
};

export function pickAuthoredReaction(
  playerEmoteKey: string,
  seed = 0,
): NpcReaction | null {
  const list = AUTHORED[playerEmoteKey];
  if (!list?.length) return null;
  return list[Math.abs(seed) % list.length]!;
}

/**
 * Optional AI flavor — stub returns null so authored lines always win unless provided.
 * Callers may pass a pre-generated safe line; never invent rewards.
 */
export function optionalAiFlavorLine(_npcSlug: string, _emoteKey: string): string | null {
  return null;
}

export function createNpcReactionController(bus: EmoteEventBus): NpcReactionController {
  const lastByNpc = new Map<string, number>();

  return {
    tryReact(input) {
      const now = input.now ?? Date.now();
      const prev = lastByNpc.get(input.npcSlug);
      if (prev !== undefined && now - prev < NPC_REACT_COOLDOWN_MS) {
        return { ok: false, reason: "NPC reaction cooldown" };
      }
      const authored = pickAuthoredReaction(
        input.playerEmoteKey,
        input.npcSlug.length + input.playerEmoteKey.length,
      );
      if (!authored) return { ok: false, reason: "No reaction for this emote" };

      const ai =
        input.aiLine?.trim() ||
        optionalAiFlavorLine(input.npcSlug, input.playerEmoteKey);
      const reaction: NpcReaction = {
        emoteKey: authored.emoteKey,
        line: ai && ai.length > 0 && ai.length <= 120 ? ai : authored.line,
      };
      lastByNpc.set(input.npcSlug, now);
      bus.publish({
        type: "npc_react",
        payload: {
          npcSlug: input.npcSlug,
          emoteKey: reaction.emoteKey,
          line: reaction.line,
          at: now,
        },
      });
      return { ok: true, reaction };
    },
  };
}
