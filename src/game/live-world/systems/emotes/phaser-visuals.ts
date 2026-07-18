/**
 * Lightweight Phaser emote visuals for circle-placeholder avatars.
 * Reduced-motion: static glyph bubble only.
 */

import type * as Phaser from "phaser";
import { getEmoteDef } from "@/game/live-world/systems/emotes/catalog";
import type { EmotePlaybackRequest } from "@/game/live-world/systems/emotes/types";

export type EmoteVisualHandle = {
  destroy: () => void;
};

/**
 * Play a cosmetic gesture on a sprite — tweens + floating glyph.
 * Does not affect physics velocity (caller cancels emote on move).
 */
export function playEmoteVisual(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Sprite,
  request: EmotePlaybackRequest,
): EmoteVisualHandle {
  const def = getEmoteDef(request.emoteKey);
  const glyph = def?.glyph ?? "✨";
  const reduced = !!request.reducedMotion;
  const duration = reduced ? 500 : (def?.durationMs ?? 1600);

  const bubble = scene.add
    .text(target.x, target.y - 36, glyph, {
      fontSize: reduced ? "18px" : "22px",
      fontFamily: "Segoe UI Emoji, Apple Color Emoji, sans-serif",
    })
    .setOrigin(0.5, 1)
    .setDepth(40)
    .setAlpha(0);

  scene.tweens.add({
    targets: bubble,
    alpha: 1,
    y: target.y - (reduced ? 40 : 52),
    duration: reduced ? 120 : 220,
    ease: "Sine.easeOut",
  });

  const tweens: Phaser.Tweens.Tween[] = [];

  if (!reduced && def) {
    const key = def.key;
    if (key === "wave" || key === "hello" || key === "salute") {
      tweens.push(
        scene.tweens.add({
          targets: target,
          angle: { from: -8, to: 8 },
          duration: 180,
          yoyo: true,
          repeat: 3,
          ease: "Sine.easeInOut",
        }),
      );
    } else if (key === "nod" || key === "thanks" || key === "sorry") {
      tweens.push(
        scene.tweens.add({
          targets: target,
          scaleY: { from: 1, to: 0.88 },
          duration: 160,
          yoyo: true,
          repeat: 2,
        }),
      );
    } else if (key === "cheer" || key === "celebrate" || key === "ready") {
      tweens.push(
        scene.tweens.add({
          targets: target,
          y: target.y - 10,
          duration: 200,
          yoyo: true,
          repeat: 2,
          ease: "Quad.easeOut",
        }),
      );
    } else if (key === "dance" || key === "sync_dance" || key === "bloom_twirl") {
      tweens.push(
        scene.tweens.add({
          targets: target,
          angle: { from: -12, to: 12 },
          x: target.x + 4,
          duration: 220,
          yoyo: true,
          repeat: 5,
        }),
      );
    } else if (key === "bow" || key === "sit") {
      tweens.push(
        scene.tweens.add({
          targets: target,
          scaleY: 0.75,
          duration: 280,
          yoyo: true,
          hold: key === "sit" ? 1200 : 200,
        }),
      );
    } else if (key === "laugh" || key === "clap") {
      tweens.push(
        scene.tweens.add({
          targets: target,
          scaleX: { from: 1, to: 1.08 },
          scaleY: { from: 1, to: 0.95 },
          duration: 140,
          yoyo: true,
          repeat: 4,
        }),
      );
    } else {
      tweens.push(
        scene.tweens.add({
          targets: target,
          angle: { from: -5, to: 5 },
          duration: 200,
          yoyo: true,
          repeat: 2,
        }),
      );
    }
  }

  const timer = scene.time.delayedCall(duration, () => {
    scene.tweens.add({
      targets: bubble,
      alpha: 0,
      duration: 180,
      onComplete: () => bubble.destroy(),
    });
    target.setAngle(0);
    target.setScale(1);
  });

  return {
    destroy: () => {
      timer.remove(false);
      tweens.forEach((t) => t.stop());
      bubble.destroy();
      target.setAngle(0);
      target.setScale(1);
    },
  };
}
