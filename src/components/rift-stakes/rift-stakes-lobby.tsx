"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { StatusChip } from "@/components/shared/page-header";
import {
  StakeConfirmDialog,
  type ConfirmationNumbers,
} from "@/components/rift-stakes/stake-confirm-dialog";
import { formatSol, STAKE_TIER_THUMBNAILS } from "@/game/rift-stakes/config";
import type { StakeTierId } from "@/game/rift-stakes/types";
import { cn } from "@/lib/utils/cn";

type Tier = {
  id: string;
  label: string;
  stakeLamports: number;
  stakeSol: string;
  potSol: string;
  description: string;
  preview: ConfirmationNumbers;
};

type StatusPayload = {
  enabled: boolean;
  demoMode: boolean;
  label: string;
  disclosures: Record<string, string>;
  tiers: Tier[];
  fee: {
    defaultBps: number;
    currentBps: number;
    maxBps: number;
    sampleConfirmation: ConfirmationNumbers;
  };
  queueSize: number;
  admin: {
    stakesPaused: boolean;
    matchmakingPaused: boolean;
    feeBps: number;
  };
  routes: Record<string, string>;
};

export function RiftStakesLobby({
  hubEmbedded = false,
}: {
  /** When true, omit Free Practice / Free Arena exit links (Battle Hub owns those modes). */
  hubEmbedded?: boolean;
}) {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("standard");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationNumbers | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [matchLink, setMatchLink] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/rift-stakes/status", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "STATUS_FAILED");
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "STATUS_FAILED");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tier = data?.tiers.find((t) => t.id === selected);

  async function openConfirm() {
    if (!tier) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/rift-stakes/lobby", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stakeTierId: tier.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "PREVIEW_FAILED");
      setConfirmation(json.confirmation);
      setConfirmOpen(true);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "PREVIEW_FAILED");
    } finally {
      setBusy(false);
    }
  }

  async function confirmJoin() {
    if (!tier || !confirmation) return;
    setBusy(true);
    try {
      const res = await fetch("/api/rift-stakes/queue", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          stakeTierId: tier.id,
          confirmedStake: true,
          confirmedFee: true,
          confirmedPayout: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "QUEUE_FAILED");
      setConfirmOpen(false);
      if (json.matched) {
        setMatchLink(`/rift-stakes/match?id=${json.matchId}`);
        setMsg(`Matched · room ${json.publicId}`);
      } else {
        setMsg(`Queued · waiting for opponent (queue ${json.queueSize})`);
      }
      void load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "QUEUE_FAILED");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-6">
        <p className="font-semibold text-rose-200">Rift Stakes unavailable</p>
        <p className="mt-2 text-sm text-rose-100/80">{error}</p>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Enable with <code>RIFT_STAKES_ENABLED=true</code> or feature flag (local
          defaults on when NODE_ENV≠production).
        </p>
        {!hubEmbedded ? (
          <Link
            href="/tcg/battle?mode=practice&board=1"
            className="btn-secondary focus-ring mt-4 inline-flex text-sm"
          >
            Free Practice Board
          </Link>
        ) : null}
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-[var(--text-muted)]">Loading Rift Stakes…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip tone="warn">{data.label}</StatusChip>
        <StatusChip tone={data.demoMode ? "info" : "live"}>
          {data.demoMode ? "DEMO escrow" : "On-chain"}
        </StatusChip>
        <StatusChip tone="default">Fee {data.fee.currentBps / 100}% · max 5%</StatusChip>
        <StatusChip tone="default">Queue {data.queueSize}</StatusChip>
        {(data.admin.stakesPaused || data.admin.matchmakingPaused) && (
          <StatusChip tone="danger">Paused</StatusChip>
        )}
      </div>

      <p className="max-w-2xl text-sm text-[var(--text-muted)]">
        {data.disclosures.optional} {data.disclosures.feeOnlyStakes}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.tiers.map((t) => {
          const thumb =
            STAKE_TIER_THUMBNAILS[t.id as StakeTierId] ??
            STAKE_TIER_THUMBNAILS.standard;
          const isSelected = selected === t.id;
          return (
            <motion.button
              key={t.id}
              type="button"
              whileHover={{ y: -2 }}
              onClick={() => setSelected(t.id)}
              className={cn(
                "group relative min-h-[11.5rem] overflow-hidden rounded-2xl border text-left transition",
                isSelected
                  ? "border-amber-400/70 shadow-[0_0_0_1px_rgba(251,191,36,0.25)]"
                  : "border-[var(--border)] hover:border-amber-500/40",
              )}
            >
              <Image
                src={thumb}
                alt=""
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={t.id === "standard" || t.id === "high"}
              />
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent",
                  isSelected
                    ? "from-[rgba(28,16,6,0.94)] via-[rgba(28,16,6,0.55)]"
                    : "from-[rgba(6,10,18,0.94)] via-[rgba(6,10,18,0.55)]",
                )}
                aria-hidden
              />
              <div className="relative z-[1] flex h-full min-h-[11.5rem] flex-col justify-end p-4">
                <p className="text-xs uppercase tracking-wider text-amber-200/90 drop-shadow-sm">
                  {t.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-white drop-shadow-sm">
                  {t.stakeSol} <span className="text-sm font-normal">SOL</span>
                </p>
                <p className="mt-1 text-xs text-white/70">
                  Pot {t.potSol} SOL · winner ≈{" "}
                  {formatSol(t.preview.winnerReceivesLamports)} SOL
                </p>
                <p className="mt-2 text-xs text-white/55">{t.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {tier && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-5">
          <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--text)]">
            {tier.label} preview
          </h3>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["Your entry", formatSol(tier.preview.yourEntryLamports)],
                ["Opponent entry", formatSol(tier.preview.opponentEntryLamports)],
                ["Prize pool", formatSol(tier.preview.prizePoolLamports)],
                [
                  "Platform fee",
                  `${tier.preview.platformFeePercent} (${formatSol(tier.preview.platformFeeLamports)})`,
                ],
                [
                  "Est. network",
                  `~${formatSol(tier.preview.estimatedNetworkFeeLamports, 6)}`,
                ],
                ["Winner receives", formatSol(tier.preview.winnerReceivesLamports)],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 text-sm">
                <dt className="text-[var(--text-muted)]">{k}</dt>
                <dd className="tabular-nums text-[var(--text)]">{v} SOL</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary focus-ring text-sm"
              onClick={() => void openConfirm()}
              disabled={busy || data.admin.stakesPaused}
            >
              Review & confirm stake
            </button>
            {!hubEmbedded ? (
              <Link
                href="/tcg/battle?mode=practice&board=1"
                className="btn-secondary focus-ring text-sm"
              >
                Free practice instead
              </Link>
            ) : null}
            <Link
              href={
                hubEmbedded
                  ? "/tcg/battle?mode=stakes&panel=treasury"
                  : "/rift-stakes/treasury"
              }
              className="btn-secondary focus-ring text-sm"
            >
              Fee treasury
            </Link>
          </div>
        </div>
      )}

      {msg && (
        <p className="text-sm text-amber-100/90">
          {msg}
          {matchLink && (
            <>
              {" · "}
              <Link href={matchLink} className="underline">
                Open match
              </Link>
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href={
            hubEmbedded
              ? "/tcg/battle?mode=stakes&panel=history"
              : "/rift-stakes/history"
          }
          className="text-[var(--accent)] underline"
        >
          Match history
        </Link>
        <Link
          href={
            hubEmbedded
              ? "/tcg/battle?mode=stakes&panel=leaderboard"
              : "/rift-stakes/leaderboard"
          }
          className="text-[var(--accent)] underline"
        >
          Leaderboard
        </Link>
        {!hubEmbedded ? (
          <Link href="/arena" className="text-[var(--text-muted)] underline">
            Free Arena hub
          </Link>
        ) : null}
      </div>

      <StakeConfirmDialog
        open={confirmOpen}
        tierLabel={tier?.label ?? "Stake"}
        confirmation={confirmation}
        busy={busy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmJoin()}
      />
    </div>
  );
}
