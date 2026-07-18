/**
 * Character / Riftling presentation helpers — cozy RPG chibi scale, shadows, anchors.
 * Depth sorting uses footY (origin 0.5,1) so actors pass behind/in front of structures.
 */

import type { GameObjects, Scene } from "phaser";
import {
  actorSheetTex,
  KEEPER_SHEET_FRAME,
  PET_SHEET_FRAME,
} from "@/game/live-world/systems/premium/asset-keys";

/** Keeper display — readable chibi / cute RPG scale (not oversized 2.5D). */
export const KEEPER_DISPLAY = { w: 42, h: 48 } as const;

/** Companion Riftling — chunky cute pet at top-down scale. */
export const PET_DISPLAY = { w: 32, h: 32 } as const;

export const KEEPER_WALK_ANIM = "pw-keeper-walk";
export const KEEPER_IDLE_ANIM = "pw-keeper-idle";
export const PET_WALK_ANIM = "pw-pet-walk";
export const PET_IDLE_ANIM = "pw-pet-idle";

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

/** Register Keeper + companion walk/idle anims when sheet textures exist. */
export function ensureCozyActorAnims(scene: Scene): void {
  const keeperSheet = actorSheetTex("player-keeper-sheet");
  const petSheet = actorSheetTex("pet-riftling-sheet");

  if (scene.textures.exists(keeperSheet) && !scene.anims.exists(KEEPER_WALK_ANIM)) {
    scene.anims.create({
      key: KEEPER_WALK_ANIM,
      frames: scene.anims.generateFrameNumbers(keeperSheet, { start: 1, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
    scene.anims.create({
      key: KEEPER_IDLE_ANIM,
      frames: scene.anims.generateFrameNumbers(keeperSheet, { start: 0, end: 0 }),
      frameRate: 2,
      repeat: -1,
    });
  }

  if (scene.textures.exists(petSheet) && !scene.anims.exists(PET_WALK_ANIM)) {
    scene.anims.create({
      key: PET_WALK_ANIM,
      frames: scene.anims.generateFrameNumbers(petSheet, { start: 1, end: 3 }),
      frameRate: 9,
      repeat: -1,
    });
    scene.anims.create({
      key: PET_IDLE_ANIM,
      frames: scene.anims.generateFrameNumbers(petSheet, { start: 0, end: 0 }),
      frameRate: 2,
      repeat: -1,
    });
  }
}

export function playCozyActorAnim(
  sprite: GameObjects.Sprite,
  moving: boolean,
  kind: "keeper" | "pet",
): void {
  const walk = kind === "keeper" ? KEEPER_WALK_ANIM : PET_WALK_ANIM;
  const idle = kind === "keeper" ? KEEPER_IDLE_ANIM : PET_IDLE_ANIM;
  const key = moving ? walk : idle;
  if (!sprite.anims || !sprite.scene.anims.exists(key)) return;
  if (sprite.anims.currentAnim?.key !== key) {
    sprite.anims.play(key, true);
  }
}

export { KEEPER_SHEET_FRAME, PET_SHEET_FRAME };
