import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  WALLPAPER_CREDIT,
  listFeaturedWallpapers,
  listWallpapers,
  type Wallpaper,
} from "@/content/wallpapers";
import { cn } from "@/lib/utils/cn";

type Props = {
  /** Compact tile strip; full grid elsewhere; featured = examples-only Desktop Art strip */
  variant?: "full" | "compact" | "featured";
  className?: string;
  /** Show index / Fan Kit links (ignored for featured examples strip) */
  showIndexLink?: boolean;
  wallpapers?: Wallpaper[];
};

function filenameFromSrc(src: string) {
  return src.split("/").pop() ?? "wallpaper.png";
}

function previewSrc(wp: Wallpaper) {
  return wp.thumbSrc ?? wp.pngSrc;
}

export function WallpaperDownloads({
  variant = "full",
  className,
  showIndexLink = true,
  wallpapers,
}: Props) {
  const resolved =
    wallpapers ??
    (variant === "featured" || variant === "compact"
      ? listFeaturedWallpapers(4)
      : listWallpapers());

  if (variant === "featured") {
    return (
      <aside
        className={cn(
          "rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_80%_0%,rgba(61,231,255,0.14),transparent_50%),radial-gradient(ellipse_at_10%_40%,rgba(255,184,77,0.1),transparent_45%),linear-gradient(165deg,#0a1228_0%,#121a28_55%,#1a1510_100%)] p-6 md:p-8",
          className,
        )}
        aria-label="Desktop art examples"
      >
        <div>
          <p className="page-kicker">Desktop art</p>
          <p className="font-display mt-2 text-2xl text-white md:text-3xl">Wallpaper examples</p>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            Commons, Spark, Meadow, and Circus — a preview of cinematic Riftwilds warfront art.
          </p>
        </div>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resolved.map((wp) => (
            <li key={wp.id}>
              <div className="relative overflow-hidden rounded-lg ring-1 ring-[rgba(61,231,255,0.22)]">
                <div className="relative aspect-video bg-[#0a1228]">
                  <Image
                    src={previewSrc(wp)}
                    alt={`${wp.title} example`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    unoptimized
                  />
                  <span className="absolute right-2 top-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--cyan)] ring-1 ring-[rgba(61,231,255,0.35)]">
                    Example
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2.5 pb-2 pt-8">
                    <span className="text-xs font-medium text-white">{wp.shortLabel}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    );
  }

  if (variant === "compact") {
    return (
      <aside
        className={cn(
          "rounded-xl border border-[rgba(61,231,255,0.28)] bg-[rgba(10,18,36,0.55)] px-4 py-3",
          className,
        )}
        aria-label="Wallpapers"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">Desktop art</p>
            <p className="font-display text-lg text-white">Wallpapers</p>
          </div>
          {showIndexLink ? (
            <div className="flex flex-wrap gap-2">
              <Link href="/coloring#wallpapers" className="btn-secondary focus-ring text-sm">
                Browse all
              </Link>
              <Link href="/fan-kit#downloads" className="btn-secondary focus-ring text-sm">
                Fan Kit
              </Link>
            </div>
          ) : null}
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {resolved.map((wp) => (
            <li key={wp.id}>
              <a
                href={wp.pngSrc}
                download={filenameFromSrc(wp.pngSrc)}
                className="group focus-ring relative block overflow-hidden rounded-lg ring-1 ring-[rgba(61,231,255,0.22)] transition hover:ring-[rgba(61,231,255,0.55)]"
              >
                <div className="relative aspect-video bg-[#0a1228]">
                  <Image
                    src={previewSrc(wp)}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2.5 pb-2 pt-8">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white">
                      <Download size={14} aria-hidden className="shrink-0 text-[var(--cyan)]" />
                      {wp.shortLabel}
                    </span>
                  </div>
                </div>
                <span className="sr-only">Download {wp.title}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">{WALLPAPER_CREDIT}</p>
      </aside>
    );
  }

  return (
    <section
      id="wallpapers"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[radial-gradient(ellipse_at_80%_0%,rgba(61,231,255,0.14),transparent_50%),radial-gradient(ellipse_at_10%_40%,rgba(255,184,77,0.1),transparent_45%),linear-gradient(165deg,#0a1228_0%,#121a28_55%,#1a1510_100%)] p-6 md:p-8",
        className,
      )}
      aria-labelledby="wallpapers-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="page-kicker">Desktop &amp; phone</p>
          <h2 id="wallpapers-heading" className="font-display mt-2 text-2xl text-white md:text-3xl">
            Desktop Wallpapers
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            {resolved.length} cinematic Riftwilds scenes — warfronts, companions, and the places they
            call home. 1920×1080, ready for your desktop.
          </p>
        </div>
        {showIndexLink ? (
          <Link href="/fan-kit#downloads" className="btn-secondary focus-ring text-sm">
            Fan Kit hub
          </Link>
        ) : null}
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resolved.map((wp) => (
          <li key={wp.id}>
            <article className="panel overflow-hidden p-3">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-[#0a1228] ring-1 ring-[rgba(61,231,255,0.2)]">
                <Image
                  src={previewSrc(wp)}
                  alt={`${wp.title} wallpaper preview`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
              </div>
              <h3 className="mt-3 font-display text-base text-white">{wp.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{wp.description}</p>
              <div className="mt-3">
                <a
                  href={wp.pngSrc}
                  download={filenameFromSrc(wp.pngSrc)}
                  className="btn-primary focus-ring inline-flex items-center gap-1.5 text-xs"
                >
                  <Download size={14} aria-hidden />
                  Download 1920×1080
                </a>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-[var(--text-muted)]">{WALLPAPER_CREDIT}</p>
    </section>
  );
}
