"use client";

import { useMemo, useState } from "react";
import type { PetRewardVaultView } from "@/lib/rewards/types";
import { lamportsToSolString } from "@/lib/items/lamports";
import { cn } from "@/lib/utils/cn";

type Range = "today" | "yesterday" | "7d" | "30d" | "lifetime";

type Props = {
  analytics: PetRewardVaultView["analytics"];
  inactive?: boolean;
};

export function RewardAnalyticsPanel({ analytics, inactive }: Props) {
  const [range, setRange] = useState<Range>("7d");

  const series = useMemo(() => {
    switch (range) {
      case "today":
        return [analytics.history.today];
      case "yesterday":
        return [analytics.history.yesterday];
      case "7d":
        return analytics.history.last7d;
      case "30d":
        return analytics.history.last30d;
      case "lifetime":
        return [analytics.history.lifetime];
    }
  }, [analytics, range]);

  const max = Math.max(
    1,
    ...series.map((p) => Number(BigInt(p.depositsLamports) / 1_000_000n)),
  );

  return (
    <div className={cn("space-y-3", inactive && "opacity-80")}>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Reward history range">
        {(
          [
            ["today", "Today"],
            ["yesterday", "Yesterday"],
            ["7d", "7d"],
            ["30d", "30d"],
            ["lifetime", "Lifetime"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={range === id}
            className={cn(
              "rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider",
              range === id
                ? "bg-[var(--grad-cta-soft)] text-white"
                : "text-[var(--text-muted)] hover:text-white",
            )}
            onClick={() => setRange(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="flex h-24 items-end gap-1 rounded-md border border-[var(--stroke)] bg-[rgba(7,11,22,0.45)] px-2 py-2"
        role="img"
        aria-label={`Vault deposits chart for ${range}`}
      >
        {series.map((p) => {
          const v = Number(BigInt(p.depositsLamports) / 1_000_000n);
          const h = Math.max(4, Math.round((v / max) * 100));
          return (
            <div
              key={p.day}
              className="flex-1 rounded-sm bg-[var(--cyan)]/70"
              style={{ height: `${h}%` }}
              title={`${p.day}: ${lamportsToSolString(BigInt(p.depositsLamports))} SOL deposits`}
            />
          );
        })}
      </div>

      <ul className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Pet rank" value={analytics.petRank != null ? `#${analytics.petRank}` : "—"} />
        <Stat label="Total eligible pets" value={String(analytics.totalEligiblePets)} />
        <Stat label="Wallet share" value={`${analytics.walletSharePercent}%`} />
        <Stat label="Epoch #" value={String(analytics.epochNumber)} />
        <Stat label="Vault balance" value={`${analytics.vaultBalanceSol} SOL`} />
        <Stat label="Today's deposits" value={`${analytics.todayDepositsSol} SOL`} />
        <Stat
          label="Avg / eligible pet"
          value={`${analytics.avgRewardPerEligiblePetSol} SOL`}
          className="sm:col-span-2 lg:col-span-3"
        />
      </ul>
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <li className={cn("rounded-md border border-[var(--stroke)] px-3 py-2", className)}>
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-0.5 font-display text-white">{value}</p>
    </li>
  );
}
