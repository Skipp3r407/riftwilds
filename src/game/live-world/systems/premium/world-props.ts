/**
 * Prop / building sprite spawning (Phaser). Scatter data in premium-logic.ts.
 */

import * as Phaser from "phaser";
import type { MapBlueprint, WorldMapObject } from "@/game/world-maps/types";
import {
  buildingKeyFromObjectId,
  buildingTex,
  propTex,
  type PropKey,
} from "@/game/live-world/systems/premium/asset-keys";
import {
  commonsPropScatter,
  hash2,
} from "@/game/live-world/systems/premium/premium-logic";

export { commonsPropScatter };

/** Display scale so barrels/signs read smaller than NPCs; towers larger. */
function propWorldScale(key: PropKey): number {
  if (key === "watchtower" || key === "ruin-arch" || key === "bridge") return 0.55;
  if (key === "tree-small" || key === "market-stall" || key === "banner-pole") return 0.48;
  if (key === "rift-crystal" || key === "riftstone-monument") return 0.5;
  if (key === "flowers" || key === "rock-moss" || key === "bush-berry") return 0.36;
  if (key === "barrel" || key === "crate" || key === "bench") return 0.38;
  return 0.42;
}

export function spawnPremiumProps(
  scene: Phaser.Scene,
  blueprint: MapBlueprint,
): Phaser.GameObjects.GameObject[] {
  if (blueprint.slug !== "riftwild-commons") return [];
  const spawned: Phaser.GameObjects.GameObject[] = [];
  for (const p of commonsPropScatter(blueprint)) {
    const key = propTex(p.key);
    if (!scene.textures.exists(key)) continue;
    const img = scene.add.image(p.x, p.y, key);
    // Prop art is ~160–176px; keep human-scale vs ~50px NPCs
    const scale = (p.scale ?? 1) * propWorldScale(p.key);
    img.setScale(scale);
    img.setOrigin(0.5, 1);
    img.setDepth(4 + p.y * 0.001);
    if (p.key === "tree-small" || p.key === "bush-berry" || p.key === "flowers") {
      scene.tweens.add({
        targets: img,
        scaleX: scale * 1.03,
        scaleY: scale * 0.97,
        duration: 2200 + hash2(p.x, p.y) * 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
    if (p.key === "campfire" || p.key === "rift-crystal" || p.key === "lantern-post") {
      scene.tweens.add({
        targets: img,
        alpha: { from: 0.85, to: 1 },
        duration: 900 + hash2(p.x, p.y, 3) * 400,
        yoyo: true,
        repeat: -1,
      });
    }
    spawned.push(img);
  }
  return spawned;
}

export function trySpawnBuildingSprite(
  scene: Phaser.Scene,
  o: WorldMapObject,
): Phaser.GameObjects.Image | null {
  if (o.type !== "building") return null;
  const bKey = buildingKeyFromObjectId(o.id);
  if (!bKey) return null;
  const tex = buildingTex(bKey);
  if (!scene.textures.exists(tex)) return null;
  const w = o.width ?? 64;
  const h = o.height ?? 64;
  const img = scene.add.image(o.x + w / 2, o.y + h * 0.92, tex);
  img.setOrigin(0.5, 1);
  // Cutout facades are often square (768²); prefer width fit but cap height
  // so NPCs (~50px) stay readable against doors/steps.
  const targetW = w * 1.08;
  const maxH = h * 1.35;
  let scale = targetW / Math.max(1, img.width);
  if (img.height * scale > maxH) {
    scale = maxH / Math.max(1, img.height);
  }
  img.setScale(scale);
  img.setDepth(5 + (o.y + h) * 0.001);
  return img;
}

export function trySpawnDecorationSprite(
  scene: Phaser.Scene,
  o: WorldMapObject,
): Phaser.GameObjects.Image | null {
  if (o.type !== "decoration" && o.type !== "quest") return null;
  const map: Record<string, PropKey> = {
    riftstone: "riftstone-monument",
    fountain: "rift-crystal",
    "event-stage": "banner-pole",
    "notice-board": "signpost",
    "pet-play": "flowers",
    "training-dummy-a": "training-dummy",
    "training-dummy-b": "training-dummy",
  };
  const prop = map[o.id];
  if (!prop) return null;
  const key = propTex(prop);
  if (!scene.textures.exists(key)) return null;
  const img = scene.add.image(
    o.x + (o.width ?? 0) / 2,
    o.y + (o.height ?? 0) / 2,
    key,
  );
  img.setOrigin(0.5, 1);
  const scale =
    prop === "riftstone-monument" ? 0.85 : prop === "training-dummy" ? 0.55 : 0.5;
  img.setScale(scale);
  img.setDepth(5 + o.y * 0.001);
  if (prop === "riftstone-monument" || prop === "rift-crystal") {
    scene.tweens.add({
      targets: img,
      alpha: { from: 0.75, to: 1 },
      scaleX: img.scaleX * 1.05,
      scaleY: img.scaleY * 1.05,
      duration: 1400,
      yoyo: true,
      repeat: -1,
    });
  }
  return img;
}

/** Resource / fishing node → premium prop texture. */
export function resourcePropKey(resourceId: string): PropKey | null {
  if (resourceId.includes("berry")) return "resource-berry";
  if (resourceId.includes("herb")) return "resource-herb";
  if (resourceId.includes("fish")) return "resource-fish";
  return null;
}

export function trySpawnResourceSprite(
  scene: Phaser.Scene,
  x: number,
  y: number,
  resourceId: string,
): Phaser.GameObjects.Image | null {
  const prop = resourcePropKey(resourceId);
  if (!prop) return null;
  const key = propTex(prop);
  if (!scene.textures.exists(key)) return null;
  const img = scene.add.image(x, y, key);
  img.setOrigin(0.5, 1);
  img.setScale(0.48);
  img.setDepth(5 + y * 0.001);
  scene.tweens.add({
    targets: img,
    scaleX: img.scaleX * 1.04,
    scaleY: img.scaleY * 0.97,
    duration: 1800,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  return img;
}
