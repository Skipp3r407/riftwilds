import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { buildAnalyticsDashboard } from "@/lib/analytics/dashboard";

export const metadata = { title: "Admin · Analytics" };

export default function AdminAnalyticsPage() {
  const enabled = featureFlagDefaults.ANALYTICS_DASHBOARD_ENABLED;
  const dashboard = buildAnalyticsDashboard();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="panel mb-6 flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="page-kicker">Ops</p>
          <h1 className="page-title mt-2">Analytics shell</h1>
          <p className="page-lede">
            In-memory gameplay metrics for decade systems. Wire admin auth before production.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
          <Link href="/ecosystem" className="btn-primary focus-ring text-sm">
            Ecosystem
          </Link>
        </div>
      </div>

      {!enabled ? (
        <section className="panel p-6 text-sm text-[var(--text-muted)]">
          Analytics dashboard paused by feature flag.
        </section>
      ) : (
        <>
          <section className="panel mb-4 p-5">
            <h2 className="font-display text-lg text-white">Event counts</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(dashboard.eventCounts).length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No events yet — generate an expedition or consult the Archivist.
                </p>
              ) : (
                Object.entries(dashboard.eventCounts).map(([name, count]) => (
                  <div
                    key={name}
                    className="rounded-md border border-[var(--stroke)] px-3 py-2 text-sm"
                  >
                    <span className="text-[var(--text-muted)]">{name}</span>
                    <span className="ml-2 text-white">{count}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="panel p-5">
              <h2 className="font-display text-lg text-white">Content inventory</h2>
              <ul className="mt-3 space-y-1 text-sm text-[var(--text-muted)]">
                <li>Achievements: {dashboard.content.achievements}</li>
                <li>
                  Civilization milestones: {dashboard.content.civilizationMilestones} (
                  {dashboard.content.unlockedMilestones} unlocked)
                </li>
                <li>Expansion packs: {dashboard.content.expansionPacks}</li>
              </ul>
              <pre className="mt-3 overflow-x-auto rounded-md bg-[rgba(0,0,0,0.25)] p-3 text-xs text-[var(--cyan)]">
                {JSON.stringify(dashboard.content.contentByKind, null, 2)}
              </pre>
            </div>
            <div className="panel p-5">
              <h2 className="font-display text-lg text-white">Recent audits</h2>
              <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto text-xs">
                {dashboard.security.recentAudits.length === 0 ? (
                  <li className="text-[var(--text-muted)]">No audit entries yet.</li>
                ) : (
                  dashboard.security.recentAudits.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-md border border-[var(--stroke)] px-2 py-1.5"
                    >
                      <span className="text-white">{a.action}</span>
                      <span className="ml-2 text-[var(--text-dim)]">{a.entityType}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>

          <section className="panel mt-4 p-5">
            <h2 className="font-display text-lg text-white">Notes</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text-muted)]">
              {dashboard.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--text-dim)]">
              API: <code className="text-[var(--cyan)]">/api/analytics/summary</code>
            </p>
          </section>
        </>
      )}
    </main>
  );
}
