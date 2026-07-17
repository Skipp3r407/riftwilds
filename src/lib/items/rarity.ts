import type { ItemRarity } from "@/lib/items/types";

/** Max combat power uplift vs Common baseline (ranked still normalizes). */
export const RARITY_POWER_CAP_BPS: Record<ItemRarity, number> = {
  COMMON: 0,
  UNCOMMON: 300,
  RARE: 600,
  EPIC: 900,
  LEGENDARY: 1200,
  MYTHIC: 1500,
  CELESTIAL: 1500,
};

export const RARITY_VISUAL: Record<
  ItemRarity,
  { label: string; border: string; glow: string; cssVar: string }
> = {
  COMMON: {
    label: "Common",
    border: "#8b93a7",
    glow: "rgba(139,147,167,0.25)",
    cssVar: "--rarity-common",
  },
  UNCOMMON: {
    label: "Uncommon",
    border: "#3ecf7a",
    glow: "rgba(62,207,122,0.35)",
    cssVar: "--rarity-uncommon",
  },
  RARE: {
    label: "Rare",
    border: "#3d9bff",
    glow: "rgba(61,155,255,0.4)",
    cssVar: "--rarity-rare",
  },
  EPIC: {
    label: "Epic",
    border: "#a855f7",
    glow: "rgba(168,85,247,0.45)",
    cssVar: "--rarity-epic",
  },
  LEGENDARY: {
    label: "Legendary",
    border: "#f5c542",
    glow: "rgba(245,197,66,0.5)",
    cssVar: "--rarity-legendary",
  },
  MYTHIC: {
    label: "Mythic",
    border: "#ff6bcb",
    glow: "rgba(255,107,203,0.5)",
    cssVar: "--rarity-mythic",
  },
  CELESTIAL: {
    label: "Celestial",
    border: "#7dd3fc",
    glow: "rgba(125,211,252,0.55)",
    cssVar: "--rarity-celestial",
  },
};

/** Apply rarity ceiling: effective total capped vs common baseline. */
export function applyRarityStatCap(
  commonBase: number,
  proposedTotal: number,
  rarity: ItemRarity,
): number {
  const maxTotal =
    commonBase + Math.floor((commonBase * RARITY_POWER_CAP_BPS[rarity]) / 10000);
  return Math.min(proposedTotal, maxTotal);
}

/** Ranked normalization: compress equip bonus toward common baseline. */
export function normalizeRankedEquipBonus(rawBonus: number, commonBaseline: number): number {
  const cap = Math.floor(commonBaseline * 0.18);
  return Math.min(Math.max(0, rawBonus), cap);
}
