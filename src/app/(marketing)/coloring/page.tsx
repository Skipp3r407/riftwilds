import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { COLORING_CREDIT, listColoringSheets } from "@/content/coloring";
import { WallpaperDownloads } from "@/components/wallpapers/wallpaper-downloads";
import { projectConfig } from "@/lib/config/project";

export const metadata: Metadata = {
  title: "Coloring Pages | Kids Corner",
  description:
    "Free printable Riftwilds coloring pages — 28 detailed game-sketch line art sheets of Spark, Commons, Circus, Keepers, and more.",
  openGraph: {
    title: "Riftwilds Coloring Pages",
    description: "28 printable game-sketch Riftling sheets — free for personal and kids’ use.",
    images: [{ url: "/assets/coloring/spark.png" }],
  },
};

export default function ColoringPage() {
  const sheets = listColoringSheets();

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 md:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,107,107,0.14),transparent_50%),linear-gradient(165deg,#1a1510_0%,#12161c_100%)] px-6 py-12 md:px-10">
        <p className="page-kicker">Parents &amp; kids</p>
        <h1 className="font-display mt-3 text-4xl text-white md:text-5xl">Coloring Pages</h1>
        <p className="mt-4 max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
          28 printable game-sketch line art pages from {projectConfig.UNIVERSE_NAME} — concept-style
          outlines kids can color. Free for personal use; crayons welcome.
        </p>
        <p className="mt-2 text-xs text-[var(--text-dim)]">{COLORING_CREDIT}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/fan-kit#kids" className="btn-secondary focus-ring text-sm">
            Parents &amp; Kids Corner
          </Link>
          <Link href="/printables" className="btn-secondary focus-ring text-sm">
            300 DPI printables
          </Link>
          <Link href="/comics" className="btn-secondary focus-ring text-sm">
            Comics
          </Link>
          <Link href="/fan-kit" className="btn-primary focus-ring text-sm">
            Full Fan Kit
          </Link>
        </div>
      </header>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Coloring sheets">
        {sheets.map((sheet) => (
          <article key={sheet.id} className="panel flex flex-col overflow-hidden">
            <div className="relative aspect-[3/4] bg-[rgba(248,242,230,0.95)]">
              <Image
                src={sheet.pngSrc}
                alt={sheet.title}
                fill
                className="object-contain p-3"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h2 className="font-display text-lg text-white">{sheet.title}</h2>
              <p className="text-xs text-[var(--text-muted)]">{sheet.description}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <a
                  href={sheet.pngSrc}
                  download={`${sheet.slug}.png`}
                  className="btn-primary focus-ring text-sm"
                >
                  PNG
                </a>
                <a
                  href={sheet.svgSrc}
                  download={`${sheet.slug}.svg`}
                  className="btn-secondary focus-ring text-sm"
                >
                  SVG
                </a>
                {sheet.pdfSrc && (
                  <a
                    href={sheet.pdfSrc}
                    download={`${sheet.slug}.pdf`}
                    className="btn-secondary focus-ring text-sm"
                  >
                    PDF
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      <WallpaperDownloads showIndexLink={false} />

      <section className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg text-white">Full-color 300 DPI printables</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Sticker sheets, posters, bookmarks, trading cards, and a circus party invite — separate
            from these line-art coloring pages.
          </p>
        </div>
        <Link href="/printables" className="btn-primary focus-ring shrink-0 text-sm">
          Open printables
        </Link>
      </section>

      <section className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg text-white">Stickers, frames &amp; share cards</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Avatar frames, transparent Riftling stickers, logo pack, and OG-style moment cards live
            in the Fan Kit hub.
          </p>
        </div>
        <Link href="/fan-kit#downloads" className="btn-primary focus-ring shrink-0 text-sm">
          Open Fan Kit
        </Link>
      </section>
    </div>
  );
}
