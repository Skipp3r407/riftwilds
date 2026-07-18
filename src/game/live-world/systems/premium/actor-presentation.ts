/**
 * Character / Riftling presentation helpers — cozy RPG chibi scale, shadows, anchors.
 * Depth sorting uses footY (origin 0.5,1) so actors pass behind/in front of structures.
 */

import type { GameObjects, Scene } from "phaser";
import type { Physics } from "phaser";
import {
  actorSheetTex,
  actorTex,
  KEEPER_SHEET_FRAME,
  PET_SHEET_FRAME,
} from "@/game/live-world/systems/premium/asset-keys";
import {
  COZY_COMPANION_ACTORS,
  companionIdleAnimKey,
  companionWalkAnimKey,
  type CozyCompanionActor,
  DEFAULT_COZY_COMPANION,
  resolveCompanionTexture,
} from "@/game/live-world/systems/premium/companion-species";

/** Keeper display — readable chibi / cute RPG scale (not oversized 2.5D). */
export const KEEPER_DISPLAY = { w: 42, h: 48 } as const;

/** Companion Riftling — chunky cute pet at top-down scale. */
export const PET_DISPLAY = { w: 32, h: 32 } as const;

export const KEEPER_WALK_ANIM = "pw-keeper-walk";
export const KEEPER_IDLE_ANIM = "pw-keeper-idle";
/** Legacy generic pet anim keys (sparklet / pet-riftling sheet). */
export const PET_WALK_ANIM = companionWalkAnimKey(DEFAULT_COZY_COMPANION);
export const PET_IDLE_ANIM = companionIdleAnimKey(DEFAULT_COZY_COMPANION);

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

function ensurePetSheetAnims(scene: Scene, actor: CozyCompanionActor): void {
  const sheet = actorSheetTex(`${actor}-sheet`);
  const walk = companionWalkAnimKey(actor);
  const idle = companionIdleAnimKey(actor);
  if (!scene.textures.exists(sheet)) return;
  if (!scene.anims.exists(walk)) {
    scene.anims.create({
      key: walk,
      frames: scene.anims.generateFrameNumbers(sheet, { start: 1, end: 3 }),
      frameRate: 9,
      repeat: -1,
    });
  }
  if (!scene.anims.exists(idle)) {
    scene.anims.create({
      key: idle,
      frames: scene.anims.generateFrameNumbers(sheet, { start: 0, end: 0 }),
      frameRate: 2,
      repeat: -1,
    });
  }
}

/** Register Keeper + per-species companion walk/idle anims when sheet textures exist. */
export function ensureCozyActorAnims(scene: Scene): void {
  const keeperSheet = actorSheetTex("player-keeper-sheet");

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

  for (const actor of COZY_COMPANION_ACTORS) {
    ensurePetSheetAnims(scene, actor);
  }

  // Legacy generic sheet (same spark palette) — keep anims for fallback texture key
  const legacy = actorSheetTex("pet-riftling-sheet");
  if (scene.textures.exists(legacy)) {
    const walk = "pw-pet-walk";
    const idle = "pw-pet-idle";
    if (!scene.anims.exists(walk)) {
      scene.anims.create({
        key: walk,
        frames: scene.anims.generateFrameNumbers(legacy, { start: 1, end: 3 }),
        frameRate: 9,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(idle)) {
      scene.anims.create({
        key: idle,
        frames: scene.anims.generateFrameNumbers(legacy, { start: 0, end: 0 }),
        frameRate: 2,
        repeat: -1,
      });
    }
  }
}

export function playCozyActorAnim(
  sprite: GameObjects.Sprite,
  moving: boolean,
  kind: "keeper" | "pet",
  companionActor?: CozyCompanionActor | null,
): void {
  if (kind === "keeper") {
    const key = moving ? KEEPER_WALK_ANIM : KEEPER_IDLE_ANIM;
    if (!sprite.anims || !sprite.scene.anims.exists(key)) return;
    if (sprite.anims.currentAnim?.key !== key) {
      sprite.anims.play(key, true);
    }
    return;
  }

  const actor = companionActor ?? DEFAULT_COZY_COMPANION;
  ensurePetSheetAnims(sprite.scene, actor);
  let walk = companionWalkAnimKey(actor);
  let idle = companionIdleAnimKey(actor);
  if (!sprite.scene.anims.exists(walk)) {
    walk = "pw-pet-walk";
    idle = "pw-pet-idle";
  }
  const key = moving ? walk : idle;
  if (!sprite.anims || !sprite.scene.anims.exists(key)) return;
  if (sprite.anims.currentAnim?.key !== key) {
    sprite.anims.play(key, true);
  }
}

/** Apply species-matched cozy texture + size to the follower sprite. */
export function applyCompanionSpeciesVisual(
  scene: Scene,
  pet: GameObjects.Sprite,
  speciesSlug: string | null | undefined,
): CozyCompanionActor {
  ensureCozyActorAnims(scene);
  const choice = resolveCompanionTexture(speciesSlug);
  const tex = (() => {
    if (scene.textures.exists(choice.sheetTex)) return choice.sheetTex;
    if (scene.textures.exists(choice.staticTex)) return choice.staticTex;
    if (scene.textures.exists(choice.legacySheetTex)) return choice.legacySheetTex;
    if (scene.textures.exists(actorSheetTex("pet-riftling-sheet"))) {
      return actorSheetTex("pet-riftling-sheet");
    }
    if (scene.textures.exists(actorTex("pet-riftling"))) return actorTex("pet-riftling");
    return "pet-companion";
  })();

  if (pet.texture.key !== tex) {
    pet.setTexture(tex);
  }
  if (tex.startsWith("pw-actor-")) {
    pet.setDisplaySize(PET_DISPLAY.w, PET_DISPLAY.h);
    const body = pet.body as Physics.Arcade.Body | undefined;
    if (body) {
      body.setSize(16, 14);
      body.setOffset((pet.width - 16) / 2, pet.height - 14);
    }
  }
  ensurePetSheetAnims(scene, choice.actor);
  return choice.actor;
}

export { KEEPER_SHEET_FRAME, PET_SHEET_FRAME, resolveCompanionTexture };
