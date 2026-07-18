import { Suspense } from "react";
import Link from "next/link";
import { AcademyShell } from "@/components/academy";
import { PageHeader, StatusChip } from "@/components/shared/page-header";
import { ALL_LESSONS } from "@/game/academy";

export const metadata = { title: "Player Academy" };

function AcademyFallback() {
  return (
    <div className="panel p-8 text-center text-sm text-[var(--text-muted)]">
      Loading Academy…
    </div>
  );
}

export default function AcademyPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Learn"
        titleSlug="academy"
        title="Player Academy"
        description={
          <>
            Interactive drills and searchable FAQ. For the TCG-first Keeper Guide (battles, energy,
            binder, packs), start at{" "}
            <Link href="/help" className="text-[var(--cyan)] underline-offset-2 hover:underline">
              Help
            </Link>
            . Credits are earned by playing — SOL is never required.{" "}
            <span className="text-[var(--text-dim)]">
              {ALL_LESSONS.length} lessons loaded · progress saves locally
            </span>
          </>
        }
        status="Live"
        statusTone="live"
        actions={<StatusChip tone="info">HELP / F1</StatusChip>}
      />
      <Suspense fallback={<AcademyFallback />}>
        <AcademyShell />
      </Suspense>
    </div>
  );
}
