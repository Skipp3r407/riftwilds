"use client";

import { useContext } from "react";
import { NakamaContext } from "@/components/nakama/nakama-provider";

export function useNakama() {
  const ctx = useContext(NakamaContext);
  if (!ctx) {
    throw new Error("useNakama must be used within NakamaProvider");
  }
  return ctx;
}

/** Soft hook — returns null outside provider (settings panels, optional widgets). */
export function useNakamaOptional() {
  return useContext(NakamaContext);
}
