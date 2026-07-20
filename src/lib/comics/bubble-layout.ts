/**
 * Resolve comic bubble positions for the full lettering system.
 * Explicit x/y win; otherwise anchor presets; otherwise speaker-aware auto layout.
 */

import type { ComicBubble, ComicBubbleTail } from "@/content/comics/types";

export type ResolvedBubble = ComicBubble & {
  x: number;
  y: number;
  tail: ComicBubbleTail;
  maxWidthPct: number;
};

const ANCHOR_MAP: Record<
  NonNullable<ComicBubble["anchor"]>,
  { x: number; y: number; tail: ComicBubbleTail }
> = {
  tl: { x: 22, y: 18, tail: "down-right" },
  tr: { x: 78, y: 18, tail: "down-left" },
  bl: { x: 24, y: 72, tail: "up-right" },
  br: { x: 76, y: 72, tail: "up-left" },
  center: { x: 50, y: 42, tail: "down" },
  top: { x: 50, y: 16, tail: "down" },
  bottom: { x: 50, y: 78, tail: "up" },
};

/** Alternate left/right speaker lanes so dialogue feels mouth-aimed. */
const SPEECH_SLOTS: Array<{ x: number; y: number; tail: ComicBubbleTail }> = [
  { x: 28, y: 22, tail: "down" },
  { x: 72, y: 28, tail: "down" },
  { x: 30, y: 48, tail: "down-right" },
  { x: 70, y: 52, tail: "down-left" },
  { x: 34, y: 68, tail: "up" },
  { x: 66, y: 70, tail: "up" },
];

const THOUGHT_SLOTS: Array<{ x: number; y: number; tail: ComicBubbleTail }> = [
  { x: 76, y: 20, tail: "down-left" },
  { x: 22, y: 36, tail: "down-right" },
  { x: 80, y: 55, tail: "up-left" },
];

const SFX_SLOTS: Array<{ x: number; y: number; tail: ComicBubbleTail }> = [
  { x: 50, y: 58, tail: "down" },
  { x: 62, y: 40, tail: "down" },
  { x: 38, y: 64, tail: "up" },
];

const BANNER_KINDS = new Set(["narration", "caption"]);
const SFX_KINDS = new Set(["sfx"]);
const THOUGHT_LIKE = new Set(["thought", "telepathy", "whisper"]);
const NO_TAIL = new Set(["narration", "caption", "sfx", "magic"]);

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function speakerLane(speaker?: string): 0 | 1 {
  if (!speaker) return 0;
  const s = speaker.toLowerCase();
  if (
    s.includes("elara") ||
    s.includes("mira") ||
    s.includes("spark") ||
    s.includes("pip") ||
    s.includes("mossprig") ||
    s.includes("bramble")
  ) {
    return 0;
  }
  if (
    s.includes("stranger") ||
    s.includes("elder") ||
    s.includes("king") ||
    s.includes("crier") ||
    s.includes("kid") ||
    s.includes("merchant") ||
    s.includes("ashwing")
  ) {
    return 1;
  }
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 1)) % 2;
  return h as 0 | 1;
}

export function bubbleHasTail(kind: ComicBubble["kind"]): boolean {
  return !NO_TAIL.has(kind);
}

export function resolveBubbleLayout(bubbles: ComicBubble[]): ResolvedBubble[] {
  let speechIdx = 0;
  let thoughtIdx = 0;
  let sfxIdx = 0;
  let captionBand = 10;

  return bubbles.map((b) => {
    if (BANNER_KINDS.has(b.kind)) {
      const y = b.y ?? captionBand;
      captionBand = Math.min(36, captionBand + 12);
      return {
        ...b,
        x: clamp(b.x ?? 50, 8, 92),
        y: clamp(y, 6, 40),
        tail: b.tail ?? "down",
        maxWidthPct: b.kind === "caption" ? 88 : 82,
      };
    }

    if (SFX_KINDS.has(b.kind)) {
      const slot = SFX_SLOTS[sfxIdx % SFX_SLOTS.length]!;
      sfxIdx += 1;
      const fromAnchor = b.anchor ? ANCHOR_MAP[b.anchor] : null;
      return {
        ...b,
        x: clamp(b.x ?? fromAnchor?.x ?? slot.x, 10, 90),
        y: clamp(b.y ?? fromAnchor?.y ?? slot.y, 20, 85),
        tail: b.tail ?? fromAnchor?.tail ?? slot.tail,
        maxWidthPct: 70,
      };
    }

    if (b.kind === "magic") {
      const fromAnchor = b.anchor ? ANCHOR_MAP[b.anchor] : null;
      return {
        ...b,
        x: clamp(b.x ?? fromAnchor?.x ?? 50, 12, 88),
        y: clamp(b.y ?? fromAnchor?.y ?? 36, 14, 70),
        tail: b.tail ?? "down",
        maxWidthPct: 56,
      };
    }

    const fromAnchor = b.anchor ? ANCHOR_MAP[b.anchor] : null;
    const lane = speakerLane(b.speaker);
    const thoughtLike = THOUGHT_LIKE.has(b.kind);
    const pool = thoughtLike ? THOUGHT_SLOTS : SPEECH_SLOTS;
    const idx = thoughtLike ? thoughtIdx++ : speechIdx++;
    const base = pool[idx % pool.length]!;
    const laneX = thoughtLike ? base.x : lane === 0 ? Math.min(base.x, 36) : Math.max(base.x, 64);
    const autoTail: ComicBubbleTail = thoughtLike
      ? base.tail
      : lane === 0
        ? idx % 2 === 0
          ? "down"
          : "down-right"
        : idx % 2 === 0
          ? "down"
          : "down-left";

    const width =
      b.kind === "shout" ? 52 : b.kind === "whisper" ? 38 : b.kind === "creature" ? 40 : thoughtLike ? 42 : 44;

    return {
      ...b,
      x: clamp(b.x ?? fromAnchor?.x ?? laneX, 12, 88),
      y: clamp(b.y ?? fromAnchor?.y ?? base.y, 14, 82),
      tail: b.tail ?? fromAnchor?.tail ?? autoTail,
      maxWidthPct: width,
    };
  });
}
