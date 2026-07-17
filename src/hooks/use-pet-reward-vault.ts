"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CelebrationStyle,
  PetRewardVaultView,
  VaultRealtimeEvent,
  VerifiedFundingRecord,
} from "@/lib/rewards/types";
import { playSfx } from "@/lib/audio/sfx";

export type DisplayEstimates = {
  estimatedPendingSol: string;
  estimatedPendingLamports: string;
  claimableSol: string;
  claimableLamports: string;
  /** True while Estimated is animating up from a verified deposit. */
  estimatedAnimating: boolean;
  celebration: CelebrationStyle | null;
  largeDepositPulse: boolean;
};

const ANIM_MS_MIN = 400;
const ANIM_MS_MAX = 600;

function animDurationMs() {
  return ANIM_MS_MIN + Math.floor(Math.random() * (ANIM_MS_MAX - ANIM_MS_MIN + 1));
}

export function usePetRewardVault(publicPetId: string) {
  const [vault, setVault] = useState<PetRewardVaultView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [display, setDisplay] = useState<DisplayEstimates>({
    estimatedPendingSol: "0",
    estimatedPendingLamports: "0",
    claimableSol: "0",
    claimableLamports: "0",
    estimatedAnimating: false,
    celebration: null,
    largeDepositPulse: false,
  });

  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyVault = useCallback((next: PetRewardVaultView, opts?: { animateEstimate?: boolean }) => {
    setVault(next);
    if (opts?.animateEstimate) {
      setDisplay((prev) => ({
        ...prev,
        estimatedAnimating: true,
        estimatedPendingLamports: next.estimatedPendingLamports,
        estimatedPendingSol: next.estimatedPendingSol,
        claimableLamports: next.claimableLamports,
        claimableSol: next.claimableSol,
      }));
      if (animTimer.current) clearTimeout(animTimer.current);
      animTimer.current = setTimeout(() => {
        setDisplay((prev) => ({ ...prev, estimatedAnimating: false }));
      }, animDurationMs());
    } else {
      setDisplay((prev) => ({
        ...prev,
        estimatedPendingLamports: next.estimatedPendingLamports,
        estimatedPendingSol: next.estimatedPendingSol,
        claimableLamports: next.claimableLamports,
        claimableSol: next.claimableSol,
        estimatedAnimating: false,
      }));
    }
  }, []);

  const load = useCallback(async () => {
    const res = await fetch(`/api/pets/${publicPetId}/rewards`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load reward vault");
      setVault(null);
    } else {
      setError(null);
      applyVault(data.vault as PetRewardVaultView);
    }
    setLoading(false);
  }, [publicPetId, applyVault]);

  useEffect(() => {
    void load();
  }, [load]);

  // SSE — reconnect restores from server snapshot (no client math).
  useEffect(() => {
    let es: EventSource | null = null;
    let closed = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closed) return;
      es = new EventSource(`/api/pets/${publicPetId}/rewards/stream`);
      es.onopen = () => setConnected(true);
      es.onerror = () => {
        setConnected(false);
        es?.close();
        if (!closed) {
          retryTimer = setTimeout(() => {
            void load().then(connect);
          }, 2000);
        }
      };
      es.onmessage = (msg) => {
        let event: VaultRealtimeEvent | { type: string };
        try {
          event = JSON.parse(msg.data) as VaultRealtimeEvent | { type: string };
        } catch {
          return;
        }

        if (event.type === "connected") {
          setConnected(true);
          return;
        }

        if (event.type === "rewardEstimateUpdated") {
          const e = event as Extract<VaultRealtimeEvent, { type: "rewardEstimateUpdated" }>;
          if (!e.fromVerifiedDeposit) return;
          playSfx("rewards.estimate_tick");
          const sol = formatSolFromLamportsString(e.estimatedPendingLamports);
          setVault((prev) =>
            prev
              ? {
                  ...prev,
                  estimatedPendingLamports: e.estimatedPendingLamports,
                  estimatedPendingSol: sol,
                }
              : prev,
          );
          setDisplay((prev) => ({
            ...prev,
            estimatedAnimating: true,
            estimatedPendingLamports: e.estimatedPendingLamports,
            estimatedPendingSol: sol,
          }));
          if (animTimer.current) clearTimeout(animTimer.current);
          animTimer.current = setTimeout(() => {
            setDisplay((prev) => ({ ...prev, estimatedAnimating: false }));
          }, animDurationMs());
          return;
        }

        if (event.type === "newFundingTransaction") {
          const e = event as Extract<VaultRealtimeEvent, { type: "newFundingTransaction" }>;
          setVault((prev) => {
            if (!prev) return prev;
            const recent: VerifiedFundingRecord[] = [e.funding, ...prev.recentFunding].slice(0, 12);
            const pool = (
              BigInt(prev.currentRewardPoolLamports) + BigInt(e.funding.amountLamports)
            ).toString();
            const large = BigInt(e.funding.amountLamports) >= 10_000_000n; // ≥ 0.01 SOL vault slice
            if (large) {
              setDisplay((d) => ({ ...d, largeDepositPulse: true }));
              if (pulseTimer.current) clearTimeout(pulseTimer.current);
              pulseTimer.current = setTimeout(() => {
                setDisplay((d) => ({ ...d, largeDepositPulse: false }));
              }, 1600);
            }
            return {
              ...prev,
              recentFunding: recent,
              currentRewardPoolLamports: pool,
              currentRewardPoolSol: formatSolFromLamportsString(pool),
              currentEpoch: { ...prev.currentEpoch, poolLamports: pool },
            };
          });
          return;
        }

        if (event.type === "rewardPoolUpdated" || event.type === "epochClosed" || event.type === "petEligibilityChanged") {
          void load();
          return;
        }

        if (event.type === "claimCompleted") {
          const e = event as Extract<VaultRealtimeEvent, { type: "claimCompleted" }>;
          setDisplay((d) => ({ ...d, celebration: e.celebrationStyle }));
          if (celebTimer.current) clearTimeout(celebTimer.current);
          celebTimer.current = setTimeout(() => {
            setDisplay((d) => ({ ...d, celebration: null }));
          }, 2200);
          void load();
        }
      };
    };

    connect();

    return () => {
      closed = true;
      setConnected(false);
      es?.close();
      if (retryTimer) clearTimeout(retryTimer);
      if (animTimer.current) clearTimeout(animTimer.current);
      if (celebTimer.current) clearTimeout(celebTimer.current);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, [publicPetId, load, applyVault]);

  const claim = useCallback(async () => {
    const res = await fetch(`/api/pets/${publicPetId}/rewards/claim`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      playSfx("ui.error");
      setError(data.message ?? data.error ?? "Claim failed");
      return { ok: false as const, error: data.error as string };
    }
    playSfx("rewards.claim");
    if (data.vault) applyVault(data.vault as PetRewardVaultView);
    setDisplay((d) => ({
      ...d,
      celebration: (data.celebrationStyle as CelebrationStyle) ?? "sparkle-burst",
      claimableLamports: "0",
      claimableSol: "0",
    }));
    if (celebTimer.current) clearTimeout(celebTimer.current);
    celebTimer.current = setTimeout(() => {
      setDisplay((d) => ({ ...d, celebration: null }));
    }, 2200);
    return { ok: true as const, celebrationStyle: data.celebrationStyle as CelebrationStyle };
  }, [publicPetId, applyVault]);

  const toggleSelection = useCallback(
    async (selected: boolean) => {
      const res = await fetch(`/api/pets/${publicPetId}/rewards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "select", selected }),
      });
      const data = await res.json();
      if (res.ok && data.vault) applyVault(data.vault as PetRewardVaultView);
    },
    [publicPetId, applyVault],
  );

  return {
    vault,
    display,
    loading,
    error,
    connected,
    reload: load,
    claim,
    toggleSelection,
  };
}

/** Display helper — server still owns the value; this only formats for UI. */
function formatSolFromLamportsString(lamports: string): string {
  try {
    const n = BigInt(lamports);
    const whole = n / 1_000_000_000n;
    const frac = n % 1_000_000_000n;
    const fracStr = frac.toString().padStart(9, "0").replace(/0+$/, "");
    return fracStr ? `${whole}.${fracStr}` : `${whole}`;
  } catch {
    return "0";
  }
}
