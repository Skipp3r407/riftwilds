import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  WALLPAPER_CREDIT,
  listWallpapers,
  type Wallpaper,
} from "@/content/wallpapers";
import { cn } from "@/lib/utils/cn";

type Props = {
  variant?: "full" | "compact";
  className?: string;
  showIndexLink?: boolean;
  wallpapers?: Wallpaper[];
};

function filenameFromSrc(src: string) {
  return src.split("/").pop() ?? "wallpaper.png";
}

export function WallpaperDownloads({
  variant = "full",
  className,
  showIndexLink = true,
  wallpapers = listWallpapers(),
}: Props) {
  if (variant === "compact") {
    return (
      <aside
        className={cn(
          "rounded-xl border border-[rgba(61,231,255,0.28)] bg-[rgba(10,18,36,0.55)] px-4 py-3",
          className,
        )}
        aria-label="Wallpapers"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
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
        <ul className="mt-3 flex flex-wrap gap-2">
          {wallpapers.slice(0, 4).map((wp) => (
            <li key={wp.id}>
              <a
                href={wp.pngSrc}
                download={filenameFromSrc(wp.pngSrc)}
                className="btn-secondary focus-ring inline-flex items-center gap-1.5 text-xs"
              >
                <Download size={14} aria-hidden />
                {wp.shortLabel}
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
            Battle Wallpapers
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
            Fifteen cinematic Riftwilds warfronts — Keepers, Riftlings, and the stakes they fight for.
            1920×1080, ready for your desktop.
          </p>
        </div>
        {showIndexLink ? (
          <Link href="/fan-kit#downloads" className="btn-secondary focus-ring text-sm">
            Fan Kit hub
          </Link>
        ) : null}
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wallpapers.map((wp) => (
          <li key={wp.id}>
            <article className="panel overflow-hidden p-3">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-[#0a1228] ring-1 ring-[rgba(61,231,255,0.2)]">
                <Image
                  src={wp.pngSrc}
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
