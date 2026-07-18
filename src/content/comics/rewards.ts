import type { ComicReward } from "@/content/comics/types";

/** Series-wide cosmetic unlocks — Credits stubs only, never SOL. */
export const SERIES_REWARDS: ComicReward[] = [
  {
    id: "rw-comic-reader",
    label: "Rift Reader",
    description: "Finish any issue of Legends of the Rift.",
    kind: "title",
    creditsStub: 5,
  },
  {
    id: "rw-lore-seeker",
    label: "Lore Seeker",
    description: "Find three hidden lore objects across the series.",
    kind: "badge",
    creditsStub: 10,
  },
  {
    id: "rw-cover-collector",
    label: "Cover Collector",
    description: "Collect a variant cover (anniversary or foil stub).",
    kind: "frame",
    creditsStub: 15,
  },
  {
    id: "rw-series-complete",
    label: "Legend Keeper",
    description: "Complete all ten issues.",
    kind: "achievement",
    creditsStub: 50,
  },
  {
    id: "rw-wallpaper-commons",
    label: "Commons Lantern Wallpaper",
    description: "Unlock after Festival of Lights.",
    kind: "wallpaper",
  },
  {
    id: "rw-avatar-spark",
    label: "Spark Portrait Avatar",
    description: "Unlock after Spark's Journey.",
    kind: "avatar",
  },
];

export const COMIC_ACHIEVEMENTS = [
  { id: "ach-first-page", label: "First Panel", description: "Open any comic issue." },
  { id: "ach-finish-one", label: "Closed Book", description: "Finish one issue." },
  { id: "ach-hotspot-1", label: "Margin Note", description: "Find a hidden lore object." },
  { id: "ach-secret-code", label: "Symbol Cipher", description: "Unlock a secret code stub." },
  { id: "ach-vote", label: "Side-Story Voice", description: "Cast a community vote." },
  { id: "ach-all-ten", label: "Ten Lights", description: "Finish the full series." },
] as const;
