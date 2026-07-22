"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { StatusChip } from "@/components/shared/page-header";
import { formatSol } from "@/game/rift-stakes/config";

type Fee = {
  stakePerPlayerLamports: number;
  prizePoolLamports: number;
  platformFeeLamports: number;
  feePercentDisplay: string;
  winnerReceivesLamports: number;
  estimatedNetworkFeeLamports: number;
};

type MatchPayload = {
  match: {
    id: string;
    publicId: string;
    status: string;
    hostDisplayName: string;
    guestDisplayName: string | null;
    winnerOwnerKey: string | null;
    demoMode: boolean;
  };
  escrow: {
    phase: string;
    hostDeposited: boolean;
    guestDeposited: boolean;
    onChainTxIds: string[];
    demoMode: boolean;
  } | null;
  fee: Fee | null;
};

export function RiftStakesMatchPanel() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const [data, setData] = useState<MatchPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/rift-stakes/match?id=${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "LOAD_FAILED");
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "LOAD_FAILED");
    }
  }, [id]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 4000);
    return () => clearInterval(t);
  }, [load]);

  async function act(action: "deposit" | "refund" | "forfeit_demo") {
    if (!id) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/rift-stakes/match", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          matchId: id,
          claimSelfWinDemo: action === "forfeit_demo",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "ACTION_FAILED");
      setMsg(action === "forfeit_demo" ? "DEMO win settled" : action);
      void load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ACTION_FAILED");
    } finally {
      setBusy(false);
    }
  }

  if (!id) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Missing match id.{" "}
        <Link href="/tcg/battle?mode=stakes" className="underline">
          Back to lobby
        </Link>
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-rose-300">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-[var(--text-muted)]">Loading match…</p>;
  }

  const { match, escrow, fee } = data;
  const done = match.status === "COMPLETED" || match.status === "REFUNDED";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <StatusChip tone="warn">Optional · Real SOL</StatusChip>
        <StatusChip tone="info">Room {match.publicId}</StatusChip>
        <StatusChip tone={match.demoMode ? "info" : "live"}>
          {match.demoMode ? "DEMO" : "LIVE"}
        </StatusChip>
        <StatusChip tone="default">{match.status}</StatusChip>
        {escrow && <StatusChip tone="default">Escrow {escrow.phase}</StatusChip>}
      </div>

      <p className="text-sm text-[var(--text-muted)]">
        {match.hostDisplayName} vs {match.guestDisplayName ?? "…waiting"}
      </p>

      {fee && (
        <dl className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2">
          {(
            [
              ["Stake each", formatSol(fee.stakePerPlayerLamports)],
              ["Prize pool", formatSol(fee.prizePoolLamports)],
              ["Platform fee", `${fee.feePercentDisplay} · ${formatSol(fee.platformFeeLamports)}`],
              ["Winner receives", formatSol(fee.winnerReceivesLamports)],
              ["Est. network", formatSol(fee.estimatedNetworkFeeLamports, 6)],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 text-sm">
              <dt className="text-[var(--text-muted)]">{k}</dt>
              <dd className="tabular-nums">{v} SOL</dd>
            </div>
          ))}
        </dl>
      )}

      {escrow && (
        <div className="rounded-xl border border-[var(--border)] p-4 text-sm">
          <p>
            Deposits — host: {escrow.hostDeposited ? "yes" : "no"} · guest:{" "}
            {escrow.guestDeposited ? "yes" : "no"}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Tx stubs: {escrow.onChainTxIds.slice(-4).join(", ") || "none yet"}
          </p>
        </div>
      )}

      {!done && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary focus-ring text-sm"
            disabled={busy}
            onClick={() => void act("deposit")}
          >
            Deposit stake (DEMO)
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={busy}
            onClick={() => void act("forfeit_demo")}
          >
            DEMO: claim win / settle
          </button>
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            disabled={busy}
            onClick={() => void act("refund")}
          >
            Cancel / refund (no fee)
          </button>
        </div>
      )}

      {match.status === "COMPLETED" && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5">
          <h3 className="text-lg font-semibold text-emerald-100">Victory settled</h3>
          <p className="mt-2 text-sm text-emerald-100/80">
            Winner receives {fee ? `${formatSol(fee.winnerReceivesLamports)} SOL` : "—"}.
            Platform fee transferred to treasury (DEMO ledger).
          </p>
        </div>
      )}

      {match.status === "REFUNDED" && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-5">
          <h3 className="text-lg font-semibold text-amber-100">Refunded</h3>
          <p className="mt-2 text-sm text-amber-100/80">
            No platform fee charged on cancel/refund.
          </p>
        </div>
      )}

      {msg && <p className="text-sm text-amber-100/90">{msg}</p>}

      <Link href="/tcg/battle?mode=stakes" className="text-sm text-[var(--accent)] underline">
        Back to lobby
      </Link>
    </div>
  );
}
