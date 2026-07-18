/**
 * Legends of the Rift — comic page narration helpers.
 * Pre-generated TTS clips live under public/assets/audio/comics/.
 * Missing files are a silent no-op in the reader (no API key required at runtime).
 */

import type { ComicBubble, ComicPage } from "@/content/comics/types";

export const COMIC_NARRATION_BASE = "/assets/audio/comics";

export type ComicNarrationLine = {
  kind: ComicBubble["kind"] | "title";
  speaker?: string;
  text: string;
};

export type ComicNarrationManifestPage = {
  pageNumber: number;
  file: string;
  src: string;
  text: string;
  bytes?: number;
  status: "ready" | "pending" | "skipped";
};

export type ComicNarrationManifestIssue = {
  slug: string;
  issueNumber: number;
  title: string;
  pages: ComicNarrationManifestPage[];
};

export type ComicNarrationManifest = {
  version: 1;
  provider: "elevenlabs" | "none";
  voiceId?: string;
  modelId?: string;
  generatedAt: string;
  issues: ComicNarrationManifestIssue[];
};

const SPEAKABLE: ReadonlySet<ComicBubble["kind"]> = new Set([
  "narration",
  "caption",
  "speech",
  "thought",
]);

/** Collect speakable lines from a comic page in reading order. */
export function collectPageNarrationLines(page: ComicPage): ComicNarrationLine[] {
  const lines: ComicNarrationLine[] = [];
  if (page.title?.trim()) {
    lines.push({ kind: "title", text: page.title.trim() });
  }
  for (const panel of page.panels) {
    if (panel.caption?.trim()) {
      lines.push({ kind: "caption", text: panel.caption.trim() });
    }
    for (const bubble of panel.bubbles) {
      if (!SPEAKABLE.has(bubble.kind)) continue;
      const text = bubble.text?.trim();
      if (!text) continue;
      lines.push({
        kind: bubble.kind,
        speaker: bubble.speaker?.trim() || undefined,
        text,
      });
    }
  }
  if (page.loreSidebar?.body?.trim()) {
    lines.push({
      kind: "narration",
      text: `${page.loreSidebar.title}: ${page.loreSidebar.body.trim()}`,
    });
  }
  return lines;
}

/** Format lines into a single TTS script (kid-friendly, original IP). */
export function joinNarrationScript(lines: ComicNarrationLine[]): string {
  return lines
    .map((line) => {
      if (line.kind === "speech" || line.kind === "thought") {
        const who = line.speaker || "Someone";
        const prefix = line.kind === "thought" ? `${who} thinks` : `${who} says`;
        return `${prefix}: ${line.text}`;
      }
      return line.text;
    })
    .join("\n\n")
    .trim();
}

export function pageNarrationScript(page: ComicPage): string {
  return joinNarrationScript(collectPageNarrationLines(page));
}

export function comicNarrationFileName(pageNumber: number): string {
  return `page-${String(pageNumber).padStart(2, "0")}.mp3`;
}

/** Public URL for a page VO clip (may 404 when not generated). */
export function comicPageNarrationUrl(issueSlug: string, pageNumber: number): string {
  return `${COMIC_NARRATION_BASE}/${issueSlug}/${comicNarrationFileName(pageNumber)}`;
}

export function comicNarrationManifestUrl(): string {
  return `${COMIC_NARRATION_BASE}/MANIFEST.json`;
}

/** True when the page has dialogue/narration worth voicing. */
export function pageHasNarration(page: ComicPage): boolean {
  return pageNarrationScript(page).length > 0;
}
