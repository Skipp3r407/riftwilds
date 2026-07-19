import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  PRINTABLES_CREDIT,
  PRINTABLES_DPI_NOTE,
  listPrintables,
} from "@/content/printables";
import { projectConfig } from "@/lib/config/project";

export const metadata: Metadata = {
  title: "Printables | Keepers, Riftlings & 300 DPI Gear",
  description:
    "Free 300 DPI Riftwilds printables — battle posters, trading cards, bookmarks, stickers, and circus invites for Keepers and families.",
  openGraph: {
    title: "Riftwilds Printables — Adventure Ready",
    description:
      "Print-ready posters, trading cards, and crafts from the world of Keepers, Riftlings, and rift storms.",
    images: [{ url: "/assets/printables/poster-spark.png" }],
  },
};

const KIND_LABEL = {
  "sticker-sheet": "Sticker sheet",
  poster: "Poster",
  bookmark: "Bookmark",
  "trading-card": "Trading cards",
  card: "5×7 card",
  invite: "Party invite",
  standee: "Paper craft",
} as const;

/** Featured hero strip — distinct art so the page never reads as empty dark wells. */
const HERO_PREVIEWS = [
  {
    src: "/assets/printables/poster-spark.png",
    alt: "Spark's Stand poster preview",
  },
  {
    src: "/assets/printables/trading-cards-sheet.png",
    alt: "Riftling trading cards preview",
  },
  {
    src: "/assets/printables/sticker-sheet-riftlings.png",
    alt: "Riftling sticker sheet preview",
  },
] as const;

export default function PrintablesPage() {
  const items = listPrintables();

  return (
    <div className="relative mx-auto max-w-5xl space-y-10 px-4 py-10 md:px-6">
      <header className="relative overflow-hidden rounded-2xl border border-[var(--stroke-bronze)] bg-[linear-gradient(165deg,rgba(31,24,16,0.82)_0%,rgba(22,20,16,0.72)_40%,rgba(18,22,28,0.78)_100%)] px-6 py-12 shadow-[var(--shadow-panel)] backdrop-blur-[2px] md:px-10">
        <Image
          src="/assets/ui/wallpapers/docs.png"
          alt=""
          fill
          unoptimized
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="pointer-events-none object-cover object-[center_35%] opacity-45"
          aria-hidden
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(14,12,10,0.78)] via-[rgba(14,12,10,0.55)] to-[rgba(14,12,10,0.35)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,213,176,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(232,213,176,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
          <div>
            <p className="page-kicker">Keepers · Riftlings · Living towns</p>
            <h1 className="font-display mt-3 text-4xl text-[var(--parchment,#e8d5b0)] md:text-5xl">
              Printables
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
              Bring {projectConfig.UNIVERSE_NAME} home — battle posters, companion trading cards,
              bookmarks, stickers, and circus invites at true 300 DPI. Adventure, care, and stakes on
              paper.
            </p>
            <p className="mt-2 text-xs text-[var(--text-dim)]">{PRINTABLES_DPI_NOTE}</p>
            <p className="mt-2 text-xs text-[var(--text-dim)]">{PRINTABLES_CREDIT}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/fan-kit#downloads" className="btn-secondary focus-ring text-sm">
                Fan Kit
              </Link>
              <Link href="/coloring" className="btn-secondary focus-ring text-sm">
                Coloring pages
              </Link>
              <Link href="/comics" className="btn-secondary focus-ring text-sm">
                Comics
              </Link>
            </div>
          </div>

          <ul
            className="grid grid-cols-3 gap-2 sm:gap-3"
            aria-label="Featured printable previews"
          >
            {HERO_PREVIEWS.map((preview) => (
              <li
                key={preview.src}
                className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[rgba(196,168,130,0.4)] bg-[rgba(248,242,230,0.92)] shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
              >
                <Image
                  src={preview.src}
                  alt={preview.alt}
                  fill
                  unoptimized
                  sizes="120px"
                  className="object-contain object-top p-1.5"
                />
              </li>
            ))}
          </ul>
        </div>
      </header>

      <section
        className="relative overflow-hidden rounded-2xl border border-[rgba(196,168,130,0.45)] shadow-[var(--shadow-panel)]"
        aria-label="How to print"
      >
        <Image
          src="/assets/wallpapers/keeper-academy.png"
          alt=""
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="pointer-events-none object-cover object-center opacity-30"
          aria-hidden
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(244,232,210,0.96)] via-[rgba(240,226,200,0.92)] to-[rgba(232,213,176,0.88)]"
        />
        <div className="relative space-y-2 p-5 text-[#2a2118] md:p-6">
          <h2 className="font-display text-lg text-[#1a1510]">How to print</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-[#3a3028]">
            <li>Download PDF (easiest) or PNG · 300 DPI.</li>
            <li>
              Print at 100% / actual size — turn off “fit to page” for true letter / A4 / 5×7 size.
            </li>
            <li>
              Use color paper or sticker paper for sticker sheets; cardstock for standees and cards.
            </li>
            <li>Cut on dashed guides where shown. Laminate bookmarks if you like.</li>
          </ol>
        </div>
      </section>

      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--stroke-bronze)] p-4 sm:p-5 md:p-6"
        aria-label="Printable downloads"
      >
        <Image
          src="/assets/ui/wallpapers/docs.png"
          alt=""
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="pointer-events-none object-cover object-center opacity-40"
          aria-hidden
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(12,10,8,0.55)] via-[rgba(12,10,8,0.42)] to-[rgba(10,12,16,0.72)]"
        />
        <div className="relative mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="page-kicker">Gallery · 12 downloads</p>
            <h2 className="font-display mt-1 text-2xl text-[var(--parchment,#e8d5b0)]">
              Adventure-ready sheets
            </h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
              Every card below has a full preview plus PDF and PNG at 300 DPI.
            </p>
          </div>
        </div>

        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="panel flex flex-col overflow-hidden border-[var(--stroke-bronze)] bg-[rgba(14,12,10,0.72)] transition-[border-color,box-shadow] hover:border-[var(--stroke-amber)] hover:shadow-[0_0_28px_rgba(255,184,77,0.12)]"
            >
              <div
                className={`printable-thumb printable-thumb--${item.atmosphere} relative aspect-[3/4] bg-[rgba(248,242,230,0.96)] ring-1 ring-inset ring-[rgba(196,168,130,0.35)]`}
              >
                <Image
                  src={item.pngSrc}
                  alt={`${item.title} preview`}
                  fill
                  className="object-contain object-top p-2"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--amber)]">
                  {KIND_LABEL[item.kind]} · 300 DPI print
                </p>
                <h2 className="font-display text-lg text-[var(--parchment,#e8d5b0)]">
                  {item.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
                <p className="text-[11px] text-[var(--text-dim)]">{item.paperNote}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <a
                    href={item.pdfSrc}
                    download={`${item.slug}.pdf`}
                    className="btn-print-pdf focus-ring text-sm"
                  >
                    PDF · 300 DPI
                  </a>
                  <a
                    href={item.pngSrc}
                    download={`${item.slug}.png`}
                    className="btn-print-png focus-ring text-sm"
                  >
                    PNG · 300 DPI
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-[var(--stroke-bronze)]">
        <Image
          src="/assets/printables/poster-hatchery.png"
          alt=""
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="pointer-events-none object-cover object-[center_30%] opacity-35"
          aria-hidden
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[rgba(12,10,8,0.9)] via-[rgba(12,10,8,0.78)] to-[rgba(12,10,8,0.55)]"
        />
        <div className="relative flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg text-[var(--parchment,#e8d5b0)]">
              Want line-art to color?
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Black-line coloring sheets live on the Kids Coloring page — separate from these
              full-color adventure printables.
            </p>
          </div>
          <Link href="/coloring" className="btn-print-pdf focus-ring shrink-0 text-sm">
            Open coloring
          </Link>
        </div>
      </section>
    </div>
  );
}
