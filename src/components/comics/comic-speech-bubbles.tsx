"use client";

import type { ComicBubble } from "@/content/comics/types";
import { resolveBubbleLayout, type ResolvedBubble } from "@/lib/comics/bubble-layout";
import { cn } from "@/lib/utils/cn";

type Props = {
  bubbles: ComicBubble[];
  parchment?: boolean;
};

function Tail({ bubble }: { bubble: ResolvedBubble }) {
  if (bubble.kind === "narration" || bubble.kind === "caption" || bubble.kind === "sfx") {
    return null;
  }

  const thought = bubble.kind === "thought";
  const dir = bubble.tail;

  // CSS triangle / thought dots aimed toward the mouth
  if (thought) {
    const offset =
      dir.includes("left") ? "right-3" : dir.includes("right") ? "left-3" : "left-1/2 -translate-x-1/2";
    const vertical = dir.startsWith("up") ? "bottom-full mb-0.5" : "top-full mt-0.5";
    return (
      <span className={cn("pointer-events-none absolute flex flex-col items-center gap-0.5", offset, vertical)} aria-hidden>
        <span className="h-2 w-2 rounded-full bg-[rgba(255,252,245,0.92)] border border-[rgba(42,33,24,0.28)]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[rgba(255,252,245,0.85)] border border-[rgba(42,33,24,0.22)]" />
        <span className="h-1 w-1 rounded-full bg-[rgba(255,252,245,0.75)]" />
      </span>
    );
  }

  const tailClass: Record<string, string> = {
    down: "top-full left-1/2 -translate-x-1/2 border-l-[9px] border-r-[9px] border-t-[12px] border-l-transparent border-r-transparent border-t-[rgba(255,252,245,0.95)]",
    up: "bottom-full left-1/2 -translate-x-1/2 border-l-[9px] border-r-[9px] border-b-[12px] border-l-transparent border-r-transparent border-b-[rgba(255,252,245,0.95)]",
    left: "right-full top-1/2 -translate-y-1/2 border-t-[9px] border-b-[9px] border-r-[12px] border-t-transparent border-b-transparent border-r-[rgba(255,252,245,0.95)]",
    right: "left-full top-1/2 -translate-y-1/2 border-t-[9px] border-b-[9px] border-l-[12px] border-t-transparent border-b-transparent border-l-[rgba(255,252,245,0.95)]",
    "down-left": "top-full left-[28%] border-l-[7px] border-r-[11px] border-t-[13px] border-l-transparent border-r-transparent border-t-[rgba(255,252,245,0.95)] -rotate-[18deg]",
    "down-right": "top-full right-[28%] left-auto border-l-[11px] border-r-[7px] border-t-[13px] border-l-transparent border-r-transparent border-t-[rgba(255,252,245,0.95)] rotate-[18deg]",
    "up-left": "bottom-full left-[28%] border-l-[7px] border-r-[11px] border-b-[13px] border-l-transparent border-r-transparent border-b-[rgba(255,252,245,0.95)] rotate-[18deg]",
    "up-right": "bottom-full right-[28%] left-auto border-l-[11px] border-r-[7px] border-b-[13px] border-l-transparent border-r-transparent border-b-[rgba(255,252,245,0.95)] -rotate-[18deg]",
  };

  return (
    <span
      className={cn("pointer-events-none absolute h-0 w-0 drop-shadow-sm", tailClass[dir] ?? tailClass.down)}
      aria-hidden
    />
  );
}

function BubbleCard({ bubble, parchment }: { bubble: ResolvedBubble; parchment: boolean }) {
  if (bubble.kind === "sfx") {
    return (
      <p
        className={cn(
          "comic-sfx pointer-events-none select-none text-center font-display text-[clamp(0.85rem,2.2vw,1.35rem)] font-bold uppercase tracking-[0.14em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]",
          parchment ? "text-[#ffb84d]" : "text-[var(--amber)]",
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
        )}
      >
        {bubble.text}
      </div>
    );
  }

  const thought = bubble.kind === "thought";

  return (
    <div
      className={cn(
        "comic-speech-bubble relative px-2.5 py-1.5 text-[clamp(0.68rem,1.55vw,0.82rem)] leading-snug shadow-[0_4px_14px_rgba(0,0,0,0.35)]",
        thought ? "rounded-[1.35rem] border-dashed" : "rounded-[1.1rem]",
        parchment
          ? "border border-[rgba(42,33,24,0.35)] bg-[rgba(255,252,245,0.95)] text-[#2a2118]"
          : "border border-[rgba(255,255,255,0.2)] bg-[rgba(255,252,245,0.94)] text-[#1a1510]",
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
        </p>
      )}
      <p className="font-[family-name:var(--font-body)]">{bubble.text}</p>
      <Tail bubble={bubble} />
    </div>
  );
}

export function ComicSpeechBubbles({ bubbles, parchment = true }: Props) {
  const laidOut = resolveBubbleLayout(bubbles);

  return (
    <div className="comic-bubble-layer pointer-events-none absolute inset-0 z-[5]">
      {laidOut.map((b, i) => (
        <div
          key={`${b.kind}-${i}-${b.text.slice(0, 12)}`}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.maxWidthPct}%`,
            maxWidth: b.kind === "sfx" ? "70%" : undefined,
          }}
        >
          <BubbleCard bubble={b} parchment={parchment} />
        </div>
      ))}
    </div>
  );
}
