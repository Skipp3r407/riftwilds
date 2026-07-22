import Image from "next/image";
import Link from "next/link";
import {
  ALBUM_STICKERS,
  BRAND_GUIDELINES,
  FAN_KIT_CREDIT,
  FAN_KIT_FRAMES,
  FAN_KIT_KEY_ART,
  FAN_KIT_LOGO_PACK,
  FAN_KIT_STICKERS,
  KIDS_CORNER,
  LISTEN_TRACKS,
  PRESS_BLURB,
  ROADMAP_MILESTONES,
  SHARE_MOMENTS,
  listMeetRiftlings,
} from "@/content/fan-kit";
import { COLORING_CREDIT } from "@/content/coloring";
import { DownloadTile } from "@/components/fan-kit/download-tile";
import { ListenStrip } from "@/components/fan-kit/listen-strip";
import { NewsletterSignup } from "@/components/fan-kit/newsletter-signup";
import { ShareButton, CopyLinkButton } from "@/components/fan-kit/share-button";
import { SocialCtas } from "@/components/fan-kit/social-ctas";
import { ColoringDownloads } from "@/components/coloring/coloring-downloads";
import { PrintablesDownloads } from "@/components/printables/printables-downloads";
import { WallpaperDownloads } from "@/components/wallpapers/wallpaper-downloads";
import { StatusChip } from "@/components/shared/page-header";
import { roadmapMilestoneThumbPath } from "@/lib/assets/paths";
import { projectConfig } from "@/lib/config/project";

const NAV_ANCHORS = [
  { href: "#downloads", label: "Downloads" },
  { href: "#printables", label: "Printables" },
  { href: "#share", label: "Share" },
  { href: "#listen", label: "Listen" },
  { href: "#meet", label: "Riftlings" },
  { href: "#kids", label: "Kids" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#stickers-album", label: "Album" },
  { href: "#press", label: "Press" },
  { href: "#newsletter", label: "Dispatch" },
] as const;

const statusTone = {
  live: "live" as const,
  "in-progress": "info" as const,
  coming: "warn" as const,
};

const statusLabel = {
  live: "Live",
  "in-progress": "In progress",
  coming: "Coming soon",
};

export function FanKitHub() {
  const meet = listMeetRiftlings();

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 md:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_15%_0%,rgba(255,184,77,0.16),transparent_45%),radial-gradient(ellipse_at_85%_10%,rgba(61,231,255,0.14),transparent_40%),linear-gradient(165deg,#1a1510_0%,#0c141f_55%,#12161c_100%)] px-6 py-12 md:px-10 md:py-16">
        <p className="page-kicker">Attract &amp; Share</p>
        <h1 className="font-display mt-3 text-4xl text-white md:text-6xl">Fan Kit</h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--text-muted)] md:text-lg">
          Wallpapers, stickers, coloring, soundtrack teasers, and shareable moment cards — free
          downloads so Keepers, kids, and streamers can take {projectConfig.PROJECT_NAME} with them.
        </p>
        <p className="mt-3 max-w-xl text-sm text-[var(--text-dim)]">{FAN_KIT_CREDIT}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/hatchery" className="btn-primary focus-ring">
            Hatch free
          </Link>
          <Link href="/comics" className="btn-secondary focus-ring">
            Read comics
          </Link>
          <Link href="/coloring" className="btn-secondary focus-ring">
            Coloring pages
          </Link>
          <Link href="/printables" className="btn-secondary focus-ring">
            300 DPI printables
          </Link>
          <Link href="/creators" className="btn-secondary focus-ring">
            Creator Hub
          </Link>
        </div>
        <nav
          className="mt-8 flex flex-wrap gap-2"
          aria-label="Fan Kit sections"
        >
          {NAV_ANCHORS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="focus-ring rounded-full border border-[var(--stroke)] bg-[rgba(12,14,18,0.45)] px-3 py-1.5 text-xs text-[var(--text-muted)] transition hover:border-[var(--cyan)] hover:text-white"
            >
              {a.label}
            </a>
          ))}
        </nav>
      </header>

      <section id="downloads" className="scroll-mt-24 space-y-8" aria-labelledby="downloads-heading">
        <div>
          <h2 id="downloads-heading" className="font-display text-2xl text-white">
            Downloads
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Logo pack, wallpapers, avatar frames, and transparent Riftling stickers.
          </p>
        </div>

        <WallpaperDownloads showIndexLink={false} />

        <div>
          <h3 className="font-display text-lg text-white">Logo pack</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FAN_KIT_LOGO_PACK.map((a) => (
              <DownloadTile key={a.id} asset={a} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg text-white">Avatar frames</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FAN_KIT_FRAMES.map((a) => (
              <DownloadTile key={a.id} asset={a} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg text-white">Riftling stickers</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FAN_KIT_STICKERS.map((a) => (
              <DownloadTile key={a.id} asset={a} />
            ))}
          </div>
        </div>

        <div className="panel panel--parchment p-5">
          <h3 className="font-display text-lg text-[var(--text-ink)]">Brand guidelines (simple)</h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-ink)]/85">
            {BRAND_GUIDELINES.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>

        <ColoringDownloads showIndexLink />
        <p className="text-xs text-[var(--text-dim)]">{COLORING_CREDIT}</p>
      </section>

      <section id="printables" className="scroll-mt-24 space-y-4" aria-labelledby="printables-section-heading">
        <h2 id="printables-section-heading" className="sr-only">
          300 DPI printables
        </h2>
        <PrintablesDownloads showIndexLink />
      </section>

      <section id="share" className="scroll-mt-24 space-y-4" aria-labelledby="share-heading">
        <div>
          <h2 id="share-heading" className="font-display text-2xl text-white">
            Shareable moment cards
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            OG-style cards for chats, streams, and group chats — copy link or native share.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHARE_MOMENTS.map((m) => (
            <article
              key={m.id}
              className="panel group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:border-[var(--cyan)]/35"
            >
              <div className="relative aspect-[1200/630] overflow-hidden bg-[rgba(10,18,32,0.95)]">
                <Image
                  src={m.imageSrc}
                  alt={`${m.title} — Riftwilds share card`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[rgba(8,10,14,0.55)] to-transparent"
                  aria-hidden
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 border-t border-[var(--stroke)] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--amber)]">
                  Riftwilds · OG card
                </p>
                <h3 className="font-display text-base leading-snug text-white">{m.title}</h3>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">{m.caption}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <ShareButton title={m.title} text={m.caption} path={m.sharePath} />
                  <CopyLinkButton path={m.sharePath} />
                  <Link href={m.sharePath} className="btn-primary focus-ring text-sm">
                    {m.hook}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="listen" className="scroll-mt-24 space-y-4" aria-labelledby="listen-heading">
        <div>
          <h2 id="listen-heading" className="font-display text-2xl text-white">
            Listen — soundtrack teasers
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Short looping ambience from the in-world playlist.
          </p>
        </div>
        <ListenStrip tracks={LISTEN_TRACKS} />
      </section>

      <section id="meet" className="scroll-mt-24 space-y-4" aria-labelledby="meet-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="meet-heading" className="font-display text-2xl text-white">
              Meet the Riftlings
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              A cute showcase of companions waiting in the Hatchery.
            </p>
          </div>
          <Link href="/hatchery" className="btn-primary focus-ring text-sm">
            Hatch free
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {meet.map((r) => (
            <article
              key={r.slug}
              className="panel group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5"
            >
              <div className="relative aspect-square bg-[radial-gradient(circle_at_50%_40%,rgba(255,184,77,0.12),transparent_55%),rgba(10,18,32,0.95)]">
                <Image
                  src={r.thumbSrc}
                  alt={r.name}
                  fill
                  className="object-contain p-4 transition duration-500 group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, 25vw"
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg text-white">{r.name}</h3>
                    <p className="text-[11px] text-[var(--amber)]">{r.title}</p>
                  </div>
                  <StatusChip tone="info">{r.affinity}</StatusChip>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{r.blurb}</p>
                <p className="text-[11px] text-[var(--text-dim)]">{r.region}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <Link href={r.codexHref} className="btn-secondary focus-ring text-sm">
                    Codex
                  </Link>
                  <Link href="/hatchery" className="btn-primary focus-ring text-sm">
                    Hatch free
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="kids" className="scroll-mt-24 space-y-4" aria-labelledby="kids-heading">
        <div>
          <h2 id="kids-heading" className="font-display text-2xl text-white">
            {KIDS_CORNER.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{KIDS_CORNER.lede}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {KIDS_CORNER.points.map((p) => (
            <article key={p.title} className="panel p-5">
              <h3 className="font-display text-base text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{p.body}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/coloring" className="btn-primary focus-ring text-sm">
            Coloring downloads
          </Link>
          <Link href="/printables" className="btn-secondary focus-ring text-sm">
            300 DPI printables
          </Link>
          <Link href="/comics" className="btn-secondary focus-ring text-sm">
            Comics library
          </Link>
          <Link href="/fairness" className="btn-secondary focus-ring text-sm">
            Fairness notes
          </Link>
        </div>
      </section>

      <section id="roadmap" className="scroll-mt-24 space-y-4" aria-labelledby="roadmap-heading">
        <div>
          <h2 id="roadmap-heading" className="font-display text-2xl text-white">
            Coming soon / roadmap
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Public milestones — no fake dates, just what’s live, cooking, or next.
          </p>
        </div>
        <ol className="grid gap-3 md:grid-cols-2">
          {ROADMAP_MILESTONES.map((m) => (
            <li
              key={m.id}
              className="group panel relative flex min-h-[10.5rem] flex-col gap-2 overflow-hidden p-5"
            >
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <Image
                  src={roadmapMilestoneThumbPath(m.id)}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-55 transition duration-300 group-hover:opacity-65"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,10,18,0.55)] via-[rgba(8,10,18,0.72)] to-[rgba(8,10,18,0.92)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(8,10,18,0.45)_100%)]" />
              </div>
              <div className="relative z-[1] flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
                    {m.title}
                  </h3>
                  <StatusChip tone={statusTone[m.status]}>{statusLabel[m.status]}</StatusChip>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{m.blurb}</p>
                {m.href && (
                  <Link
                    href={m.href}
                    className="mt-auto text-sm text-[var(--cyan)] hover:underline"
                  >
                    Open →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="stickers-album"
        className="scroll-mt-24 space-y-4"
        aria-labelledby="album-heading"
      >
        <div>
          <h2 id="album-heading" className="font-display text-2xl text-white">
            Achievement sticker album
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Cosmetic collectibles for reading comics and visiting Commons — preview gallery (not SOL
            rewards).
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ALBUM_STICKERS.map((s) => (
            <article
              key={s.id}
              className={`panel flex flex-col items-center p-4 text-center ${
                s.previewUnlocked ? "" : "opacity-70"
              }`}
            >
              <div className="relative h-20 w-20">
                <Image
                  src={s.imageSrc}
                  alt=""
                  fill
                  className={`object-contain ${s.previewUnlocked ? "" : "grayscale"}`}
                  unoptimized
                />
              </div>
              <h3 className="font-display mt-3 text-sm text-white">{s.title}</h3>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">{s.how}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[var(--amber)]">
                {s.previewUnlocked ? "Preview unlocked" : s.rarity}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="press" className="scroll-mt-24 space-y-4" aria-labelledby="press-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="press-heading" className="font-display text-2xl text-white">
              {PRESS_BLURB.subtitle}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{PRESS_BLURB.title}</p>
          </div>
          <Link href="/press" className="btn-secondary focus-ring text-sm">
            Open press page
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="panel space-y-3 p-5">
            <ul className="space-y-3 text-sm text-[var(--text-muted)]">
              {PRESS_BLURB.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-1 text-[var(--cyan)]" aria-hidden>
                    ◆
                  </span>
                  <span>{b}</span>
                </li>
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
              {FAN_KIT_KEY_ART.slice(1).map((a) => (
                <a
                  key={a.id}
                  href={a.href}
                  download={a.downloadName}
                  className="btn-secondary focus-ring text-sm"
                >
                  {a.title}
                </a>
              ))}
            </div>
          </div>
          <div className="relative min-h-[200px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--stroke)]">
            <Image
              src={PRESS_BLURB.keyArtHref}
              alt="Riftwilds key art"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              unoptimized
            />
          </div>
        </div>
      </section>

      <section id="community" className="scroll-mt-24 space-y-4" aria-labelledby="social-heading">
        <div>
          <h2 id="social-heading" className="font-display text-2xl text-white">
            Community hangouts
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Social links appear when published — placeholders stay honest until then.
          </p>
        </div>
        <SocialCtas />
      </section>

      <section id="newsletter" className="scroll-mt-24 space-y-4" aria-labelledby="news-heading">
        <h2 id="news-heading" className="sr-only">
          Newsletter
        </h2>
        <NewsletterSignup />
      </section>
    </div>
  );
}
