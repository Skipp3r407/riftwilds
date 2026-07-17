import Link from "next/link";

export const metadata = { title: "Admin · Events" };

export default function AdminEventsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="page-kicker">Ops</p>
      <h1 className="page-title mt-2">Events</h1>
      <p className="page-lede mt-2">
        Shell for festival calendar overrides, community posts, and creator showcase windows.
      </p>
      <Link href="/api/festivals" className="btn-secondary focus-ring mt-4 inline-flex text-sm">
        Festivals API
      </Link>
      <Link href="/admin" className="btn-secondary focus-ring mt-6 inline-flex text-sm">
        Back to admin
      </Link>
    </main>
  );
}
