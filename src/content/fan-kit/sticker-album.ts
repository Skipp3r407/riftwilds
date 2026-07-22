/**
 * Achievement sticker album preview — cosmetic collectibles only.
 * Reading comics / visiting Commons unlocks (preview UI; local progress hooks later).
 */

export type AlbumSticker = {
  id: string;
  title: string;
  how: string;
  imageSrc: string;
  rarity: "common" | "uncommon" | "rare";
  previewUnlocked: boolean;
};

export const ALBUM_STICKERS: AlbumSticker[] = [
  {
    id: "alb-first-page",
    title: "First Page Turn",
    how: "Open any Legends of the Rift issue",
    imageSrc: "/assets/fan-kit/stickers/spark.png",
    rarity: "common",
    previewUnlocked: true,
  },
  {
    id: "alb-issue-one",
    title: "Rift Dawn Reader",
    how: "Finish Issue #1: The First Rift",
    imageSrc: "/assets/fan-kit/stickers/commons-crest.png",
    rarity: "common",
    previewUnlocked: true,
  },
  {
    id: "alb-commons-walk",
    title: "Commons Wanderer",
    how: "Visit Live World / Riftwild Commons",
    imageSrc: "/assets/fan-kit/stickers/keeper-badge.png",
    rarity: "common",
    previewUnlocked: true,
  },
  {
    id: "alb-coloring",
    title: "Crayon Keeper",
    how: "Download a coloring sheet",
    imageSrc: "/assets/fan-kit/stickers/care-heart.png",
    rarity: "uncommon",
    previewUnlocked: false,
  },
  {
    id: "alb-hatch",
    title: "First Hatch Glow",
    how: "Claim a free egg in the Hatchery",
    imageSrc: "/assets/fan-kit/stickers/hatch-egg.png",
    rarity: "uncommon",
    previewUnlocked: false,
  },
  {
    id: "alb-circus",
    title: "Circus Night",
    how: "Read Issue #3: The Traveling Circus",
    imageSrc: "/assets/fan-kit/stickers/bubbloon.png",
    rarity: "rare",
    previewUnlocked: false,
  },
  {
    id: "alb-soundtrack",
    title: "Listening Post",
    how: "Preview a soundtrack loop on Fan Kit",
    imageSrc: "/assets/fan-kit/stickers/mossprig.png",
    rarity: "uncommon",
    previewUnlocked: false,
  },
  {
    id: "alb-share",
    title: "Signal Flare",
    how: "Share a moment card with a friend",
    imageSrc: "/assets/fan-kit/stickers/cindercub.png",
    rarity: "rare",
    previewUnlocked: false,
  },
];
