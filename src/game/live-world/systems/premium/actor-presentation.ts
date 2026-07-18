/**
 * Character / Riftling presentation helpers — cozy RPG chibi scale, shadows, anchors.
 * Depth sorting uses footY (origin 0.5,1) so actors pass behind/in front of structures.
 */

/** Keeper display — readable chibi / cute RPG scale (not oversized 2.5D). */
export const KEEPER_DISPLAY = { w: 42, h: 48 } as const;

/** Companion Riftling — chunky cute pet at top-down scale. */
export const PET_DISPLAY = { w: 32, h: 32 } as const;

/** Scale NPC sheet heights for cozy village readability. */
export function scaleNpcDisplayHeight(baseHeight: number): number {
  return Math.round(baseHeight * 1.05);
}

/** Soft directional contact shadow under an actor foot (afternoon sun bias). */
export type ActorShadowSpec = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  alpha: number;
};

export function actorContactShadow(
  displayW: number,
  displayH: number,
  kind: "keeper" | "pet" | "npc" = "npc",
): ActorShadowSpec {
  const baseW = displayW * (kind === "pet" ? 0.55 : 0.62);
  const baseH = Math.max(6, displayH * 0.12);
  return {
    offsetX: 2,
    offsetY: -1,
    width: baseW,
    height: baseH,
    alpha: kind === "keeper" ? 0.22 : kind === "pet" ? 0.18 : 0.2,
  };
}
