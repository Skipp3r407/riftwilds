import Link from "next/link";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { adminSnapshot, listTemplates } from "@/lib/world-expansion";

export const metadata = { title: "World Expansion Admin" };

export default function WorldExpansionAdminPage() {
  const snap = adminSnapshot();
  const templates = listTemplates();

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 md:px-6">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <p className="page-kicker">Ops</p>
          <h1 className="page-title mt-2">World Expansion</h1>
          <p className="page-lede">
            Lifecycle, capacity-driven generation, overflow vs permanent housing. Mutations via{" "}
            <code className="text-[var(--cyan)]">/api/world-expansion</code> — audited.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/living-world" className="btn-secondary focus-ring text-sm">
            Population
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Back
          </Link>
        </div>
      </div>

      <section className="panel grid gap-3 p-5 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase text-[var(--text-dim)]">WORLD_EXPANSION</p>
          <p
            className={`font-display text-xl ${featureFlagDefaults.WORLD_EXPANSION_ENABLED ? "text-[var(--emerald)]" : "text-[var(--coral)]"}`}
          >
            {featureFlagDefaults.WORLD_EXPANSION_ENABLED ? "ON" : "OFF"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[var(--text-dim)]">Prisma persist</p>
          <p
            className={`font-display text-xl ${featureFlagDefaults.WORLD_EXPANSION_PRISMA_ENABLED ? "text-[var(--emerald)]" : "text-[var(--coral)]"}`}
          >
            {featureFlagDefaults.WORLD_EXPANSION_PRISMA_ENABLED ? "ON" : "PREPARED"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-[var(--text-dim)]">Open maps</p>
          <p className="font-display text-xl text-white">
            {snap.maps.filter((m) => m.lifecycle === "OPEN").length}
          </p>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Maps ({snap.maps.length})</h2>
        <ul className="mt-3 space-y-2 text-xs text-[var(--text-muted)]">
          {snap.maps.map((m) => (
            <li key={m.mapId} className="rounded border border-[var(--stroke)] px-3 py-2">
              <span className="text-white">{m.name}</span> · {m.lifecycle} · {m.mapKind} ·{" "}
              {m.crowdLabel} · players {m.playersOnline} · plots {m.plotsOccupied}/{m.plotsTotal} ·{" "}
              {m.templateKey}
              {!m.allowsPermanentHousing ? " · no deeds" : ""}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-[var(--text-dim)]">
          Actions: approve · pause · resume · force_generate · retry · archive · rename — POST
          /api/world-expansion. Never apply migration 20260718140000 until approved.
        </p>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Templates ({templates.length})</h2>
        <ul className="mt-2 grid gap-2 text-xs text-[var(--text-muted)] sm:grid-cols-2">
          {templates.map((t) => (
            <li key={t.key} className="rounded border border-[var(--stroke)] px-2 py-1.5">
              <span className="text-white">{t.name}</span> · {t.biome} · soft {t.softPlayerLimit} ·{" "}
              {t.allowsPermanentHousing ? "housing" : "overflow-only"}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Jobs & requests</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Requests: {snap.requests.length} · Jobs: {snap.jobs.length}
        </p>
        <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-[11px] text-[var(--text-dim)]">
          {snap.jobs.slice(-12).map((j) => (
            <li key={j.jobId}>
              {j.jobId.slice(0, 14)}… · {j.status} · attempts {j.attempts}/{j.maxAttempts}
              {j.lastError ? ` · ${j.lastError}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="font-display text-lg text-white">Audit</h2>
        <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-[11px] text-[var(--text-muted)]">
          {snap.audit.length === 0 ? (
            <li>No admin actions yet.</li>
          ) : (
            snap.audit.map((a) => (
              <li key={a.id}>
                {a.at} · {a.actorId} · {a.action} · {a.mapId ?? "—"} · {a.detail}
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
