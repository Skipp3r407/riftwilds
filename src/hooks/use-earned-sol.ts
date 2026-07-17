"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EARNED_SOL_STORAGE_KEY,
  PLAY_REWARD_LAMPORTS,
  createStarterEarnedSolState,
  creditEarnedSol,
  formatEarnedSol,
  parseEarnedSolLamports,
  serializeEarnedSolState,
} from "@/lib/shop/earned-sol";

export function useEarnedSol() {
  const [lamports, setLamports] = useState<bigint | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EARNED_SOL_STORAGE_KEY);
      if (!raw) {
        const starter = createStarterEarnedSolState();
        localStorage.setItem(EARNED_SOL_STORAGE_KEY, JSON.stringify(starter));
        setLamports(BigInt(starter.lamports));
      } else {
        setLamports(parseEarnedSolLamports(raw));
      }
    } catch {
      setLamports(parseEarnedSolLamports(null));
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: bigint) => {
    setLamports(next);
    try {
      localStorage.setItem(EARNED_SOL_STORAGE_KEY, serializeEarnedSolState(next));
    } catch {
      /* ignore quota */
    }
  }, []);

  const setBalance = useCallback(
    (next: bigint) => {
      persist(next < 0n ? 0n : next);
    },
    [persist],
  );

  const claimPlayReward = useCallback(() => {
    setLamports((prev) => {
      const base = prev ?? 0n;
      const next = creditEarnedSol(base, PLAY_REWARD_LAMPORTS);
      try {
        localStorage.setItem(EARNED_SOL_STORAGE_KEY, serializeEarnedSolState(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return {
    ready,
    lamports: lamports ?? 0n,
    solLabel: formatEarnedSol(lamports ?? 0n),
    setBalance,
    claimPlayReward,
    playRewardSol: formatEarnedSol(PLAY_REWARD_LAMPORTS),
  };
}
