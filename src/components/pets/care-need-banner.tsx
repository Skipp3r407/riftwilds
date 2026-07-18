"use client";

import type { NeedMessage } from "@/game/creatures/care-catalog";

export function CareNeedBanner({ message }: { message: NeedMessage | null }) {
  if (!message) return null;
  return (
    <div
      className="panel-inset border-[rgba(61,231,255,0.25)] px-3 py-2.5 text-sm text-white"
      role="status"
      aria-live="polite"
    >
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
        Companion note
      </p>
      <p className="mt-1 leading-relaxed">{message.text}</p>
    </div>
  );
}
