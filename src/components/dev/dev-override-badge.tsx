"use client";

import { useEffect, useState } from "react";
import { isDevOverrideUiEnabled } from "@/lib/auth/dev-override";

/**
 * Corner badge — only mounts outside production when override/dev is active.
 * Stripped from production UX by NODE_ENV + UI gate.
 */
export function DevOverrideBadge() {
  const enabled = isDevOverrideUiEnabled();
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void fetch("/api/auth/session")
      .then((r) => r.json())
      .then((json: { session?: { developer?: boolean; userId?: string } | null }) => {
        if (cancelled) return;
        setSessionActive(
          json?.session?.developer === true ||
            json?.session?.userId === "dev-keeper-local",
        );
      })
      .catch(() => {
        if (!cancelled) setSessionActive(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-3 z-[9998] select-none rounded-md border border-[rgba(255,160,40,0.55)] bg-[rgba(28,16,4,0.92)] px-2.5 py-1.5 font-display text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[rgb(255,176,72)] shadow-[0_0_0_1px_rgba(0,0,0,0.35)] backdrop-blur-sm md:bottom-4 md:left-4"
      role="status"
      aria-label="Development mode active"
    >
      <span aria-hidden>🟠 </span>
      {sessionActive
        ? "DEVELOPMENT MODE · DEV OVERRIDE ACTIVE"
        : "DEVELOPMENT MODE"}
    </div>
  );
}
