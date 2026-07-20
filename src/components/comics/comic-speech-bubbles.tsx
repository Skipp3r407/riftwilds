"use client";

import type { ComicBubble } from "@/content/comics/types";
import {
  bubbleHasTail,
  resolveBubbleLayout,
  type ResolvedBubble,
} from "@/lib/comics/bubble-layout";
import { cn } from "@/lib/utils/cn";

type Props = {
  bubbles: ComicBubble[];
  parchment?: boolean;
  /** Highlight bubble index during guided reading */
  focusIndex?: number | null;
};

function Tail({ bubble }: { bubble: ResolvedBubble }) {
  if (!bubbleHasTail(bubble.kind)) return null;

  const thought = bubble.kind === "thought" || bubble.kind === "telepathy";
  const dir = bubble.tail;

  if (thought || bubble.kind === "whisper") {
    const offset =
      dir.includes("left") ? "right-3" : dir.includes("right") ? "left-3" : "left-1/2 -translate-x-1/2";
    const vertical = dir.startsWith("up") ? "bottom-full mb-0.5" : "top-full mt-0.5";
    return (
      <span
        className={cn("pointer-events-none absolute flex flex-col items-center gap-0.5", offset, vertical)}
        aria-hidden
      >
        <span className="h-2 w-2 rounded-full border border-[rgba(42,33,24,0.28)] bg-[rgba(255,252,245,0.92)]" />
        <span className="h-1.5 w-1.5 rounded-full border border-[rgba(42,33,24,0.22)] bg-[rgba(255,252,245,0.85)]" />
        <span className="h-1 w-1 rounded-full bg-[rgba(255,252,245,0.75)]" />
      </span>
    );
  }

  const fill =
    bubble.kind === "shout"
      ? "border-t-[rgba(255,184,77,0.95)]"
      : bubble.kind === "creature"
        ? "border-t-[rgba(122,201,140,0.95)]"
        : "border-t-[rgba(255,252,245,0.95)]";
  const fillUp =
    bubble.kind === "shout"
      ? "border-b-[rgba(255,184,77,0.95)]"
      : bubble.kind === "creature"
        ? "border-b-[rgba(122,201,140,0.95)]"
        : "border-b-[rgba(255,252,245,0.95)]";
  const fillRight =
    bubble.kind === "shout"
      ? "border-r-[rgba(255,184,77,0.95)]"
      : bubble.kind === "creature"
        ? "border-r-[rgba(122,201,140,0.95)]"
        : "border-r-[rgba(255,252,245,0.95)]";
  const fillLeft =
    bubble.kind === "shout"
      ? "border-l-[rgba(255,184,77,0.95)]"
      : bubble.kind === "creature"
        ? "border-l-[rgba(122,201,140,0.95)]"
        : "border-l-[rgba(255,252,245,0.95)]";

  const tailClass: Record<string, string> = {
    down: `top-full left-1/2 -translate-x-1/2 border-l-[9px] border-r-[9px] border-t-[12px] border-l-transparent border-r-transparent ${fill}`,
    up: `bottom-full left-1/2 -translate-x-1/2 border-l-[9px] border-r-[9px] border-b-[12px] border-l-transparent border-r-transparent ${fillUp}`,
    left: `right-full top-1/2 -translate-y-1/2 border-t-[9px] border-b-[9px] border-r-[12px] border-t-transparent border-b-transparent ${fillRight}`,
    right: `left-full top-1/2 -translate-y-1/2 border-t-[9px] border-b-[9px] border-l-[12px] border-t-transparent border-b-transparent ${fillLeft}`,
    "down-left": `top-full left-[28%] border-l-[7px] border-r-[11px] border-t-[13px] border-l-transparent border-r-transparent ${fill} -rotate-[18deg]`,
    "down-right": `top-full right-[28%] left-auto border-l-[11px] border-r-[7px] border-t-[13px] border-l-transparent border-r-transparent ${fill} rotate-[18deg]`,
    "up-left": `bottom-full left-[28%] border-l-[7px] border-r-[11px] border-b-[13px] border-l-transparent border-r-transparent ${fillUp} rotate-[18deg]`,
    "up-right": `bottom-full right-[28%] left-auto border-l-[11px] border-r-[7px] border-b-[13px] border-l-transparent border-r-transparent ${fillUp} -rotate-[18deg]`,
  };

  return (
    <span
      className={cn("pointer-events-none absolute h-0 w-0 drop-shadow-sm", tailClass[dir] ?? tailClass.down)}
      aria-hidden
    />
  );
}

function BubbleCard({
  bubble,
  parchment,
  dimmed,
}: {
  bubble: ResolvedBubble;
  parchment: boolean;
  dimmed?: boolean;
}) {
  if (bubble.kind === "sfx") {
    return (
      <p
        className={cn(
          "comic-sfx pointer-events-none select-none text-center font-display text-[clamp(0.85rem,2.2vw,1.35rem)] font-bold uppercase tracking-[0.14em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]",
          parchment ? "text-[#ffb84d]" : "text-[var(--amber)]",
          dimmed && "opacity-35",
        )}
      >
        {bubble.text}
      </p>
    );
  }

  if (bubble.kind === "narration" || bubble.kind === "caption") {
    return (
      <div
        className={cn(
          "comic-caption rounded-sm border px-2.5 py-1.5 text-[clamp(0.7rem,1.6vw,0.85rem)] leading-snug shadow-md",
          bubble.kind === "narration" && "italic",
          parchment
            ? "border-[rgba(42,33,24,0.45)] bg-[rgba(20,14,10,0.78)] text-[#f5ead2]"
            : "border-[rgba(196,168,130,0.4)] bg-[rgba(10,24,40,0.82)] text-[var(--stone)]",
          dimmed && "opacity-35",
        )}
      >
        {bubble.text}
      </div>
    );
  }

  if (bubble.kind === "magic") {
    return (
      <div
        className={cn(
          "comic-magic-bubble rounded-md border px-2.5 py-1.5 text-center font-display text-[clamp(0.68rem,1.5vw,0.84rem)] tracking-wide shadow-md",
          parchment
            ? "border-[rgba(122,201,140,0.55)] bg-[rgba(18,40,28,0.82)] text-[#d8ffe8]"
            : "border-[rgba(61,231,255,0.45)] bg-[rgba(12,28,48,0.88)] text-[var(--cyan)]",
          dimmed && "opacity-35",
        )}
      >
        {bubble.speaker && (
          <p className="mb-0.5 text-[9px] uppercase tracking-[0.16em] opacity-80">{bubble.speaker}</p>
        )}
        <p>{bubble.text}</p>
      </div>
    );
  }

  const thought = bubble.kind === "thought" || bubble.kind === "telepathy";
  const shout = bubble.kind === "shout";
  const whisper = bubble.kind === "whisper";
  const creature = bubble.kind === "creature";

  return (
    <div
      className={cn(
        "comic-speech-bubble relative px-2.5 py-1.5 text-[clamp(0.68rem,1.55vw,0.82rem)] leading-snug shadow-[0_4px_14px_rgba(0,0,0,0.35)]",
        thought && "rounded-[1.35rem] border-dashed",
        shout && "rounded-md font-semibold uppercase tracking-wide",
        whisper && "rounded-[1.2rem] italic opacity-95",
        creature && "rounded-[1.4rem] border-dotted",
        !thought && !shout && !whisper && !creature && "rounded-[1.1rem]",
        parchment
          ? shout
            ? "border border-[rgba(180,90,30,0.55)] bg-[rgba(255,236,200,0.96)] text-[#3a2010]"
            : creature
              ? "border border-[rgba(60,120,70,0.5)] bg-[rgba(236,252,240,0.95)] text-[#1a2e1c]"
              : telepathyTone(bubble.kind, parchment)
          : shout
            ? "border border-[rgba(255,184,77,0.55)] bg-[rgba(40,24,10,0.9)] text-[#ffe6b0]"
            : "border border-[rgba(255,255,255,0.2)] bg-[rgba(255,252,245,0.94)] text-[#1a1510]",
        dimmed && "opacity-35",
      )}
    >
      {bubble.speaker && (
        <p
          className={cn(
            "mb-0.5 font-display text-[9px] uppercase tracking-[0.14em]",
            parchment ? "text-[#8b5a3c]" : "text-[#5c3d2e]",
          )}
        >
          {bubble.speaker}
          {bubble.kind === "telepathy" ? " · mind" : ""}
          {bubble.kind === "creature" ? " · creature" : ""}
        </p>
      )}
      <p className="font-[family-name:var(--font-body)]">{bubble.text}</p>
      <Tail bubble={bubble} />
    </div>
  );
}

function telepathyTone(kind: ComicBubble["kind"], parchment: boolean): string {
  if (kind === "telepathy") {
    return parchment
      ? "border border-[rgba(100,140,200,0.45)] bg-[rgba(230,240,255,0.94)] text-[#1a2438]"
      : "border border-[rgba(120,180,255,0.4)] bg-[rgba(20,28,48,0.9)] text-[#d0e4ff]";
  }
  return parchment
    ? "border border-[rgba(42,33,24,0.35)] bg-[rgba(255,252,245,0.95)] text-[#2a2118]"
    : "border border-[rgba(255,255,255,0.2)] bg-[rgba(255,252,245,0.94)] text-[#1a1510]";
}

export function ComicSpeechBubbles({ bubbles, parchment = true, focusIndex = null }: Props) {
  const laidOut = resolveBubbleLayout(bubbles);

  return (
    <div className="comic-bubble-layer pointer-events-none absolute inset-0 z-[5]">
      {laidOut.map((b, i) => (
        <div
          key={`${b.kind}-${i}-${b.text.slice(0, 12)}`}
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300",
            focusIndex != null && focusIndex === i && "z-10 scale-105",
          )}
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.maxWidthPct}%`,
            maxWidth: b.kind === "sfx" ? "70%" : undefined,
          }}
        >
          <BubbleCard
            bubble={b}
            parchment={parchment}
            dimmed={focusIndex != null && focusIndex !== i}
          />
        </div>
      ))}
    </div>
  );
}
