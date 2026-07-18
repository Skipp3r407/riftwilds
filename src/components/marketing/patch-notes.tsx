import Link from "next/link";
import {
  PATCH_NOTE_SECTION_LABELS,
  type PatchNoteEntry,
  type PatchNoteSectionKey,
} from "@/content/patch-notes";

const SECTION_KEYS: PatchNoteSectionKey[] = ["added", "changed", "fixed", "knownIssues"];

const SECTION_ACCENT: Record<PatchNoteSectionKey, string> = {
  added: "var(--cyan)",
  changed: "var(--amber, #e8b86d)",
  fixed: "var(--coral)",
  knownIssues: "var(--text-dim)",
};

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function PatchSection({
  sectionKey,
  items,
}: {
  sectionKey: PatchNoteSectionKey;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <h3
        className="font-display text-xs uppercase tracking-[0.18em]"
        style={{ color: SECTION_ACCENT[sectionKey] }}
      >
        {PATCH_NOTE_SECTION_LABELS[sectionKey]}
      </h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-[var(--text-muted)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PatchEntryCard({ entry }: { entry: PatchNoteEntry }) {
  return (
    <article
      id={entry.id}
      className="panel scroll-mt-24 p-6 md:p-8"
      aria-labelledby={`${entry.id}-title`}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <time
          dateTime={entry.date}
          className="font-display text-xs uppercase tracking-[0.2em] text-[var(--cyan)]"
        >
          {formatDisplayDate(entry.date)}
        </time>
        {entry.version ? (
          <span className="rounded border border-[var(--stroke)] px-2 py-0.5 text-[11px] text-[var(--text-dim)]">
            {entry.version}
          </span>
        ) : null}
      </div>
      <h2 id={`${entry.id}-title`} className="font-display mt-2 text-2xl text-white md:text-3xl">
        {entry.title}
      </h2>
      {entry.summary ? (
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">{entry.summary}</p>
      ) : null}
      {SECTION_KEYS.map((key) => (
        <PatchSection key={key} sectionKey={key} items={entry[key] ?? []} />
      ))}
    </article>
  );
}

export function PatchNotesView({ entries }: { entries: PatchNoteEntry[] }) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_15%_0%,rgba(94,196,196,0.16),transparent_55%),radial-gradient(ellipse_at_90%_20%,rgba(232,184,109,0.1),transparent_45%),linear-gradient(165deg,#1a1510_0%,#12161c_100%)] px-6 py-12 md:px-10">
        <p className="page-kicker">Community · Help</p>
        <h1 className="font-display mt-3 text-4xl text-white md:text-5xl">Patch Notes</h1>
        <p className="mt-4 max-w-xl text-sm text-[var(--text-muted)] md:text-base">
          What shipped in each Riftwilds push — features, fixes, and known issues. Newest updates
          first.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/help" className="btn-secondary focus-ring text-sm">
            Help
          </Link>
          <Link href="/feedback" className="btn-secondary focus-ring text-sm">
            Feedback / Bugs
          </Link>
          <Link href="/docs" className="btn-secondary focus-ring text-sm">
            Docs
          </Link>
          <Link href="/social" className="btn-primary focus-ring text-sm">
            Community
          </Link>
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-[var(--text-muted)]">
          No published updates yet. Check back after the next push.
        </div>
      ) : (
        <div className="space-y-6">
          <nav aria-label="Release timeline" className="panel p-4 text-sm">
            <p className="font-display text-xs uppercase tracking-[0.18em] text-white">Timeline</p>
            <ol className="mt-3 space-y-2 text-[var(--text-muted)]">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <a href={`#${entry.id}`} className="footer-link hover:text-[var(--cyan)]">
                    <span className="text-[var(--text-dim)]">{entry.date}</span>
                    {" · "}
                    {entry.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {entries.map((entry) => (
            <PatchEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
