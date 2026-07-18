"use client";

import { useEffect, useState } from "react";

type Props = {
  claim: {
    label: string;
    rarity: string;
    kind: string;
    creditsAmount?: number;
    loyaltyTokens?: number;
    assetId?: string;
    source: string;
  };
  onClose: () => void;
  onShare: () => void;
};

export function ClaimScreen({ claim, onClose, onShare }: Props) {
  const [phase, setPhase] = useState<"reveal" | "idle">("reveal");

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("idle"), 900);
    return () => window.clearTimeout(t);
  }, [claim.label]);

  return (
    <div
      className="panel relative overflow-hidden p-6"
      role="dialog"
      aria-label="Reward claim"
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--amber)]/20 via-transparent to-[var(--emerald)]/10 transition-opacity duration-700 ${
          phase === "reveal" ? "opacity-100" : "opacity-40"
        }`}
      />
      <p className="page-kicker">Claimed</p>
      <h2
        className={`font-display text-2xl text-white transition-transform duration-700 ${
          phase === "reveal" ? "scale-105" : "scale-100"
        }`}
      >
        {claim.label}
      </h2>
      <p className="mt-1 text-sm text-[var(--amber)]">
        {claim.rarity} · {claim.kind} · {claim.source}
      </p>
      <ul className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
        {claim.creditsAmount ? <li>+{claim.creditsAmount} Credits</li> : null}
        {claim.loyaltyTokens ? <li>+{claim.loyaltyTokens} Loyalty Tokens</li> : null}
        {claim.assetId ? <li>Unlock: {claim.assetId}</li> : null}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-primary focus-ring text-sm" onClick={onClose}>
          Collect
        </button>
        <button type="button" className="btn-secondary focus-ring text-sm" onClick={onShare}>
          Share (opt-in)
        </button>
      </div>
    </div>
  );
}
