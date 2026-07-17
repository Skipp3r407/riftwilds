import {
  BlueprintRegionScene,
  type RegionSceneInit,
} from "@/game/live-world/scenes/BlueprintRegionScene";

export const COMMONS_KEY = "CommonsScene";

/** Riftwild Commons — blueprint-driven playable hub (extends Live World engine). */
export class CommonsScene extends BlueprintRegionScene {
  constructor() {
    super(COMMONS_KEY);
  }

  init(data: RegionSceneInit): void {
    super.init({ ...data, regionSlug: "riftwild-commons" });
  }
}
