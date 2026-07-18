/**
 * Expands narrative beats into substantial comic pages (20–40 target).
 * Mixes splash, panel grids, lore sidebars, and end matter.
 */

import type {
  ComicBubble,
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

/** Pad short beat lists into ~minPages by expanding dialogue and adding bridge pages. */
export function expandBeatsToPages(
  issueSlug: string,
  beats: Beat[],
  opts?: { minPages?: number; maxPages?: number },
): ComicPage[] {
  const minPages = opts?.minPages ?? 22;
  const maxPages = opts?.maxPages ?? 36;
  const pages: ComicPage[] = [];
  let pageNumber = 1;

  const push = (partial: Omit<ComicPage, "id" | "pageNumber">) => {
    if (pages.length >= maxPages) return;
    pages.push({
      id: `${issueSlug}-p${String(pageNumber).padStart(2, "0")}`,
      pageNumber,
      ...partial,
    });
    pageNumber += 1;
  };

  for (const beat of beats) {
    if (pages.length >= maxPages) break;

    if (beat.kind === "splash") {
      push({
        layout: "splash",
        title: beat.title,
        artSrc: beat.artSrc,
        artAlt: beat.artAlt,
        atmosphere: beat.atmosphere ?? "rift",
        isKeyArt: beat.isKeyArt ?? true,
        developerNote: beat.developerNote,
        hotspots: beat.hotspots,
        panels: [
          {
            id: `${issueSlug}-splash-${pageNumber}`,
            artSrc: beat.artSrc,
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
      push({
        layout: "lore",
        title: beat.title,
        atmosphere: beat.atmosphere ?? "dusk",
        loreSidebar: { title: beat.title, body: beat.body },
        panels: [
          {
            id: `${issueSlug}-lore-${pageNumber}`,
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
      const groups = chunk(beat.lines, 4);
      for (const group of groups) {
        if (pages.length >= maxPages) break;
        push({
          layout: "narrative",
          atmosphere: beat.atmosphere ?? "day",
          artSrc: beat.artSrc,
          hotspots: beat.hotspots,
          panels: [
            {
              id: `${issueSlug}-dlg-${pageNumber}`,
              artSrc: beat.artSrc,
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
    const layout = beat.layout ?? layoutForPanelCount(beat.panels.length);
    const panels: ComicPanel[] = beat.panels.map((p, i) => ({
      id: `${issueSlug}-panel-${pageNumber}-${i}`,
      artSrc: p.artSrc ?? beat.artSrc,
      artAlt: p.artAlt,
      atmosphere: p.atmosphere ?? beat.atmosphere,
      caption: p.caption,
      bubbles: p.bubbles,
    }));
    push({
      layout,
      title: beat.title,
      artSrc: beat.artSrc,
      atmosphere: beat.atmosphere,
      panels,
      hotspots: beat.hotspots,
      loreSidebar: beat.loreSidebar,
      developerNote: beat.developerNote,
    });
  }

  // Bridge pages if under minimum — professional narrative pads, not empty shells
  let bridge = 0;
  while (pages.length < minPages) {
    bridge += 1;
    const atm =
      bridge % 3 === 0 ? "night" : bridge % 2 === 0 ? "dusk" : ("day" as const);
    push({
      layout: "narrative",
      atmosphere: atm,
      title: bridge % 2 === 0 ? "Quiet between storms" : "The road remembers",
      panels: [
        {
          id: `${issueSlug}-bridge-${pageNumber}`,
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
            },
            {
              kind: "thought",
              speaker: "Keeper",
              text: "Credits buy supplies. Courage is not for sale.",
            },
            {
              kind: "sfx",
              text: bridge % 2 === 0 ? "soft wind…" : "rift-hummm",
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

  pages.push({
    id: `${meta.slug}-end-recap`,
    pageNumber: n++,
    layout: "end",
    title: "Issue complete",
    atmosphere: "festival",
    panels: [
      {
        id: `${meta.slug}-end-1`,
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
      panels: [
        {
          id: `${meta.slug}-vote`,
          atmosphere: "dusk",
          bubbles: [
            {
              kind: "caption",
              text: meta.votePrompt ?? "How should the next side-story lean?",
            },
            ...meta.voteOptions.map((o) => ({
              kind: "speech" as const,
              speaker: o.label,
              text: o.blurb,
            })),
          ],
        },
      ],
    });
  }

  return pages;
}

export function speech(speaker: string, text: string, anchor?: ComicBubble["anchor"]): ComicBubble {
  return { kind: "speech", speaker, text, anchor };
}

export function thought(speaker: string, text: string): ComicBubble {
  return { kind: "thought", speaker, text };
}

export function narrate(text: string): ComicBubble {
  return { kind: "narration", text };
}

export function sfx(text: string): ComicBubble {
  return { kind: "sfx", text };
}

export function caption(text: string): ComicBubble {
  return { kind: "caption", text };
}
