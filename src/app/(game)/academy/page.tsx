import { Suspense } from "react";
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
            Interactive tutorials, Combat Academy drills, and a searchable FAQ. Credits are earned
            by playing — SOL is never required for basic gameplay.{" "}
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
