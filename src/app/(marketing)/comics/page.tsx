import type { Metadata } from "next";
import { ComicsLibrary } from "@/components/comics/comics-library";
import { COMIC_SERIES, listPublishedComics } from "@/content/comics";

export const metadata: Metadata = {
  title: "Legends of the Rift | Comics",
  description:
    "Official Riftwilds comic series — Legends of the Rift. Ten issues of original graphic novel lore across Aeryndra.",
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
