"use client";

import Image from "next/image";
import type { ComicHotspot, ComicPage } from "@/content/comics/types";
import { cn } from "@/lib/utils/cn";

const ATMOS: Record<string, string> = {
  dawn: "from-[#3a2820]/80 via-[#2f5a3a]/55 to-[#0a1830]/70",
  day: "from-[#2f5a3a]/70 via-[#4a8f4a]/45 to-[#1a2840]/65",
  dusk: "from-[#3a2820]/80 via-[#8b5a3c]/55 to-[#121a28]/70",
  night: "from-[#0a1830]/75 via-[#121a28]/60 to-[#1a1510]/80",
  rift: "from-[#121a28]/75 via-[#1a2840]/55 to-[#2a2118]/70",
  festival: "from-[#1a2030]/70 via-[#3a2820]/55 to-[#0a1830]/70",
  storm: "from-[#1a2438]/75 via-[#3d4a60]/50 to-[#0a1830]/75",
  ruin: "from-[#2a2118]/80 via-[#5c3d2e]/55 to-[#121a28]/70",
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

function Bubbles({ page, ink }: { page: ComicPage; ink: boolean }) {
  const bubbles = page.panels.flatMap((p) => p.bubbles);
  return (
    <div className="space-y-3">
      {bubbles.map((b, i) => {
        if (b.kind === "sfx") {
          return (
            <p
              key={i}
              className={cn(
                "font-display text-center text-2xl uppercase tracking-widest",
                ink ? "text-[#8b5a3c]" : "text-[var(--amber)]",
              )}
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
                "rounded-md border px-3 py-2 text-sm italic leading-relaxed",
                ink
                  ? "border-[rgba(92,61,46,0.35)] bg-[rgba(255,248,230,0.45)] text-[#2a2118]"
                  : "border-[rgba(196,168,130,0.35)] bg-[rgba(232,213,176,0.08)] text-[var(--stone)]",
                b.kind === "caption" && "not-italic opacity-80",
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
                ? ink
                  ? "ml-auto border border-dashed border-[rgba(92,61,46,0.45)] bg-[rgba(255,248,230,0.55)] text-[#3a2820]"
                  : "ml-auto border border-dashed border-[rgba(196,168,130,0.45)] bg-[rgba(232,213,176,0.1)] text-[var(--stone)]"
                : ink
                  ? "border border-[rgba(42,33,24,0.2)] bg-[rgba(255,252,245,0.72)] text-[#2a2118] shadow-sm"
                  : "border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] text-white",
            )}
          >
            {b.speaker && (
              <p
                className={cn(
                  "mb-1 text-[10px] uppercase tracking-[0.16em]",
                  ink ? "text-[#8b5a3c]" : "text-[var(--amber)]",
                )}
              >
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
  /** Dark mode = reading lamp on parchment (still warm paper). */
  const parchment = !highContrast;
  const lamp = parchment && darkMode;

  return (
    <article
      className={cn(
        "relative mx-auto w-full max-w-3xl overflow-hidden",
        highContrast
          ? "rounded-xl border border-white bg-black text-white shadow-2xl"
          : cn("comic-page-paper", lamp && "comic-page-paper--lamp"),
      )}
      style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
      aria-label={`${issueTitle}, page ${page.pageNumber}`}
    >
      <div className={cn("relative z-[2] min-h-[70vh] bg-gradient-to-b", gradient)}>
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
            <div
              className={cn(
                "absolute inset-0",
                parchment
                  ? "bg-gradient-to-t from-[rgba(42,33,24,0.88)] via-[rgba(42,33,24,0.2)] to-transparent"
                  : "bg-gradient-to-t from-black/85 via-black/25 to-transparent",
              )}
            />
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
                  : parchment
                    ? "border-[rgba(139,90,60,0.55)] bg-[rgba(232,213,176,0.18)] hover:bg-[rgba(232,213,176,0.35)]"
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
            <h3
              className={cn(
                "font-display text-2xl drop-shadow",
                parchment ? "text-[#f5ead2]" : "text-white",
              )}
            >
              {page.title}
            </h3>
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
                  className={cn(
                    "rounded-lg border p-3",
                    parchment
                      ? "border-[rgba(42,33,24,0.2)] bg-[rgba(255,248,230,0.55)]"
                      : "border-[rgba(255,255,255,0.12)] bg-black/35",
                  )}
                >
                  {panel.caption && (
                    <p
                      className={cn(
                        "mb-2 text-xs uppercase tracking-wider",
                        parchment ? "text-[#5c3d2e]" : "text-[var(--mint)]",
                      )}
                    >
                      {panel.caption}
                    </p>
                  )}
                  <Bubbles page={{ ...page, panels: [panel] }} ink={parchment} />
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
            page.panels.length <= 1 && <Bubbles page={page} ink={parchment} />}

          {page.loreSidebar && (
            <aside
              className={cn(
                "rounded-lg border p-4",
                parchment
                  ? "border-[rgba(139,90,60,0.45)] bg-[rgba(255,248,230,0.65)]"
                  : "border-[rgba(61,231,255,0.3)] bg-[rgba(10,24,40,0.75)]",
              )}
            >
              <p
                className={cn(
                  "text-[10px] uppercase tracking-[0.18em]",
                  parchment ? "text-[#8b5a3c]" : "text-[var(--cyan)]",
                )}
              >
                Lore sidebar
              </p>
              <h4
                className={cn(
                  "font-display mt-1 text-lg",
                  parchment ? "text-[#2a2118]" : "text-white",
                )}
              >
                {page.loreSidebar.title}
              </h4>
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed",
                  parchment ? "text-[#3a2820]/90" : "text-[var(--text-muted)]",
                )}
              >
                {page.loreSidebar.body}
              </p>
            </aside>
          )}

          {page.developerNote && (
            <p className={cn("text-xs", parchment ? "text-[#5c3d2e]/80" : "text-[var(--text-muted)]")}>
              Dev note: {page.developerNote}
            </p>
          )}
        </div>
      </div>
      <footer
        className={cn(
          "relative z-[2] flex items-center justify-between border-t px-4 py-2 text-xs",
          parchment
            ? "border-[rgba(92,61,46,0.35)] text-[#5c3d2e]"
            : "border-[var(--stroke)] text-[var(--text-muted)]",
        )}
      >
        <span>{issueTitle}</span>
        <span>Page {page.pageNumber}</span>
      </footer>
    </article>
  );
}
