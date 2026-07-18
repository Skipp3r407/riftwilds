import { describe, expect, it, beforeEach } from "vitest";
import { resetCreditLedgerForTests, ensureStarterCredits, creditCredits, getCreditBalance } from "@/lib/credits/ledger";
import { getDemoMarketplaceListings } from "@/lib/marketplace/demo-listings";
import { settleMarketplaceCreditsPurchase, listingPriceCredits } from "@/lib/marketplace/credits-settle";

describe("marketplace Credits settlement", () => {
  beforeEach(() => {
    resetCreditLedgerForTests();
  });

  it("debits buyer and credits seller with fee", () => {
    const listing = getDemoMarketplaceListings()[0];
    expect(listing).toBeTruthy();
    const price = listingPriceCredits(listing!);
    ensureStarterCredits("mkt-buyer");
    creditCredits({
      userId: "mkt-buyer",
      amount: Math.max(500, price + 50),
      reason: "ADMIN_ADJUST",
      requestId: "mkt-topup",
    });
    const before = getCreditBalance("mkt-buyer");
    const r = settleMarketplaceCreditsPurchase({
      listing: listing!,
      buyerUserId: "mkt-buyer",
      requestId: "mkt-purchase-1",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.currency).toBe("CREDITS");
      expect(r.feeCredits).toBeGreaterThan(0);
      expect(getCreditBalance("mkt-buyer")).toBe(before - r.priceCredits);
      expect(r.sellerNet).toBe(r.priceCredits - r.feeCredits);
    }
  });
});
