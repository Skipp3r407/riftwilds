import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { housingAdminSnapshot, housingCatalogSnapshot } from "@/lib/housing";
import { neighborhoodSnapshot } from "@/lib/neighborhoods";

export const metadata = { title: "Admin · Housing" };

export default function AdminHousingPage() {
  const housing = housingAdminSnapshot();
  const catalog = housingCatalogSnapshot();
  const nbhd = neighborhoodSnapshot();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Admin"
        titleSlug="homestead"
        title="Housing & Neighborhoods"
        description="In-memory snapshots. Prisma flags remain prepare-only."
        status="Tools"
        statusTone="live"
        actions={
          <>
            <Link href="/housing" className="btn-secondary focus-ring text-sm">
              Player hub
            </Link>
            <Link href="/neighborhoods" className="btn-secondary focus-ring text-sm">
              Neighborhoods
            </Link>
          </>
        }
      />
      <section className="panel p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Housing</h2>
        <pre className="mt-3 overflow-x-auto text-xs text-[var(--text-dim)]">
          {JSON.stringify({ housing, flags: catalog.flags }, null, 2)}
        </pre>
      </section>
      <section className="panel p-5 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Neighborhoods</h2>
        <pre className="mt-3 overflow-x-auto text-xs text-[var(--text-dim)]">
          {JSON.stringify(
            {
              count: nbhd.neighborhoods.length,
              flags: nbhd.flags,
              architecture: nbhd.architecture,
              stageNotes: nbhd.stageNotes,
            },
            null,
            2,
          )}
        </pre>
      </section>
    </div>
  );
}
