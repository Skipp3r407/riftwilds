import type { Metadata } from "next";
import { ComicsLibrary } from "@/components/comics/comics-library";
import { COMIC_SERIES, listPublishedComics } from "@/content/comics";

export const metadata: Metadata = {
  title: "Lore Library | Legends of the Rift",
  description:
    "Riftwilds Comic Publishing — Legends of the Rift. Publisher-grade issues with Codex unlocks, card teases, and cosmetic rewards (never crypto-gated story).",
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
