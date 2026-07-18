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

export default function PrintablesPage() {
  const items = listPrintables();

  return (
    <div className="relative mx-auto max-w-5xl space-y-10 px-4 py-10 md:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-4 h-[420px] opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 15% 0%, rgba(255,184,77,0.16), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 10%, rgba(61,231,255,0.12), transparent 50%), radial-gradient(ellipse 60% 40% at 50% 30%, rgba(196,168,130,0.08), transparent 60%)",
        }}
      />

      <header className="relative overflow-hidden rounded-2xl border border-[var(--stroke-bronze)] bg-[linear-gradient(165deg,#1f1810_0%,#161410_40%,#12161c_100%)] px-6 py-12 shadow-[var(--shadow-panel)] md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,213,176,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,213,176,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(61,231,255,0.2),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,184,77,0.18),transparent_70%)]"
        />

        <p className="page-kicker relative">Keepers · Riftlings · Living towns</p>
        <h1 className="font-display relative mt-3 text-4xl text-[var(--parchment,#e8d5b0)] md:text-5xl">
          Printables
        </h1>
        <p className="relative mt-4 max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
          Bring {projectConfig.UNIVERSE_NAME} home — battle posters, companion trading cards,
          bookmarks, stickers, and circus invites at true 300 DPI. Adventure, care, and stakes on
          paper.
        </p>
        <p className="relative mt-2 text-xs text-[var(--text-dim)]">{PRINTABLES_DPI_NOTE}</p>
        <p className="relative mt-2 text-xs text-[var(--text-dim)]">{PRINTABLES_CREDIT}</p>
        <div className="relative mt-6 flex flex-wrap gap-2">
          <Link href="/fan-kit#downloads" className="btn-secondary focus-ring text-sm">
            Fan Kit
          </Link>
          <Link href="/coloring" className="btn-secondary focus-ring text-sm">
            Coloring pages
          </Link>
          <Link href="/comics" className="btn-primary focus-ring text-sm">
            Comics
          </Link>
        </div>
      </header>

      <section
        className="panel panel--parchment space-y-2 p-5 text-[#2a2118]"
        aria-label="How to print"
      >
        <h2 className="font-display text-lg text-[#1a1510]">How to print</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-[#3a3028]">
          <li>Download PDF (easiest) or PNG · 300 DPI.</li>
          <li>Print at 100% / actual size — turn off “fit to page” for true letter / A4 / 5×7 size.</li>
          <li>Use color paper or sticker paper for sticker sheets; cardstock for standees and cards.</li>
          <li>Cut on dashed guides where shown. Laminate bookmarks if you like.</li>
        </ol>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Printable downloads">
        {items.map((item) => (
          <article
            key={item.id}
            className="panel flex flex-col overflow-hidden border-[var(--stroke-bronze)] transition-[border-color,box-shadow] hover:border-[var(--stroke-amber)] hover:shadow-[0_0_28px_rgba(255,184,77,0.12)]"
          >
            <div className="relative aspect-[3/4] bg-[linear-gradient(180deg,#1a1510_0%,#12161c_100%)] ring-1 ring-inset ring-[rgba(196,168,130,0.22)]">
              <Image
                src={item.pngSrc}
                alt={`${item.title} preview`}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[rgba(18,16,12,0.55)] to-transparent"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--amber)]">
                {KIND_LABEL[item.kind]} · 300 DPI print
              </p>
              <h2 className="font-display text-lg text-[var(--parchment,#e8d5b0)]">{item.title}</h2>
              <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
              <p className="text-[11px] text-[var(--text-dim)]">{item.paperNote}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <a
                  href={item.pdfSrc}
                  download={`${item.slug}.pdf`}
                  className="btn-primary focus-ring text-sm"
                >
                  PDF · 300 DPI
                </a>
                <a
                  href={item.pngSrc}
                  download={`${item.slug}.png`}
                  className="btn-secondary focus-ring text-sm"
                >
                  PNG · 300 DPI
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="panel flex flex-col gap-3 border-[var(--stroke-bronze)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg text-[var(--parchment,#e8d5b0)]">
            Want line-art to color?
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Black-line coloring sheets live on the Kids Coloring page — separate from these
            full-color adventure printables.
          </p>
        </div>
        <Link href="/coloring" className="btn-primary focus-ring shrink-0 text-sm">
          Open coloring
        </Link>
      </section>
    </div>
  );
}
