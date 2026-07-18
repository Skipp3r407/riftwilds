"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SocialPresenceSnapshot } from "@/lib/social-presence/types";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

type FeaturedSlot = {
  title: string;
  displayName: string;
  regionSlug: string;
  score: number;
};

export function useSocialPresence(opts?: {
  enabled?: boolean;
  regionSlug?: string | null;
  locationId?: string | null;
  restZoneKind?: string | null;
}) {
  const enabled =
    (opts?.enabled ?? true) && featureFlagDefaults.SOCIAL_PRESENCE_ENABLED;
  const [snapshot, setSnapshot] = useState<SocialPresenceSnapshot | null>(null);
  const [featured, setFeatured] = useState<FeaturedSlot[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const lastSignalRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch("/api/social-presence/status");
      const json = (await res.json()) as { snapshot?: SocialPresenceSnapshot };
      setSnapshot(json.snapshot ?? null);
    } catch {
      /* ignore */
    }
  }, [enabled]);

  const refreshFeatured = useCallback(async () => {
    if (!enabled || !featureFlagDefaults.TOWN_FEATURED_PLAYER_ENABLED) return;
    try {
      const res = await fetch("/api/social-presence/featured");
      const json = (await res.json()) as {
        featured?: FeaturedSlot[];
      };
      setFeatured(json.featured ?? []);
    } catch {
      /* ignore */
    }
  }, [enabled]);

  const heartbeat = useCallback(
    async (signals: string[], genuineDeltaMs = 0) => {
      if (!enabled) return;
      try {
        await fetch("/api/social-presence/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            signals,
            regionSlug: opts?.regionSlug ?? "riftwild-commons",
            locationId: opts?.locationId ?? "commons-plaza",
            restZoneKind: opts?.restZoneKind ?? "town_plaza",
            genuineDeltaMs,
          }),
        });
        lastSignalRef.current = Date.now();
      } catch {
        /* ignore */
      }
    },
    [enabled, opts?.locationId, opts?.regionSlug, opts?.restZoneKind],
  );

  const recordAction = useCallback(
    async (kind: string, signal = "INTERACT") => {
      if (!enabled) return null;
      try {
        await heartbeat([signal, "UI"], 5_000);
        const res = await fetch("/api/social-presence/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            signal,
            regionSlug: opts?.regionSlug ?? "riftwild-commons",
            locationId: opts?.locationId ?? "commons-plaza",
            restZoneKind: opts?.restZoneKind ?? "town_plaza",
          }),
        });
        const json = (await res.json()) as {
          ok?: boolean;
          message?: string;
          xp?: number;
          featuredTitle?: string | null;
        };
        if (json.ok && json.message) {
          setToast(json.message);
          window.setTimeout(() => setToast(null), 2800);
        }
        if (json.featuredTitle) {
          setToast(`${json.featuredTitle} — cosmetic title this hour`);
          window.setTimeout(() => setToast(null), 3500);
        }
        await refresh();
        await refreshFeatured();
        return json;
      } catch {
        return null;
      }
    },
    [enabled, heartbeat, opts?.locationId, opts?.regionSlug, opts?.restZoneKind, refresh, refreshFeatured],
  );

  const claimIdle = useCallback(async () => {
    if (!enabled) return;
    try {
      const res = await fetch("/api/social-presence/claim-idle", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      if (json.message) {
        setToast(json.message);
        window.setTimeout(() => setToast(null), 3200);
      }
      await refresh();
    } catch {
      /* ignore */
    }
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    void refreshFeatured();
    void heartbeat(["UI"], 0);
    const pulse = window.setInterval(() => {
      const age = Date.now() - lastSignalRef.current;
      // Only count genuine time when recently engaged client-side
      void heartbeat(age < 90_000 ? ["UI"] : [], age < 90_000 ? 15_000 : 0);
      void refresh();
    }, 15_000);
    return () => window.clearInterval(pulse);
  }, [enabled, heartbeat, refresh, refreshFeatured]);

  useEffect(() => {
    if (!enabled) return;
    const onKey = () => {
      void heartbeat(["MOVE"], 2_000);
    };
    const onPointer = () => {
      void heartbeat(["UI", "CAMERA"], 1_000);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [enabled, heartbeat]);

  return {
    enabled,
    snapshot,
    featured,
    toast,
    refresh,
    heartbeat,
    recordAction,
    claimIdle,
  };
}
