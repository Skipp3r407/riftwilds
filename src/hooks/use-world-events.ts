"use client";

import { useCallback, useEffect, useState } from "react";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import type { WorldEventPlayerView } from "@/lib/world-events/types";

export function useWorldEvents(opts?: { enabled?: boolean; pollMs?: number }) {
  const enabled =
    (opts?.enabled ?? true) && featureFlagDefaults.LIVE_WORLD_EVENTS_ENABLED;
  const [view, setView] = useState<WorldEventPlayerView | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch("/api/world-events");
      const json = (await res.json()) as { view?: WorldEventPlayerView };
      setView(json.view ?? null);
    } catch {
      /* ignore */
    }
  }, [enabled]);

  const participate = useCallback(
    async (
      participationAction: string,
      signals: string[] = ["MOVE", "INTERACT"],
    ) => {
      if (!enabled) return null;
      try {
        const res = await fetch("/api/world-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "participate",
            participationAction,
            signals,
          }),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          message?: string;
          view?: WorldEventPlayerView;
        };
        if (json.view) setView(json.view);
        if (json.message) {
          setToast(json.message);
          window.setTimeout(() => setToast(null), 2800);
        }
        return json;
      } catch {
        return null;
      }
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), opts?.pollMs ?? 20_000);
    return () => window.clearInterval(id);
  }, [enabled, opts?.pollMs, refresh]);

  return { enabled, view, toast, refresh, participate };
}
