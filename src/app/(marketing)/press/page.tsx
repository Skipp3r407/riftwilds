import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PRESS_BLURB, FAN_KIT_KEY_ART, FAN_KIT_LOGO_PACK } from "@/content/fan-kit";
import { SocialCtas } from "@/components/fan-kit/social-ctas";
import { projectConfig } from "@/lib/config/project";

export const metadata: Metadata = {
  title: "Press & Streamer Kit",
  description:
    "What Riftwilds is in three bullets — key art, logos, and talking points for streamers and creators.",
  openGraph: {
    title: "Riftwilds Press Kit",
    description: PRESS_BLURB.bullets[0],
    images: [{ url: "/assets/marketing/og-default.png" }],
  },
};

/** Muted echo of press key art — cozy egg / rift forest atmosphere. */
const PRESS_BG = PRESS_BLURB.keyArtHref;

export default function PressPage() {
  return (
    <>
      {/* Full-bleed key-art atmosphere — /press has no RouteWallpaper entry. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <Image
          src={PRESS_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover object-[center_32%]"
          style={{ opacity: 0.92 }}
          unoptimized
        />
        {/* Scrim — rift art stays visible; title / panels stay legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,11,22,0.18)] via-[rgba(7,11,22,0.08)] to-[rgba(7,11,22,0.48)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(61,231,255,0.14),transparent_46%),radial-gradient(ellipse_at_82%_58%,rgba(255,184,77,0.12),transparent_44%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,11,22,0.12)_72%,rgba(7,11,22,0.36)_100%)]" />
      </div>

      <div className="relative mx-auto max-w-3xl space-y-10 px-4 py-10 md:px-6">
        <header>
          <p className="page-kicker">For streamers &amp; creators</p>
          <h1 className="font-display mt-3 text-4xl text-white md:text-5xl">
            {PRESS_BLURB.title}
          </h1>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            A one-pager you can skim before going live. Credits ≠ SOL. Story first.
          </p>
        </header>

        <section className="panel space-y-4 bg-[rgba(8,12,20,0.78)] p-6 backdrop-blur-[2px]">
          <h2 className="font-display text-xl text-white">In three bullets</h2>
          <ul className="space-y-3 text-sm text-[var(--text-muted)]">
            {PRESS_BLURB.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-[var(--cyan)]" aria-hidden>
                  ◆
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--stroke)]">
          <Image
            src={PRESS_BLURB.keyArtHref}
            alt={`${projectConfig.PROJECT_NAME} key art`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            unoptimized
            priority
          />
        </section>

        <section className="panel space-y-3 bg-[rgba(8,12,20,0.78)] p-6 backdrop-blur-[2px]">
          <h2 className="font-display text-xl text-white">Talking points</h2>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {PRESS_BLURB.talkingPoints.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={PRESS_BLURB.keyArtHref}
              download={PRESS_BLURB.keyArtDownloadName}
              className="btn-primary focus-ring text-sm"
            >
              Download key art
            </a>
            <Link href="/fan-kit" className="btn-secondary focus-ring text-sm">
              Full Fan Kit
            </Link>
            <Link href="/creators" className="btn-secondary focus-ring text-sm">
              Creator Hub
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-white">Quick links</h2>
          <ul className="flex flex-wrap gap-2">
            {PRESS_BLURB.links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="focus-ring inline-block rounded-full border border-[var(--stroke)] bg-[rgba(8,12,20,0.55)] px-3 py-1.5 text-sm text-[var(--text-muted)] backdrop-blur-[2px] hover:border-[var(--cyan)] hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-white">Logos &amp; key art</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[...FAN_KIT_KEY_ART, ...FAN_KIT_LOGO_PACK.slice(0, 2)].map((a) => (
              <a
                key={a.id}
                href={a.href}
                download={a.downloadName}
                className="panel focus-ring flex items-center gap-3 bg-[rgba(8,12,20,0.78)] p-3 backdrop-blur-[2px] hover:border-[var(--cyan)]"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[rgba(10,18,32,0.8)]">
                  <Image src={a.thumbSrc} alt="" fill className="object-contain p-1" unoptimized />
                </div>
                <div>
                  <p className="text-sm text-white">{a.title}</p>
                  <p className="text-xs text-[var(--cyan)]">Download</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-white">Social</h2>
          <SocialCtas />
        </section>
      </div>
    </>
  );
}
