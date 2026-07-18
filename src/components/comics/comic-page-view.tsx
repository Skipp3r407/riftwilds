"use client";

import Image from "next/image";
import type { ComicHotspot, ComicPage } from "@/content/comics/types";
import { cn } from "@/lib/utils/cn";

const ATMOS: Record<string, string> = {
  dawn: "from-[#3a2820] via-[#2f5a3a] to-[#0a1830]",
  day: "from-[#2f5a3a] via-[#4a8f4a] to-[#1a2840]",
  dusk: "from-[#3a2820] via-[#8b5a3c] to-[#121a28]",
  night: "from-[#0a1830] via-[#121a28] to-[#1a1510]",
  rift: "from-[#121a28] via-[#1a2840] to-[#2a2118]",
  festival: "from-[#1a2030] via-[#3a2820] to-[#0a1830]",
  storm: "from-[#1a2438] via-[#3d4a60] to-[#0a1830]",
  ruin: "from-[#2a2118] via-[#5c3d2e] to-[#121a28]",
};

type Props = {
  page: ComicPage;
  issueTitle: string;
  highContrast?: boolean;
  darkMode?: boolean;
  foundHotspots: string[];
  onHotspot: (hotspot: ComicHotspot) => void;
  zoom?: number;
};

function Bubbles({ page }: { page: ComicPage }) {
  const bubbles = page.panels.flatMap((p) => p.bubbles);
  return (
    <div className="space-y-3">
      {bubbles.map((b, i) => {
        if (b.kind === "sfx") {
          return (
            <p
              key={i}
              className="font-display text-center text-2xl uppercase tracking-widest text-[var(--amber)]"
            >
              {b.text}
            </p>
          );
        }
        if (b.kind === "narration" || b.kind === "caption") {
          return (
            <p
              key={i}
              className={cn(
                "rounded-md border border-[rgba(196,168,130,0.35)] bg-[rgba(232,213,176,0.08)] px-3 py-2 text-sm italic leading-relaxed text-[var(--stone)]",
                b.kind === "caption" && "not-italic text-[var(--text-muted)]",
              )}
            >
              {b.text}
            </p>
          );
        }
        return (
          <div
            key={i}
            className={cn(
              "relative max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              b.kind === "thought"
                ? "ml-auto border border-dashed border-[rgba(61,231,255,0.35)] bg-[rgba(61,231,255,0.08)] text-[var(--cyan)]"
                : "border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] text-white",
            )}
          >
            {b.speaker && (
              <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-[var(--amber)]">
                {b.speaker}
              </p>
            )}
            <p>{b.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export function ComicPageView({
  page,
  issueTitle,
  highContrast,
  darkMode = true,
  foundHotspots,
  onHotspot,
  zoom = 1,
}: Props) {
  const artSrc = page.artSrc ?? page.panels.find((p) => p.artSrc)?.artSrc;
  const atm = page.atmosphere ?? "day";
  const gradient = ATMOS[atm] ?? ATMOS.day;

  return (
    <article
      className={cn(
        "relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl border shadow-2xl",
        highContrast
          ? "border-white bg-black text-white"
          : "border-[var(--stroke)] bg-[rgba(10,14,24,0.95)]",
        !darkMode && "bg-[rgba(232,213,176,0.95)] text-[#2a2118]",
      )}
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
      aria-label={`${issueTitle}, page ${page.pageNumber}`}
    >
      <div className={cn("relative min-h-[70vh] bg-gradient-to-b", gradient)}>
        {artSrc ? (
          <div className="relative aspect-[3/4] w-full sm:aspect-[4/5]">
            <Image
              src={artSrc}
              alt={page.artAlt ?? `${issueTitle} page ${page.pageNumber} illustration`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          </div>
        ) : (
          <div className="aspect-[3/4] w-full" aria-hidden />
        )}

        {page.hotspots?.map((h) => {
          const found = foundHotspots.includes(h.id);
          return (
            <button
              key={h.id}
              type="button"
              className={cn(
                "absolute z-10 rounded-md border-2 focus-ring transition",
                found
                  ? "border-[var(--emerald)] bg-[rgba(74,223,122,0.25)]"
                  : "border-[var(--cyan)]/40 bg-[rgba(61,231,255,0.12)] hover:bg-[rgba(61,231,255,0.28)]",
              )}
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${h.w}%`,
                height: `${h.h}%`,
              }}
              aria-label={found ? `Found: ${h.label}` : `Hidden object: ${h.label}`}
              title={h.hint ?? h.label}
              onClick={() => onHotspot(h)}
            />
          );
        })}

        <div className="relative z-[2] space-y-4 p-4 pb-8 md:p-6">
          {page.title && (
            <h3 className="font-display text-2xl text-white drop-shadow">{page.title}</h3>
          )}

          {page.layout !== "splash" && page.panels.length > 1 && (
            <div
              className={cn(
                "grid gap-3",
                page.layout === "two-col" && "sm:grid-cols-2",
                page.layout === "grid-2x2" && "sm:grid-cols-2",
                page.layout === "grid-3" && "sm:grid-cols-3",
                page.layout === "three-stack" && "grid-cols-1",
              )}
            >
              {page.panels.map((panel) => (
                <div
                  key={panel.id}
                  className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-black/35 p-3"
                >
                  {panel.caption && (
                    <p className="mb-2 text-xs uppercase tracking-wider text-[var(--mint)]">
                      {panel.caption}
                    </p>
                  )}
                  <Bubbles page={{ ...page, panels: [panel] }} />
                </div>
              ))}
            </div>
          )}

          {(page.layout === "splash" ||
            page.layout === "narrative" ||
            page.layout === "lore" ||
            page.layout === "end" ||
            page.layout === "wide" ||
            page.panels.length === 1) &&
            page.panels.length <= 1 && <Bubbles page={page} />}

          {page.loreSidebar && (
            <aside className="rounded-lg border border-[rgba(61,231,255,0.3)] bg-[rgba(10,24,40,0.75)] p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--cyan)]">
                Lore sidebar
              </p>
              <h4 className="font-display mt-1 text-lg text-white">{page.loreSidebar.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {page.loreSidebar.body}
              </p>
            </aside>
          )}

          {page.developerNote && (
            <p className="text-xs text-[var(--text-muted)]">Dev note: {page.developerNote}</p>
          )}
        </div>
      </div>
      <footer className="flex items-center justify-between border-t border-[var(--stroke)] px-4 py-2 text-xs text-[var(--text-muted)]">
        <span>{issueTitle}</span>
        <span>Page {page.pageNumber}</span>
      </footer>
    </article>
  );
}
