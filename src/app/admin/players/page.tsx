import Link from "next/link";

export const metadata = { title: "Admin · Players" };

export default function AdminPlayersPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="page-kicker">Ops</p>
      <h1 className="page-title mt-2">Players</h1>
      <p className="page-lede mt-2">
        Shell for Riftkeeper accounts, bans, identity merges (email/social ↔ wallet), and support
        lookups. Mutations require admin role.
      </p>
      <ul className="panel mt-6 list-disc space-y-2 p-5 pl-8 text-sm text-[var(--text-muted)]">
        <li>Search by username / wallet / email identity (AuthIdentity)</li>
        <li>Soft-ban / hard-ban with audit log</li>
        <li>Wallet link merge preview (see modular-auth planWalletLinkMerge)</li>
      </ul>
      <Link href="/admin" className="btn-secondary focus-ring mt-6 inline-flex text-sm">
        Back to admin
      </Link>
    </main>
  );
}
