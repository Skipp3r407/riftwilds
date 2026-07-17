import Link from "next/link";

export const metadata = { title: "Admin · Guilds" };

export default function AdminGuildsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <p className="page-kicker">Ops</p>
      <h1 className="page-title mt-2">Guilds</h1>
      <p className="page-lede mt-2">
        Shell for guild moderation, crest reviews, and boss-event toggles. Live guilds remain
        feature-flagged.
      </p>
      <Link href="/admin" className="btn-secondary focus-ring mt-6 inline-flex text-sm">
        Back to admin
      </Link>
    </main>
  );
}
