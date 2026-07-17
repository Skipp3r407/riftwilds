import { allocateForTransactionType, serializeAllocation } from "@/lib/revenue/allocate";
import { getActivePolicy, bpsToPercentLabel } from "@/lib/revenue/policies";
import { revenueDisclosures } from "@/lib/revenue/disclosures";
import { lamportsToSolString } from "@/lib/items/lamports";
import type { RevenueTransactionType } from "@/lib/revenue/types";

type Props = {
  grossLamports: bigint;
  transactionType?: RevenueTransactionType;
  networkFeeEstimateLamports?: bigint;
  showPaymentSummary?: boolean;
  className?: string;
};

export function PurchaseAllocationBreakdown({
  grossLamports,
  transactionType = "SHOP_PURCHASE",
  networkFeeEstimateLamports = 5000n,
  showPaymentSummary = true,
  className,
}: Props) {
  const policy = getActivePolicy(transactionType);
  const result = allocateForTransactionType(grossLamports, transactionType);
  const serialized = serializeAllocation(result);
  const isMarketplace = transactionType === "MARKETPLACE_SALE";

  return (
    <div className={className}>
      {showPaymentSummary ? (
        <div className="panel mb-3 space-y-2 p-4 text-sm">
          <h3 className="font-display text-white">Payment summary</h3>
          <Row label="Item / sale price" value={`${lamportsToSolString(grossLamports)} SOL`} />
          <Row
            label="Network fee (est.)"
            value={`${lamportsToSolString(networkFeeEstimateLamports)} SOL`}
          />
          <Row
            label="Total wallet cost"
            value={`${lamportsToSolString(grossLamports + networkFeeEstimateLamports)} SOL`}
            strong
          />
          <p className="text-[10px] text-[var(--text-muted)]">
            Network fees are separate and are not project revenue.
          </p>
        </div>
      ) : null}

      <div className="panel space-y-3 p-4 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-white">
            {isMarketplace ? "Marketplace allocation" : "Project allocation"}
          </h3>
          <span className="text-[10px] text-[var(--text-muted)]">
            {policy.name} · v{policy.version}
          </span>
        </div>

        <ul className="space-y-2">
          {serialized.lines.map((line) => (
            <li key={line.destination} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 text-[var(--text-muted)]">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: line.color }}
                />
                {line.label} ({bpsToPercentLabel(line.basisPoints)})
              </span>
              <span className="text-[var(--mint)]">
                {lamportsToSolString(BigInt(line.allocatedAmountLamports))} SOL
              </span>
            </li>
          ))}
        </ul>

        {result.remainderLamports > 0n ? (
          <p className="text-[10px] text-[var(--text-muted)]">
            Rounding remainder {lamportsToSolString(result.remainderLamports)} SOL →{" "}
            {result.remainderDestination.replace(/_/g, " ").toLowerCase()}
          </p>
        ) : null}

        <p className="text-[10px] text-[var(--amber)]">{revenueDisclosures.policyMayChange}</p>
        <p className="text-[10px] text-[var(--text-muted)]">{revenueDisclosures.purchases}</p>
        <p className="text-[10px] text-[var(--text-muted)]">{revenueDisclosures.holderRewards}</p>
      </div>
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
      <span className={strong ? "font-medium text-white" : "text-[var(--mint)]"}>{value}</span>
    </div>
  );
}
