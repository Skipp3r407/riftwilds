/**
 * Prop / building sprite spawning (Phaser). Scatter data in premium-logic.ts.
 * Depth bands + occluders create 2.5D overlap (city-builder layering).
 */

import * as Phaser from "phaser";
import type { MapBlueprint, WorldMapObject } from "@/game/world-maps/types";
import {
  buildingKeyFromObjectId,
  buildingTex,
  isTreeProp,
  propTex,
  type PropKey,
} from "@/game/live-world/systems/premium/asset-keys";
import {
  commonsPropScatter,
  filterScatterForBudget,
  hash2,
} from "@/game/live-world/systems/premium/premium-logic";
import {
  DEPTH,
  addContactShadow,
  depthAt,
  updateOccluderFades,
  type Occluder,
} from "@/game/live-world/systems/premium/depth-layers";

export { commonsPropScatter, filterScatterForBudget, updateOccluderFades };
export type { Occluder };

/** @deprecated Prefer Occluder — kept for scene migration. */
export type BuildingFacade = {
  id: string;
  sprite: Phaser.GameObjects.Image;
  footY: number;
  footX: number;
  halfW: number;
  baseAlpha: number;
};

/** Display scale so barrels/signs read smaller than NPCs; towers larger. */
function propWorldScale(key: PropKey): number {
  if (key === "watchtower" || key === "ruin-arch" || key === "bridge") return 0.55;
  if (key === "tree-pine") return 0.52;
  if (key === "tree-rift") return 0.5;
  if (isTreeProp(key) || key === "market-stall" || key === "banner-pole") return 0.48;
  if (key === "rift-crystal" || key === "riftstone-monument") return 0.5;
  if (key === "flowers" || key === "rock-moss" || key === "bush-berry") return 0.36;
  if (key === "barrel" || key === "crate" || key === "bench") return 0.38;
  return 0.42;
}

function isCanopyProp(key: PropKey): boolean {
  return (
    isTreeProp(key) ||
    key === "banner-pole" ||
    key === "watchtower" ||
    key === "ruin-arch"
  );
}

export type PremiumPropSpawnResult = {
  sprites: Phaser.GameObjects.GameObject[];
  occluders: Occluder[];
};

export function spawnPremiumProps(
  scene: Phaser.Scene,
  blueprint: MapBlueprint,
  budget: "full" | "medium" | "low" = "full",
): PremiumPropSpawnResult {
  if (blueprint.slug !== "riftwild-commons") {
    return { sprites: [], occluders: [] };
  }
  const spawned: Phaser.GameObjects.GameObject[] = [];
  const occluders: Occluder[] = [];
  const specs = filterScatterForBudget(commonsPropScatter(blueprint), budget);

  for (const p of specs) {
    const key = propTex(p.key);
    if (!scene.textures.exists(key)) continue;
    const img = scene.add.image(p.x, p.y, key);
    const scale = (p.scale ?? 1) * propWorldScale(p.key);
    img.setScale(scale);
    img.setOrigin(0.5, 1);

    const canopy = isCanopyProp(p.key);
    const dock = p.key === "bridge";
    const band = canopy
      ? DEPTH.canopy
      : dock
        ? DEPTH.streetProp
        : DEPTH.lowProp;
    img.setDepth(depthAt(band, p.y));

    // Contact shadow — grounds props so they don't float on flat green
    if (
      isTreeProp(p.key) ||
      p.key === "market-stall" ||
      p.key === "barrel" ||
      p.key === "crate" ||
      p.key === "watchtower" ||
      p.key === "bridge"
    ) {
      addContactShadow(
        scene,
        p.x + 2,
        p.y - 2,
        28 + scale * 20,
        10 + scale * 4,
        canopy ? 0.2 : 0.16,
      );
    }

    if (isTreeProp(p.key) || p.key === "bush-berry" || p.key === "flowers") {
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

    if (canopy || dock) {
      const kind = dock ? "dock" : isTreeProp(p.key) ? "tree" : "canopy";
      const halfW = (img.displayWidth || 40) * 0.35;
      const heightPx = dock ? 48 : isTreeProp(p.key) ? 96 : 90;
      const id = `prop-${p.key}-${Math.round(p.x)}-${Math.round(p.y)}`;
      img.setData("occluder", true);
      img.setData("occluderKind", kind);
      img.setData("occluderId", id);
      img.setData("footX", p.x);
      img.setData("footY", p.y);
      img.setData("halfW", halfW);
      img.setData("heightPx", heightPx);
      img.setData("baseAlpha", 1);
      occluders.push({
        id,
        kind,
        sprite: img,
        footX: p.x,
        footY: p.y,
        halfW,
        heightPx,
        baseAlpha: 1,
        fadeWhenBehind: true,
      });
    }

    spawned.push(img);
  }
  return { sprites: spawned, occluders };
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
  // Slight south bias + taller facade so neighboring roofs overlap (2.5D)
  const img = scene.add.image(o.x + w / 2, o.y + h * 0.94, tex);
  img.setOrigin(0.5, 1);
  const targetW = w * 1.14;
  const maxH = h * 1.55;
  let scale = targetW / Math.max(1, img.width);
  if (img.height * scale > maxH) {
    scale = maxH / Math.max(1, img.height);
  }
  img.setScale(scale);
  img.setDepth(depthAt(DEPTH.building, o.y + h));

  addContactShadow(
    scene,
    o.x + w / 2 + 4,
    o.y + h - 4,
    w * 0.9,
    h * 0.22,
    0.26,
  );

  img.setData("buildingFacade", true);
  img.setData("occluder", true);
  img.setData("buildingId", o.id);
  img.setData("footY", o.y + h);
  img.setData("footX", o.x + w / 2);
  img.setData("halfW", w * 0.58);
  img.setData("baseAlpha", 1);
  img.setData("heightPx", Math.max(96, h * 1.4));
  return img;
}

/** @deprecated use updateOccluderFades with collectOccluders */
export function updateBuildingRoofFade(
  facades: BuildingFacade[],
  playerX: number,
  playerY: number,
): void {
  updateOccluderFades(
    facades.map((f) => ({
      id: f.id,
      kind: "building" as const,
      sprite: f.sprite,
      footX: f.footX,
      footY: f.footY,
      halfW: f.halfW,
      heightPx: 110,
      baseAlpha: f.baseAlpha,
      fadeWhenBehind: true,
    })),
    playerX,
    playerY,
  );
}

export function collectBuildingFacades(scene: Phaser.Scene): BuildingFacade[] {
  return collectOccluders(scene)
    .filter((o) => o.kind === "building")
    .map((o) => ({
      id: o.id,
      sprite: o.sprite as Phaser.GameObjects.Image,
      footY: o.footY,
      footX: o.footX,
      halfW: o.halfW,
      baseAlpha: o.baseAlpha,
    }));
}

export function collectOccluders(scene: Phaser.Scene): Occluder[] {
  const out: Occluder[] = [];
  for (const child of scene.children.list) {
    if (!("getData" in child)) continue;
    const img = child as Phaser.GameObjects.Image;
    if (!img.getData?.("occluder") && !img.getData?.("buildingFacade")) continue;
    const isBuilding = !!img.getData("buildingFacade");
    const storedKind = img.getData("occluderKind") as Occluder["kind"] | undefined;
    const kind: Occluder["kind"] = isBuilding
      ? "building"
      : storedKind === "tree" ||
          storedKind === "dock" ||
          storedKind === "canopy" ||
          storedKind === "wall"
        ? storedKind
        : "canopy";
    out.push({
      id: String(img.getData("buildingId") ?? img.getData("occluderId") ?? "occluder"),
      kind,
      sprite: img,
      footY: Number(img.getData("footY") ?? img.y),
      footX: Number(img.getData("footX") ?? img.x),
      halfW: Number(img.getData("halfW") ?? 40),
      heightPx: Number(img.getData("heightPx") ?? (isBuilding ? 110 : 90)),
      baseAlpha: Number(img.getData("baseAlpha") ?? 1),
      fadeWhenBehind: true,
    });
  }
  return out;
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
    "plaza-well": "rift-crystal",
    "keeper-well": "rift-crystal",
    "sanctum-shrine": "riftstone-monument",
    "market-square": "market-stall",
    "row-garden": "flowers",
    "terrace-stairs": "rock-moss",
    "dock-boat": "bridge",
    "gate-north": "watchtower",
    "gate-east": "watchtower",
    "gate-south": "watchtower",
    "gate-west": "watchtower",
    "training-dummy-a": "training-dummy",
    "training-dummy-b": "training-dummy",
  };
  const prop = map[o.id];
  if (!prop) return null;
  const key = propTex(prop);
  if (!scene.textures.exists(key)) return null;
  const footX = o.x + (o.width ?? 0) / 2;
  const footY = o.y + (o.height ?? 0);
  const img = scene.add.image(footX, footY, key);
  img.setOrigin(0.5, 1);
  const scale =
    prop === "riftstone-monument" ? 0.85 : prop === "training-dummy" ? 0.55 : 0.5;
  img.setScale(scale);
  const band =
    prop === "bridge" || prop === "watchtower" ? DEPTH.canopy : DEPTH.streetProp;
  img.setDepth(depthAt(band, footY));
  addContactShadow(scene, footX + 2, footY - 2, 36, 12, 0.18);
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
  if (prop === "watchtower" || prop === "bridge") {
    const kind = prop === "bridge" ? "dock" : "canopy";
    img.setData("occluder", true);
    img.setData("occluderKind", kind);
    img.setData("occluderId", `deco-${o.id}`);
    img.setData("footY", footY);
    img.setData("footX", footX);
    img.setData("halfW", 28);
    img.setData("heightPx", prop === "bridge" ? 40 : 100);
    img.setData("baseAlpha", 1);
  }
  return img;
}

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
  img.setDepth(depthAt(DEPTH.lowProp, y));
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

/**
 * Draw city wall segments as layered stone blocks so walls enclose space visually.
 */
export function drawCityWallVisuals(
  scene: Phaser.Scene,
  blueprint: MapBlueprint,
): Phaser.GameObjects.GameObject[] {
  if (blueprint.slug !== "riftwild-commons") return [];
  const out: Phaser.GameObjects.GameObject[] = [];
  for (const box of blueprint.colliders) {
    if (box.kind !== "wall") continue;
    if (!box.id.startsWith("wall-")) continue;
    const g = scene.add.graphics();
    // Base stone fill
    g.fillStyle(0x4a453c, 0.72);
    g.fillRect(box.x, box.y, box.width, box.height);
    // Top lip / battlement highlight
    g.fillStyle(0x6a6358, 0.55);
    if (box.width >= box.height) {
      g.fillRect(box.x, box.y, box.width, Math.min(6, box.height * 0.35));
    } else {
      g.fillRect(box.x, box.y, Math.min(6, box.width * 0.35), box.height);
    }
    // Shadow edge into town
    g.fillStyle(0x000000, 0.18);
    if (box.width >= box.height) {
      g.fillRect(box.x, box.y + box.height - 3, box.width, 3);
    } else {
      g.fillRect(box.x + box.width - 3, box.y, 3, box.height);
    }
    g.setDepth(depthAt(DEPTH.wallBase, box.y + box.height));
    out.push(g);
  }
  return out;
}
