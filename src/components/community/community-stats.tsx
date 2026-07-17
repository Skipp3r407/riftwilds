import type { TokenMarketMetrics } from "@/lib/community";

function fmtUsd(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "N/A";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtNum(n: number | null): string {
  if (n === null) return "N/A";
  return n.toLocaleString();
}

type Props = {
  market: TokenMarketMetrics;
};

export function CommunityStats({ market }: Props) {
  return (
    <section className="panel space-y-4 p-5" aria-labelledby="community-stats-heading">
      <div>
        <h2 id="community-stats-heading" className="font-display text-xl text-white">
          Token stats
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{market.note}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Holders" value={fmtNum(market.holderCount)} />
        <Stat label="Market cap" value={fmtUsd(market.marketCapUsd)} />
        <Stat label="Price" value={market.priceUsd !== null ? `$${market.priceUsd}` : "N/A"} />
        <Stat
          label="Bonding curve"
          value={
            market.bondingCurveProgressPercent !== null
              ? `${market.bondingCurveProgressPercent}%`
              : market.bondingCurveApplicable
                ? "N/A"
                : "Graduated / N/A"
          }
        />
        <Stat
          label="Tokens burned"
          value={
            market.burnsSupported
              ? fmtNum(market.totalTokensBurned)
              : "0 / N/A (no burn tokenomics yet)"
          }
        />
        <Stat label="24h volume" value={fmtUsd(market.volume24hUsd)} />
      </div>
      <p className="text-[10px] uppercase tracking-wider text-[var(--amber)]">
        Availability · {market.availability} · source {market.source}
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[var(--stroke)] bg-[var(--bg-elevated)] p-3">
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 font-display text-white">{value}</p>
    </div>
  );
}
