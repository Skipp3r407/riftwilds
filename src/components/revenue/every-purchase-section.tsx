import Link from "next/link";
import { getActivePolicy, bpsToPercentLabel } from "@/lib/revenue/policies";
import { revenueDisclosures } from "@/lib/revenue/disclosures";

export function EveryPurchaseSection() {
  const shop = getActivePolicy("SHOP_PURCHASE");
  const market = getActivePolicy("MARKETPLACE_SALE");

  return (
    <section id="every-purchase" className="scroll-mt-24 space-y-6">
      <div>
        <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--cyan)]">
          Purchase flow
        </p>
        <h2 className="font-display mt-2 text-3xl text-white md:text-4xl">
          EVERY PURCHASE SUPPORTS THE ECOSYSTEM
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)]">
          When an eligible shop purchase, crafting fee, upgrade, or marketplace transaction is
          completed, the revenue is divided according to the active public allocation policy.
        </p>
      </div>

      <div className="panel overflow-hidden p-5">
        <ol className="flex flex-col gap-3 text-sm md:flex-row md:flex-wrap md:items-center md:justify-between">
          {[
            "Player Purchase",
            "Verified SOL Payment",
            "Public Revenue Allocation",
            "Growth · Community Treasury · Ops · Events",
          ].map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-elevated)] font-display text-xs text-[var(--cyan)]">
                {i + 1}
              </span>
              <span className="text-white">{step}</span>
              {i < 3 ? (
                <span className="hidden text-[var(--text-muted)] md:inline" aria-hidden>
                  →
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <h3 className="font-display text-lg text-white">Direct shop allocation</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {shop.name} · policy v{shop.version}
          </p>
          <ul className="mt-4 space-y-3">
            {shop.entries.map((e) => (
              <li key={e.destination}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-white">{e.label}</span>
                  <span style={{ color: e.color }}>{bpsToPercentLabel(e.basisPoints)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${e.basisPoints / 100}%`,
                      background: e.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <h3 className="font-display text-lg text-white">Marketplace allocation</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {market.name} · policy v{market.version}
          </p>
          <ul className="mt-4 space-y-3">
            {market.entries.map((e) => (
              <li key={e.destination}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-white">{e.label}</span>
                  <span style={{ color: e.color }}>{bpsToPercentLabel(e.basisPoints)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${e.basisPoints / 100}%`,
                      background: e.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-[var(--amber)]">{revenueDisclosures.policyMayChange}</p>
      <p className="text-xs text-[var(--text-muted)]">{revenueDisclosures.holderRewards}</p>
      <p className="text-xs text-[var(--text-muted)]">{revenueDisclosures.reserve}</p>
      <Link href="/economy/policies" className="text-sm text-[var(--cyan)] underline">
        View public policy history
      </Link>
    </section>
  );
}
