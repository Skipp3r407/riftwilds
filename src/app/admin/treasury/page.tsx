import Link from "next/link";

export const metadata = { title: "Admin · Treasury" };

export default function AdminTreasuryPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="page-kicker">Ops</p>
      <h1 className="page-title mt-2">Treasury</h1>
      <p className="page-lede mt-2">
        Shell for bucket balances, grant approvals, and vote schedules. Public view at /treasury.
      </p>
      <Link href="/treasury" className="btn-secondary focus-ring mt-4 inline-flex text-sm">
        Public treasury
      </Link>
      <Link href="/admin" className="btn-secondary focus-ring mt-6 inline-flex text-sm">
        Back to admin
      </Link>
    </main>
  );
}
