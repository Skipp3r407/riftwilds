"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

type SummaryPayload = {
  badgeCount?: number;
  summary?: {
    unreadMessages: number;
    pendingIncomingRequests: number;
  };
};

/** Compact unread + request badge — poll lightly for nav / header peek. */
export function SocialNavBadge({ className }: { className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!featureFlagDefaults.FRIENDS_AND_PM_ENABLED) return;
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/social/summary");
        const data = (await res.json()) as SummaryPayload;
        if (cancelled) return;
        const next =
          data.badgeCount ??
          (data.summary?.unreadMessages ?? 0) + (data.summary?.pendingIncomingRequests ?? 0);
        setCount(next);
      } catch {
        /* ignore transient */
      }
    }

    void tick();
    const id = window.setInterval(tick, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (count <= 0) {
    return (
      <Link href="/social" className={`btn-secondary focus-ring text-sm ${className ?? ""}`}>
        Social
      </Link>
    );
  }

  return (
    <Link
      href="/social?tab=messages"
      className={`btn-secondary focus-ring relative text-sm ${className ?? ""}`}
      title={`${count} unread social items`}
    >
      Social
      <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--amber)] px-1 text-[10px] font-medium text-black">
        {count > 9 ? "9+" : count}
      </span>
    </Link>
  );
}

/** Inline badge count for sidebar nav labels. */
export function useSocialBadgeCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!featureFlagDefaults.FRIENDS_AND_PM_ENABLED) return;
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/social/summary");
        const data = (await res.json()) as SummaryPayload;
        if (!cancelled) {
          setCount(
            data.badgeCount ??
              (data.summary?.unreadMessages ?? 0) + (data.summary?.pendingIncomingRequests ?? 0),
          );
        }
      } catch {
        /* ignore */
      }
    }

    void tick();
    const id = window.setInterval(tick, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return count;
}
