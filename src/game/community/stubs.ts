export type PhotoShot = {
  id: string;
  title: string;
  regionSlug: string;
  petLabel?: string;
  filterKey: string;
  capturedAt: string;
};

export type GalleryEntry = {
  id: string;
  shotId: string;
  keeperLabel: string;
  likes: number;
  contestKey?: string;
};

export type CommunityContest = {
  key: string;
  name: string;
  description: string;
  festivalKey?: string;
  status: "upcoming" | "open" | "judging" | "closed";
};

export const PHOTO_FILTERS = [
  "clear",
  "aurora",
  "ember_glow",
  "moonwater",
  "soft_mist",
] as const;

export const DEMO_CONTESTS: CommunityContest[] = [
  {
    key: "bloomtide_snapshots",
    name: "Bloomtide Snapshots",
    description: "Capture grove light during Bloomtide Festival.",
    festivalKey: "bloomtide_festival",
    status: "upcoming",
  },
  {
    key: "companion_portraits",
    name: "Companion Portraits",
    description: "Best Riftling portrait with homestead lighting.",
    status: "open",
  },
];

export function createPhotoShotStub(input: {
  title: string;
  regionSlug: string;
  petLabel?: string;
  filterKey?: string;
}): PhotoShot {
  return {
    id: `photo_${Date.now()}`,
    title: input.title,
    regionSlug: input.regionSlug,
    petLabel: input.petLabel,
    filterKey: input.filterKey ?? "clear",
    capturedAt: new Date().toISOString(),
  };
}
