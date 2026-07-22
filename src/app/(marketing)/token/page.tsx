"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EconomySummary } from "@/components/economy";
import { SectionTitleBand, StatusChip } from "@/components/shared/page-header";
import { TokenLiveAnalyticsPanel } from "@/components/token";
import { useActiveWallet } from "@/hooks/use-active-wallet";
import { projectConfig, tokenTierThresholds } from "@/lib/config/project";
import type { TokenAnalyticsDashboard } from "@/lib/ecosystem/token-analytics";

type BalancePayload = {
  balance?: { uiAmount: string; tier: string; fetchedAt: string; amountRaw: string };
  error?: { message: string };
};

const METRIC_ART = {
  Price: "/assets/ui/token/metric-price.svg",
  "Market cap": "/assets/ui/token/metric-marketcap.svg",
  Liquidity: "/assets/ui/token/metric-liquidity.svg",
  "24h volume": "/assets/ui/token/metric-volume.svg",
} as const;

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
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <section className="panel relative overflow-hidden p-0">
        <div className="relative min-h-[240px] px-5 py-6 sm:min-h-[280px] sm:px-6 sm:py-8">
          <Image
            src="/assets/ui/token/utility-banner.png?v=tk2"
            alt=""
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover object-center opacity-55"
            unoptimized
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(6,12,24,0.94)] via-[rgba(6,12,24,0.78)] to-[rgba(6,12,24,0.48)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.88)] via-transparent to-[rgba(6,12,24,0.35)]"
            aria-hidden
          />
          <div className="relative z-10">
            <div className="pointer-events-none absolute -right-1 top-0 h-16 w-16 opacity-80 sm:right-2 sm:h-20 sm:w-20" aria-hidden>
              <Image
                src="/assets/brand/rift-coin-icon.svg"
                alt=""
                fill
                sizes="80px"
                className="object-contain drop-shadow-[0_0_18px_rgba(61,231,255,0.35)]"
                unoptimized
              />
            </div>
            <SectionTitleBand slug="token" label="Token" kicker="Ecosystem utility" />
            <p className="page-lede mt-4 max-w-2xl text-[rgba(220,230,245,0.92)]">
              {projectConfig.TOKEN_NAME} ({projectConfig.TOKEN_SYMBOL}) is ecosystem utility for
              cosmetics, fees, crafting, guilds, housing, arena, eggs, season pass, events, and
              creator purchases — not a promise of profit. Pump.fun was the launch chapter; this
              site is the product.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="#live-analytics" className="btn-primary focus-ring text-sm">
                Live analytics
              </a>
              <Link href="/analytics/token" className="btn-secondary focus-ring text-sm">
                Full analytics
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

      {analytics?.live ? (
        <section id="live-analytics" className="mt-10 scroll-mt-24">
          <TokenLiveAnalyticsPanel live={analytics.live} />
        </section>
      ) : analytics ? (
        <section className="mt-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone="info">{analytics.phase}</StatusChip>
            <span className="text-xs text-[var(--text-dim)]">{analytics.market.note}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Price"
              value={fmtUsd(analytics.market.priceUsd)}
              iconSrc={METRIC_ART.Price}
            />
            <Metric
              label="Market cap"
              value={fmtUsd(analytics.market.marketCapUsd)}
              iconSrc={METRIC_ART["Market cap"]}
            />
            <Metric
              label="Liquidity"
              value={fmtUsd(analytics.market.liquidityUsd)}
              iconSrc={METRIC_ART.Liquidity}
            />
            <Metric
              label="24h volume"
              value={fmtUsd(analytics.market.volume24hUsd)}
              iconSrc={METRIC_ART["24h volume"]}
            />
          </div>
          <p className="text-xs text-[var(--amber)]">{analytics.rewardVaultNote}</p>
        </section>
      ) : null}

      <div className="panel relative mt-8 overflow-hidden p-0">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[42%] opacity-40 sm:opacity-50" aria-hidden>
          <Image
            src="/assets/ui/token/utility-banner.png?v=tk2"
            alt=""
            fill
            sizes="360px"
            className="object-cover object-right"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(8,12,22,1)] via-[rgba(8,12,22,0.85)] to-[rgba(8,12,22,0.35)]" />
        </div>
        <div className="relative z-10 space-y-3 p-6 text-sm">
          <div className="mb-1 flex items-center gap-3">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[rgba(61,231,255,0.22)] bg-[rgba(6,12,24,0.55)]">
              <Image
                src="/assets/brand/riftwilds-mark.svg"
                alt=""
                fill
                sizes="40px"
                className="object-contain p-1.5"
                unoptimized
                aria-hidden
              />
            </span>
            <h2 className="font-display text-lg text-white">Token info</h2>
          </div>
          <Row label="Name" value={projectConfig.TOKEN_NAME} />
          <Row label="Symbol" value={projectConfig.TOKEN_SYMBOL} />
          <Row label="Mint" value={projectConfig.TOKEN_MINT_ADDRESS} copyable />
          <Row label="Pump.fun (launch)" value={projectConfig.PUMP_FUN_URL} />
          <Row label="Network" value={projectConfig.SOLANA_NETWORK} />
        </div>
      </div>

      <div className="panel relative mt-6 overflow-hidden p-0">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[48%] max-w-[220px] opacity-55" aria-hidden>
          <Image
            src="/assets/ui/token/panel-balance.svg"
            alt=""
            fill
            sizes="220px"
            className="object-contain object-right p-2"
            unoptimized
          />
        </div>
        <div className="relative z-10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[rgba(255,184,77,0.28)] bg-[rgba(6,12,24,0.55)]">
                <Image
                  src="/assets/ui/token/metric-price.svg"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                  aria-hidden
                />
              </span>
              <h2 className="font-display text-xl text-white">Your balance</h2>
            </div>
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
            <p className="mt-3 max-w-xl text-sm text-[var(--text-muted)]">
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
            <p className="mt-3 max-w-xl text-sm text-[var(--text-muted)]">
              Mint is{" "}
              {projectConfig.TOKEN_MINT_ADDRESS === "COMING_SOON" ? "not configured yet" : "ready"}
              . Press refresh after connecting.
            </p>
          )}
        </div>
      </div>

      <div className="panel relative mt-6 overflow-hidden p-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          aria-hidden
        >
          <Image
            src="/assets/ui/wallpapers/economy.png?v=economynnebula1"
            alt=""
            fill
            sizes="896px"
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-[rgba(6,12,24,0.88)]" />
        </div>
        <div className="relative z-10 p-6">
          <div className="flex items-center gap-3">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[rgba(61,231,255,0.22)] bg-[rgba(6,12,24,0.55)]">
              <Image
                src="/assets/ui/token/metric-marketcap.svg"
                alt=""
                fill
                sizes="40px"
                className="object-cover"
                unoptimized
                aria-hidden
              />
            </span>
            <h2 className="font-display text-xl text-white">Access tiers</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
            {Object.entries(tokenTierThresholds).map(([tier, min]) => (
              <li key={tier} className="flex justify-between border-b border-[var(--stroke)] py-2">
                <span>{tier}</span>
                <span className="text-white">{min.toString()} base units</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel relative mt-6 overflow-hidden p-0">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 opacity-30 sm:w-32" aria-hidden>
          <Image
            src="/assets/treasury/icon-reserves.png"
            alt=""
            fill
            sizes="128px"
            className="object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[rgba(8,12,22,1)]" />
        </div>
        <div className="relative z-10 space-y-3 p-6 pl-8 text-sm text-[var(--text-muted)] sm:pl-12">
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
      </div>

      <div className="mt-8">
        <EconomySummary variant="compact" />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  iconSrc,
}: {
  label: string;
  value: string;
  iconSrc: string;
}) {
  return (
    <div className="panel relative min-h-[7.5rem] overflow-hidden p-0">
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
        <Image
          src="/assets/ui/token/utility-banner.png?v=tk2"
          alt=""
          fill
          sizes="220px"
          className="object-cover object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,12,24,0.96)] via-[rgba(6,12,24,0.88)] to-[rgba(6,12,24,0.55)]" />
      </div>
      <div className="relative z-10 flex h-full flex-col p-4">
        <div className="flex items-start gap-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[rgba(61,231,255,0.28)] bg-[rgba(6,12,24,0.6)] shadow-[0_0_16px_rgba(61,231,255,0.12)]">
            <Image
              src={iconSrc}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
              unoptimized
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-[rgba(200,214,232,0.9)]">{label}</p>
            <p className="mt-1 font-display text-xl text-white drop-shadow-sm">{value}</p>
          </div>
        </div>
      </div>
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
