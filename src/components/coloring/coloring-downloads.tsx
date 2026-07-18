import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  COLORING_CREDIT,
  listColoringSheets,
  type ColoringSheet,
} from "@/content/coloring";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Compact strip for comic reader; full grid elsewhere */
  variant?: "full" | "compact";
  className?: string;
  /** Show link to /coloring index */
  showIndexLink?: boolean;
  sheets?: ColoringSheet[];
};

function filenameFromSrc(src: string) {
  return src.split("/").pop() ?? "download.png";
}

export function ColoringDownloads({
  variant = "full",
  className,
  showIndexLink = true,
  sheets = listColoringSheets(),
}: Props) {
  if (variant === "compact") {
    return (
      <aside
        className={cn(
          "rounded-xl border border-[rgba(196,168,130,0.35)] bg-[rgba(20,14,10,0.45)] px-4 py-3",
          className,
        )}
        aria-label="Kids coloring pages"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--amber)]">
              Kids corner
            </p>
            <p className="font-display text-lg text-[var(--parchment,#e8d5b0)]">
              Download to color
            </p>
          </div>
          {showIndexLink ? (
            <div className="flex flex-wrap gap-2">
              <Link href="/coloring" className="btn-secondary focus-ring text-sm">
                All coloring pages
              </Link>
              <Link href="/fan-kit#kids" className="btn-secondary focus-ring text-sm">
                Fan Kit
              </Link>
            </div>
          ) : null}
        </div>
        <ul className="mt-3 flex flex-wrap gap-2">
          {sheets.slice(0, 4).map((sheet) => (
            <li key={sheet.id}>
              <a
                href={sheet.pngSrc}
                download={filenameFromSrc(sheet.pngSrc)}
                className="btn-secondary focus-ring inline-flex items-center gap-1.5 text-xs"
              >
                <Download size={14} aria-hidden />
                {sheet.shortLabel}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-[rgba(232,213,176,0.55)]">{COLORING_CREDIT}</p>
      </aside>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_15%_0%,rgba(255,184,77,0.12),transparent_50%),radial-gradient(ellipse_at_85%_30%,rgba(61,231,255,0.1),transparent_45%),linear-gradient(165deg,#1a1510_0%,#121a28_55%,#0e1624_100%)] p-6 md:p-8",
        className,
      )}
      aria-labelledby="coloring-pages-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="page-kicker">Kids corner</p>
          <h2 id="coloring-pages-heading" className="font-display mt-2 text-2xl text-white md:text-3xl">
            Coloring pages
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            28 printable black-line game-sketch sheets — Spark, Commons, circus, Keepers, harbor,
            hatchery, and more — made for crayons and markers.
          </p>
        </div>
        {showIndexLink ? (
          <Link href="/coloring" className="btn-secondary focus-ring text-sm">
            View all downloads
          </Link>
        ) : null}
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sheets.map((sheet) => (
          <li key={sheet.id}>
            <article className="panel overflow-hidden p-3">
              <div className="relative aspect-[850/1100] overflow-hidden rounded-lg bg-white ring-1 ring-[rgba(196,168,130,0.25)]">
                <Image
                  src={sheet.pngSrc}
                  alt={`${sheet.title} preview`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
              </div>
              <h3 className="mt-3 font-display text-base text-white">{sheet.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                {sheet.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={sheet.pngSrc}
                  download={filenameFromSrc(sheet.pngSrc)}
                  className="btn-primary focus-ring inline-flex items-center gap-1.5 text-xs"
                >
                  <Download size={14} aria-hidden />
                  PNG
                </a>
                {sheet.pdfSrc ? (
                  <a
                    href={sheet.pdfSrc}
                    download={filenameFromSrc(sheet.pdfSrc)}
                    className="btn-secondary focus-ring inline-flex items-center gap-1.5 text-xs"
                  >
                    PDF
                  </a>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-[var(--text-muted)]">{COLORING_CREDIT}</p>
    </section>
  );
}
