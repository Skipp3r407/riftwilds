/**
 * Expands narrative beats into substantial comic pages (20–40 target).
 * Mixes splash, panel grids, lore sidebars, and end matter.
 * Every page receives artSrc so the reader never shows an empty leaf.
 */

import { artForAtmosphere, PAGE_ART, SPLASH } from "@/content/comics/art";
import type {
  ComicBubble,
  ComicBubbleTail,
  ComicHotspot,
  ComicIssueMeta,
  ComicPage,
  ComicPanel,
  ComicPanelLayout,
} from "@/content/comics/types";

export type Beat =
  | {
      kind: "splash";
      title?: string;
      artSrc?: string;
      artAlt?: string;
      atmosphere?: ComicPanel["atmosphere"];
      narration?: string;
      bubbles?: ComicBubble[];
      hotspots?: ComicHotspot[];
      isKeyArt?: boolean;
      developerNote?: string;
    }
  | {
      kind: "scene";
      title?: string;
      layout?: Exclude<ComicPanelLayout, "splash" | "end" | "lore">;
      atmosphere?: ComicPanel["atmosphere"];
      artSrc?: string;
      panels: Array<{
        caption?: string;
        artSrc?: string;
        artAlt?: string;
        atmosphere?: ComicPanel["atmosphere"];
        bubbles: ComicBubble[];
      }>;
      hotspots?: ComicHotspot[];
      loreSidebar?: { title: string; body: string };
      developerNote?: string;
    }
  | {
      kind: "lore";
      title: string;
      body: string;
      atmosphere?: ComicPanel["atmosphere"];
      artSrc?: string;
      bubbles?: ComicBubble[];
    }
  | {
      kind: "dialogue";
      atmosphere?: ComicPanel["atmosphere"];
      artSrc?: string;
      lines: ComicBubble[];
      caption?: string;
      hotspots?: ComicHotspot[];
    };

export type BubblePlaceOpts = {
  anchor?: ComicBubble["anchor"];
  x?: number;
  y?: number;
  tail?: ComicBubbleTail;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function layoutForPanelCount(n: number): ComicPanelLayout {
  if (n <= 1) return "wide";
  if (n === 2) return "two-col";
  if (n === 3) return "three-stack";
  if (n === 4) return "grid-2x2";
  return "grid-3";
}

function withArt(
  partial: Omit<ComicPage, "id" | "pageNumber">,
): Omit<ComicPage, "id" | "pageNumber"> {
  const artSrc = partial.artSrc ?? partial.panels.find((p) => p.artSrc)?.artSrc;
  if (artSrc) {
    return {
      ...partial,
      artSrc,
      panels: partial.panels.map((p) => ({ ...p, artSrc: p.artSrc ?? artSrc })),
    };
  }
  const fallback = artForAtmosphere(partial.atmosphere);
  return {
    ...partial,
    artSrc: fallback,
    panels: partial.panels.map((p) => ({
      ...p,
      artSrc: p.artSrc ?? fallback,
    })),
  };
}

/** Pad short beat lists into ~minPages by expanding dialogue and adding bridge pages. */
export function expandBeatsToPages(
  issueSlug: string,
  beats: Beat[],
  opts?: { minPages?: number; maxPages?: number; fallbackArt?: string },
): ComicPage[] {
  const minPages = opts?.minPages ?? 22;
  const maxPages = opts?.maxPages ?? 36;
  const issueFallback = opts?.fallbackArt ?? PAGE_ART.commons;
  const pages: ComicPage[] = [];
  let pageNumber = 1;

  const push = (partial: Omit<ComicPage, "id" | "pageNumber">) => {
    if (pages.length >= maxPages) return;
    const ensured = withArt(partial);
    if (!ensured.artSrc) {
      ensured.artSrc = issueFallback;
    }
    pages.push({
      id: `${issueSlug}-p${String(pageNumber).padStart(2, "0")}`,
      pageNumber,
      ...ensured,
    });
    pageNumber += 1;
  };

  for (const beat of beats) {
    if (pages.length >= maxPages) break;

    if (beat.kind === "splash") {
      push({
        layout: "splash",
        title: beat.title,
        artSrc: beat.artSrc ?? artForAtmosphere(beat.atmosphere ?? "rift"),
        artAlt: beat.artAlt,
        atmosphere: beat.atmosphere ?? "rift",
        isKeyArt: beat.isKeyArt ?? true,
        developerNote: beat.developerNote,
        hotspots: beat.hotspots,
        panels: [
          {
            id: `${issueSlug}-splash-${pageNumber}`,
            artSrc: beat.artSrc ?? artForAtmosphere(beat.atmosphere ?? "rift"),
            artAlt: beat.artAlt,
            atmosphere: beat.atmosphere,
            bubbles: [
              ...(beat.narration
                ? [{ kind: "narration" as const, text: beat.narration }]
                : []),
              ...(beat.bubbles ?? []),
            ],
          },
        ],
      });
      continue;
    }

    if (beat.kind === "lore") {
      const art = beat.artSrc ?? artForAtmosphere(beat.atmosphere ?? "dusk");
      push({
        layout: "lore",
        title: beat.title,
        artSrc: art,
        atmosphere: beat.atmosphere ?? "dusk",
        loreSidebar: { title: beat.title, body: beat.body },
        panels: [
          {
            id: `${issueSlug}-lore-${pageNumber}`,
            artSrc: art,
            atmosphere: beat.atmosphere,
            bubbles: beat.bubbles ?? [
              { kind: "caption", text: "Codex fragment — recovered from the margin." },
            ],
          },
        ],
      });
      continue;
    }

    if (beat.kind === "dialogue") {
      const art = beat.artSrc ?? artForAtmosphere(beat.atmosphere ?? "day");
      const groups = chunk(beat.lines, 4);
      for (const group of groups) {
        if (pages.length >= maxPages) break;
        push({
          layout: "narrative",
          atmosphere: beat.atmosphere ?? "day",
          artSrc: art,
          hotspots: beat.hotspots,
          panels: [
            {
              id: `${issueSlug}-dlg-${pageNumber}`,
              artSrc: art,
              atmosphere: beat.atmosphere,
              caption: beat.caption,
              bubbles: group,
            },
          ],
        });
      }
      continue;
    }

    // scene
    const sceneArt = beat.artSrc ?? artForAtmosphere(beat.atmosphere ?? "day");
    const layout = beat.layout ?? layoutForPanelCount(beat.panels.length);
    const panels: ComicPanel[] = beat.panels.map((p, i) => ({
      id: `${issueSlug}-panel-${pageNumber}-${i}`,
      artSrc: p.artSrc ?? sceneArt,
      artAlt: p.artAlt,
      atmosphere: p.atmosphere ?? beat.atmosphere,
      caption: p.caption,
      bubbles: p.bubbles,
    }));
    push({
      layout,
      title: beat.title,
      artSrc: sceneArt,
      atmosphere: beat.atmosphere,
      panels,
      hotspots: beat.hotspots,
      loreSidebar: beat.loreSidebar,
      developerNote: beat.developerNote,
    });
  }

  // Bridge pages if under minimum — professional narrative pads, not empty shells
  let bridge = 0;
  const bridgeArts = [
    PAGE_ART.commons,
    PAGE_ART.forest,
    PAGE_ART.rift,
    SPLASH.merchant,
    PAGE_ART.festival,
    SPLASH.sparkPath,
  ];
  while (pages.length < minPages) {
    bridge += 1;
    const atm =
      bridge % 3 === 0 ? "night" : bridge % 2 === 0 ? "dusk" : ("day" as const);
    const art = bridgeArts[bridge % bridgeArts.length] ?? issueFallback;
    push({
      layout: "narrative",
      atmosphere: atm,
      artSrc: art,
      title: bridge % 2 === 0 ? "Quiet between storms" : "The road remembers",
      panels: [
        {
          id: `${issueSlug}-bridge-${pageNumber}`,
          artSrc: art,
          atmosphere: atm,
          bubbles: [
            {
              kind: "narration",
              text:
                bridge % 2 === 0
                  ? "Between named trials, Keepers learn the oldest skill: waiting without wasting the wait."
                  : "Footpaths in the Riftwilds rewrite themselves overnight. Maps are promises, not contracts.",
            },
            {
              kind: "speech",
              speaker: "Elara Venn",
              text:
                bridge % 3 === 0
                  ? "If the path changes, walk it anyway. The Heart notices who still shows up."
                  : "Carry water. Carry kindness. Carry the name of whoever waits for you.",
              x: 30,
              y: 28,
              tail: "down",
            },
            {
              kind: "thought",
              speaker: "Keeper",
              text: "Credits buy supplies. Courage is not for sale.",
              x: 72,
              y: 55,
              tail: "down-left",
            },
            {
              kind: "sfx",
              text: bridge % 2 === 0 ? "soft wind…" : "rift-hummm",
              x: 55,
              y: 70,
            },
          ],
        },
      ],
    });
  }

  return pages;
}

export function buildEndPages(
  meta: ComicIssueMeta,
  startPage: number,
): ComicPage[] {
  const pages: ComicPage[] = [];
  let n = startPage;
  const coverArt = meta.covers.find((c) => c.kind === "standard")?.src ?? PAGE_ART.festival;

  pages.push({
    id: `${meta.slug}-end-recap`,
    pageNumber: n++,
    layout: "end",
    title: "Issue complete",
    atmosphere: "festival",
    artSrc: coverArt,
    panels: [
      {
        id: `${meta.slug}-end-1`,
        artSrc: coverArt,
        atmosphere: "festival",
        bubbles: [
          {
            kind: "caption",
            text: `You finished Issue #${meta.issueNumber}: ${meta.title}.`,
          },
          {
            kind: "narration",
            text: meta.synopsis,
          },
          ...(meta.playChapterHref
            ? [
                {
                  kind: "caption" as const,
                  text: `Play this chapter → ${meta.playChapterLabel ?? "Live World"}`,
                },
              ]
            : []),
        ],
      },
    ],
  });

  if (meta.hasCommunityVote && meta.voteOptions?.length) {
    pages.push({
      id: `${meta.slug}-end-vote`,
      pageNumber: n++,
      layout: "end",
      title: "Shape the side-story",
      atmosphere: "dusk",
      artSrc: PAGE_ART.commons,
      panels: [
        {
          id: `${meta.slug}-vote`,
          artSrc: PAGE_ART.commons,
          atmosphere: "dusk",
          bubbles: [
            {
              kind: "caption",
              text: meta.votePrompt ?? "How should the next side-story lean?",
            },
            ...meta.voteOptions.map((o, i) => ({
              kind: "speech" as const,
              speaker: o.label,
              text: o.blurb,
              x: i % 2 === 0 ? 28 : 72,
              y: 30 + i * 16,
              tail: (i % 2 === 0 ? "down" : "down-left") as ComicBubbleTail,
            })),
          ],
        },
      ],
    });
  }

  return pages;
}

export function speech(
  speaker: string,
  text: string,
  place?: ComicBubble["anchor"] | BubblePlaceOpts,
): ComicBubble {
  if (!place) return { kind: "speech", speaker, text };
  if (typeof place === "string") return { kind: "speech", speaker, text, anchor: place };
  return { kind: "speech", speaker, text, ...place };
}

export function thought(
  speaker: string,
  text: string,
  place?: ComicBubble["anchor"] | BubblePlaceOpts,
): ComicBubble {
  if (!place) return { kind: "thought", speaker, text };
  if (typeof place === "string") return { kind: "thought", speaker, text, anchor: place };
  return { kind: "thought", speaker, text, ...place };
}

export function narrate(text: string, place?: BubblePlaceOpts): ComicBubble {
  return { kind: "narration", text, ...place };
}

export function sfx(text: string, place?: BubblePlaceOpts): ComicBubble {
  return { kind: "sfx", text, ...place };
}

export function caption(text: string, place?: BubblePlaceOpts): ComicBubble {
  return { kind: "caption", text, ...place };
}

/** Final pass: guarantee every page + panel has resolvable art. */
export function ensureIssueArt(pages: ComicPage[], fallbackArt: string): ComicPage[] {
  return pages.map((page) => {
    const artSrc = page.artSrc ?? page.panels.find((p) => p.artSrc)?.artSrc ?? fallbackArt;
    return {
      ...page,
      artSrc,
      panels: page.panels.map((p) => ({
        ...p,
        artSrc: p.artSrc ?? artSrc,
      })),
    };
  });
}
