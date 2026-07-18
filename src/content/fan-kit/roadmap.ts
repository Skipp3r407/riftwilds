/**
 * Public roadmap teasers — exciting milestones without fake calendar dates.
 */

export type RoadmapMilestone = {
  id: string;
  title: string;
  blurb: string;
  status: "live" | "in-progress" | "coming";
  href?: string;
};

export const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: "comics",
    title: "Legends of the Rift comics",
    blurb: "Ten-issue original series with old-book reading and World Codex unlocks.",
    status: "live",
    href: "/comics",
  },
  {
    id: "coloring",
    title: "Kids coloring pack",
    blurb: "28 printable game-sketch sheets — Spark, Commons, Circus, Keepers, and more.",
    status: "live",
    href: "/coloring",
  },
  {
    id: "live-world",
    title: "Live World Commons",
    blurb: "Walk the plaza with your companion. Multiplayer authority expands next.",
    status: "live",
    href: "/live-world",
  },
  {
    id: "housing",
    title: "Homesteads & neighborhoods",
    blurb: "Personal housing spaces and neighborhood gathering — cozy Keeper living.",
    status: "in-progress",
    href: "/homestead",
  },
  {
    id: "festival",
    title: "Traveling Circus festival",
    blurb: "Seasonal Commons festival vibes tied to comic Issue #3 and live events.",
    status: "in-progress",
    href: "/comics/the-traveling-circus",
  },
  {
    id: "sticker-album",
    title: "Achievement sticker album",
    blurb: "Cosmetic collectibles for reading comics and visiting Commons — album preview live.",
    status: "in-progress",
    href: "/fan-kit#stickers-album",
  },
  {
    id: "newsletter",
    title: "Keeper Dispatch newsletter",
    blurb: "Weekly lore drops, comic releases, and festival heads-up. Signup open; sendouts soon.",
    status: "coming",
    href: "/fan-kit#newsletter",
  },
  {
    id: "creator-drops",
    title: "Creator Hub drops",
    blurb: "Community creator packs and cosmetics through the Creator Hub.",
    status: "coming",
    href: "/creators",
  },
];
