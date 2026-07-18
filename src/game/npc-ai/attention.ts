/**
 * Player-attention indicators — floating ! types with wave + timeout.
 */

export type AttentionKind =
  | "quest"
  | "story"
  | "chat"
  | "fear"
  | "praise"
  | "respect"
  | "wary"
  | "none";

export type AttentionState = {
  kind: AttentionKind;
  /** Epoch ms when indicator appeared. */
  startedAt: number;
  /** Auto-clear if player ignores (ms). */
  timeoutMs: number;
  waved: boolean;
  /** Optional quest key when kind === quest. */
  questId?: string;
  /** Cleared when player interacts or timeout. */
  active: boolean;
};

export const ATTENTION_TIMEOUT_MS: Record<Exclude<AttentionKind, "none">, number> = {
  quest: 28_000,
  story: 22_000,
  chat: 16_000,
  fear: 12_000,
  praise: 14_000,
  respect: 14_000,
  wary: 13_000,
};

export const ATTENTION_ASSET: Record<Exclude<AttentionKind, "none">, string> = {
  quest: "/assets/ui/npc-indicators/quest.svg",
  story: "/assets/ui/npc-indicators/story.svg",
  chat: "/assets/ui/npc-indicators/chat.svg",
  fear: "/assets/ui/npc-indicators/fear.svg",
  praise: "/assets/ui/npc-indicators/praise.svg",
  respect: "/assets/ui/npc-indicators/respect.svg",
  wary: "/assets/ui/npc-indicators/wary.svg",
};

export const ATTENTION_TEXTURE_KEY: Record<Exclude<AttentionKind, "none">, string> = {
  quest: "npc-ind-quest",
  story: "npc-ind-story",
  chat: "npc-ind-chat",
  fear: "npc-ind-fear",
  praise: "npc-ind-praise",
  respect: "npc-ind-respect",
  wary: "npc-ind-wary",
};

export function createAttention(
  kind: Exclude<AttentionKind, "none">,
  now = Date.now(),
  questId?: string,
): AttentionState {
  return {
    kind,
    startedAt: now,
    timeoutMs: ATTENTION_TIMEOUT_MS[kind],
    waved: false,
    questId,
    active: true,
  };
}

export function tickAttention(
  state: AttentionState | null,
  now: number,
): AttentionState | null {
  if (!state || !state.active || state.kind === "none") return null;
  if (now - state.startedAt >= state.timeoutMs) {
    return { ...state, active: false, kind: "none" };
  }
  return state;
}

/** Wave once shortly after appearing (visual stub signal). */
export function shouldWave(state: AttentionState | null, now: number): boolean {
  if (!state?.active || state.waved) return false;
  return now - state.startedAt >= 400;
}

export function markWaved(state: AttentionState): AttentionState {
  return { ...state, waved: true };
}

export function clearAttention(state: AttentionState | null): AttentionState | null {
  if (!state) return null;
  return { ...state, active: false, kind: "none" };
}

export function attentionTint(kind: AttentionKind): number {
  switch (kind) {
    case "quest":
      return 0xffb84d;
    case "story":
      return 0x3de7ff;
    case "chat":
      return 0x9aa3b5;
    case "fear":
      return 0xe85a5a;
    case "praise":
      return 0xff8c3a;
    case "respect":
      return 0xc4a35a;
    case "wary":
      return 0xb8a0d0;
    default:
      return 0xffffff;
  }
}
