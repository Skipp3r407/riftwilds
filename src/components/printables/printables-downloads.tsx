import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  PRINTABLES_CREDIT,
  PRINTABLES_DPI_NOTE,
  listPrintables,
  type PrintableItem,
} from "@/content/printables";
import { cn } from "@/lib/utils/cn";

type Props = {
  variant?: "full" | "compact";
  className?: string;
  showIndexLink?: boolean;
  items?: PrintableItem[];
};

const KIND_LABEL: Record<PrintableItem["kind"], string> = {
  "sticker-sheet": "Sticker sheet",
  poster: "Poster",
  bookmark: "Bookmark",
  "trading-card": "Trading cards",
  card: "5×7 card",
  invite: "Party invite",
  standee: "Paper craft",
};

function filenameFromSrc(src: string) {
  return src.split("/").pop() ?? "download.png";
}

export function PrintablesDownloads({
  variant = "full",
  className,
  showIndexLink = true,
  items = listPrintables(),
}: Props) {
  if (variant === "compact") {
    return (
      <aside
        className={cn(
          "rounded-xl border border-[rgba(196,168,130,0.35)] bg-[rgba(20,14,10,0.45)] px-4 py-3",
          className,
        )}
        aria-label="300 DPI printables"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--amber)]">
              300 DPI print
            </p>
            <p className="font-display text-lg text-[var(--parchment,#e8d5b0)]">
              Printable gear
            </p>
          </div>
          {showIndexLink ? (
            <Link href="/printables" className="btn-secondary focus-ring text-sm">
              All printables
            </Link>
          ) : null}
        </div>
        <ul className="mt-3 flex flex-wrap gap-2">
          {items.slice(0, 5).map((item) => (
            <li key={item.id}>
              <a
                href={item.pdfSrc}
                download={filenameFromSrc(item.pdfSrc)}
                className="btn-secondary focus-ring inline-flex items-center gap-1.5 text-xs"
              >
                <Download size={14} aria-hidden />
                {item.shortLabel}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-[rgba(232,213,176,0.55)]">{PRINTABLES_CREDIT}</p>
      </aside>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--stroke-bronze)] p-6 md:p-8",
        className,
      )}
      aria-labelledby="printables-heading"
    >
      <Image
        src="/assets/ui/wallpapers/docs.png"
        alt=""
        fill
        unoptimized
        sizes="100vw"
        className="pointer-events-none object-cover opacity-35"
        aria-hidden
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(255,184,77,0.14),transparent_50%),radial-gradient(ellipse_at_85%_30%,rgba(61,231,255,0.1),transparent_45%),linear-gradient(165deg,rgba(31,24,16,0.82)_0%,rgba(20,24,32,0.78)_55%,rgba(18,22,28,0.88)_100%)]"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="page-kicker">300 DPI print</p>
          <h2
            id="printables-heading"
            className="font-display mt-2 text-2xl text-[var(--parchment,#e8d5b0)] md:text-3xl"
          >
            Printable gear
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            Battle posters, companion trading cards, bookmarks, stickers, and a circus invite —
            ready for home printers.
          </p>
          <p className="mt-2 max-w-xl text-xs text-[var(--text-dim)]">{PRINTABLES_DPI_NOTE}</p>
        </div>
        {showIndexLink ? (
          <Link href="/printables" className="btn-secondary focus-ring text-sm">
            View all downloads
          </Link>
        ) : null}
      </div>

      <ul className="relative mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <li key={item.id}>
            <article className="panel overflow-hidden border-[var(--stroke-bronze)] bg-[rgba(14,12,10,0.72)] p-3">
              <div
                className={`printable-thumb printable-thumb--${item.atmosphere} relative aspect-[850/1100] overflow-hidden rounded-lg bg-[rgba(248,242,230,0.96)] ring-1 ring-[rgba(196,168,130,0.28)]`}
              >
                <Image
                  src={item.pngSrc}
                  alt={`${item.title} preview`}
                  fill
                  className="object-contain object-top p-1.5"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-[var(--amber)]">
                {KIND_LABEL[item.kind]} · 300 DPI
              </p>
              <h3 className="mt-1 font-display text-base text-[var(--parchment,#e8d5b0)]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                {item.description}
              </p>
              <p className="mt-1 text-[11px] text-[var(--text-dim)]">{item.paperNote}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={item.pdfSrc}
                  download={filenameFromSrc(item.pdfSrc)}
                  className="btn-print-pdf focus-ring text-xs"
                >
                  <Download size={14} aria-hidden />
                  PDF · 300 DPI
                </a>
                <a
                  href={item.pngSrc}
                  download={filenameFromSrc(item.pngSrc)}
                  className="btn-print-png focus-ring text-xs"
                >
                  PNG · 300 DPI
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="relative mt-5 text-xs text-[var(--text-muted)]">{PRINTABLES_CREDIT}</p>
    </section>
  );
}
