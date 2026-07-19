/**
 * Cosmetic variants — tens of thousands of art finishes over the same gameplay id.
 * NEVER change attack/health/cost/keywords/role.
 */

import type { TcgCardFinish } from "@/content/tcg/types";

export const VARIANT_POLICY = {
  powerNeutral: true as const,
  competitiveUsesBaseId: true as const,
  note: "Finishes (foil/gold/crystal/animated/signed) are binder cosmetics only.",
} as const;

export type TcgVariantDef = {
  id: string;
  baseCardId: string;
  finish: TcgCardFinish | string;
  artist?: string;
  artPath?: string;
  cardImagePath?: string;
  particleOverride?: string[];
  soundOverride?: Partial<{ play: string; hit: string; death: string }>;
  unlockMethod: string;
  seasonalTag?: string;
  /** Soft craft cost in Rift Shards (never crypto). */
  shardCraftCost: number;
};

export function variantId(baseCardId: string, finish: string): string {
  return `${baseCardId}__${finish}`;
}

export function parseVariantId(
  id: string,
): { baseCardId: string; finish: string } | null {
  const idx = id.indexOf("__");
  if (idx <= 0) return null;
  return {
    baseCardId: id.slice(0, idx),
    finish: id.slice(idx + 2),
  };
}

/** Estimate cosmetic catalog size for live-ops planning. */
export function estimateVariantCapacity(
  gameplayCards: number,
  finishesPerCard = 5,
): number {
  return gameplayCards * finishesPerCard;
}
