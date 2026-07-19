import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FeedbackForm } from "@/components/marketing/feedback-form";
import { projectConfig } from "@/lib/config/project";

/** Crystal archive atmosphere — community hall / report desk vibe. */
const FEEDBACK_BG = "/assets/ui/wallpapers/docs.png";

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
    <>
      {/* Full-bleed crystal archive — route has no shared RouteWallpaper entry. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <Image
          src={FEEDBACK_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%]"
          style={{ opacity: 0.82 }}
          unoptimized
        />
        {/* Light scrim — archive stays visible; panels carry form contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,11,22,0.22)] via-[rgba(7,11,22,0.12)] to-[rgba(7,11,22,0.55)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(61,231,255,0.14),transparent_42%),radial-gradient(ellipse_at_90%_18%,rgba(255,184,77,0.1),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,11,22,0.02)_0%,rgba(7,11,22,0.22)_72%,rgba(7,11,22,0.42)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-3xl space-y-8 px-4 py-10 md:px-6">
        <header className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_15%_0%,rgba(94,196,196,0.16),transparent_55%),radial-gradient(ellipse_at_90%_20%,rgba(232,184,109,0.1),transparent_45%),linear-gradient(165deg,rgba(26,21,16,0.9)_0%,rgba(18,22,28,0.92)_100%)] px-6 py-12 backdrop-blur-[3px] md:px-10">
          <p className="page-kicker">Community · Help</p>
          <h1 className="font-display mt-3 text-4xl text-white md:text-5xl">
            Feedback &amp; Bug Reports
          </h1>
          <p className="mt-4 max-w-xl text-sm text-[var(--text-muted)] md:text-base">
            Found a glitch or have an idea for {projectConfig.PROJECT_NAME}? Tell us — no wallet or SOL
            required.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/help" className="btn-secondary focus-ring text-sm">
              Help
            </Link>
            <Link href="/patch-notes" className="btn-secondary focus-ring text-sm">
              Patch Notes
            </Link>
          </div>
        </header>

        <section className="panel relative space-y-4 bg-[rgba(8,12,20,0.82)] p-6 backdrop-blur-[3px] md:p-8">
          <FeedbackForm source="feedback-page" />
        </section>

        <section className="panel space-y-3 bg-[rgba(8,12,20,0.82)] p-6 text-sm text-[var(--text-muted)] backdrop-blur-[3px]">
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
    </>
  );
}
