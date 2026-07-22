import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { RiftStakesMatchPanel } from "@/components/rift-stakes/rift-stakes-match-panel";

export const metadata = { title: "Rift Stakes Match" };

export default function RiftStakesMatchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Escrow match"
        titleSlug="arena"
        title="Rift Stakes Match"
        description="Fee, pot, and escrow status stay visible for the whole match."
        status="Optional · Real SOL"
        statusTone="warn"
        actions={
          <Link href="/tcg/battle?mode=stakes" className="btn-secondary focus-ring">
            Lobby
          </Link>
        }
      />
      <Suspense fallback={<p className="text-sm text-[var(--text-muted)]">Loading…</p>}>
        <RiftStakesMatchPanel />
      </Suspense>
    </div>
  );
}
