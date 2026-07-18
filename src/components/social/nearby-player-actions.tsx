"use client";

import Link from "next/link";
import { playSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Best-effort handle or display stub for deep links. */
  handleHint: string;
  label?: string;
  compact?: boolean;
};

/**
 * Live World nearby context actions — Add friend / Whisper / Invite.
 * Deep-links into /social until multiplayer supplies real peer owner keys.
 */
export function NearbyPlayerActions({ handleHint, label, compact }: Props) {
  const handle = handleHint.replace(/\s+/g, "_").toLowerCase().slice(0, 24) || "keeper";
  const whisperHref = `/social?tab=messages&with=${encodeURIComponent(handle)}`;
  const friendHref = `/social?tab=friends&add=${encodeURIComponent(handle)}`;

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1",
        compact ? "mt-0.5" : "mt-1",
      )}
      role="group"
      aria-label={`Actions for ${label ?? handle}`}
    >
      <Link
        href={friendHref}
        className="focus-ring rounded px-1.5 py-0.5 text-[9px] text-[var(--cyan)] hover:bg-[rgba(61,231,255,0.08)]"
        onClick={() => playSfx("ui.click")}
      >
        Add friend
      </Link>
      <Link
        href={whisperHref}
        className="focus-ring rounded px-1.5 py-0.5 text-[9px] text-[var(--cyan)] hover:bg-[rgba(61,231,255,0.08)]"
        onClick={() => playSfx("ui.click")}
      >
        Whisper
      </Link>
      <Link
        href={`/social?tab=friends&add=${encodeURIComponent(handle)}`}
        className="focus-ring rounded px-1.5 py-0.5 text-[9px] text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.04)]"
        title="Party invite stub — opens Social Hub"
        onClick={() => playSfx("ui.click")}
      >
        Invite
      </Link>
    </div>
  );
}
