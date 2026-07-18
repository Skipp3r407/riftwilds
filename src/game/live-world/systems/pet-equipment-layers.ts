import * as Phaser from "phaser";
import { getDefaultAnchor } from "@/lib/equipment/anchors";
import type { AppearanceSnapshot, EquippedLayer } from "@/lib/equipment/types";
import type { AttachmentPoint } from "@/lib/items/types";

type LayerSprite = {
  itemId: string;
  slot: string;
  sprite: Phaser.GameObjects.Image;
};

/**
 * Attaches equipment overlay sprites to the companion pet.
 * Anchors are phase-1 defaults — perfect animation-frame alignment is backlog.
 */
export class PetEquipmentLayerManager {
  private layers: LayerSprite[] = [];
  private revision = 0;
  private highlight?: Phaser.GameObjects.Ellipse;

  constructor(
    private scene: Phaser.Scene,
    private pet: Phaser.Physics.Arcade.Sprite,
  ) {}

  setSelected(selected: boolean): void {
    if (selected) {
      if (!this.highlight) {
        this.highlight = this.scene.add.ellipse(0, 0, 40, 16, 0x3de7ff, 0.35);
        this.highlight.setDepth(8);
      }
      this.highlight.setVisible(true);
    } else if (this.highlight) {
      this.highlight.setVisible(false);
    }
  }

  applyAppearance(snap: AppearanceSnapshot | null): void {
    if (!snap) {
      this.clear();
      return;
    }
    if (snap.revision === this.revision && this.layers.length === snap.layers.length) {
      return;
    }
    this.revision = snap.revision;
    this.clear();
    for (const layer of snap.layers) {
      this.spawnLayer(layer);
    }
  }

  private spawnLayer(layer: EquippedLayer): void {
    const key = `equip-layer-${layer.itemId}`;
    // Prefer dedicated world overlay; Phaser load will fall back if missing via icon retry.
    const path = layer.worldLayerPath || layer.iconPath;
    const finish = () => {
      if (!this.scene.textures.exists(key)) return;
      const img = this.scene.add.image(this.pet.x, this.pet.y, key);
      img.setOrigin(0.5, 0.5);
      const anchor = getDefaultAnchor(layer.attachment as AttachmentPoint);
      img.setScale(anchor.scale * (this.pet.displayWidth / 64));
      img.setAngle(anchor.rotationDeg);
      img.setData("anchor", anchor);
      img.setData("attachment", layer.attachment);
      this.layers.push({ itemId: layer.itemId, slot: layer.slot, sprite: img });
      this.syncPositions();
    };

    if (this.scene.textures.exists(key)) {
      finish();
      return;
    }

    const onFail = () => {
      if (path !== layer.iconPath && !this.scene.textures.exists(key)) {
        this.scene.load.image(key, layer.iconPath);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, finish);
        if (!this.scene.load.isLoading()) this.scene.load.start();
      }
    };
    this.scene.load.image(key, path);
    this.scene.load.once(Phaser.Loader.Events.COMPLETE, finish);
    this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, onFail);
    if (!this.scene.load.isLoading()) {
      this.scene.load.start();
    }
  }

  syncPositions(): void {
    const breath = this.pet.scaleY || 1;
    for (const layer of this.layers) {
      const anchor = layer.sprite.getData("anchor") as {
        x: number;
        y: number;
        depthBias: number;
      };
      layer.sprite.setPosition(this.pet.x + anchor.x, this.pet.y + anchor.y * breath);
      layer.sprite.setDepth(this.pet.depth + anchor.depthBias);
      layer.sprite.setVisible(this.pet.visible);
    }
    if (this.highlight?.visible) {
      this.highlight.setPosition(this.pet.x, this.pet.y - 2);
      this.highlight.setDepth(this.pet.depth - 0.5);
    }
  }

  clear(): void {
    for (const layer of this.layers) {
      layer.sprite.destroy();
    }
    this.layers = [];
  }

  destroy(): void {
    this.clear();
    this.highlight?.destroy();
    this.highlight = undefined;
  }
}
