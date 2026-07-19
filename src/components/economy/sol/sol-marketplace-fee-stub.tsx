import {
  getSolMarketplaceFeeDisplayStub,
  DEFAULT_SOL_MARKETPLACE_FEES,
} from "@/lib/economy/sol/marketplace-sol";
import { lamportsToSolString } from "@/lib/items/lamports";

/** Prominent SOL fee display stub — settlement stays blocked by flags. */
export function SolMarketplaceFeeStub() {
  const stub = getSolMarketplaceFeeDisplayStub(1_000_000_000n);
  const p = stub.preview;

  return (
    <section className="panel space-y-4 p-5" aria-labelledby="sol-fee-stub-heading">
      <div>
        <h2 id="sol-fee-stub-heading" className="font-display text-xl text-white">
          SOL marketplace fee preview
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Example split on 1 SOL. Live SOL settlement is{" "}
          <strong className="text-[var(--amber)]">{stub.live ? "enabled" : "blocked"}</strong>
          {stub.blockedReason ? ` — ${stub.blockedReason}` : "."}
        </p>
      </div>
      <ul className="grid gap-2 text-sm text-[var(--text-muted)] sm:grid-cols-2">
        <li>Seller: {p.sellerPercent}% ({lamportsToSolString(BigInt(p.sellerLamports))} SOL)</li>
        <li>Platform: {p.platformPercent}% ({lamportsToSolString(BigInt(p.platformLamports))} SOL)</li>
        <li>
          Creator: {p.creatorPercent}% ({lamportsToSolString(BigInt(p.creatorRoyaltyLamports))} SOL)
        </li>
        <li>
          Community: {p.communityPercent}% (
          {lamportsToSolString(BigInt(p.communityFundLamports))} SOL)
        </li>
      </ul>
      <p className="text-xs text-[var(--text-dim)]">
        Listing fee default:{" "}
        {lamportsToSolString(DEFAULT_SOL_MARKETPLACE_FEES.listingFeeLamports)} SOL ·{" "}
        {stub.listingFeeNote}
      </p>
      <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--text-muted)]">
        {stub.disclosures.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </section>
  );
}
