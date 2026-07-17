import { PurchaseAllocationBreakdown } from "@/components/revenue/purchase-allocation-breakdown";
import { getActivePolicy, bpsToPercentLabel } from "@/lib/revenue/policies";
import { revenueDisclosures } from "@/lib/revenue/disclosures";

type Props = {
  listingPriceLamports: bigint;
  mode?: "listing" | "purchase";
};

/** Shown before seller creates a listing and before buyer confirms. */
export function MarketplaceSellerProceeds({ listingPriceLamports, mode = "listing" }: Props) {
  const policy = getActivePolicy("MARKETPLACE_SALE");

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-muted)]">
        {mode === "listing"
          ? "Review seller proceeds and project fees before creating this listing."
          : "Review the full marketplace split before approving this purchase."}
      </p>
      <ul className="panel flex flex-wrap gap-2 p-3 text-[10px] text-[var(--text-muted)]">
        {policy.entries.map((e) => (
          <li
            key={e.destination}
            className="rounded border border-[var(--stroke)] px-2 py-1"
            style={{ borderColor: e.color }}
          >
            {e.label}: {bpsToPercentLabel(e.basisPoints)}
          </li>
        ))}
      </ul>
      <PurchaseAllocationBreakdown
        grossLamports={listingPriceLamports}
        transactionType="MARKETPLACE_SALE"
      />
      <p className="text-[10px] text-[var(--text-muted)]">{revenueDisclosures.reserve}</p>
    </div>
  );
}
