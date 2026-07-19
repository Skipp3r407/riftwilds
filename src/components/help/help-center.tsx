import Link from "next/link";
import {
  HELP_FAQ_TEASERS,
  HELP_QUICK_LINKS,
  HELP_SECTIONS,
} from "@/content/help/guides";

export function HelpCenter() {
  return (
    <div className="help-center relative space-y-8">
      {/* Local readability wash over RouteWallpaper docs hall — keeps Jump to + cards legible */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(7,11,22,0.28) 0%, rgba(7,11,22,0.12) 40%, rgba(7,11,22,0.35) 100%), radial-gradient(ellipse at 15% 0%, rgba(61,231,255,0.14), transparent 42%), radial-gradient(ellipse at 90% 20%, rgba(255,184,77,0.10), transparent 38%), radial-gradient(ellipse at 50% 100%, rgba(20,40,72,0.55), transparent 50%)",
        }}
        aria-hidden
      />

      <nav
        aria-label="Help topics"
        className="rounded-xl border border-[rgba(61,231,255,0.22)] bg-[rgba(8,12,20,0.82)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[3px]"
      >
        <p className="font-display text-[10px] uppercase tracking-[0.28em] text-[var(--cyan)]">
          Jump to
        </p>
        <ol className="mt-3 flex flex-wrap gap-2">
          {HELP_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="focus-ring inline-flex rounded-md border border-[rgba(255,184,77,0.22)] bg-[rgba(255,184,77,0.06)] px-2.5 py-1.5 text-xs text-[var(--text-primary,#f4efe6)] transition hover:border-[rgba(61,231,255,0.45)] hover:bg-[rgba(61,231,255,0.08)]"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section aria-labelledby="help-destinations-heading" className="space-y-3">
        <h2
          id="help-destinations-heading"
          className="font-display text-lg text-[var(--amber)]"
        >
          Play destinations
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="focus-ring group flex h-full flex-col rounded-xl border border-[rgba(61,231,255,0.2)] bg-[rgba(8,12,20,0.78)] px-4 py-4 backdrop-blur-[2px] transition hover:border-[rgba(61,231,255,0.45)] hover:bg-[rgba(12,20,34,0.9)]"
              >
                <span className="font-display text-sm text-[var(--cyan)] group-hover:text-[var(--amber)]">
                  {link.label}
                </span>
                <span className="mt-1 text-sm text-[var(--text-muted)]">{link.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-6">
        {HELP_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="scroll-mt-24 rounded-xl border border-white/10 bg-[rgba(8,12,20,0.76)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[3px]"
          >
            <h2
              id={`${section.id}-title`}
              className="font-display text-xl text-[var(--text-primary,#f4efe6)]"
            >
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--amber)]/90">{section.summary}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-muted)]">
              {section.body.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {section.hrefs && section.hrefs.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {section.hrefs.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="btn-secondary focus-ring !px-3 !py-1.5 text-xs"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      <section
        aria-labelledby="help-faq-teasers-heading"
        className="rounded-xl border border-[rgba(255,184,77,0.25)] bg-[rgba(12,16,24,0.7)] px-5 py-5"
      >
        <h2
          id="help-faq-teasers-heading"
          className="font-display text-lg text-[var(--amber)]"
        >
          Common questions
        </h2>
        <dl className="mt-4 space-y-4">
          {HELP_FAQ_TEASERS.map((item) => (
            <div key={item.q}>
              <dt className="font-display text-sm text-white">{item.q}</dt>
              <dd className="mt-1 text-sm text-[var(--text-muted)]">{item.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-[var(--text-dim)]">
          Searchable FAQ and interactive drills live in the{" "}
          <Link href="/academy?tab=faq" className="text-[var(--cyan)] underline-offset-2 hover:underline">
            Player Academy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
