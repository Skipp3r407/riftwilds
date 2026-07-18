import Link from "next/link";
import { COMIC_ISSUES, listPublishedComics } from "@/content/comics";

export const metadata = { title: "Admin · Comics" };

export default function AdminComicsPage() {
  const published = listPublishedComics();
  const drafts = COMIC_ISSUES.filter((i) => i.status !== "published");
  const totalPages = COMIC_ISSUES.reduce((n, i) => n + i.pages.length, 0);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-6">
      <div className="panel p-6">
        <p className="page-kicker">Ops · Content</p>
        <h1 className="page-title mt-2">Comics Studio</h1>
        <p className="page-lede">
          Legends of the Rift — upload / schedule / draft / preview / analytics stubs. Mutations
          require future admin auth wiring; catalog is code-authored today.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/comics" className="btn-primary focus-ring text-sm">
            Preview library
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
          <Link href="/admin/content" className="btn-secondary focus-ring text-sm">
            Content Studio
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Published issues" value={String(published.length)} />
        <Stat label="Draft / scheduled" value={String(drafts.length)} />
        <Stat label="Total pages" value={String(totalPages)} />
        <Stat label="Analytics" value="Stub — local progress only" />
      </div>

      <section className="panel p-4">
        <h2 className="font-display text-lg text-white">Catalog</h2>
        <ul className="mt-3 divide-y divide-[var(--stroke)] text-sm">
          {COMIC_ISSUES.map((issue) => (
            <li key={issue.slug} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-white">
                  #{issue.issueNumber} {issue.title}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {issue.status} · {issue.pages.length} pages · {issue.publishedAt}
                  {issue.worldEventKey ? ` · event:${issue.worldEventKey}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/comics/${issue.slug}`} className="btn-secondary focus-ring text-xs">
                  Preview
                </Link>
                <button type="button" className="btn-secondary focus-ring text-xs opacity-60" disabled>
                  Upload art (stub)
                </button>
                <button type="button" className="btn-secondary focus-ring text-xs opacity-60" disabled>
                  Schedule (stub)
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel grid gap-4 p-4 md:grid-cols-3">
        <div>
          <h2 className="font-display text-lg text-white">Upload</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Stub: drop covers/pages into <code>public/assets/comics/</code> then reference in catalog.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg text-white">Schedule / draft</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Stub: flip <code>status</code> on issue meta (`published` | `scheduled` | `draft`).
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg text-white">Analytics</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Stub: readers persist progress in localStorage (`riftwilds-comics-progress-v1`). Server
            rollups TBD.
          </p>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 font-display text-xl text-white">{value}</p>
    </div>
  );
}
