import Link from "next/link";
import { getAdminConfigSnapshot } from "@/lib/loyalty/config";
import {
  STORM_FREQUENCY_HINT,
  STORM_SOL,
  STORM_WAVES,
  STORM_TIER_WEIGHT_BOOST,
} from "@/lib/loyalty/rift-storm-config";

export const metadata = { title: "Admin · Loyalty / Rift Storm" };

export default function AdminLoyaltyPage() {
  const cfg = getAdminConfigSnapshot();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="page-kicker">Ops</p>
      <h1 className="page-title mt-2">Loyalty & Rift Storm</h1>
      <p className="page-lede mt-2">
        Config stubs for tables, odds, frequency, and SOL promo caps. SOL stays optional and
        flagged off. Never sell gameplay advantages in the Loyalty Shop.
      </p>

      <section className="panel mt-6 space-y-2 p-5 text-sm">
        <h2 className="font-display text-lg text-white">Loyalty config v{cfg.configVersion}</h2>
        <p className="text-[var(--text-muted)]">{cfg.framing}</p>
        <ul className="list-disc space-y-1 pl-5 text-[var(--text-muted)]">
          <li>Milestones: {cfg.milestoneDays.join(", ")}</li>
          <li>Pity threshold: {cfg.pityThreshold}</li>
          <li>Activity window: {cfg.activityWindowMs / 3600000}h</li>
          <li>SOL airdrops enabled in snapshot: {String(cfg.solAirdropsEnabled)}</li>
        </ul>
      </section>

      <section className="panel mt-4 space-y-2 p-5 text-sm">
        <h2 className="font-display text-lg text-white">Storm waves</h2>
        <ul className="space-y-2">
          {STORM_WAVES.map((w) => (
            <li key={w.id} className="border-b border-[var(--stroke)] py-2">
              <span className="text-white">{w.id}</span> — {w.label} (min score {w.minScore})
            </li>
          ))}
        </ul>
        <h3 className="mt-4 font-display text-white">Frequency hints</h3>
        <ul className="list-disc pl-5 text-[var(--text-muted)]">
          {Object.entries(STORM_FREQUENCY_HINT).map(([k, v]) => (
            <li key={k}>
              {k}: {v}
            </li>
          ))}
        </ul>
        <h3 className="mt-4 font-display text-white">Tier weight boosts</h3>
        <ul className="list-disc pl-5 text-[var(--text-muted)]">
          {Object.entries(STORM_TIER_WEIGHT_BOOST).map(([k, v]) => (
            <li key={k}>
              {k}: +{Math.round(v * 100)}%
            </li>
          ))}
        </ul>
        <h3 className="mt-4 font-display text-white">SOL promo (default off)</h3>
        <p className="text-[var(--text-muted)]">{STORM_SOL.disclaimer}</p>
        <p className="text-xs text-[var(--text-muted)]">
          Cap {STORM_SOL.maxLamportsPerGrant} lamports / grant · {STORM_SOL.maxGrantsPerStorm} /
          storm
        </p>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/loyalty" className="btn-primary focus-ring text-sm">
          Player loyalty UI
        </Link>
        <Link href="/admin/rewards" className="btn-secondary focus-ring text-sm">
          Rewards admin
        </Link>
        <Link href="/admin" className="btn-secondary focus-ring text-sm">
          Back
        </Link>
      </div>
      <p className="mt-4 text-xs text-[var(--text-muted)]">
        Trigger API: POST /api/loyalty/storm/trigger with action trigger | cancel | schedule_tick |
        config
      </p>
    </main>
  );
}
