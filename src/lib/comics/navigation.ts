/**
 * Reader navigation helpers — keyboard, page clamps, adjacent issues.
 */

import type { ComicIssue } from "@/content/comics/types";

export function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.max(1, Math.min(totalPages, Math.floor(page)));
}

export function nextPage(page: number, totalPages: number): number {
  return clampPage(page + 1, totalPages);
}

export function prevPage(page: number, totalPages: number): number {
  return clampPage(page - 1, totalPages);
}

export function pageFromKeyboard(
  key: string,
  page: number,
  totalPages: number,
): number | null {
  const k = key.toLowerCase();
  if (k === "arrowright" || k === " " || k === "pagedown" || k === "d") {
    return nextPage(page, totalPages);
  }
  if (k === "arrowleft" || k === "pageup" || k === "a" || k === "backspace") {
    return prevPage(page, totalPages);
  }
  if (k === "home") return 1;
  if (k === "end") return totalPages;
  return null;
}

/** Best-effort gamepad stub — maps common face/D-pad codes. */
export function pageFromGamepadButton(
  buttonIndex: number,
  page: number,
  totalPages: number,
): number | null {
  // 14/15 = D-pad L/R (standard mapping); 1 = B/circle often "back"
  if (buttonIndex === 15 || buttonIndex === 5) return nextPage(page, totalPages);
  if (buttonIndex === 14 || buttonIndex === 4 || buttonIndex === 1) {
    return prevPage(page, totalPages);
  }
  return null;
}

export function adjacentIssues(
  catalog: ComicIssue[],
  slug: string,
): { prev: ComicIssue | null; next: ComicIssue | null } {
  const idx = catalog.findIndex((i) => i.slug === slug);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? catalog[idx - 1]! : null,
    next: idx < catalog.length - 1 ? catalog[idx + 1]! : null,
  };
}

export function estimateReadingTimeMinutes(pageCount: number): number {
  // ~45 seconds per illustrated page average
  return Math.max(8, Math.round((pageCount * 45) / 60));
}
