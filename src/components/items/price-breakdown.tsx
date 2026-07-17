import { lamportsToSolString } from "@/lib/items/lamports";
import type { PriceQuote } from "@/lib/items/pricing";

export function PriceBreakdown({ quote }: { quote: PriceQuote }) {
  return (
    <div className="panel space-y-2 p-4 text-sm">
      <h3 className="font-display text-white">Price breakdown</h3>
      <Row label="Item price" value={`${quote.priceSol} SOL`} />
      <Row
        label="Estimated USD"
        value={
          quote.estimatedUsd != null ? `≈ $${quote.estimatedUsd.toFixed(2)}` : "—"
        }
      />
      <p className="text-[10px] text-[var(--text-muted)]">{quote.usdDisclaimer}</p>
      <Row
        label="Network fee (est.)"
        value={`${lamportsToSolString(quote.networkFeeEstimateLamports)} SOL`}
      />
      <Row
        label="Marketplace fee"
        value={`${lamportsToSolString(quote.marketplaceFeeLamports)} SOL`}
      />
      <Row
        label="Creator / project fee"
        value={`${lamportsToSolString(quote.creatorFeeLamports)} SOL`}
      />
      <Row
        label="Seller proceeds"
        value={`${lamportsToSolString(quote.sellerProceedsLamports)} SOL`}
      />
      <Row
        label="Total buyer cost"
        value={`${lamportsToSolString(quote.totalBuyerCostLamports)} SOL`}
        strong
      />
      <ul className="mt-3 space-y-1 text-[10px] text-[var(--text-muted)]">
        {quote.disclosures.map((d) => (
          <li key={d.slice(0, 24)}>{d}</li>
        ))}
      </ul>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className={strong ? "font-medium text-white" : "text-[var(--mint)]"}>
        {value}
      </span>
    </div>
  );
}
