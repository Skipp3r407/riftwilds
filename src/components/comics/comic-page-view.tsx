"use client";

import Image from "next/image";
import type {
  ComicBubble,
  ComicHotspot,
  ComicPage,
  ComicPanel,
} from "@/content/comics/types";
import { ComicSpeechBubbles } from "@/components/comics/comic-speech-bubbles";
import { cn } from "@/lib/utils/cn";

type Props = {
  page: ComicPage;
  issueTitle: string;
  highContrast?: boolean;
  darkMode?: boolean;
  foundHotspots: string[];
  onHotspot: (hotspot: ComicHotspot) => void;
  zoom?: number;
  /** Guided reading: focused panel index */
  focusPanelIndex?: number | null;
  /** Guided reading: focused bubble index within focused panel (or page-flat) */
  focusBubbleIndex?: number | null;
  onPanelFocus?: (panelIndex: number) => void;
};

/** Remap panel-local bubble % into full-page % using panel frames. */
function flattenBubblesToPage(page: ComicPage): ComicBubble[] {
  return page.panels.flatMap((panel, panelIndex) => {
    const frame = panel.frame ?? { x: 0, y: 0, w: 100, h: 100 };
    return panel.bubbles.map((bubble, bubbleIndex) => {
      const lx = bubble.x ?? 50;
      const ly = bubble.y ?? 50;
      return {
        ...bubble,
        x: frame.x + (lx / 100) * frame.w,
        y: frame.y + (ly / 100) * frame.h,
        readOrder: bubble.readOrder ?? panelIndex * 20 + bubbleIndex,
      };
    });
  });
}

function PanelArt({
  panel,
  page,
  issueTitle,
  parchment,
  focused,
  dimmed,
  focusBubbleIndex,
  onFocus,
}: {
  panel: ComicPanel;
  page: ComicPage;
  issueTitle: string;
  parchment: boolean;
  focused?: boolean;
  dimmed?: boolean;
  focusBubbleIndex?: number | null;
  onFocus?: () => void;
}) {
  const artSrc = panel.artSrc ?? page.artSrc;
  const frame = panel.frame ?? { x: 0, y: 0, w: 100, h: 100 };
  const impact = frame.impact && frame.impact !== "none" ? frame.impact : null;

  return (
    <div
      className={cn(
        "comic-panel absolute overflow-hidden border transition-[box-shadow,opacity,transform] duration-300",
        parchment
          ? "border-[rgba(42,33,24,0.55)] bg-[rgba(20,14,10,0.35)]"
          : "border-white/25 bg-black/40",
        focused && "z-[4] shadow-[0_0_0_2px_rgba(255,184,77,0.75)]",
        dimmed && "opacity-40",
        impact === "speed-lines" && "comic-panel--speed-lines",
        impact === "impact-burst" && "comic-panel--impact",
        impact === "rift-flare" && "comic-panel--rift-flare",
      )}
      style={{
        left: `${frame.x}%`,
        top: `${frame.y}%`,
        width: `${frame.w}%`,
        height: `${frame.h}%`,
        transform: frame.tiltDeg ? `rotate(${frame.tiltDeg}deg)` : undefined,
      }}
      role={onFocus ? "button" : undefined}
      tabIndex={onFocus ? 0 : undefined}
      onClick={onFocus}
      onKeyDown={
        onFocus
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onFocus();
              }
            }
          : undefined
      }
      aria-label={panel.caption ?? `Panel ${panel.id}`}
    >
      {artSrc ? (
        <Image
          src={artSrc}
          alt={panel.artAlt ?? page.artAlt ?? `${issueTitle} panel`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, min(720px, 90vh)"
          unoptimized
          {...(page.pageNumber <= 2 ? { priority: true } : { loading: "lazy" as const })}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2840] to-[#2a2118]" aria-hidden />
      )}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          parchment
            ? "bg-gradient-to-b from-[rgba(20,14,10,0.25)] via-transparent to-[rgba(20,14,10,0.4)]"
            : "bg-gradient-to-b from-black/25 via-transparent to-black/45",
        )}
      />
      {!page.bakedLettering && (
        <ComicSpeechBubbles
          bubbles={panel.bubbles}
          parchment={parchment}
          focusIndex={focused ? (focusBubbleIndex ?? null) : dimmed ? -1 : null}
        />
      )}
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
  focusPanelIndex = null,
  focusBubbleIndex = null,
  onPanelFocus,
}: Props) {
  const artSrc = page.artSrc ?? page.panels.find((p) => p.artSrc)?.artSrc;
  const parchment = !highContrast;
  const lamp = parchment && darkMode;
  const panelCaption = page.panels.find((p) => p.caption)?.caption;
  const composed = Boolean(page.composedPlate);
  const bakedLettering = Boolean(page.bakedLettering);
  const multiPanel =
    !composed &&
    !bakedLettering &&
    page.panels.length > 1 &&
    page.layout !== "splash" &&
    page.layout !== "end";
  const allBubbles = composed
    ? flattenBubblesToPage(page)
    : page.panels.flatMap((p) => p.bubbles);
  const a11yScript = allBubbles
    .map((b) => (b.speaker ? `${b.speaker}: ${b.text}` : b.text))
    .filter(Boolean)
    .join(". ");
  const guided = focusPanelIndex != null;

  return (
    <article
      className={cn(
        "comic-page-view relative mx-auto flex h-full w-full max-w-none flex-col overflow-hidden",
        highContrast
          ? "rounded-xl border border-white bg-black text-white shadow-2xl"
          : cn("comic-page-paper", lamp && "comic-page-paper--lamp"),
      )}
      style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
      aria-label={`${issueTitle}, page ${page.pageNumber}${page.role ? `, ${page.role}` : ""}${a11yScript ? `. ${a11yScript}` : ""}`}
      data-page-role={page.role ?? "story"}
      data-baked-lettering={bakedLettering ? "true" : undefined}
    >
      {/* Keep script in DOM for screen readers when lettering is painted into art */}
      {bakedLettering && a11yScript ? (
        <p className="sr-only">
          {page.title ? `${page.title}. ` : ""}
          {panelCaption ? `${panelCaption}. ` : ""}
          {page.loreSidebar
            ? `${page.loreSidebar.title}: ${page.loreSidebar.body}. `
            : ""}
          {a11yScript}
        </p>
      ) : null}
      <div className="comic-page-art relative z-[2] min-h-0 flex-1 overflow-hidden">
        {multiPanel ? (
          <>
            {/* Soft full-page backdrop */}
            {artSrc && (
              <Image
                src={artSrc}
                alt=""
                fill
                className="object-cover opacity-35 blur-[2px]"
                sizes="(max-width: 768px) 100vw, min(720px, 90vh)"
                unoptimized
                aria-hidden
              />
            )}
            {page.panels.map((panel, i) => (
              <PanelArt
                key={panel.id}
                panel={panel}
                page={page}
                issueTitle={issueTitle}
                parchment={parchment}
                focused={guided && focusPanelIndex === i}
                dimmed={guided && focusPanelIndex !== i}
                focusBubbleIndex={focusPanelIndex === i ? focusBubbleIndex : null}
                onFocus={onPanelFocus ? () => onPanelFocus(i) : undefined}
              />
            ))}
          </>
        ) : (
          <>
            {artSrc ? (
              <Image
                src={artSrc}
                alt={page.artAlt ?? `${issueTitle} page ${page.pageNumber} illustration`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, min(720px, 90vh)"
                unoptimized
                {...(page.pageNumber <= 2
                  ? { priority: true }
                  : { loading: "lazy" as const })}
              />
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-b from-[#1a2840] to-[#2a2118]"
                aria-hidden
              />
            )}
            {/* Soft vignette only when HTML lettering still floats on top */}
            {!bakedLettering && (
              <div
                className={cn(
                  "pointer-events-none absolute inset-0",
                  parchment
                    ? "bg-gradient-to-b from-[rgba(20,14,10,0.35)] via-transparent to-[rgba(20,14,10,0.45)]"
                    : "bg-gradient-to-b from-black/30 via-transparent to-black/50",
                )}
              />
            )}
            {!bakedLettering && (
              <ComicSpeechBubbles
                bubbles={allBubbles}
                parchment={parchment}
                focusIndex={focusBubbleIndex}
              />
            )}
          </>
        )}

        {!bakedLettering && (page.title || panelCaption) && (
          <header className="pointer-events-none absolute inset-x-0 top-0 z-[6] px-3 pt-2.5 sm:px-4 sm:pt-3">
            {page.title && (
              <h3
                className={cn(
                  "font-display text-[clamp(0.95rem,2.4vw,1.45rem)] leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]",
                  parchment ? "text-[#f5ead2]" : "text-white",
                )}
              >
                {page.title}
              </h3>
            )}
            {panelCaption && (
              <p
                className={cn(
                  "mt-0.5 max-w-[92%] text-[clamp(0.65rem,1.5vw,0.78rem)] uppercase tracking-[0.12em] drop-shadow",
                  parchment ? "text-[#e8d5b0]/90" : "text-[var(--mint)]",
                )}
              >
                {panelCaption}
              </p>
            )}
            {page.role && page.role !== "story" && (
              <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[var(--amber)]/90">
                {page.role.replace(/-/g, " ")}
              </p>
            )}
          </header>
        )}

        {page.hotspots?.map((h) => {
          const found = foundHotspots.includes(h.id);
          return (
            <button
              key={h.id}
              type="button"
              className={cn(
                "comic-hotspot absolute z-10 rounded-md focus-ring transition",
                found
                  ? "border border-[var(--emerald)]/70 bg-[rgba(74,223,122,0.18)]"
                  : "border border-transparent bg-transparent hover:border-[rgba(196,168,130,0.55)] hover:bg-[rgba(232,213,176,0.12)] focus-visible:border-[rgba(196,168,130,0.7)] focus-visible:bg-[rgba(232,213,176,0.16)]",
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

        {!bakedLettering && page.loreSidebar && (
          <aside
            className={cn(
              "absolute bottom-8 left-2 right-2 z-[6] max-h-[28%] overflow-y-auto rounded-md border px-3 py-2 sm:left-auto sm:right-3 sm:max-w-[42%]",
              parchment
                ? "border-[rgba(139,90,60,0.55)] bg-[rgba(20,14,10,0.78)] text-[#f5ead2]"
                : "border-[rgba(61,231,255,0.35)] bg-[rgba(10,24,40,0.85)] text-white",
            )}
          >
            <p className="text-[9px] uppercase tracking-[0.16em] text-[var(--amber)]">Lore</p>
            <h4 className="font-display text-sm">{page.loreSidebar.title}</h4>
            <p className="mt-1 text-[11px] leading-snug opacity-90">{page.loreSidebar.body}</p>
          </aside>
        )}
      </div>

      <footer
        className={cn(
          "comic-page-footer relative z-[2] flex shrink-0 items-center justify-between border-t px-3 py-1 text-[10px] sm:text-xs",
          parchment
            ? "border-[rgba(92,61,46,0.35)] bg-[rgba(232,213,176,0.35)] text-[#5c3d2e]"
            : "border-[var(--stroke)] bg-black/40 text-[var(--text-muted)]",
        )}
      >
        <span className="truncate pr-2">{issueTitle}</span>
        <span className="shrink-0">
          Page {page.pageNumber}
          {page.musicCueId ? " · ♪" : ""}
          {page.voiceCueId ? " · VO" : ""}
        </span>
      </footer>
    </article>
  );
}
