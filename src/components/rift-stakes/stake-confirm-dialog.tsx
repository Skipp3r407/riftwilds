"use client";

import { formatSol } from "@/game/rift-stakes/config";

export type ConfirmationNumbers = {
  yourEntryLamports: number;
  opponentEntryLamports: number;
  prizePoolLamports: number;
  platformFeePercent: string;
  platformFeeBps: number;
  platformFeeLamports: number;
  estimatedNetworkFeeLamports: number;
  winnerReceivesLamports: number;
  feeWaived: boolean;
  feeSource: string;
  label: string;
};

type Props = {
  open: boolean;
  tierLabel: string;
  confirmation: ConfirmationNumbers | null;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Exact pre-join disclosure: entry, opponent, pot, fee %, fee amount,
 * network estimate, winner receives — all visible before Confirm.
 */
export function StakeConfirmDialog({
  open,
  tierLabel,
  confirmation,
  busy,
  onCancel,
  onConfirm,
}: Props) {
  if (!open || !confirmation) return null;

  const rows: { label: string; value: string; emphasize?: boolean }[] = [
    { label: "Your entry", value: `${formatSol(confirmation.yourEntryLamports)} SOL` },
    {
      label: "Opponent entry",
      value: `${formatSol(confirmation.opponentEntryLamports)} SOL`,
    },
    {
      label: "Prize pool",
      value: `${formatSol(confirmation.prizePoolLamports)} SOL`,
      emphasize: true,
    },
    {
      label: "Platform fee",
      value: `${confirmation.platformFeePercent} (${formatSol(confirmation.platformFeeLamports)} SOL)`,
    },
    {
      label: "Est. network fee",
      value: `~${formatSol(confirmation.estimatedNetworkFeeLamports, 6)} SOL (display only)`,
    },
    {
      label: "Winner receives",
      value: `${formatSol(confirmation.winnerReceivesLamports)} SOL`,
      emphasize: true,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rift-stakes-confirm-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300/90">
          {confirmation.label}
        </p>
        <h2
          id="rift-stakes-confirm-title"
          className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--text)]"
        >
          Confirm {tierLabel} stake
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Fees apply only to Rift Stakes. Casual, Ranked, and Training stay free.
          Cancelled matches charge no platform fee.
        </p>

        <dl className="mt-4 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 p-3">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-[var(--text-muted)]">{r.label}</dt>
              <dd
                className={
                  r.emphasize
                    ? "font-semibold tabular-nums text-[var(--text)]"
                    : "tabular-nums text-[var(--text)]"
                }
              >
                {r.value}
              </dd>
            </div>
          ))}
        </dl>

        {confirmation.feeWaived ? (
          <p className="mt-3 text-xs text-emerald-300/90">
            Fee waived ({confirmation.feeSource}).
          </p>
        ) : (
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Fee source: {confirmation.feeSource} · hard max 5%.
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn-secondary focus-ring text-sm"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary focus-ring text-sm"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Joining…" : "Confirm & join queue"}
          </button>
        </div>
      </div>
    </div>
  );
}
