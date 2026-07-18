"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EconomySummary } from "@/components/economy";
import { SectionTitleBand, StatusChip } from "@/components/shared/page-header";
import { useActiveWallet } from "@/hooks/use-active-wallet";
import { projectConfig, tokenTierThresholds } from "@/lib/config/project";
import type { TokenAnalyticsDashboard } from "@/lib/ecosystem/token-analytics";

type BalancePayload = {
  balance?: { uiAmount: string; tier: string; fetchedAt: string; amountRaw: string };
  error?: { message: string };
};

function fmtUsd(n: number | null) {
  if (n === null || Number.isNaN(n)) return "N/A";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(4)}`;
}

export default function TokenPage() {
  const { address, viewOnly } = useActiveWallet();
  const [data, setData] = useState<BalancePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<TokenAnalyticsDashboard | null>(null);

  useEffect(() => {
    void fetch("/api/analytics/token")
      .then((r) => r.json())
      .then((json: { dashboard?: TokenAnalyticsDashboard }) =>
        setAnalytics(json.dashboard ?? null),
      )
      .catch(() => setAnalytics(null));
  }, []);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/token/balance?wallet=${address}`);
      const json = (await res.json()) as BalancePayload;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [address]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <section className="panel relative overflow-hidden p-0">
        <div className="relative min-h-[200px] px-5 py-6 sm:px-6 sm:py-8">
          <Image
            src="/assets/ui/token/utility-banner.png?v=tk2"
            alt=""
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover object-center opacity-45"
            unoptimized
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(6,12,24,0.92)] via-[rgba(6,12,24,0.78)] to-[rgba(6,12,24,0.55)]"
            aria-hidden
          />
          <div className="relative z-10">
            <SectionTitleBand slug="token" label="Token" kicker="Ecosystem utility" />
            <p className="page-lede mt-4 max-w-2xl text-[rgba(220,230,245,0.92)]">
              {projectConfig.TOKEN_NAME} ({projectConfig.TOKEN_SYMBOL}) is ecosystem utility for
              cosmetics, fees, crafting, guilds, housing, arena, eggs, season pass, events, and
              creator purchases — not a promise of profit. Pump.fun was the launch chapter; this
              site is the product.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/analytics/token" className="btn-primary focus-ring text-sm">
                Live analytics
              </Link>
              <Link href="/treasury" className="btn-secondary focus-ring text-sm">
                Treasury
              </Link>
              <Link href="/rewards" className="btn-secondary focus-ring text-sm">
                Rewards
              </Link>
              <Link href="/play" className="btn-secondary focus-ring text-sm">
                Play
              </Link>
            </div>
          </div>
        </div>
      </section>

      {analytics ? (
        <section className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone="info">{analytics.phase}</StatusChip>
            <span className="text-xs text-[var(--text-dim)]">{analytics.market.note}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Price" value={fmtUsd(analytics.market.priceUsd)} />
            <Metric label="Market cap" value={fmtUsd(analytics.market.marketCapUsd)} />
            <Metric label="Liquidity" value={fmtUsd(analytics.market.liquidityUsd)} />
            <Metric label="24h volume" value={fmtUsd(analytics.market.volume24hUsd)} />
          </div>
          <p className="text-xs text-[var(--amber)]">{analytics.rewardVaultNote}</p>
        </section>
      ) : null}

      <div className="panel mt-8 space-y-3 p-6 text-sm">
        <Row label="Name" value={projectConfig.TOKEN_NAME} />
        <Row label="Symbol" value={projectConfig.TOKEN_SYMBOL} />
        <Row label="Mint" value={projectConfig.TOKEN_MINT_ADDRESS} copyable />
        <Row label="Pump.fun (launch)" value={projectConfig.PUMP_FUN_URL} />
        <Row label="Network" value={projectConfig.SOLANA_NETWORK} />
      </div>

      <div className="panel mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-white">Your balance</h2>
          <button
            type="button"
            className="btn-secondary focus-ring px-3 py-2 text-sm"
            onClick={() => void refresh()}
            disabled={!address || loading}
          >
            {loading ? "Refreshing…" : "Refresh balance"}
          </button>
        </div>
        {!address ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Connect a wallet or paste an address to view on-chain balance. Soft play works without a
            wallet — see{" "}
            <Link href="/login" className="text-[var(--cyan)]">
              Account
            </Link>
            .
          </p>
        ) : data?.balance ? (
          <div className="mt-3 text-sm text-[var(--text-muted)]">
            {viewOnly ? (
              <p className="mb-2 text-xs text-[var(--amber)]">
                View-only — balance lookup only; cannot sign or send SOL.
              </p>
            ) : null}
            <p>
              Balance: <span className="text-white">{data.balance.uiAmount}</span>
            </p>
            <p>
              Tier: <span className="text-[var(--cyan)]">{data.balance.tier}</span>
            </p>
            <p className="text-xs">Updated {new Date(data.balance.fetchedAt).toLocaleString()}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Mint is {projectConfig.TOKEN_MINT_ADDRESS === "COMING_SOON" ? "not configured yet" : "ready"}
            . Press refresh after connecting.
          </p>
        )}
      </div>

      <div className="panel mt-6 p-6">
        <h2 className="font-display text-xl text-white">Access tiers</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
          {Object.entries(tokenTierThresholds).map(([tier, min]) => (
            <li key={tier} className="flex justify-between border-b border-[var(--stroke)] py-2">
              <span>{tier}</span>
              <span className="text-white">{min.toString()} base units</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel mt-6 space-y-3 p-6 text-sm text-[var(--text-muted)]">
        <p>
          <strong className="text-white">Scam warning:</strong> Only trust the mint address published
          by official project channels.
        </p>
        <p>
          <strong className="text-white">Risk:</strong> Digital asset values can change rapidly. No
          guaranteed rewards or returns.
        </p>
        <p>
          Buying the launch coin does <strong className="text-white">not</strong> automatically
          generate SOL for pet owners. See{" "}
          <Link href="/rewards" className="text-[var(--cyan)]">
            Reward Center
          </Link>
          .
        </p>
      </div>

      <div className="mt-8">
        <EconomySummary variant="compact" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-display text-xl text-white">{value}</p>
    </div>
  );
}

function Row({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--stroke)] py-2">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-white">
        {value}
        {copyable ? (
          <button
            type="button"
            className="ml-2 text-[var(--cyan)]"
            onClick={() => void navigator.clipboard.writeText(value)}
          >
            Copy
          </button>
        ) : null}
      </span>
    </div>
  );
}
