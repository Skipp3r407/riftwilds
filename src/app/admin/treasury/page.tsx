import { TreasuryOpsAdminDashboard } from "@/components/treasury-ops/admin-dashboard";

export const metadata = { title: "Admin · Treasury Ops" };
export const dynamic = "force-dynamic";

export default function AdminTreasuryPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <TreasuryOpsAdminDashboard />
    </main>
  );
}
