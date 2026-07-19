import type { Metadata } from "next";
import { ComicsLibrary } from "@/components/comics/comics-library";
import { COMIC_SERIES, listPublishedComics } from "@/content/comics";

export const metadata: Metadata = {
  title: "Lore Library | Legends of the Rift",
  description:
    "Riftwilds Lore Library — Legends of the Rift. Ten illustrated comic issues with Codex unlocks and cosmetic rewards (never P2W).",
};

export default function ComicsLibraryPage() {
  const issues = listPublishedComics();
  return (
    <ComicsLibrary
      issues={issues}
      seriesTitle={COMIC_SERIES.title}
      seriesSubtitle={COMIC_SERIES.subtitle}
    />
  );
}
