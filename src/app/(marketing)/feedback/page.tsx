import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackForm } from "@/components/marketing/feedback-form";
import { projectConfig } from "@/lib/config/project";

export const metadata: Metadata = {
  title: "Feedback & Bug Reports",
  description:
    "Report bugs or share ideas for Riftwilds. No wallet required — feedback helps improve the game.",
  openGraph: {
    title: "Riftwilds Feedback",
    description: "Bug reports and ideas for Riftwilds — used to improve the game.",
    type: "website",
    siteName: projectConfig.PROJECT_NAME,
    images: [{ url: "/assets/marketing/og-default.png" }],
  },
  alternates: {
    canonical: "/feedback",
  },
};

export default function FeedbackPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_15%_0%,rgba(94,196,196,0.16),transparent_55%),radial-gradient(ellipse_at_90%_20%,rgba(232,184,109,0.1),transparent_45%),linear-gradient(165deg,#1a1510_0%,#12161c_100%)] px-6 py-12 md:px-10">
        <p className="page-kicker">Community · Help</p>
        <h1 className="font-display mt-3 text-4xl text-white md:text-5xl">
          Feedback &amp; Bug Reports
        </h1>
        <p className="mt-4 max-w-xl text-sm text-[var(--text-muted)] md:text-base">
          Found a glitch or have an idea for {projectConfig.PROJECT_NAME}? Tell us — no wallet or SOL
          required.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/academy" className="btn-secondary focus-ring text-sm">
            Academy / Help
          </Link>
          <Link href="/patch-notes" className="btn-secondary focus-ring text-sm">
            Patch Notes
          </Link>
        </div>
      </header>

      <section className="panel relative space-y-4 p-6 md:p-8">
        <FeedbackForm source="feedback-page" />
      </section>

      <section className="panel space-y-3 p-6 text-sm text-[var(--text-muted)]">
        <h2 className="font-display text-lg text-white">Privacy</h2>
        <p>
          We use feedback and bug reports to improve {projectConfig.PROJECT_NAME} — fix issues,
          prioritize features, and understand what keepers need. Optional contact email is only for
          follow-up if you want one. We do not sell this information.
        </p>
        <p className="text-xs text-[var(--text-dim)]">
          Prefer email?{" "}
          <a
            href={`mailto:${projectConfig.SUPPORT_EMAIL}`}
            className="footer-link text-[var(--cyan)]"
          >
            {projectConfig.SUPPORT_EMAIL}
          </a>
          {" · "}
          <Link href="/legal/privacy" className="footer-link text-[var(--cyan)]">
            Privacy policy
          </Link>
        </p>
      </section>
    </div>
  );
}
