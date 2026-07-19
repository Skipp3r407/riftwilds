import Link from "next/link";
import { serializeEligibilityRules } from "@/lib/marketplace/eligibility";
import { listingTypesForPhase } from "@/lib/marketplace/listing-kinds";
import { exchangeAntiAbuseSummary } from "@/lib/exchange/anti-abuse";
import { listMarketplaceTxLog } from "@/lib/marketplace/security";

export const metadata = { title: "Admin · Marketplace" };

export default function AdminMarketplacePage() {
  const eligibility = serializeEligibilityRules();
  const types = listingTypesForPhase("all");
  const abuse = exchangeAntiAbuseSummary();
  const txLog = listMarketplaceTxLog(12);

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 md:px-6">
      <div>
        <p className="page-kicker">Ops</p>
        <h1 className="page-title mt-2">Marketplace moderation</h1>
        <p className="page-lede mt-2">
          Listing eligibility, listing types, anti-abuse honesty board, and demo transaction log.
          Production escrow / graph wash detection are not claimed complete.
        </p>
      </div>

      <section className="panel space-y-2 p-5">
        <h2 className="font-display text-lg text-white">Eligibility policy</h2>
        <p className="text-sm text-[var(--amber)]">{eligibility.policy}</p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
          {eligibility.rules.map((r) => (
            <li key={r.class}>
              {r.mayList ? "✓" : "✗"} {r.class}: {r.reason}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel space-y-2 p-5">
        <h2 className="font-display text-lg text-white">Listing types</h2>
        <ul className="space-y-1 text-sm text-[var(--text-muted)]">
          {types.map((t) => (
            <li key={t.id}>
              <span className="text-white">{t.label}</span> · {t.phase} — {t.description}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel space-y-3 p-5">
        <h2 className="font-display text-lg text-white">Anti-abuse</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-[var(--cyan)]">Enforced</p>
            <ul className="mt-1 space-y-1 text-sm text-[var(--text-muted)]">
              {abuse.real.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase text-[var(--amber)]">Scaffold</p>
            <ul className="mt-1 space-y-1 text-sm text-[var(--text-muted)]">
              {abuse.scaffold.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel space-y-2 p-5">
        <h2 className="font-display text-lg text-white">Demo tx log</h2>
        {txLog.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            Empty until wishlist / trade / rate-limit events fire this process.
          </p>
        ) : (
          <ul className="space-y-1 text-xs text-[var(--text-muted)]">
            {txLog.map((e) => (
              <li key={e.id}>
                [{e.type}] {e.actorLabel}: {e.detail}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin" className="btn-secondary focus-ring text-sm">
          Back to admin
        </Link>
        <Link href="/marketplace" className="btn-secondary focus-ring text-sm">
          Player Marketplace
        </Link>
        <Link href="/exchange" className="btn-secondary focus-ring text-sm">
          Rift Exchange
        </Link>
      </div>
    </main>
  );
}
