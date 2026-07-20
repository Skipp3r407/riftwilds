/**
 * Legends of the Rift — story arcs & volumes.
 */

import type { ComicSeriesDef, ComicStoryArc, ComicVolume } from "@/content/comics/types";

export const COMIC_VOLUMES: ComicVolume[] = [
  {
    id: "vol-1-first-lights",
    title: "Volume I — First Lights",
    volumeNumber: 1,
    issueSlugs: [
      "the-first-rift",
      "sparks-journey",
      "the-traveling-circus",
      "the-lost-city",
      "the-storm-king",
      "the-merchants-secret",
      "the-traitors-gate",
      "the-forge-of-rifts",
      "the-riftwright",
    ],
  },
  {
    id: "vol-2-shattered-sky",
    title: "Volume II — Shattered Sky",
    volumeNumber: 2,
    issueSlugs: ["the-shattered-star"],
  },
];

export const COMIC_ARCS: ComicStoryArc[] = [
  {
    id: "arc-fracture-dawn",
    title: "Fracture Dawn",
    subtitle: "Origin of the Commons and the first Keepers.",
    issueSlugs: ["the-first-rift", "sparks-journey"],
    expansionId: "exp-legends-core",
  },
  {
    id: "arc-road-wonders",
    title: "Road Wonders",
    subtitle: "Circus, ruins, and sky-kings along the Fracture roads.",
    issueSlugs: ["the-traveling-circus", "the-lost-city", "the-storm-king"],
    expansionId: "exp-legends-core",
  },
  {
    id: "arc-keepers-compact",
    title: "Keepers' Compact",
    subtitle: "Trade, betrayal, and the Forge that engineered the First Rift.",
    issueSlugs: ["the-merchants-secret", "the-traitors-gate", "the-forge-of-rifts", "the-riftwright"],
    expansionId: "exp-legends-core",
  },
  {
    id: "arc-shattered-sky",
    title: "Shattered Sky",
    subtitle: "Volume Two — the Star returns; Hollow hunger follows.",
    issueSlugs: ["the-shattered-star"],
    expansionId: "exp-legends-vol2",
  },
];

export const RIFTWILDS_COMIC_SERIES: ComicSeriesDef = {
  id: "legends-of-the-rift",
  title: "Legends of the Rift",
  subtitle:
    "Official Riftwilds comic publishing — illustrated issues that unlock Codex ties, tease cards, and never gate core story behind crypto.",
  volumes: COMIC_VOLUMES,
  arcs: COMIC_ARCS,
};

export function arcForIssue(slug: string): ComicStoryArc | undefined {
  return COMIC_ARCS.find((a) => a.issueSlugs.includes(slug));
}

export function volumeForIssue(slug: string): ComicVolume | undefined {
  return COMIC_VOLUMES.find((v) => v.issueSlugs.includes(slug));
}
