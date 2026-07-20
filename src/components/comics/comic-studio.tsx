"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ComicIssue } from "@/content/comics/types";
import { summarizeIssueForStudio } from "@/content/comics/publishing-engine";
import { COMIC_ARCS, COMIC_VOLUMES } from "@/content/comics/story-arcs";
import { offlineReadyNote } from "@/lib/comics/offline";

type Props = {
  issues: ComicIssue[];
};

type StudioTab = "catalog" | "pages" | "lettering" | "covers" | "publish" | "arcs";

export function ComicStudio({ issues }: Props) {
  const [selectedSlug, setSelectedSlug] = useState(issues[0]?.slug ?? "");
  const [tab, setTab] = useState<StudioTab>("catalog");
  const [draftNote, setDraftNote] = useState("");
  const [statusOverride, setStatusOverride] = useState<Record<string, string>>({});

  const issue = issues.find((i) => i.slug === selectedSlug) ?? issues[0];
  const summary = useMemo(
    () => (issue ? summarizeIssueForStudio(issue) : null),
    [issue],
  );
  const published = issues.filter((i) => (statusOverride[i.slug] ?? i.status) === "published");
  const drafts = issues.filter((i) => (statusOverride[i.slug] ?? i.status) !== "published");
  const totalPages = issues.reduce((n, i) => n + i.pages.length, 0);

  if (!issue || !summary) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-[var(--text-muted)]">No issues in catalog.</p>
      </main>
    );
  }

  const tabs: { id: StudioTab; label: string }[] = [
    { id: "catalog", label: "Catalog" },
    { id: "pages", label: "Pages" },
    { id: "lettering", label: "Lettering" },
    { id: "covers", label: "Covers" },
    { id: "publish", label: "Publish" },
    { id: "arcs", label: "Arcs" },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-6">
      <div className="panel p-6">
        <p className="page-kicker">Ops · Comic Publishing Engine</p>
        <h1 className="page-title mt-2">Comic Studio</h1>
        <p className="page-lede">
          Create / edit / letter / publish scaffolding over the code-authored catalog. Mutations are
          local UI state until admin auth + DB land — preview always reflects live{" "}
          <code className="text-[var(--cyan)]">src/content/comics/</code>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/comics" className="btn-primary focus-ring text-sm">
            Preview library
          </Link>
          <Link href={`/comics/${issue.slug}`} className="btn-secondary focus-ring text-sm">
            Open reader · {issue.title}
          </Link>
          <Link href="/admin" className="btn-secondary focus-ring text-sm">
            Admin home
          </Link>
          <span className="self-center text-xs text-[var(--text-muted)]">
            Docs: docs/comics/PUBLISHING_ENGINE.md
          </span>
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">{offlineReadyNote()}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Published" value={String(published.length)} />
        <Stat label="Draft / scheduled" value={String(drafts.length)} />
        <Stat label="Total pages" value={String(totalPages)} />
        <Stat label="Selected bubbles" value={String(summary.bubbleCount)} />
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Studio tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`btn-secondary focus-ring text-sm ${tab === t.id ? "border-[var(--amber)] text-[var(--amber)]" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="panel max-h-[70vh] overflow-y-auto p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Issues</p>
          <ul className="mt-2 space-y-1">
            {issues.map((i) => (
              <li key={i.slug}>
                <button
                  type="button"
                  className={`w-full rounded-md px-2 py-2 text-left text-sm focus-ring ${
                    i.slug === issue.slug
                      ? "bg-[rgba(255,184,77,0.12)] text-[var(--amber)]"
                      : "text-white hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                  onClick={() => setSelectedSlug(i.slug)}
                >
                  #{i.issueNumber} {i.title}
                  <span className="mt-0.5 block text-[10px] text-[var(--text-muted)]">
                    {statusOverride[i.slug] ?? i.status} · {i.pages.length}p
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="panel space-y-4 p-4" aria-label="Studio workspace">
          {tab === "catalog" && (
            <>
              <h2 className="font-display text-lg text-white">
                #{issue.issueNumber} {issue.title}
              </h2>
              <p className="text-sm text-[var(--text-muted)]">{issue.synopsis}</p>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--text-muted)]">Arc / volume</dt>
                  <dd className="text-white">
                    {issue.arcId ?? "—"} · {issue.volumeId ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Unlock</dt>
                  <dd className="text-white">
                    {(issue.unlockGates ?? [{ kind: "free" }]).map((g) => g.kind).join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Roles</dt>
                  <dd className="text-white">
                    {Object.entries(summary.roles)
                      .map(([k, v]) => `${k}:${v}`)
                      .join(" · ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)]">Canon links</dt>
                  <dd className="text-white">{summary.canonLinks}</dd>
                </div>
              </dl>
              <label className="block text-xs text-[var(--text-muted)]">
                Studio note (local only)
                <textarea
                  className="mt-1 w-full rounded-md border border-[var(--stroke)] bg-[rgba(0,0,0,0.25)] px-3 py-2 text-sm text-white focus-ring"
                  rows={3}
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="Lettering pass, art plate TODO, VO cue…"
                />
              </label>
            </>
          )}

          {tab === "pages" && (
            <>
              <h2 className="font-display text-lg text-white">Pages · {issue.pages.length}</h2>
              <div className="max-h-[55vh] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[rgba(10,18,28,0.95)] text-[var(--text-muted)]">
                    <tr>
                      <th className="py-2 pr-2">#</th>
                      <th className="py-2 pr-2">Role</th>
                      <th className="py-2 pr-2">Layout</th>
                      <th className="py-2 pr-2">Title</th>
                      <th className="py-2 pr-2">Panels</th>
                      <th className="py-2">Bubbles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issue.pages.map((p) => (
                      <tr key={p.id} className="border-t border-[var(--stroke)]">
                        <td className="py-1.5 pr-2 text-white">{p.pageNumber}</td>
                        <td className="py-1.5 pr-2 text-[var(--amber)]">{p.role ?? "story"}</td>
                        <td className="py-1.5 pr-2">{p.layout}</td>
                        <td className="py-1.5 pr-2 text-white">{p.title ?? "—"}</td>
                        <td className="py-1.5 pr-2">{p.panels.length}</td>
                        <td className="py-1.5">
                          {p.panels.reduce((n, pan) => n + pan.bubbles.length, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link
                href={`/comics/${issue.slug}?page=1`}
                className="btn-secondary focus-ring inline-flex text-sm"
              >
                Preview from page 1
              </Link>
            </>
          )}

          {tab === "lettering" && (
            <>
              <h2 className="font-display text-lg text-white">Lettering kinds in issue</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Full system: speech · thought · narration · whisper · shout · magic · telepathy ·
                creature · sfx · caption. Fantasy SFX only (KRRRAAAK, FWOOOM…).
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {summary.bubbleKinds.map((k) => (
                  <li
                    key={k}
                    className="rounded-full border border-[var(--stroke)] px-3 py-1 text-xs text-[var(--cyan)]"
                  >
                    {k}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-white">
                Hotspots: {summary.hotspotCount} · Canon deep links: {summary.canonLinks}
              </p>
            </>
          )}

          {tab === "covers" && (
            <>
              <h2 className="font-display text-lg text-white">
                Cover variants · {issue.covers.length}
              </h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {issue.covers.map((c) => (
                  <li key={c.kind} className="rounded-md border border-[var(--stroke)] p-3 text-sm">
                    <p className="font-display text-white">{c.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{c.kind}</p>
                    {c.unlockHint && (
                      <p className="mt-1 text-xs text-[var(--amber)]">{c.unlockHint}</p>
                    )}
                    <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">{c.src}</p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === "publish" && (
            <>
              <h2 className="font-display text-lg text-white">Publish controls (stub)</h2>
              <p className="text-sm text-[var(--text-muted)]">
                Flipping status here is UI-only. Persist by editing{" "}
                <code>status</code> in <code>catalog.ts</code> or future DB rows.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["published", "scheduled", "draft"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`btn-secondary focus-ring text-sm ${
                      (statusOverride[issue.slug] ?? issue.status) === s
                        ? "border-[var(--amber)] text-[var(--amber)]"
                        : ""
                    }`}
                    onClick={() =>
                      setStatusOverride((prev) => ({ ...prev, [issue.slug]: s }))
                    }
                  >
                    Mark {s}
                  </button>
                ))}
              </div>
              <Link
                href={`/comics/${issue.slug}`}
                className="btn-primary focus-ring mt-4 inline-flex text-sm"
              >
                Live preview
              </Link>
            </>
          )}

          {tab === "arcs" && (
            <>
              <h2 className="font-display text-lg text-white">Volumes &amp; arcs</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm text-[var(--amber)]">Volumes</h3>
                  <ul className="mt-2 space-y-2 text-sm text-[var(--text-muted)]">
                    {COMIC_VOLUMES.map((v) => (
                      <li key={v.id}>
                        <span className="text-white">{v.title}</span>
                        <br />
                        {v.issueSlugs.length} issues
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm text-[var(--amber)]">Arcs</h3>
                  <ul className="mt-2 space-y-2 text-sm text-[var(--text-muted)]">
                    {COMIC_ARCS.map((a) => (
                      <li key={a.id}>
                        <span className="text-white">{a.title}</span>
                        <br />
                        {a.subtitle}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
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
