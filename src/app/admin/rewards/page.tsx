import Link from "next/link";

export const metadata = { title: "Admin · Rewards" };

export default function AdminRewardsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="page-kicker">Ops</p>
      <h1 className="page-title mt-2">Rewards</h1>
      <p className="page-lede mt-2">
        Shell for reward vault epochs, verified deposits, and claim freezes. Never invent pet SOL
        from token buys.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/admin/economy/revenue-allocation" className="btn-secondary focus-ring text-sm">
          Revenue allocation
        </Link>
        <Link href="/rewards" className="btn-secondary focus-ring text-sm">
          Public Reward Center
        </Link>
      </div>
      <Link href="/admin" className="btn-secondary focus-ring mt-6 inline-flex text-sm">
        Back to admin
      </Link>
    </main>
  );
}
