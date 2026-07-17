import {
  BlueprintRegionScene,
  type RegionSceneInit,
} from "@/game/live-world/scenes/BlueprintRegionScene";

export const EMBER_KEY = "EmberCraterScene";

export class EmberCraterScene extends BlueprintRegionScene {
  constructor() {
    super(EMBER_KEY);
  }

  init(data: RegionSceneInit): void {
    super.init({ ...data, regionSlug: "ember-crater" });
  }
}
