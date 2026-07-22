import { PageHeader } from "@/components/shared/page-header";
import { RiftStakesAdminPanel } from "@/components/rift-stakes/rift-stakes-admin-panel";

export const metadata = { title: "Admin · Rift Stakes" };
export const dynamic = "force-dynamic";

export default function AdminRiftStakesPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 md:px-6">
      <PageHeader
        kicker="Admin"
        titleSlug="arena"
        title="Rift Stakes Admin"
        description="Fee %, 0% promos, pause stakes/treasury/matchmaking, fee logs. Hard max 5%."
        status="Local DEMO"
        statusTone="warn"
      />
      <RiftStakesAdminPanel />
    </main>
  );
}
